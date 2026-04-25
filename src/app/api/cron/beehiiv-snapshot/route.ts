import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { beehiivSnapshots } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { startCronRun, finishCronRun } from "@/lib/crm/cron-runs";
import {
  fetchSubscriberStats,
  fetchNewsletterPosts,
} from "@/lib/integrations/beehiiv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

function today(): string {
  // YYYY-MM-DD in UTC $€” postgres DATE column is timezone-agnostic so pick a
  // stable timezone. UTC matches the 06:00 cron schedule.
  return new Date().toISOString().slice(0, 10);
}

/**
 * Daily snapshot of Beehiiv subscriber + engagement numbers.
 *
 * Persists one row per day to beehiiv_snapshots so:
 *   $€¢ the newsletter page can plot real subscriber-growth trends from DB
 *     instead of paginating the Beehiiv API on every load;
 *   $€¢ weekly/monthly reporting has a durable record even if Beehiiv changes
 *     its API shape or returns transient errors.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: runId } = await startCronRun("beehiiv_snapshot");
  try {
    const [stats, posts] = await Promise.all([
      fetchSubscriberStats(),
      fetchNewsletterPosts(50),
    ]);

    if (!stats) {
      await finishCronRun(runId, "error", {
        error: "Beehiiv fetchSubscriberStats returned null",
      });
      return NextResponse.json(
        { error: "Beehiiv subscriber stats unavailable" },
        { status: 502 }
      );
    }

    const totalSubscribers = stats.totalSubscribers;
    const activeSubscribers = stats.activeSubscribers;

    // Yesterday's snapshot $†’ today delta
    const [prev] = await db
      .select({
        total: beehiivSnapshots.totalSubscribers,
      })
      .from(beehiivSnapshots)
      .where(sql`${beehiivSnapshots.snapshotDate} < ${today()}::date`)
      .orderBy(desc(beehiivSnapshots.snapshotDate))
      .limit(1);

    const newSubscribersToday = prev?.total
      ? Math.max(0, totalSubscribers - Number(prev.total))
      : 0;

    // Send-weighted averages across the last 20 sends with recipients > 0,
    // matching how the newsletter page renders the headline numbers.
    const recentSends = posts
      .filter(
        (p) =>
          p.sentAt !== null &&
          (p.stats.recipients > 0 || p.stats.openRate > 0)
      )
      .slice(0, 20);
    const totalRecipients = recentSends.reduce(
      (s, p) => s + p.stats.recipients,
      0
    );
    const totalOpens = recentSends.reduce((s, p) => s + p.stats.opens, 0);
    const totalClicks = recentSends.reduce((s, p) => s + p.stats.clicks, 0);
    const avgOpenRate =
      totalRecipients > 0
        ? totalOpens / totalRecipients
        : recentSends.length > 0
          ? recentSends.reduce((s, p) => s + p.stats.openRate, 0) /
            recentSends.length
          : 0;
    const avgClickRate =
      totalRecipients > 0
        ? totalClicks / totalRecipients
        : recentSends.length > 0
          ? recentSends.reduce((s, p) => s + p.stats.clickRate, 0) /
            recentSends.length
          : 0;

    // Upsert by date (unique index on snapshot_date) so re-runs within the
    // same day overwrite instead of erroring.
    await db
      .insert(beehiivSnapshots)
      .values({
        snapshotDate: today(),
        totalSubscribers,
        activeSubscribers,
        newSubscribersToday,
        avgOpenRate,
        avgClickRate,
        rawData: {
          recentSendCount: recentSends.length,
          totalRecipients,
          totalOpens,
          totalClicks,
        },
      })
      .onConflictDoUpdate({
        target: beehiivSnapshots.snapshotDate,
        set: {
          totalSubscribers,
          activeSubscribers,
          newSubscribersToday,
          avgOpenRate,
          avgClickRate,
          rawData: {
            recentSendCount: recentSends.length,
            totalRecipients,
            totalOpens,
            totalClicks,
          },
        },
      });

    await finishCronRun(runId, "success", {
      result: {
        totalSubscribers,
        activeSubscribers,
        newSubscribersToday,
        avgOpenRate,
        avgClickRate,
        sendsAnalyzed: recentSends.length,
      },
      error: null,
    });

    return NextResponse.json({
      ok: true,
      date: today(),
      totalSubscribers,
      activeSubscribers,
      newSubscribersToday,
      avgOpenRate,
      avgClickRate,
      sendsAnalyzed: recentSends.length,
    });
  } catch (err) {
    await finishCronRun(runId, "error", {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

