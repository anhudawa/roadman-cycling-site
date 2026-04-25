import { db } from "@/lib/db";
import { stripeSnapshots, subscribers } from "@/lib/db/schema";
import { asc, desc, gte, lte, and, sql, count } from "drizzle-orm";
import { fetchMrrBreakdown } from "@/lib/integrations/stripe";

/**
 * Mission-control data model.
 *
 * Prefers the stripe_snapshots table (written daily by /api/cron/stripe-snapshot)
 * so dashboard loads don't hit the Stripe API. Falls back to a live fetch when
 * no snapshots exist yet so day-zero still renders something real.
 */

export const TARGET_MRR_CENTS = 100_000_00; // $100,000

export interface MrrNow {
  mrrCents: number;
  activeSubscriptions: number;
  trialingCount: number;
  pastDueCount: number;
  pastDueMrrCents: number;
  annualMrrCents: number;
  asOf: Date;
  /** Has the snapshot cron actually run? When false we fell back to a live Stripe fetch. */
  fromSnapshot: boolean;
}

export interface MrrTrendPoint {
  date: string; // YYYY-MM-DD
  mrrCents: number;
  activeSubscriptions: number;
  netNewMrrCents: number;
  netNewSubs: number;
  pastDueMrrCents: number;
}

export interface MrrSummary {
  now: MrrNow;
  /** Last N days of MRR history. */
  trend: MrrTrendPoint[];
  /** Daily net MRR adds averaged over last 30 days (cents/day). */
  avgDailyNetAdd30dCents: number;
  /** Monthly net add rate = 30d avg Ã— 30. */
  monthlyNetAddCents: number;
  /** Projection in months at current pace. Null if not growing or already past target. */
  monthsToTargetAtCurrentPace: number | null;
  /** Human-readable current-month delta: month-over-month change in MRR. */
  moMChangeCents: number | null;
  moMChangePct: number | null;
  /** Churn: subscribers with churnedAt in trailing 30d. */
  churnedSubscribers30d: number;
  /** Approximate churned MRR (count Ã— current ARPU). */
  approxChurnedMrrCents: number;
  /** Trial $†’ paid conversion rate last 30d. */
  trialsStarted30d: number;
  trialsConverted30d: number;
  trialConversionRate: number; // 0..1
}

async function readRecentSnapshots(days: number) {
  const cutoff = new Date(Date.now() - days * 86400000);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return db
    .select()
    .from(stripeSnapshots)
    .where(gte(stripeSnapshots.snapshotDate, cutoffStr))
    .orderBy(asc(stripeSnapshots.snapshotDate));
}

export async function getMrrSummary(
  opts: { trendDays?: number } = {}
): Promise<MrrSummary | null> {
  const trendDays = opts.trendDays ?? 90;

  // 1. MRR now $€” prefer today's snapshot, fall back to live fetch.
  const latest = await db
    .select()
    .from(stripeSnapshots)
    .orderBy(desc(stripeSnapshots.snapshotDate))
    .limit(1);

  let now: MrrNow;
  if (latest.length > 0) {
    const l = latest[0];
    const asOf = new Date(String(l.snapshotDate));
    now = {
      mrrCents: Number(l.mrrCents ?? 0),
      activeSubscriptions: Number(l.activeSubscriptions ?? 0),
      trialingCount: Number(l.trialingCount ?? 0),
      pastDueCount: Number(l.pastDueCount ?? 0),
      pastDueMrrCents: Number(l.pastDueMrrCents ?? 0),
      annualMrrCents: Number(l.annualMrrCents ?? 0),
      asOf,
      fromSnapshot: true,
    };
  } else {
    const live = await fetchMrrBreakdown();
    if (!live) return null;
    now = {
      mrrCents: live.mrrCents,
      activeSubscriptions: live.activeSubscriptionCount,
      trialingCount: live.trialingCount,
      pastDueCount: live.pastDueCount,
      pastDueMrrCents: live.pastDueMrrCents,
      annualMrrCents: live.annualMrrCents,
      asOf: new Date(),
      fromSnapshot: false,
    };
  }

  // 2. Trend
  const history = await readRecentSnapshots(trendDays);
  const trend: MrrTrendPoint[] = history.map((h) => ({
    date: String(h.snapshotDate),
    mrrCents: Number(h.mrrCents ?? 0),
    activeSubscriptions: Number(h.activeSubscriptions ?? 0),
    netNewMrrCents: Number(h.netNewMrrCents ?? 0),
    netNewSubs: Number(h.netNewSubs ?? 0),
    pastDueMrrCents: Number(h.pastDueMrrCents ?? 0),
  }));

  // 3. Last-30d avg daily net add $†’ monthly projection
  const last30 = trend.slice(-30);
  const sum30 = last30.reduce((s, p) => s + p.netNewMrrCents, 0);
  const avgDaily = last30.length > 0 ? sum30 / last30.length : 0;
  const monthlyNetAddCents = Math.round(avgDaily * 30);

  const remainingCents = Math.max(0, TARGET_MRR_CENTS - now.mrrCents);
  const monthsToTargetAtCurrentPace =
    monthlyNetAddCents > 0 ? remainingCents / monthlyNetAddCents : null;

  // 4. Month-over-month: compare today to 30 days ago.
  let moMChangeCents: number | null = null;
  let moMChangePct: number | null = null;
  if (trend.length >= 2) {
    const oldest30 = trend.find((p) => {
      const d = new Date(p.date).getTime();
      return d >= Date.now() - 30.5 * 86400000 && d <= Date.now() - 29.5 * 86400000;
    }) ?? trend[0];
    if (oldest30) {
      moMChangeCents = now.mrrCents - oldest30.mrrCents;
      moMChangePct =
        oldest30.mrrCents > 0
          ? (moMChangeCents / oldest30.mrrCents) * 100
          : null;
    }
  }

  // 5. Churn in trailing 30d (from subscribers table)
  const thirty = new Date(Date.now() - 30 * 86400000);
  const [churnRow] = await db
    .select({ n: count() })
    .from(subscribers)
    .where(
      and(
        gte(subscribers.churnedAt, thirty),
        lte(subscribers.churnedAt, new Date())
      )
    );
  const churnedSubscribers30d = Number(churnRow?.n ?? 0);
  const approxArpu =
    now.activeSubscriptions > 0 ? now.mrrCents / now.activeSubscriptions : 0;
  const approxChurnedMrrCents = Math.round(
    churnedSubscribers30d * approxArpu
  );

  // 6. Trial $†’ paid conversion (trailing 30d)
  const [trialsStartedRow] = await db
    .select({ n: count() })
    .from(subscribers)
    .where(
      and(
        gte(subscribers.trialStartedAt, thirty),
        lte(subscribers.trialStartedAt, new Date())
      )
    );
  const [trialsConvertedRow] = await db
    .select({ n: count() })
    .from(subscribers)
    .where(
      and(
        gte(subscribers.trialStartedAt, thirty),
        lte(subscribers.trialStartedAt, new Date()),
        sql`${subscribers.paidAt} IS NOT NULL`
      )
    );
  const trialsStarted30d = Number(trialsStartedRow?.n ?? 0);
  const trialsConverted30d = Number(trialsConvertedRow?.n ?? 0);
  const trialConversionRate =
    trialsStarted30d > 0 ? trialsConverted30d / trialsStarted30d : 0;

  return {
    now,
    trend,
    avgDailyNetAdd30dCents: Math.round(avgDaily),
    monthlyNetAddCents,
    monthsToTargetAtCurrentPace,
    moMChangeCents,
    moMChangePct,
    churnedSubscribers30d,
    approxChurnedMrrCents,
    trialsStarted30d,
    trialsConverted30d,
    trialConversionRate,
  };
}

export function formatCents(cents: number): string {
  const usd = cents / 100;
  if (Math.abs(usd) >= 10_000) {
    return `$${Math.round(usd).toLocaleString()}`;
  }
  return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCentsCompact(cents: number): string {
  const usd = cents / 100;
  if (Math.abs(usd) >= 1_000_000)
    return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (Math.abs(usd) >= 1_000) return `$${(usd / 1_000).toFixed(1)}k`;
  return `$${usd.toFixed(0)}`;
}
