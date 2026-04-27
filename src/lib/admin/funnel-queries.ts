/**
 * Acquisition-funnel queries for `/admin/funnel/acquisition`.
 *
 * Counting model: Snapshot. Within the date range, count distinct sessions
 * that hit each stage by event timestamp. We don't lock sessions to an
 * origin date — change the range, the buckets shift. See the design note
 * in docs (or `events` table indexes) before swapping to a cohort model.
 *
 * Stages — events that promote a session to each:
 *   visit            : pageview, page_view
 *   engagement       : ≥2 distinct page paths in the session  OR
 *                      any of: ask_question_submitted, diagnostic_start,
 *                      prediction_started, tool_result_upsell_view
 *   email_captured   : signup, email_captured, form_submit (with email)
 *   paid_conversion  : paid_report_checkout_success, checkout_completed,
 *                      report_purchased
 *   community        : skool_trial
 *
 * All queries operate on the existing `events` Postgres table — no schema
 * change. They're indexed on (timestamp, page, session_id) so the
 * date-bound DISTINCT-session aggregations are cheap up to a few million
 * rows; revisit if /admin/funnel ever feels sluggish.
 */

import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export type FunnelStage =
  | "visit"
  | "engagement"
  | "email_captured"
  | "paid_conversion"
  | "community";

export interface FunnelStageCount {
  stage: FunnelStage;
  label: string;
  sessionCount: number;
}

export interface FunnelDropOff {
  fromStage: FunnelStage;
  toStage: FunnelStage;
  /** Sessions that reached `fromStage` but not `toStage`. */
  drop: number;
  /** drop / fromStageCount, expressed 0..1. NaN-safe (returns 0 when from=0). */
  dropRate: number;
  /** toStageCount / fromStageCount, expressed 0..1. */
  conversionRate: number;
}

export interface FunnelTopPath {
  /** First page hit by sessions that reached the target stage in range. */
  entryPage: string;
  sessionsConverted: number;
}

export interface AcquisitionFunnel {
  range: { from: Date; to: Date };
  stages: FunnelStageCount[];
  dropOffs: FunnelDropOff[];
  topPathsToEmail: FunnelTopPath[];
  topPathsToPaid: FunnelTopPath[];
}

const STAGE_LABELS: Record<FunnelStage, string> = {
  visit: "Visit",
  engagement: "Engagement",
  email_captured: "Email Captured",
  paid_conversion: "Paid Conversion",
  community: "Community Signup",
};

// Event-to-stage mapping. The arrays are wired into raw SQL via
// drizzle's `sql` template — we keep them as constants here so the
// vocabulary lives in one place.
const VISIT_EVENTS = ["pageview", "page_view"];
const ENGAGEMENT_DIRECT_EVENTS = [
  "ask_question_submitted",
  "diagnostic_start",
  "prediction_started",
  "tool_result_upsell_view",
];
const EMAIL_EVENTS = ["signup", "email_captured", "form_submit"];
const PAID_EVENTS = [
  "paid_report_checkout_success",
  "checkout_completed",
  "report_purchased",
];
const COMMUNITY_EVENTS = ["skool_trial"];

/**
 * Distinct session count for a set of event types in [from, to].
 * Returns 0 if the events table is missing (pre-migration envs).
 */
async function distinctSessionsForEvents(
  eventTypes: string[],
  from: Date,
  to: Date,
): Promise<number> {
  if (eventTypes.length === 0) return 0;
  try {
    const rows = await db.execute<{ c: number }>(sql`
      SELECT COUNT(DISTINCT session_id)::int AS c
      FROM events
      WHERE type = ANY(${eventTypes})
        AND timestamp >= ${from}
        AND timestamp <= ${to}
        AND session_id IS NOT NULL
        AND session_id <> 'unknown'
    `);
    return Number(rows.rows[0]?.c ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Distinct session count for the engagement stage:
 *   sessions with ≥2 distinct page paths in range
 *     UNION
 *   sessions that fired any of ENGAGEMENT_DIRECT_EVENTS in range.
 *
 * Single SQL query so we don't double-count.
 */
async function distinctEngagedSessions(from: Date, to: Date): Promise<number> {
  try {
    const rows = await db.execute<{ c: number }>(sql`
      WITH multi_page AS (
        SELECT session_id
        FROM events
        WHERE timestamp >= ${from}
          AND timestamp <= ${to}
          AND type IN ('pageview', 'page_view')
          AND session_id IS NOT NULL
          AND session_id <> 'unknown'
        GROUP BY session_id
        HAVING COUNT(DISTINCT page) >= 2
      ),
      direct AS (
        SELECT DISTINCT session_id
        FROM events
        WHERE timestamp >= ${from}
          AND timestamp <= ${to}
          AND type = ANY(${ENGAGEMENT_DIRECT_EVENTS})
          AND session_id IS NOT NULL
          AND session_id <> 'unknown'
      )
      SELECT COUNT(*)::int AS c FROM (
        SELECT session_id FROM multi_page
        UNION
        SELECT session_id FROM direct
      ) u
    `);
    return Number(rows.rows[0]?.c ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Top-N entry pages for sessions that ever reached one of `goalEventTypes`
 * in range. "Entry page" = the earliest pageview/page_view in the session
 * within range.
 */
async function topEntryPagesToGoal(
  goalEventTypes: string[],
  from: Date,
  to: Date,
  limit = 5,
): Promise<FunnelTopPath[]> {
  if (goalEventTypes.length === 0) return [];
  try {
    const rows = await db.execute<{ entry_page: string; sessions: number }>(sql`
      WITH converted_sessions AS (
        SELECT DISTINCT session_id
        FROM events
        WHERE timestamp >= ${from}
          AND timestamp <= ${to}
          AND type = ANY(${goalEventTypes})
          AND session_id IS NOT NULL
          AND session_id <> 'unknown'
      ),
      session_entries AS (
        SELECT DISTINCT ON (e.session_id)
          e.session_id,
          e.page AS entry_page
        FROM events e
        INNER JOIN converted_sessions cs ON cs.session_id = e.session_id
        WHERE e.timestamp >= ${from}
          AND e.timestamp <= ${to}
          AND e.type IN ('pageview', 'page_view')
        ORDER BY e.session_id, e.timestamp ASC
      )
      SELECT entry_page, COUNT(*)::int AS sessions
      FROM session_entries
      GROUP BY entry_page
      ORDER BY sessions DESC
      LIMIT ${limit}
    `);
    return rows.rows.map((r) => ({
      entryPage: r.entry_page,
      sessionsConverted: Number(r.sessions ?? 0),
    }));
  } catch {
    return [];
  }
}

export async function getAcquisitionFunnel(
  from: Date,
  to: Date,
): Promise<AcquisitionFunnel> {
  const [visit, engagement, emailCaptured, paid, community] = await Promise.all([
    distinctSessionsForEvents(VISIT_EVENTS, from, to),
    distinctEngagedSessions(from, to),
    distinctSessionsForEvents(EMAIL_EVENTS, from, to),
    distinctSessionsForEvents(PAID_EVENTS, from, to),
    distinctSessionsForEvents(COMMUNITY_EVENTS, from, to),
  ]);

  const stages: FunnelStageCount[] = [
    { stage: "visit", label: STAGE_LABELS.visit, sessionCount: visit },
    { stage: "engagement", label: STAGE_LABELS.engagement, sessionCount: engagement },
    { stage: "email_captured", label: STAGE_LABELS.email_captured, sessionCount: emailCaptured },
    { stage: "paid_conversion", label: STAGE_LABELS.paid_conversion, sessionCount: paid },
    { stage: "community", label: STAGE_LABELS.community, sessionCount: community },
  ];

  const dropOffs: FunnelDropOff[] = [];
  for (let i = 0; i < stages.length - 1; i++) {
    const a = stages[i];
    const b = stages[i + 1];
    const fromCount = a.sessionCount;
    const toCount = b.sessionCount;
    const conversionRate = fromCount > 0 ? toCount / fromCount : 0;
    const dropRate = fromCount > 0 ? Math.max(0, 1 - toCount / fromCount) : 0;
    dropOffs.push({
      fromStage: a.stage,
      toStage: b.stage,
      drop: Math.max(0, fromCount - toCount),
      dropRate,
      conversionRate,
    });
  }

  const [topPathsToEmail, topPathsToPaid] = await Promise.all([
    topEntryPagesToGoal(EMAIL_EVENTS, from, to),
    topEntryPagesToGoal(PAID_EVENTS, from, to),
  ]);

  return {
    range: { from, to },
    stages,
    dropOffs,
    topPathsToEmail,
    topPathsToPaid,
  };
}
