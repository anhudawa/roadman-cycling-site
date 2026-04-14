/**
 * Typed query helpers for Blood Engine. Wrap drizzle access in small,
 * intention-revealing functions so the API routes stay thin.
 */

import { and, desc, eq, isNull, lte } from "drizzle-orm";
import { db } from "../db";
import { bloodEngineUsers, bloodReports } from "../db/schema";
import type { InterpretationJSON, NormalizedMarkerValue, ReportContext } from "./schemas";

export type BloodEngineUser = typeof bloodEngineUsers.$inferSelect;
export type BloodReport = typeof bloodReports.$inferSelect;

export async function getUserById(id: number): Promise<BloodEngineUser | null> {
  const rows = await db.select().from(bloodEngineUsers).where(eq(bloodEngineUsers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<BloodEngineUser | null> {
  const rows = await db
    .select()
    .from(bloodEngineUsers)
    .where(eq(bloodEngineUsers.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}

export interface GrantAccessParams {
  email: string;
  stripeCustomerId?: string;
  stripeSessionId?: string;
}

/** Upsert a user as paid. Returns the row (with its id). */
export async function grantAccess(params: GrantAccessParams): Promise<BloodEngineUser> {
  const email = params.email.toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    const [updated] = await db
      .update(bloodEngineUsers)
      .set({
        hasAccess: true,
        accessGrantedAt: existing.accessGrantedAt ?? new Date(),
        stripeCustomerId: params.stripeCustomerId ?? existing.stripeCustomerId,
        stripeSessionId: params.stripeSessionId ?? existing.stripeSessionId,
      })
      .where(eq(bloodEngineUsers.id, existing.id))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(bloodEngineUsers)
    .values({
      email,
      hasAccess: true,
      accessGrantedAt: new Date(),
      stripeCustomerId: params.stripeCustomerId,
      stripeSessionId: params.stripeSessionId,
    })
    .returning();
  return created;
}

export async function recordTosAcceptance(userId: number, version: string): Promise<void> {
  await db
    .update(bloodEngineUsers)
    .set({ tosAcceptedAt: new Date(), tosVersion: version })
    .where(eq(bloodEngineUsers.id, userId));
}

export async function recordLogin(userId: number): Promise<void> {
  await db
    .update(bloodEngineUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(bloodEngineUsers.id, userId));
}

export interface SaveReportParams {
  userId: number;
  context: ReportContext;
  results: NormalizedMarkerValue[];
  interpretation: InterpretationJSON;
  promptVersion: string;
  retestDueAt: Date | null;
  drawDate: string;
}

export async function saveReport(params: SaveReportParams): Promise<BloodReport> {
  const [row] = await db
    .insert(bloodReports)
    .values({
      userId: params.userId,
      drawDate: params.drawDate,
      context: params.context,
      results: params.results,
      interpretation: params.interpretation,
      promptVersion: params.promptVersion,
      retestDueAt: params.retestDueAt,
    })
    .returning();
  return row;
}

export async function listReports(userId: number): Promise<BloodReport[]> {
  return db
    .select()
    .from(bloodReports)
    .where(eq(bloodReports.userId, userId))
    .orderBy(desc(bloodReports.createdAt));
}

export async function getReport(reportId: number, userId: number): Promise<BloodReport | null> {
  const rows = await db
    .select()
    .from(bloodReports)
    .where(and(eq(bloodReports.id, reportId), eq(bloodReports.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Reports whose retest nudge is due and has not yet been sent. */
export async function findDueRetestReports(now: Date): Promise<BloodReport[]> {
  return db
    .select()
    .from(bloodReports)
    .where(and(lte(bloodReports.retestDueAt, now), isNull(bloodReports.retestNudgeSentAt)));
}

export async function markRetestNudgeSent(reportId: number): Promise<void> {
  await db
    .update(bloodReports)
    .set({ retestNudgeSentAt: new Date() })
    .where(eq(bloodReports.id, reportId));
}

/**
 * Hard-delete a Blood Engine user. ON DELETE CASCADE on blood_reports.user_id
 * and blood_engine_api_calls.user_id removes the dependent rows automatically.
 */
export async function deleteUser(userId: number): Promise<void> {
  await db.delete(bloodEngineUsers).where(eq(bloodEngineUsers.id, userId));
}
