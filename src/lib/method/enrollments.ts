/**
 * Database helpers for The Method enrollments.
 *
 * All queries take a normalised, lowercase email — callers are responsible
 * for trim+lowercase before invoking. We intentionally don't double-normalise
 * here so a typo upstream surfaces rather than silently rewrites the row.
 */

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  methodEnrollments,
  methodProgress,
  type MethodEnrollment,
} from "./schema";
import type { MethodTier } from "./tiers";

export async function getEnrollmentByEmail(
  email: string,
): Promise<MethodEnrollment | null> {
  const rows = await db
    .select()
    .from(methodEnrollments)
    .where(eq(methodEnrollments.email, email))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEnrollmentById(
  id: number,
): Promise<MethodEnrollment | null> {
  const rows = await db
    .select()
    .from(methodEnrollments)
    .where(eq(methodEnrollments.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEnrollmentByStripeSessionId(
  stripeSessionId: string,
): Promise<MethodEnrollment | null> {
  const rows = await db
    .select()
    .from(methodEnrollments)
    .where(eq(methodEnrollments.stripeSessionId, stripeSessionId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Idempotently create-or-refresh a pending enrollment row at the start of
 * checkout. Mirrors the camp_bookings upsert pattern: re-clicking "Buy"
 * updates the same row rather than spawning duplicates, so the webhook
 * has a stable `id` to settle against.
 */
export async function upsertPendingEnrollment(input: {
  email: string;
  name: string | null;
  tier?: MethodTier;
}): Promise<MethodEnrollment> {
  const tier: MethodTier = input.tier ?? "standard";
  const inserted = await db
    .insert(methodEnrollments)
    .values({
      email: input.email,
      name: input.name,
      tier,
      status: "pending",
    })
    .onConflictDoUpdate({
      target: methodEnrollments.email,
      set: {
        name: input.name,
        // Re-clicking Buy with a different tier selection updates the row,
        // so the Stripe line item and the stored tier stay in lock-step.
        tier,
        updatedAt: new Date(),
      },
    })
    .returning();
  if (!inserted[0]) {
    // Postgres ON CONFLICT … RETURNING reliably returns the row in the
    // 0.45 driver, but defensive fallback in case a future upgrade changes
    // semantics.
    const row = await getEnrollmentByEmail(input.email);
    if (!row) throw new Error("Failed to upsert method enrollment");
    return row;
  }
  return inserted[0];
}

export async function attachStripeSessionId(
  enrollmentId: number,
  stripeSessionId: string,
): Promise<void> {
  await db
    .update(methodEnrollments)
    .set({ stripeSessionId, updatedAt: new Date() })
    .where(eq(methodEnrollments.id, enrollmentId));
}

/**
 * Webhook settle path. Idempotent on `stripeEventIds` — re-delivered
 * events flip nothing. Caller is expected to log if `wasAlreadyPaid`
 * comes back true.
 */
export async function markEnrollmentPaid(input: {
  enrollmentId: number;
  stripeEventId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amountCents: number | null;
  currency: string;
}): Promise<{ enrollment: MethodEnrollment; wasAlreadyPaid: boolean }> {
  const existing = await getEnrollmentById(input.enrollmentId);
  if (!existing) throw new Error(`enrollment ${input.enrollmentId} not found`);

  if (existing.stripeEventIds.includes(input.stripeEventId)) {
    return { enrollment: existing, wasAlreadyPaid: true };
  }
  if (existing.paidAt) {
    // Different event for an already-paid enrollment (e.g. async webhook
    // retry across both URLs). Append the event id for audit but skip
    // the side effects.
    const updated = await db
      .update(methodEnrollments)
      .set({
        stripeEventIds: sql`${methodEnrollments.stripeEventIds} || ${JSON.stringify([input.stripeEventId])}::jsonb`,
        updatedAt: new Date(),
      })
      .where(eq(methodEnrollments.id, input.enrollmentId))
      .returning();
    return { enrollment: updated[0] ?? existing, wasAlreadyPaid: true };
  }

  const now = new Date();
  const updated = await db
    .update(methodEnrollments)
    .set({
      status: "active",
      paidAt: now,
      dripStartAt: now,
      stripeSessionId: input.stripeSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId,
      amountCents: input.amountCents,
      currency: input.currency,
      stripeEventIds: sql`${methodEnrollments.stripeEventIds} || ${JSON.stringify([input.stripeEventId])}::jsonb`,
      updatedAt: now,
    })
    .where(eq(methodEnrollments.id, input.enrollmentId))
    .returning();
  if (!updated[0]) throw new Error("markEnrollmentPaid update returned no row");
  return { enrollment: updated[0], wasAlreadyPaid: false };
}

export async function getCompletedSlugs(
  enrollmentId: number,
): Promise<string[]> {
  const rows = await db
    .select({ slug: methodProgress.moduleSlug })
    .from(methodProgress)
    .where(eq(methodProgress.enrollmentId, enrollmentId));
  return rows.map((r) => r.slug);
}
