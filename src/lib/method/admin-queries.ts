/**
 * Admin queries for The Roadman Method — the ops view over enrollments,
 * tier mix, revenue, course progress, and onboarding plan selections so the
 * team can fulfil Premium TrainingPeaks plans and triage the funnel.
 *
 * Read-only. Lives behind the admin auth gate.
 */

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  methodEnrollments,
  methodOnboarding,
  methodProgress,
} from "./schema";
import { METHOD_MODULES } from "./modules";

const TOTAL_MODULES = METHOD_MODULES.length;

export interface MethodAdminRow {
  id: number;
  email: string;
  name: string | null;
  tier: string;
  status: string;
  amountCents: number | null;
  currency: string;
  paidAt: Date | null;
  createdAt: Date;
  completedCount: number;
  totalModules: number;
  planName: string | null;
  planCode: string | null;
  goal: string | null;
  hours: number | null;
  level: string | null;
}

export interface MethodAdminStats {
  active: number;
  pending: number;
  premium: number;
  graduated: number;
  revenueCents: number;
}

export async function getMethodAdminStats(): Promise<MethodAdminStats> {
  const rows = await db
    .select({
      status: methodEnrollments.status,
      tier: methodEnrollments.tier,
      amountCents: methodEnrollments.amountCents,
    })
    .from(methodEnrollments);

  let active = 0;
  let pending = 0;
  let premium = 0;
  let revenueCents = 0;
  for (const r of rows) {
    if (r.status === "active") {
      active += 1;
      revenueCents += r.amountCents ?? 0;
      if (r.tier === "premium") premium += 1;
    } else if (r.status === "pending") {
      pending += 1;
    }
  }

  // Graduated = active enrollments with all modules complete.
  const grad = await db
    .select({
      enrollmentId: methodProgress.enrollmentId,
      n: sql<number>`count(*)::int`,
    })
    .from(methodProgress)
    .groupBy(methodProgress.enrollmentId);
  const graduated = grad.filter((g) => g.n >= TOTAL_MODULES).length;

  return { active, pending, premium, graduated, revenueCents };
}

export async function listMethodEnrollmentsForAdmin(
  statusFilter: string,
  limit = 200,
): Promise<MethodAdminRow[]> {
  const base = db
    .select({
      id: methodEnrollments.id,
      email: methodEnrollments.email,
      name: methodEnrollments.name,
      tier: methodEnrollments.tier,
      status: methodEnrollments.status,
      amountCents: methodEnrollments.amountCents,
      currency: methodEnrollments.currency,
      paidAt: methodEnrollments.paidAt,
      createdAt: methodEnrollments.createdAt,
    })
    .from(methodEnrollments)
    .orderBy(desc(methodEnrollments.createdAt))
    .limit(limit);

  const enrollments =
    statusFilter && statusFilter !== "all"
      ? await base.where(eq(methodEnrollments.status, statusFilter))
      : await base;

  if (enrollments.length === 0) return [];

  const [onboardingRows, progressRows] = await Promise.all([
    db
      .select({
        enrollmentId: methodOnboarding.enrollmentId,
        planName: methodOnboarding.planName,
        planCode: methodOnboarding.planCode,
        goal: methodOnboarding.goal,
        hours: methodOnboarding.hours,
        level: methodOnboarding.level,
      })
      .from(methodOnboarding),
    db
      .select({
        enrollmentId: methodProgress.enrollmentId,
        n: sql<number>`count(*)::int`,
      })
      .from(methodProgress)
      .groupBy(methodProgress.enrollmentId),
  ]);

  const onboardingByEid = new Map(onboardingRows.map((o) => [o.enrollmentId, o]));
  const progressByEid = new Map(progressRows.map((p) => [p.enrollmentId, p.n]));

  return enrollments.map((e) => {
    const ob = onboardingByEid.get(e.id);
    return {
      ...e,
      completedCount: progressByEid.get(e.id) ?? 0,
      totalModules: TOTAL_MODULES,
      planName: ob?.planName ?? null,
      planCode: ob?.planCode ?? null,
      goal: ob?.goal ?? null,
      hours: ob?.hours ?? null,
      level: ob?.level ?? null,
    };
  });
}
