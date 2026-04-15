import { db } from "@/lib/db";
import { contacts, contactActivities, deals } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export type ScoreBand = "hot" | "warm" | "cool" | "cold";

export interface ScoreSignals {
  isBeehiivSubscriber: boolean;
  isStripeCustomer: boolean;
  cohortApplicationCount: number;
  emailsSent90d: number;
  emailOpens90d: number;
  emailClicks90d: number;
  notesEver: number;
  qualifiedOfferedAcceptedStageChanges: number;
  lifecycleStage: string | null;
  hasWonDeal: boolean;
  hasOpenDealProposalish: boolean;
  lastActivityAt: Date | null;
}

export function computeScore(signals: ScoreSignals): number {
  let score = 0;

  if (signals.isBeehiivSubscriber) score += 20;
  if (signals.isStripeCustomer) score += 50;
  if (signals.cohortApplicationCount > 0) score += 30;

  score += Math.min(20, signals.emailsSent90d * 2);
  score += Math.min(50, signals.emailOpens90d * 10);
  score += Math.min(75, signals.emailClicks90d * 25);
  score += Math.min(25, signals.notesEver * 5);
  score += Math.min(120, signals.qualifiedOfferedAcceptedStageChanges * 40);

  switch (signals.lifecycleStage) {
    case "customer":
      score += 100;
      break;
    case "opportunity":
      score += 50;
      break;
    case "lead":
      score += 20;
      break;
    default:
      break;
  }

  if (signals.hasWonDeal) score += 150;
  if (signals.hasOpenDealProposalish) score += 75;

  // Recency
  if (!signals.lastActivityAt) {
    score -= 50;
  } else {
    const days =
      (Date.now() - signals.lastActivityAt.getTime()) / 86_400_000;
    if (days <= 7) score += 30;
    else if (days <= 30) score += 10;
    else if (days <= 90) score += 0;
    else score -= 30;
  }

  if (score < 0) score = 0;
  if (score > 1000) score = 1000;
  return Math.round(score);
}

export function getScoreBand(score: number): ScoreBand {
  if (score >= 250) return "hot";
  if (score >= 120) return "warm";
  if (score >= 50) return "cool";
  return "cold";
}

export function bandBadgeClass(band: ScoreBand): string {
  switch (band) {
    case "hot":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    case "warm":
      return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    case "cool":
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "cold":
    default:
      return "bg-slate-600/20 text-slate-400 border-slate-600/30";
  }
}

function getAt<T>(obj: unknown, path: string[]): T | undefined {
  let cur: unknown = obj;
  for (const p of path) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur as T;
}

export async function scoreContact(contactId: number): Promise<number> {
  const contactRow = await db
    .select()
    .from(contacts)
    .where(eq(contacts.id, contactId))
    .limit(1);
  if (contactRow.length === 0) return 0;
  const c = contactRow[0];

  const since90 = new Date(Date.now() - 90 * 86_400_000);

  const cf = (c.customFields ?? {}) as Record<string, unknown>;
  const isBeehiivSubscriber =
    getAt<boolean>(cf, ["enrichment", "beehiiv", "isSubscriber"]) === true;
  const isStripeCustomer =
    getAt<boolean>(cf, ["enrichment", "stripe", "isCustomer"]) === true;

  const acts = await db
    .select({
      type: contactActivities.type,
      createdAt: contactActivities.createdAt,
      meta: contactActivities.meta,
    })
    .from(contactActivities)
    .where(eq(contactActivities.contactId, contactId));

  let cohortApplicationCount = 0;
  let emailsSent90d = 0;
  let emailOpens90d = 0;
  let emailClicks90d = 0;
  let notesEver = 0;
  let qualifiedOfferedAcceptedStageChanges = 0;

  for (const a of acts) {
    const createdAt = a.createdAt as Date;
    const within90 = createdAt >= since90;
    switch (a.type) {
      case "cohort_application":
        cohortApplicationCount += 1;
        break;
      case "email_sent":
        if (within90) emailsSent90d += 1;
        break;
      case "email_opened":
        if (within90) emailOpens90d += 1;
        break;
      case "email_clicked":
        if (within90) emailClicks90d += 1;
        break;
      case "note":
        notesEver += 1;
        break;
      case "stage_change": {
        const meta = (a.meta ?? {}) as Record<string, unknown>;
        const to =
          (meta.to as string | undefined) ??
          (meta.next as string | undefined) ??
          (meta.toStage as string | undefined);
        if (to && ["qualified", "offered", "accepted"].includes(to)) {
          qualifiedOfferedAcceptedStageChanges += 1;
        }
        break;
      }
      default:
        break;
    }
  }

  const dealRows = await db
    .select({ stage: deals.stage })
    .from(deals)
    .where(eq(deals.contactId, contactId));

  let hasWonDeal = false;
  let hasOpenDealProposalish = false;
  for (const d of dealRows) {
    if (d.stage === "won") hasWonDeal = true;
    if (["proposal", "negotiation", "offered"].includes(d.stage)) {
      hasOpenDealProposalish = true;
    }
  }

  return computeScore({
    isBeehiivSubscriber,
    isStripeCustomer,
    cohortApplicationCount,
    emailsSent90d,
    emailOpens90d,
    emailClicks90d,
    notesEver,
    qualifiedOfferedAcceptedStageChanges,
    lifecycleStage: c.lifecycleStage ?? null,
    hasWonDeal,
    hasOpenDealProposalish,
    lastActivityAt: c.lastActivityAt ?? null,
  });
}

export interface ScoreAllResult {
  scanned: number;
  updated: number;
  errors: string[];
}

const MAX_PER_RUN = 5000;
const BATCH_SIZE = 50;

export async function scoreAllContacts(): Promise<ScoreAllResult> {
  const errors: string[] = [];
  let scanned = 0;
  let updated = 0;

  const since90 = new Date(Date.now() - 90 * 86_400_000);

  // Aggregated activity signals per contact
  const actAgg = await db
    .select({
      contactId: contactActivities.contactId,
      cohortApplicationCount: sql<number>`COUNT(*) FILTER (WHERE ${contactActivities.type} = 'cohort_application')::int`,
      emailsSent90d: sql<number>`COUNT(*) FILTER (WHERE ${contactActivities.type} = 'email_sent' AND ${contactActivities.createdAt} >= ${since90})::int`,
      emailOpens90d: sql<number>`COUNT(*) FILTER (WHERE ${contactActivities.type} = 'email_opened' AND ${contactActivities.createdAt} >= ${since90})::int`,
      emailClicks90d: sql<number>`COUNT(*) FILTER (WHERE ${contactActivities.type} = 'email_clicked' AND ${contactActivities.createdAt} >= ${since90})::int`,
      notesEver: sql<number>`COUNT(*) FILTER (WHERE ${contactActivities.type} = 'note')::int`,
      stageBumps: sql<number>`COUNT(*) FILTER (WHERE ${contactActivities.type} = 'stage_change' AND (${contactActivities.meta}->>'to' IN ('qualified','offered','accepted') OR ${contactActivities.meta}->>'next' IN ('qualified','offered','accepted') OR ${contactActivities.meta}->>'toStage' IN ('qualified','offered','accepted')))::int`,
    })
    .from(contactActivities)
    .groupBy(contactActivities.contactId);

  const actMap = new Map<number, (typeof actAgg)[number]>();
  for (const r of actAgg) if (r.contactId !== null) actMap.set(r.contactId, r);

  // Aggregated deal signals per contact
  const dealAgg = await db
    .select({
      contactId: deals.contactId,
      hasWon: sql<boolean>`BOOL_OR(${deals.stage} = 'won')`,
      hasProposalish: sql<boolean>`BOOL_OR(${deals.stage} IN ('proposal','negotiation','offered'))`,
    })
    .from(deals)
    .groupBy(deals.contactId);

  const dealMap = new Map<number, (typeof dealAgg)[number]>();
  for (const r of dealAgg) if (r.contactId !== null) dealMap.set(r.contactId, r);

  // Pull all contacts (cap)
  const allContacts = await db.select().from(contacts).limit(MAX_PER_RUN);

  for (let i = 0; i < allContacts.length; i += BATCH_SIZE) {
    const batch = allContacts.slice(i, i + BATCH_SIZE);
    for (const c of batch) {
      scanned += 1;
      try {
        const cf = (c.customFields ?? {}) as Record<string, unknown>;
        const isBeehiivSubscriber =
          getAt<boolean>(cf, ["enrichment", "beehiiv", "isSubscriber"]) === true;
        const isStripeCustomer =
          getAt<boolean>(cf, ["enrichment", "stripe", "isCustomer"]) === true;
        const a = actMap.get(c.id);
        const d = dealMap.get(c.id);

        const score = computeScore({
          isBeehiivSubscriber,
          isStripeCustomer,
          cohortApplicationCount: a?.cohortApplicationCount ?? 0,
          emailsSent90d: a?.emailsSent90d ?? 0,
          emailOpens90d: a?.emailOpens90d ?? 0,
          emailClicks90d: a?.emailClicks90d ?? 0,
          notesEver: a?.notesEver ?? 0,
          qualifiedOfferedAcceptedStageChanges: a?.stageBumps ?? 0,
          lifecycleStage: c.lifecycleStage ?? null,
          hasWonDeal: Boolean(d?.hasWon),
          hasOpenDealProposalish: Boolean(d?.hasProposalish),
          lastActivityAt: c.lastActivityAt ?? null,
        });

        await writeScore(c.id, score);
        updated += 1;
      } catch (err) {
        errors.push(
          `contact ${c.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }

  return { scanned, updated, errors };
}

export async function writeScore(contactId: number, score: number): Promise<void> {
  const nowIso = new Date().toISOString();
  await db
    .update(contacts)
    .set({
      customFields: sql`
        jsonb_set(
          jsonb_set(
            COALESCE(${contacts.customFields}, '{}'::jsonb),
            '{system,lead_score}',
            to_jsonb(${score}::int),
            true
          ),
          '{system,last_scored_at}',
          to_jsonb(${nowIso}::text),
          true
        )
      `,
      updatedAt: new Date(),
    })
    .where(eq(contacts.id, contactId));
}

// Band distribution for dashboard reports
export async function getScoreBandDistribution(): Promise<
  Record<ScoreBand, number>
> {
  const rows = await db
    .select({
      score: sql<number | null>`NULLIF((${contacts.customFields}->'system'->>'lead_score'), '')::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(contacts)
    .groupBy(sql`NULLIF((${contacts.customFields}->'system'->>'lead_score'), '')::int`);

  const dist: Record<ScoreBand, number> = { hot: 0, warm: 0, cool: 0, cold: 0 };
  for (const r of rows) {
    const s = r.score ?? 0;
    dist[getScoreBand(s)] += r.count;
  }
  return dist;
}

// Silence unused imports lint if tree-shaking drops them
void and;
void gte;
