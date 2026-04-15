/**
 * Waiting-list helpers for the pre-launch Blood Engine landing page.
 *
 * Single source of truth for every place that reads or writes the waitlist —
 * API route, admin view, stats, future email campaign scheduler.
 */

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "../db";
import { bloodEngineWaitlist } from "../db/schema";

export type WaitlistEntry = typeof bloodEngineWaitlist.$inferSelect;

export interface AddWaitlistParams {
  email: string;
  source?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}

export interface AddWaitlistResult {
  entry: WaitlistEntry;
  /** True the first time this email was added; false if it was already there. */
  isNew: boolean;
}

/**
 * Idempotent — calling twice with the same email returns isNew=false the
 * second time. Previously-unsubscribed emails are re-activated.
 */
export async function addToWaitlist(
  params: AddWaitlistParams
): Promise<AddWaitlistResult> {
  const email = params.email.toLowerCase();

  const existing = await db
    .select()
    .from(bloodEngineWaitlist)
    .where(eq(bloodEngineWaitlist.email, email))
    .limit(1);

  if (existing[0]) {
    // Re-activate if previously unsubscribed; otherwise no-op.
    if (existing[0].unsubscribedAt) {
      const [updated] = await db
        .update(bloodEngineWaitlist)
        .set({ unsubscribedAt: null })
        .where(eq(bloodEngineWaitlist.id, existing[0].id))
        .returning();
      return { entry: updated, isNew: false };
    }
    return { entry: existing[0], isNew: false };
  }

  const [created] = await db
    .insert(bloodEngineWaitlist)
    .values({
      email,
      source: params.source ?? null,
      referrer: params.referrer ?? null,
      userAgent: params.userAgent ?? null,
      ip: params.ip ?? null,
    })
    .returning();
  return { entry: created, isNew: true };
}

export async function unsubscribeFromWaitlist(email: string): Promise<void> {
  await db
    .update(bloodEngineWaitlist)
    .set({ unsubscribedAt: new Date() })
    .where(eq(bloodEngineWaitlist.email, email.toLowerCase()));
}

export async function listWaitlist(): Promise<WaitlistEntry[]> {
  return db
    .select()
    .from(bloodEngineWaitlist)
    .orderBy(desc(bloodEngineWaitlist.createdAt));
}

export interface WaitlistStats {
  total: number;
  active: number;
  notified: number;
  unsubscribed: number;
  bySource: Record<string, number>;
}

export async function waitlistStats(): Promise<WaitlistStats> {
  const rows = await db.select().from(bloodEngineWaitlist);
  const bySource: Record<string, number> = {};
  let notified = 0;
  let unsubscribed = 0;
  for (const r of rows) {
    const key = r.source || "(unknown)";
    bySource[key] = (bySource[key] ?? 0) + 1;
    if (r.notifiedAt) notified++;
    if (r.unsubscribedAt) unsubscribed++;
  }
  return {
    total: rows.length,
    active: rows.length - unsubscribed,
    notified,
    unsubscribed,
    bySource,
  };
}

/** Active (not-unsubscribed) and not-yet-notified — for future launch emails. */
export async function listPendingNotification(): Promise<WaitlistEntry[]> {
  return db
    .select()
    .from(bloodEngineWaitlist)
    .where(
      and(
        isNull(bloodEngineWaitlist.unsubscribedAt),
        isNull(bloodEngineWaitlist.notifiedAt)
      )
    );
}

export async function markNotified(id: number): Promise<void> {
  await db
    .update(bloodEngineWaitlist)
    .set({ notifiedAt: new Date() })
    .where(eq(bloodEngineWaitlist.id, id));
}

/** Active subscribers who HAVE been notified — useful for a re-send target. */
export async function listNotified(): Promise<WaitlistEntry[]> {
  return db
    .select()
    .from(bloodEngineWaitlist)
    .where(
      and(
        isNotNull(bloodEngineWaitlist.notifiedAt),
        isNull(bloodEngineWaitlist.unsubscribedAt)
      )
    );
}
