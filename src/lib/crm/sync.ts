import { db } from "@/lib/db";
import { contacts, syncRuns, type SyncRunResult } from "@/lib/db/schema";
import { upsertContact } from "@/lib/crm/contacts";
import { fetchAllSubscribers } from "@/lib/integrations/beehiiv";
import { fetchAllCustomers } from "@/lib/integrations/stripe";
import { eq, desc } from "drizzle-orm";

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
