import { and, desc, eq, gte, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  askMessages,
  askRetrievals,
  askSessions,
  events,
  riderProfiles,
  toolResults,
} from "@/lib/db/schema";
import type { ToolSlug } from "@/lib/tool-results/types";

/**
 * SQL aggregates backing /admin/insights. Each helper returns a small
 * POJO the page can render directly $€” no formatting, no presentational
 * decisions. Heavy lifting stays in SQL so the page remains a thin
 * server-component composer.
 */

export type InsightsRange = "24h" | "7d" | "30d" | "all";

export function rangeToSince(range: InsightsRange): Date | null {
  const now = Date.now();
  switch (range) {
    case "24h":
      return new Date(now - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case "all":
    default:
      return null;
  }
}

export interface ToolFunnel {
  tool: ToolSlug;
  started: number;
  completed: number;
  saved: number;
  handoff: number;
}

const TOOL_SLUGS: ToolSlug[] = ["plateau", "fuelling", "ftp_zones"];

/**
 * Panel 1: completion + save + handoff counts per tool. We source
 * started/completed from the analytics events table (client-fired) and
 * saved/handoff from tool_results (authoritative server-side state).
 */
export async function getToolFunnels(range: InsightsRange): Promise<ToolFunnel[]> {
  const since = rangeToSince(range);

  const evFilter = (type: string) =>
    since
      ? and(eq(events.type, type), gte(events.timestamp, since))
      : eq(events.type, type);

  const trFilter = (tool: ToolSlug) =>
    since
      ? and(eq(toolResults.toolSlug, tool), gte(toolResults.createdAt, since))
      : eq(toolResults.toolSlug, tool);

  const [startedRows, completedRows, savedRows, handoffRows] = await Promise.all([
    db
      .select({ tool: sql<string>`meta->>'tool'`.as("tool"), cnt: sql<number>`count(*)` })
      .from(events)
      .where(evFilter("tool_started"))
      .groupBy(sql`meta->>'tool'`),
    db
      .select({ tool: sql<string>`meta->>'tool'`.as("tool"), cnt: sql<number>`count(*)` })
      .from(events)
      .where(evFilter("tool_completed"))
      .groupBy(sql`meta->>'tool'`),
    Promise.all(
      TOOL_SLUGS.map(async (tool) => {
        const [row] = await db
          .select({ cnt: sql<number>`count(*)` })
          .from(toolResults)
          .where(trFilter(tool));
        return { tool, cnt: Number(row?.cnt ?? 0) };
      }),
    ),
    Promise.all(
      TOOL_SLUGS.map(async (tool) => {
        const cond = since
          ? and(
              eq(toolResults.toolSlug, tool),
              isNotNull(toolResults.askHandoffAt),
              gte(toolResults.askHandoffAt, since),
            )
          : and(eq(toolResults.toolSlug, tool), isNotNull(toolResults.askHandoffAt));
        const [row] = await db.select({ cnt: sql<number>`count(*)` }).from(toolResults).where(cond);
        return { tool, cnt: Number(row?.cnt ?? 0) };
      }),
    ),
  ]);

  const byTool = (rows: Array<{ tool: string | null; cnt: number }>) => {
    const map = new Map<string, number>();
    for (const r of rows) if (r.tool) map.set(r.tool, Number(r.cnt));
    return map;
  };
  const startedMap = byTool(startedRows);
  const completedMap = byTool(completedRows);
  const savedMap = new Map(savedRows.map((r) => [r.tool, r.cnt]));
  const handoffMap = new Map(handoffRows.map((r) => [r.tool, r.cnt]));

  // Analytics events write the tool name with either dash or underscore
  // depending on when the call-site wrote it $€” normalise both.
  const norm = (t: string) => t.replace(/-/g, "_");

  const sumByNorm = (map: Map<string, number>, tool: ToolSlug): number => {
    let n = 0;
    for (const [k, v] of map) if (norm(k) === tool) n += v;
    return n;
  };

  return TOOL_SLUGS.map((tool) => ({
    tool,
    started: sumByNorm(startedMap, tool),
    completed: sumByNorm(completedMap, tool),
    saved: savedMap.get(tool) ?? 0,
    handoff: handoffMap.get(tool) ?? 0,
  }));
}

export interface TopQuestion {
  snippet: string;
  count: number;
}

/**
 * Panel 2: top user questions grouped by first 8 words. Hand-written
 * stop-list keeps the grouping stable without pulling in a full NLP
 * dep $€” most of the value is spotting repeat phrasings.
 */
export async function getTopQuestions(range: InsightsRange, limit = 20): Promise<TopQuestion[]> {
  const since = rangeToSince(range);
  const cond = since
    ? and(eq(askMessages.role, "user"), gte(askMessages.createdAt, since))
    : eq(askMessages.role, "user");

  const rows = await db
    .select({
      // Postgres array_to_string(regexp_split_to_array(trim(content),'\s+'),' ') only keeps first N via array slice
      snippet: sql<string>`array_to_string(
        (string_to_array(btrim(lower(content)), ' '))[1:8],
        ' '
      )`,
      cnt: sql<number>`count(*)`,
    })
    .from(askMessages)
    .where(cond)
    .groupBy(sql`array_to_string(
      (string_to_array(btrim(lower(content)), ' '))[1:8],
      ' '
    )`)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(limit);

  return rows
    .filter((r) => r.snippet && r.snippet.length > 0)
    .map((r) => ({ snippet: r.snippet, count: Number(r.cnt) }));
}

export interface PrimaryResultRow {
  tool: ToolSlug;
  primaryResult: string;
  count: number;
}

/**
 * Panel 3: most-common primary_result values per tool $€” e.g. how many
 * riders land on the "underRecovered" profile or the "75g/hr" carb
 * bucket.
 */
export async function getTopPrimaryResults(
  range: InsightsRange,
  limit = 20,
): Promise<PrimaryResultRow[]> {
  const since = rangeToSince(range);
  const cond = since
    ? and(isNotNull(toolResults.primaryResult), gte(toolResults.createdAt, since))
    : isNotNull(toolResults.primaryResult);

  const rows = await db
    .select({
      tool: toolResults.toolSlug,
      primaryResult: toolResults.primaryResult,
      cnt: sql<number>`count(*)`,
    })
    .from(toolResults)
    .where(cond)
    .groupBy(toolResults.toolSlug, toolResults.primaryResult)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(limit);

  return rows.map((r) => ({
    tool: r.tool as ToolSlug,
    primaryResult: r.primaryResult ?? "$€”",
    count: Number(r.cnt),
  }));
}

export interface LimiterRow {
  limiter: string;
  count: number;
}

export async function getLimiterDistribution(range: InsightsRange): Promise<LimiterRow[]> {
  const since = rangeToSince(range);
  const cond = since
    ? and(isNotNull(riderProfiles.biggestLimiter), gte(riderProfiles.updatedAt, since))
    : isNotNull(riderProfiles.biggestLimiter);

  const rows = await db
    .select({
      limiter: riderProfiles.biggestLimiter,
      cnt: sql<number>`count(*)`,
    })
    .from(riderProfiles)
    .where(cond)
    .groupBy(riderProfiles.biggestLimiter)
    .orderBy(desc(sql<number>`count(*)`));

  return rows
    .filter((r) => r.limiter !== null)
    .map((r) => ({ limiter: r.limiter as string, count: Number(r.cnt) }));
}

export interface FlaggedMessage {
  id: string;
  sessionId: string;
  snippet: string;
  flags: string[];
  confidence: string | null;
  flagged: boolean;
  createdAt: Date;
}

/**
 * Panel 5: assistant answers that were flagged by the invented-citation
 * post-filter OR came back with low confidence. Sorted newest first
 * so QA has something to chase every morning.
 */
export async function getFlaggedAnswers(range: InsightsRange, limit = 25): Promise<FlaggedMessage[]> {
  const since = rangeToSince(range);
  const base = eq(askMessages.role, "assistant");
  const flagCond = or(
    eq(askMessages.flaggedForReview, true),
    eq(askMessages.confidence, "low"),
  );
  const cond = since ? and(base, flagCond, gte(askMessages.createdAt, since)) : and(base, flagCond);

  const rows = await db
    .select({
      id: askMessages.id,
      sessionId: askMessages.sessionId,
      content: askMessages.content,
      flags: askMessages.safetyFlags,
      confidence: askMessages.confidence,
      flagged: askMessages.flaggedForReview,
      createdAt: askMessages.createdAt,
    })
    .from(askMessages)
    .where(cond)
    .orderBy(desc(askMessages.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    sessionId: r.sessionId,
    snippet: (r.content ?? "").slice(0, 160),
    flags: (r.flags ?? []) as string[],
    confidence: r.confidence,
    flagged: r.flagged,
    createdAt: r.createdAt,
  }));
}

export interface SourceRow {
  sourceType: string;
  sourceId: string;
  count: number;
}

/**
 * Panel 6: retrieval items that actually landed in a streamed answer.
 * Gives a ranking of which episodes/methodologies the model leans on.
 */
export async function getTopSources(range: InsightsRange, limit = 20): Promise<SourceRow[]> {
  const since = rangeToSince(range);
  const cond = since
    ? and(eq(askRetrievals.usedInAnswer, true), gte(askRetrievals.createdAt, since))
    : eq(askRetrievals.usedInAnswer, true);

  const rows = await db
    .select({
      sourceType: askRetrievals.sourceType,
      sourceId: askRetrievals.sourceId,
      cnt: sql<number>`count(*)`,
    })
    .from(askRetrievals)
    .where(cond)
    .groupBy(askRetrievals.sourceType, askRetrievals.sourceId)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(limit);

  return rows.map((r) => ({
    sourceType: r.sourceType,
    sourceId: r.sourceId,
    count: Number(r.cnt),
  }));
}

export interface AskFunnel {
  sessions: number;
  questions: number;
  ctaClicked: number;
  profileSaved: number;
}

export async function getAskFunnel(range: InsightsRange): Promise<AskFunnel> {
  const since = rangeToSince(range);
  const [sessionsRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(askSessions)
    .where(since ? gte(askSessions.startedAt, since) : sql`true`);

  const [questionsRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(askMessages)
    .where(
      since
        ? and(eq(askMessages.role, "user"), gte(askMessages.createdAt, since))
        : eq(askMessages.role, "user"),
    );

  const evFilter = (type: string) =>
    since ? and(eq(events.type, type), gte(events.timestamp, since)) : eq(events.type, type);

  const [ctaRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(events)
    .where(evFilter("ask_cta_clicked"));

  const [profileRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(events)
    .where(evFilter("ask_profile_saved"));

  return {
    sessions: Number(sessionsRow?.cnt ?? 0),
    questions: Number(questionsRow?.cnt ?? 0),
    ctaClicked: Number(ctaRow?.cnt ?? 0),
    profileSaved: Number(profileRow?.cnt ?? 0),
  };
}

export interface CoachingLead {
  email: string;
  firstName: string | null;
  coachingInterest: string;
  mainGoal: string | null;
  currentFtp: number | null;
  weeklyTrainingHours: number | null;
  updatedAt: Date;
}

export async function getCoachingLeads(range: InsightsRange, limit = 25): Promise<CoachingLead[]> {
  const since = rangeToSince(range);
  const base = or(
    eq(riderProfiles.coachingInterest, "interested"),
    eq(riderProfiles.coachingInterest, "ready"),
  );
  const cond = since ? and(base, gte(riderProfiles.updatedAt, since)) : base;

  const rows = await db
    .select({
      email: riderProfiles.email,
      firstName: riderProfiles.firstName,
      coachingInterest: riderProfiles.coachingInterest,
      mainGoal: riderProfiles.mainGoal,
      currentFtp: riderProfiles.currentFtp,
      weeklyTrainingHours: riderProfiles.weeklyTrainingHours,
      updatedAt: riderProfiles.updatedAt,
    })
    .from(riderProfiles)
    .where(cond)
    .orderBy(desc(riderProfiles.updatedAt))
    .limit(limit);

  return rows.map((r) => ({
    email: r.email,
    firstName: r.firstName,
    coachingInterest: r.coachingInterest ?? "",
    mainGoal: r.mainGoal,
    currentFtp: r.currentFtp,
    weeklyTrainingHours: r.weeklyTrainingHours,
    updatedAt: r.updatedAt,
  }));
}

export interface EmailCaptureStats {
  total: number;
  emailed: number;
  rate: number; // 0$€“100
}

export async function getEmailCaptureStats(range: InsightsRange): Promise<EmailCaptureStats> {
  const since = rangeToSince(range);

  const [totalRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(toolResults)
    .where(since ? gte(toolResults.createdAt, since) : sql`true`);

  const [emailedRow] = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(toolResults)
    .where(
      since
        ? and(isNotNull(toolResults.emailSentAt), gte(toolResults.createdAt, since))
        : isNotNull(toolResults.emailSentAt),
    );

  const total = Number(totalRow?.cnt ?? 0);
  const emailed = Number(emailedRow?.cnt ?? 0);
  return {
    total,
    emailed,
    rate: total > 0 ? (emailed / total) * 100 : 0,
  };
}
