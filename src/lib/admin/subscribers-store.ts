import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq, and, gte, lte, isNull, isNotNull, sql, count, desc } from "drizzle-orm";

// ── Types ──────────────────────────────────────────────────

export interface Subscriber {
  id: number;
  email: string;
  source: string | null;
  sourcePage: string | null;
  signedUpAt: Date | null;
  skoolJoinedAt: Date | null;
  trialStartedAt: Date | null;
  paidAt: Date | null;
  churnedAt: Date | null;
  beehiivId: string | null;
  stripeCustomerId: string | null;
  persona: string | null;
}

export interface FunnelStats {
  signups: number;
  skoolJoins: number;
  trialStarts: number;
  paidMembers: number;
  activeAfter30d: number;
}

export interface CohortRow {
  week: string; // ISO date of week start
  signups: number;
  skoolJoins: number;
  trialStarts: number;
  paidMembers: number;
  activeAfter30d: number;
}

export interface SourceRow {
  source: string;
  signups: number;
  paidMembers: number;
  convRate: number;
}

export interface ContentROI {
  sourcePage: string;
  signups: number;
  paidConversions: number;
  revenue: number; // cents
}

export interface AtRiskTrial {
  email: string;
  trialStartedAt: Date;
  daysLeft: number;
  sourcePage: string | null;
}

export interface StalledSubscriber {
  email: string;
  signedUpAt: Date;
  stalledStage: "no_skool" | "no_trial" | "no_paid";
  daysSinceSignup: number;
}

// ── Upsert functions ──────────────────────────────────────

export async function upsertOnSignup(
  email: string,
  sourcePage: string,
  source?: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .insert(subscribers)
    .values({
      email: normalizedEmail,
      source: source ?? inferSource(sourcePage),
      sourcePage,
      signedUpAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        source: sql`COALESCE(${subscribers.source}, excluded.source)`,
        sourcePage: sql`COALESCE(${subscribers.sourcePage}, excluded.source_page)`,
        signedUpAt: sql`COALESCE(${subscribers.signedUpAt}, excluded.signed_up_at)`,
      },
    });
}

export async function upsertOnSkoolJoin(
  email: string,
  persona?: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .insert(subscribers)
    .values({
      email: normalizedEmail,
      skoolJoinedAt: new Date(),
      persona: persona ?? null,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        skoolJoinedAt: sql`COALESCE(${subscribers.skoolJoinedAt}, excluded.skool_joined_at)`,
        persona: sql`COALESCE(excluded.persona, ${subscribers.persona})`,
      },
    });
}

export async function upsertOnTrialStart(
  email: string,
  stripeCustomerId: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .insert(subscribers)
    .values({
      email: normalizedEmail,
      trialStartedAt: new Date(),
      stripeCustomerId,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        trialStartedAt: sql`COALESCE(${subscribers.trialStartedAt}, excluded.trial_started_at)`,
        stripeCustomerId: sql`COALESCE(excluded.stripe_customer_id, ${subscribers.stripeCustomerId})`,
      },
    });
}

export async function upsertOnPaid(
  email: string,
  stripeCustomerId: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .insert(subscribers)
    .values({
      email: normalizedEmail,
      paidAt: new Date(),
      stripeCustomerId,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        paidAt: sql`COALESCE(${subscribers.paidAt}, excluded.paid_at)`,
        stripeCustomerId: sql`COALESCE(excluded.stripe_customer_id, ${subscribers.stripeCustomerId})`,
      },
    });
}

export async function upsertOnChurn(
  email: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  await db
    .update(subscribers)
    .set({ churnedAt: new Date() })
    .where(eq(subscribers.email, normalizedEmail));
}

// ── Query functions ───────────────────────────────────────

export async function getFunnelStats(from: Date, to: Date): Promise<FunnelStats> {
  const thirtyDaysAgo = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [signupCount, skoolCount, trialCount, paidCount, activeCount] =
    await Promise.all([
      db.select({ cnt: count() }).from(subscribers)
        .where(and(gte(subscribers.signedUpAt, from), lte(subscribers.signedUpAt, to))),
      db.select({ cnt: count() }).from(subscribers)
        .where(and(gte(subscribers.skoolJoinedAt, from), lte(subscribers.skoolJoinedAt, to))),
      db.select({ cnt: count() }).from(subscribers)
        .where(and(gte(subscribers.trialStartedAt, from), lte(subscribers.trialStartedAt, to))),
      db.select({ cnt: count() }).from(subscribers)
        .where(and(gte(subscribers.paidAt, from), lte(subscribers.paidAt, to))),
      db.select({ cnt: count() }).from(subscribers)
        .where(and(
          gte(subscribers.paidAt, from),
          lte(subscribers.paidAt, thirtyDaysAgo),
          isNull(subscribers.churnedAt)
        )),
    ]);

  return {
    signups: Number(signupCount[0]?.cnt ?? 0),
    skoolJoins: Number(skoolCount[0]?.cnt ?? 0),
    trialStarts: Number(trialCount[0]?.cnt ?? 0),
    paidMembers: Number(paidCount[0]?.cnt ?? 0),
    activeAfter30d: Number(activeCount[0]?.cnt ?? 0),
  };
}

export async function getCohortData(from: Date, to: Date): Promise<CohortRow[]> {
  const rows = await db
    .select({
      week: sql<string>`DATE_TRUNC('week', ${subscribers.signedUpAt})::date`,
      signups: count(),
      skoolJoins: sql<number>`COUNT(CASE WHEN ${subscribers.skoolJoinedAt} IS NOT NULL THEN 1 END)`,
      trialStarts: sql<number>`COUNT(CASE WHEN ${subscribers.trialStartedAt} IS NOT NULL THEN 1 END)`,
      paidMembers: sql<number>`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL THEN 1 END)`,
      activeAfter30d: sql<number>`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL AND ${subscribers.churnedAt} IS NULL AND ${subscribers.paidAt} < NOW() - INTERVAL '30 days' THEN 1 END)`,
    })
    .from(subscribers)
    .where(and(
      isNotNull(subscribers.signedUpAt),
      gte(subscribers.signedUpAt, from),
      lte(subscribers.signedUpAt, to)
    ))
    .groupBy(sql`DATE_TRUNC('week', ${subscribers.signedUpAt})`)
    .orderBy(desc(sql`DATE_TRUNC('week', ${subscribers.signedUpAt})`));

  return rows.map((r) => ({
    week: r.week,
    signups: Number(r.signups),
    skoolJoins: Number(r.skoolJoins),
    trialStarts: Number(r.trialStarts),
    paidMembers: Number(r.paidMembers),
    activeAfter30d: Number(r.activeAfter30d),
  }));
}

export async function getSourceBreakdown(from: Date, to: Date): Promise<SourceRow[]> {
  const rows = await db
    .select({
      source: sql<string>`COALESCE(${subscribers.source}, 'unknown')`,
      signups: count(),
      paidMembers: sql<number>`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL THEN 1 END)`,
    })
    .from(subscribers)
    .where(and(
      isNotNull(subscribers.signedUpAt),
      gte(subscribers.signedUpAt, from),
      lte(subscribers.signedUpAt, to)
    ))
    .groupBy(sql`COALESCE(${subscribers.source}, 'unknown')`)
    .orderBy(desc(count()));

  return rows.map((r) => {
    const signups = Number(r.signups);
    const paidMembers = Number(r.paidMembers);
    return {
      source: r.source,
      signups,
      paidMembers,
      convRate: signups > 0 ? (paidMembers / signups) * 100 : 0,
    };
  });
}

export async function getContentROI(): Promise<ContentROI[]> {
  const rows = await db
    .select({
      sourcePage: subscribers.sourcePage,
      signups: count(),
      paidConversions: sql<number>`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL THEN 1 END)`,
    })
    .from(subscribers)
    .where(isNotNull(subscribers.sourcePage))
    .groupBy(subscribers.sourcePage)
    .orderBy(desc(sql`COUNT(CASE WHEN ${subscribers.paidAt} IS NOT NULL THEN 1 END)`));

  // Revenue estimation: $195/month * months active
  return rows.map((r) => ({
    sourcePage: r.sourcePage!,
    signups: Number(r.signups),
    paidConversions: Number(r.paidConversions),
    revenue: Number(r.paidConversions) * 195 * 100, // Approximate: 1 month revenue in cents per paid conversion
  }));
}

export async function getTrialsAtRisk(): Promise<AtRiskTrial[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      email: subscribers.email,
      trialStartedAt: subscribers.trialStartedAt,
      sourcePage: subscribers.sourcePage,
    })
    .from(subscribers)
    .where(and(
      isNotNull(subscribers.trialStartedAt),
      gte(subscribers.trialStartedAt, sevenDaysAgo),
      isNull(subscribers.paidAt)
    ))
    .orderBy(subscribers.trialStartedAt);

  return rows.map((r) => {
    const trialStart = r.trialStartedAt!;
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    return {
      email: r.email,
      trialStartedAt: trialStart,
      daysLeft,
      sourcePage: r.sourcePage,
    };
  });
}

export async function getStalledSubscribers(): Promise<StalledSubscriber[]> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      email: subscribers.email,
      signedUpAt: subscribers.signedUpAt,
      skoolJoinedAt: subscribers.skoolJoinedAt,
      trialStartedAt: subscribers.trialStartedAt,
      paidAt: subscribers.paidAt,
    })
    .from(subscribers)
    .where(and(
      isNotNull(subscribers.signedUpAt),
      lte(subscribers.signedUpAt, fourteenDaysAgo),
      isNull(subscribers.paidAt)
    ))
    .orderBy(subscribers.signedUpAt)
    .limit(50);

  return rows.map((r) => {
    const daysSinceSignup = Math.floor(
      (Date.now() - r.signedUpAt!.getTime()) / (24 * 60 * 60 * 1000)
    );

    let stalledStage: "no_skool" | "no_trial" | "no_paid";
    if (!r.skoolJoinedAt) stalledStage = "no_skool";
    else if (!r.trialStartedAt) stalledStage = "no_trial";
    else stalledStage = "no_paid";

    return {
      email: r.email,
      signedUpAt: r.signedUpAt!,
      stalledStage,
      daysSinceSignup,
    };
  });
}

export async function getHealthStats(): Promise<{
  trialToPaidRate: number;
  trialToPaidRateAvg: number;
  newSignupsTrend: number; // positive = up, negative = down
  communityGrowthRate: number;
}> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [thisWeekTrials, thisWeekPaid, lastWeekTrials, lastWeekPaid, thisWeekSignups, lastWeekSignups, thisWeekSkool, lastWeekSkool] =
    await Promise.all([
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.trialStartedAt, oneWeekAgo), lte(subscribers.trialStartedAt, now))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.paidAt, oneWeekAgo), lte(subscribers.paidAt, now))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.trialStartedAt, twoWeeksAgo), lte(subscribers.trialStartedAt, oneWeekAgo))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.paidAt, twoWeeksAgo), lte(subscribers.paidAt, oneWeekAgo))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.signedUpAt, oneWeekAgo), lte(subscribers.signedUpAt, now))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.signedUpAt, twoWeeksAgo), lte(subscribers.signedUpAt, oneWeekAgo))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.skoolJoinedAt, oneWeekAgo), lte(subscribers.skoolJoinedAt, now))),
      db.select({ cnt: count() }).from(subscribers).where(and(gte(subscribers.skoolJoinedAt, twoWeeksAgo), lte(subscribers.skoolJoinedAt, oneWeekAgo))),
    ]);

  const twTrials = Number(thisWeekTrials[0]?.cnt ?? 0);
  const twPaid = Number(thisWeekPaid[0]?.cnt ?? 0);
  const lwTrials = Number(lastWeekTrials[0]?.cnt ?? 0);
  const lwPaid = Number(lastWeekPaid[0]?.cnt ?? 0);
  const twSignups = Number(thisWeekSignups[0]?.cnt ?? 0);
  const lwSignups = Number(lastWeekSignups[0]?.cnt ?? 0);
  const twSkool = Number(thisWeekSkool[0]?.cnt ?? 0);
  const lwSkool = Number(lastWeekSkool[0]?.cnt ?? 0);

  return {
    trialToPaidRate: twTrials > 0 ? (twPaid / twTrials) * 100 : 0,
    trialToPaidRateAvg: lwTrials > 0 ? (lwPaid / lwTrials) * 100 : 0,
    newSignupsTrend: lwSignups > 0 ? ((twSignups - lwSignups) / lwSignups) * 100 : 0,
    communityGrowthRate: lwSkool > 0 ? ((twSkool - lwSkool) / lwSkool) * 100 : 0,
  };
}

// ── Helpers ───────────────────────────────────────────────

function inferSource(page: string): string {
  if (page.startsWith("/podcast")) return "podcast";
  if (page.includes("ref=")) return "referral";
  return "organic";
}
