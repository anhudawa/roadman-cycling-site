import { db } from "@/lib/db";
import { contacts, subscribers, syncRuns, type SyncRunResult } from "@/lib/db/schema";
import { upsertContact } from "@/lib/crm/contacts";
import { fetchAllSubscribers } from "@/lib/integrations/beehiiv";
import {
  fetchAllCustomers,
  fetchAllSubscriptionsForSync,
} from "@/lib/integrations/stripe";
import { eq, desc, sql } from "drizzle-orm";

const MAX_UPSERTS_PER_RUN = 2000;

export type SyncSource = "beehiiv" | "stripe";

export interface SyncRunRecord {
  id: number;
  source: string;
  status: string;
  result: SyncRunResult | null;
  error: string | null;
  startedAt: Date;
  finishedAt: Date | null;
}

function emptyResult(): SyncRunResult {
  return { scanned: 0, created: 0, updated: 0, skipped: 0, errors: 0 };
}

async function startRun(source: SyncSource): Promise<number> {
  const row = await db
    .insert(syncRuns)
    .values({ source, status: "running" })
    .returning({ id: syncRuns.id });
  return row[0].id;
}

async function finishRun(
  id: number,
  status: "success" | "error",
  result: SyncRunResult | null,
  error: string | null
): Promise<void> {
  await db
    .update(syncRuns)
    .set({
      status,
      result,
      error,
      finishedAt: new Date(),
    })
    .where(eq(syncRuns.id, id));
}

async function existingEmailsSet(emails: string[]): Promise<Set<string>> {
  if (emails.length === 0) return new Set();
  const rows = await db
    .select({ email: contacts.email })
    .from(contacts);
  const existing = new Set(rows.map((r) => r.email.toLowerCase()));
  return existing;
}

export async function syncBeehiivSubscribers(): Promise<{
  runId: number;
  result: SyncRunResult;
}> {
  const runId = await startRun("beehiiv");
  const result = emptyResult();
  try {
    const subs = await fetchAllSubscribers({ limit: MAX_UPSERTS_PER_RUN });
    result.scanned = subs.length;

    const emails = subs.map((s) => s.email.toLowerCase());
    const existing = await existingEmailsSet(emails);

    let processed = 0;
    for (const s of subs) {
      if (processed >= MAX_UPSERTS_PER_RUN) {
        result.skipped += 1;
        continue;
      }
      const emailLower = s.email.toLowerCase();
      const wasExisting = existing.has(emailLower);
      try {
        if (wasExisting) {
          // Touch contact (last activity) without overwriting source
          await upsertContact({
            email: s.email,
            name: s.name ?? null,
            firstSeenAt: s.createdAt ?? undefined,
          });
          result.updated += 1;
        } else {
          await upsertContact({
            email: s.email,
            name: s.name ?? null,
            source: "beehiiv",
            firstSeenAt: s.createdAt ?? undefined,
          });
          result.created += 1;
        }
      } catch (err) {
        console.error("[sync] beehiiv upsert failed", s.email, err);
        result.errors += 1;
      }
      processed++;
    }

    await finishRun(runId, "success", result, null);
    return { runId, result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await finishRun(runId, "error", result, msg);
    throw err;
  }
}

export async function syncStripeCustomers(): Promise<{
  runId: number;
  result: SyncRunResult;
}> {
  const runId = await startRun("stripe");
  const result = emptyResult();
  try {
    // $”€$”€ 1. Sync customers into contacts (existing behaviour) $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
    const customers = await fetchAllCustomers({ limit: MAX_UPSERTS_PER_RUN });
    result.scanned = customers.length;

    const emails = customers.map((c) => c.email.toLowerCase());
    const existing = await existingEmailsSet(emails);

    let processed = 0;
    for (const c of customers) {
      if (processed >= MAX_UPSERTS_PER_RUN) {
        result.skipped += 1;
        continue;
      }
      const emailLower = c.email.toLowerCase();
      const wasExisting = existing.has(emailLower);
      try {
        if (wasExisting) {
          await upsertContact({
            email: c.email,
            name: c.name,
            firstSeenAt: c.createdAt,
          });
          result.updated += 1;
        } else {
          await upsertContact({
            email: c.email,
            name: c.name,
            source: "stripe",
            firstSeenAt: c.createdAt,
          });
          result.created += 1;
        }
      } catch (err) {
        console.error("[sync] stripe upsert failed", c.email, err);
        result.errors += 1;
      }
      processed++;
    }

    // $”€$”€ 2. Sync subscription lifecycle into subscribers table $”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€$”€
    // Previously missing: subscribers.paid_at / trial_started_at / churned_at
    // were never set from Stripe, so /admin/funnel, /admin/health and
    // trial-conversion metrics all showed 0. Populate them here so everything
    // downstream (funnel, cohort retention, LTV) actually has numbers.
    const subs = await fetchAllSubscriptionsForSync({ limit: MAX_UPSERTS_PER_RUN });
    let linked = 0;
    let lifecycleErrors = 0;

    // Group subs by email so a customer with multiple subscriptions still
    // gets one consolidated lifecycle state.
    const byEmail = new Map<string, typeof subs>();
    for (const s of subs) {
      if (!s.email) continue;
      const key = s.email.toLowerCase();
      const arr = byEmail.get(key) ?? [];
      arr.push(s);
      byEmail.set(key, arr);
    }

    for (const [email, rows] of byEmail) {
      try {
        // Pick the most representative subscription:
        //   - any active/trialing/past_due wins over canceled
        //   - most recently created among those
        const live = rows.filter((r) =>
          ["active", "trialing", "past_due"].includes(r.status)
        );
        const canceled = rows.filter((r) => r.status === "canceled");
        const pick =
          (live.length > 0
            ? live.sort((a, b) => +b.createdAt - +a.createdAt)[0]
            : null) ??
          (canceled.length > 0
            ? canceled.sort((a, b) => +b.createdAt - +a.createdAt)[0]
            : rows[0]);

        const wasPaid = pick.status === "active" || pick.status === "past_due";
        const wasTrialing = pick.status === "trialing";
        const wasChurned = pick.status === "canceled";

        // Derive timestamps from the subscription:
        //   - trialStartedAt: earliest trial_start across this customer's subs
        //   - paidAt: earliest createdAt of an active/past_due sub
        //   - churnedAt: canceled_at of the most recent canceled sub
        //     (only if no live sub exists $€” a churn-then-resubscribe is "paid")
        const trialStart = rows
          .map((r) => r.trialStart)
          .filter((d): d is Date => d !== null)
          .sort((a, b) => +a - +b)[0] ?? null;
        const paidAt = live
          .map((r) => r.createdAt)
          .sort((a, b) => +a - +b)[0] ?? null;
        const churnedAt =
          live.length === 0 && canceled.length > 0
            ? canceled
                .map((r) => r.canceledAt ?? r.createdAt)
                .sort((a, b) => +b - +a)[0] ?? null
            : null;

        await db
          .insert(subscribers)
          .values({
            email,
            stripeCustomerId: pick.customerId,
            source: "stripe",
            trialStartedAt: trialStart ?? null,
            paidAt: wasPaid ? paidAt : null,
            churnedAt: wasChurned ? churnedAt : null,
          })
          .onConflictDoUpdate({
            target: subscribers.email,
            set: {
              stripeCustomerId: sql`COALESCE(excluded.stripe_customer_id, ${subscribers.stripeCustomerId})`,
              // Coalesce so we never downgrade (e.g. trial-end resetting a paid_at).
              trialStartedAt: sql`COALESCE(${subscribers.trialStartedAt}, excluded.trial_started_at)`,
              paidAt: sql`COALESCE(${subscribers.paidAt}, excluded.paid_at)`,
              churnedAt: wasChurned
                ? sql`COALESCE(${subscribers.churnedAt}, excluded.churned_at)`
                : subscribers.churnedAt,
              source: sql`COALESCE(${subscribers.source}, excluded.source)`,
            },
          });

        // Clear churnedAt if the customer has re-subscribed (live wins).
        if (live.length > 0 && !wasTrialing) {
          await db
            .update(subscribers)
            .set({ churnedAt: null })
            .where(eq(subscribers.email, email));
        }

        linked += 1;
      } catch (err) {
        console.error("[sync] subscription lifecycle failed for", email, err);
        lifecycleErrors += 1;
      }
    }

    result.updated += linked;
    result.errors += lifecycleErrors;

    await finishRun(runId, "success", result, null);
    return { runId, result };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await finishRun(runId, "error", result, msg);
    throw err;
  }
}

export async function listRecentRuns(limit = 20): Promise<SyncRunRecord[]> {
  const rows = await db
    .select()
    .from(syncRuns)
    .orderBy(desc(syncRuns.startedAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    status: r.status,
    result: r.result as SyncRunResult | null,
    error: r.error,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt,
  }));
}
