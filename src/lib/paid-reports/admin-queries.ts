import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orders as ordersTable,
  paidReports,
  toolResults,
  diagnosticResults,
  riderProfiles,
} from "@/lib/db/schema";
import { asOrderStatus, asPaidReportStatus } from "./types";

/**
 * Read-only queries that power the admin dashboards for paid reports
 * and the diagnostic framework. Everything here is admin-only and
 * returns compact row shapes — the full domain objects live in the
 * dedicated stores.
 */

export interface PaidReportAdminRow {
  reportId: number;
  orderId: number;
  email: string;
  productSlug: string;
  status: ReturnType<typeof asPaidReportStatus>;
  orderStatus: ReturnType<typeof asOrderStatus>;
  amountCents: number;
  currency: string;
  pdfUrl: string | null;
  generatorVersion: string | null;
  downloadCount: number;
  deliveredAt: Date | null;
  createdAt: Date;
  lastResentAt: Date | null;
  riderFirstName: string | null;
  riderLeadScore: number | null;
}

export async function listPaidReportsForAdmin(
  opts: { limit?: number; status?: string | null } = {},
): Promise<PaidReportAdminRow[]> {
  const conditions = opts.status
    ? [eq(paidReports.status, opts.status)]
    : [];
  const rows = await db
    .select({
      reportId: paidReports.id,
      orderId: paidReports.orderId,
      email: paidReports.email,
      productSlug: paidReports.productSlug,
      status: paidReports.status,
      orderStatus: ordersTable.status,
      amountCents: ordersTable.amountCents,
      currency: ordersTable.currency,
      pdfUrl: paidReports.pdfUrl,
      generatorVersion: paidReports.generatorVersion,
      downloadCount: paidReports.downloadCount,
      deliveredAt: paidReports.deliveredAt,
      createdAt: paidReports.createdAt,
      lastResentAt: paidReports.lastResentAt,
      riderFirstName: riderProfiles.firstName,
      riderLeadScore: riderProfiles.leadScore,
    })
    .from(paidReports)
    .innerJoin(ordersTable, eq(ordersTable.id, paidReports.orderId))
    .leftJoin(riderProfiles, eq(riderProfiles.id, paidReports.riderProfileId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(paidReports.createdAt))
    .limit(opts.limit ?? 100);

  return rows.map((r) => ({
    reportId: r.reportId,
    orderId: r.orderId,
    email: r.email,
    productSlug: r.productSlug,
    status: asPaidReportStatus(r.status),
    orderStatus: asOrderStatus(r.orderStatus),
    amountCents: r.amountCents,
    currency: r.currency,
    pdfUrl: r.pdfUrl,
    generatorVersion: r.generatorVersion,
    downloadCount: r.downloadCount,
    deliveredAt: r.deliveredAt,
    createdAt: r.createdAt,
    lastResentAt: r.lastResentAt,
    riderFirstName: r.riderFirstName ?? null,
    riderLeadScore: r.riderLeadScore ?? null,
  }));
}

export interface PaidReportStats {
  total: number;
  delivered: number;
  pending: number;
  failed: number;
  refunded: number;
  revenueCents: number;
}

export async function getPaidReportStats(): Promise<PaidReportStats> {
  const statusRows = await db
    .select({
      status: paidReports.status,
      count: sql<number>`count(*)::int`,
    })
    .from(paidReports)
    .groupBy(paidReports.status);

  const revenueRows = await db
    .select({
      sum: sql<number>`COALESCE(SUM(${ordersTable.amountCents}), 0)::int`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.status, "paid"));

  const counts: Record<string, number> = {};
  let total = 0;
  for (const row of statusRows) {
    counts[row.status] = row.count;
    total += row.count;
  }

  return {
    total,
    delivered: counts.delivered ?? 0,
    pending:
      (counts.pending_payment ?? 0) +
      (counts.payment_confirmed ?? 0) +
      (counts.generating ?? 0) +
      (counts.generated ?? 0),
    failed: counts.failed ?? 0,
    refunded: (counts.refunded ?? 0) + (counts.revoked ?? 0),
    revenueCents: revenueRows[0]?.sum ?? 0,
  };
}

export interface DiagnosticToolRow {
  toolSlug: string;
  totalRuns: number;
  emailedRuns: number;
  askHandoffs: number;
}

export async function listDiagnosticToolStats(): Promise<DiagnosticToolRow[]> {
  const rows = await db
    .select({
      toolSlug: toolResults.toolSlug,
      totalRuns: sql<number>`count(*)::int`,
      emailedRuns: sql<number>`count(${toolResults.emailSentAt})::int`,
      askHandoffs: sql<number>`count(${toolResults.askHandoffAt})::int`,
    })
    .from(toolResults)
    .groupBy(toolResults.toolSlug)
    .orderBy(desc(sql<number>`count(*)`));

  return rows.map((r) => ({
    toolSlug: r.toolSlug,
    totalRuns: r.totalRuns,
    emailedRuns: r.emailedRuns,
    askHandoffs: r.askHandoffs,
  }));
}

export interface DiagnosticCategoryRow {
  toolSlug: string;
  primaryCategory: string;
  count: number;
}

export async function listDiagnosticCategoryDistribution(): Promise<
  DiagnosticCategoryRow[]
> {
  const rows = await db
    .select({
      toolSlug: diagnosticResults.toolSlug,
      primaryCategory: diagnosticResults.primaryCategory,
      count: sql<number>`count(*)::int`,
    })
    .from(diagnosticResults)
    .groupBy(diagnosticResults.toolSlug, diagnosticResults.primaryCategory)
    .orderBy(desc(sql<number>`count(*)`));

  return rows.map((r) => ({
    toolSlug: r.toolSlug,
    primaryCategory: r.primaryCategory,
    count: r.count,
  }));
}

export interface RecentToolResultRow {
  slug: string;
  toolSlug: string;
  email: string;
  primaryResult: string | null;
  summary: string;
  createdAt: Date;
}

export async function listRecentToolResults(
  limit = 50,
): Promise<RecentToolResultRow[]> {
  const rows = await db
    .select({
      slug: toolResults.slug,
      toolSlug: toolResults.toolSlug,
      email: toolResults.email,
      primaryResult: toolResults.primaryResult,
      summary: toolResults.summary,
      createdAt: toolResults.createdAt,
    })
    .from(toolResults)
    .orderBy(desc(toolResults.createdAt))
    .limit(limit);
  return rows;
}
