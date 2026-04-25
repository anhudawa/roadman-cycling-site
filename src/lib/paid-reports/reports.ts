import crypto from "crypto";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { paidReports } from "@/lib/db/schema";
import {
  asPaidReportStatus,
  type PaidReport,
  type PaidReportStatus,
} from "./types";

/**
 * Paid-report lifecycle store.
 *
 * Lifecycle: pending_payment $†’ payment_confirmed $†’ generating $†’
 * generated $†’ delivered. Terminal states are refunded / revoked /
 * failed. Each transition is idempotent $€” callers can retry without
 * clobbering a later state.
 *
 * Tokens: the raw token is returned once on create so the email link
 * can include it. Only the sha256 of the token is stored. Tokens are
 * long enough (32 random bytes $†’ 43 base64url chars) that brute force
 * is impractical; combined with a strict content-type check on the
 * download route they give us secure-by-default delivery without
 * requiring auth.
 */

type Row = typeof paidReports.$inferSelect;

function rowToDomain(row: Row): PaidReport {
  return {
    id: row.id,
    orderId: row.orderId,
    riderProfileId: row.riderProfileId,
    email: row.email,
    productSlug: row.productSlug,
    toolResultId: row.toolResultId,
    status: asPaidReportStatus(row.status),
    statusReason: row.statusReason,
    secureTokenHash: row.secureTokenHash,
    pdfUrl: row.pdfUrl,
    webReportHtml: row.webReportHtml,
    pageCount: row.pageCount,
    generatorVersion: row.generatorVersion,
    deliveredAt: row.deliveredAt,
    revokedAt: row.revokedAt,
    lastResentAt: row.lastResentAt,
    downloadCount: row.downloadCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export interface CreatePaidReportInput {
  orderId: number;
  riderProfileId: number | null;
  email: string;
  productSlug: string;
  toolResultId: number | null;
}

export async function createPaidReport(
  input: CreatePaidReportInput,
): Promise<PaidReport> {
  const [row] = await db
    .insert(paidReports)
    .values({
      orderId: input.orderId,
      riderProfileId: input.riderProfileId,
      email: input.email,
      productSlug: input.productSlug,
      toolResultId: input.toolResultId,
      status: "pending_payment",
    })
    .returning();
  return rowToDomain(row);
}

export async function getPaidReportById(
  id: number,
): Promise<PaidReport | null> {
  const [row] = await db
    .select()
    .from(paidReports)
    .where(eq(paidReports.id, id))
    .limit(1);
  return row ? rowToDomain(row) : null;
}

export async function getPaidReportByOrderId(
  orderId: number,
): Promise<PaidReport | null> {
  const [row] = await db
    .select()
    .from(paidReports)
    .where(eq(paidReports.orderId, orderId))
    .limit(1);
  return row ? rowToDomain(row) : null;
}

export async function listPaidReportsByEmail(
  email: string,
  limit = 50,
): Promise<PaidReport[]> {
  const rows = await db
    .select()
    .from(paidReports)
    .where(eq(paidReports.email, email))
    .orderBy(desc(paidReports.createdAt))
    .limit(limit);
  return rows.map(rowToDomain);
}

/* ============================================================ */
/* Token helpers                                                 */
/* ============================================================ */

/**
 * Generate a URL-safe random token + its sha256 hash. The raw token
 * MUST only be returned to the caller and emailed to the rider $€” the
 * hash is all that persists.
 */
export function generateSecureToken(): { token: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("base64url");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { token: raw, hash };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getPaidReportByToken(
  token: string,
): Promise<PaidReport | null> {
  const hash = hashToken(token);
  const [row] = await db
    .select()
    .from(paidReports)
    .where(eq(paidReports.secureTokenHash, hash))
    .limit(1);
  return row ? rowToDomain(row) : null;
}

/* ============================================================ */
/* State transitions $€” idempotent                                */
/* ============================================================ */

export async function markPaymentConfirmed(
  reportId: number,
): Promise<PaidReport | null> {
  const [row] = await db
    .update(paidReports)
    .set({ status: "payment_confirmed", updatedAt: new Date() })
    .where(
      sql`${paidReports.id} = ${reportId} AND ${paidReports.status} IN ('pending_payment','payment_confirmed')`,
    )
    .returning();
  return row ? rowToDomain(row) : null;
}

export async function markGenerating(
  reportId: number,
  generatorVersion: string,
): Promise<PaidReport | null> {
  const [row] = await db
    .update(paidReports)
    .set({
      status: "generating",
      generatorVersion,
      updatedAt: new Date(),
    })
    .where(
      sql`${paidReports.id} = ${reportId} AND ${paidReports.status} IN ('payment_confirmed','generating')`,
    )
    .returning();
  return row ? rowToDomain(row) : null;
}

export interface MarkGeneratedInput {
  reportId: number;
  pdfUrl: string | null;
  webReportHtml: string | null;
  pageCount: number | null;
  tokenHash: string;
}

export async function markGenerated(
  input: MarkGeneratedInput,
): Promise<PaidReport | null> {
  const [row] = await db
    .update(paidReports)
    .set({
      status: "generated",
      pdfUrl: input.pdfUrl,
      webReportHtml: input.webReportHtml,
      pageCount: input.pageCount,
      secureTokenHash: input.tokenHash,
      updatedAt: new Date(),
    })
    .where(eq(paidReports.id, input.reportId))
    .returning();
  return row ? rowToDomain(row) : null;
}

export async function markDelivered(
  reportId: number,
): Promise<PaidReport | null> {
  const now = new Date();
  const [row] = await db
    .update(paidReports)
    .set({ status: "delivered", deliveredAt: now, updatedAt: now })
    .where(eq(paidReports.id, reportId))
    .returning();
  return row ? rowToDomain(row) : null;
}

export async function markFailed(
  reportId: number,
  reason: string,
): Promise<PaidReport | null> {
  const [row] = await db
    .update(paidReports)
    .set({ status: "failed", statusReason: reason, updatedAt: new Date() })
    .where(eq(paidReports.id, reportId))
    .returning();
  return row ? rowToDomain(row) : null;
}

export async function markRefunded(
  reportId: number,
): Promise<PaidReport | null> {
  const [row] = await db
    .update(paidReports)
    .set({ status: "refunded", updatedAt: new Date() })
    .where(eq(paidReports.id, reportId))
    .returning();
  return row ? rowToDomain(row) : null;
}

export async function markRevoked(
  reportId: number,
  reason: string,
): Promise<PaidReport | null> {
  const now = new Date();
  const [row] = await db
    .update(paidReports)
    .set({
      status: "revoked",
      statusReason: reason,
      revokedAt: now,
      updatedAt: now,
    })
    .where(eq(paidReports.id, reportId))
    .returning();
  return row ? rowToDomain(row) : null;
}

export async function markResent(
  reportId: number,
): Promise<PaidReport | null> {
  const now = new Date();
  const [row] = await db
    .update(paidReports)
    .set({ lastResentAt: now, updatedAt: now })
    .where(eq(paidReports.id, reportId))
    .returning();
  return row ? rowToDomain(row) : null;
}

export async function incrementDownloadCount(
  reportId: number,
): Promise<void> {
  await db
    .update(paidReports)
    .set({
      downloadCount: sql`${paidReports.downloadCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(paidReports.id, reportId));
}

export type { PaidReport, PaidReportStatus };
