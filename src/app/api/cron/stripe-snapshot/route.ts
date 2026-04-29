import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripeSnapshots } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { startCronRun, finishCronRun } from "@/lib/crm/cron-runs";
import {
  fetchMrrBreakdown,
  fetchRevenueForPeriod,
} from "@/lib/integrations/stripe";
import { verifyBearer } from "@/lib/security/bearer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  return verifyBearer(authHeader, cronSecret);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Daily snapshot of Stripe MRR + subscription health.
 *
 * Pulls every active/trialing/past_due subscription from Stripe, normalises
 * each to monthly cents, and upserts one row per day into stripe_snapshots.
 * Also captures total charges over the trailing 24h so the revenue page can
 * show daily cashflow alongside recurring MRR.
 *
 * This is the foundation of the mission-control dashboard: without these
 * snapshots we can't plot MRR trends, compute churn, or project a glide
 * path to $100K.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: runId } = await startCronRun("stripe_snapshot");
  try {
    const mrr = await fetchMrrBreakdown();
    if (!mrr) {
      await finishCronRun(runId, "error", {
        error: "Stripe fetchMrrBreakdown returned null",
      });
      return NextResponse.json(
        { error: "Stripe MRR fetch failed" },
        { status: 502 }
      );
    }

    // Trailing 24h charges for the "daily cash" tile on the revenue page.
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const period = await fetchRevenueForPeriod(since, now);
    const totalRevenueCents = period?.totalCents ?? 0;
    const transactionCount = period?.count ?? 0;

    // Net-new MRR / subs vs most recent earlier snapshot.
    const [prev] = await db
      .select({
        mrr: stripeSnapshots.mrrCents,
        active: stripeSnapshots.activeSubscriptions,
      })
      .from(stripeSnapshots)
      .where(sql`${stripeSnapshots.snapshotDate} < ${today()}::date`)
      .orderBy(desc(stripeSnapshots.snapshotDate))
      .limit(1);

    const netNewMrrCents = prev ? mrr.mrrCents - Number(prev.mrr) : 0;
    const netNewSubs = prev
      ? mrr.activeSubscriptionCount - Number(prev.active)
      : 0;

    await db
      .insert(stripeSnapshots)
      .values({
        snapshotDate: today(),
        totalRevenueCents,
        transactionCount,
        mrrCents: mrr.mrrCents,
        activeSubscriptions: mrr.activeSubscriptionCount,
        trialingCount: mrr.trialingCount,
        pastDueCount: mrr.pastDueCount,
        pastDueMrrCents: mrr.pastDueMrrCents,
        annualMrrCents: mrr.annualMrrCents,
        netNewMrrCents,
        netNewSubs,
        rawData: {
          capturedAt: now.toISOString(),
          prev: prev
            ? { mrr: Number(prev.mrr), active: Number(prev.active) }
            : null,
        },
      })
      .onConflictDoUpdate({
        target: stripeSnapshots.snapshotDate,
        set: {
          totalRevenueCents,
          transactionCount,
          mrrCents: mrr.mrrCents,
          activeSubscriptions: mrr.activeSubscriptionCount,
          trialingCount: mrr.trialingCount,
          pastDueCount: mrr.pastDueCount,
          pastDueMrrCents: mrr.pastDueMrrCents,
          annualMrrCents: mrr.annualMrrCents,
          netNewMrrCents,
          netNewSubs,
          rawData: {
            capturedAt: now.toISOString(),
            prev: prev
              ? { mrr: Number(prev.mrr), active: Number(prev.active) }
              : null,
          },
        },
      });

    await finishCronRun(runId, "success", {
      result: {
        mrrCents: mrr.mrrCents,
        activeSubscriptions: mrr.activeSubscriptionCount,
        trialing: mrr.trialingCount,
        pastDue: mrr.pastDueCount,
        netNewMrrCents,
        netNewSubs,
        dayRevenueCents: totalRevenueCents,
      },
      error: null,
    });

    return NextResponse.json({
      ok: true,
      date: today(),
      mrrCents: mrr.mrrCents,
      activeSubscriptions: mrr.activeSubscriptionCount,
      trialing: mrr.trialingCount,
      pastDue: mrr.pastDueCount,
      netNewMrrCents,
      netNewSubs,
      dayRevenueCents: totalRevenueCents,
    });
  } catch (err) {
    await finishCronRun(runId, "error", {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
