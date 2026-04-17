import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and, gte, lte, sql, count, desc } from "drizzle-orm";
import { startOfDay, startOfWeek, startOfMonth, subDays } from "./time-ranges";
import { calculateChiSquared } from "@/lib/ab/statistics";
import type { ABResult } from "@/lib/ab/types";

// ── Types ──────────────────────────────────────────────────
export type EventType =
  | "pageview"
  | "signup"
  | "form_submit"
  | "skool_trial"
  | "checkout_initiated"
  | "checkout_completed";

export interface TrackingEvent {
  id: string;
  type: EventType;
  timestamp: string; // ISO string
  page: string;
  referrer?: string;
  userAgent?: string;
  device?: "mobile" | "desktop" | "tablet";
  email?: string;
  source?: string;
  sessionId?: string;
  variantId?: string;
  meta?: Record<string, string>;
}

// ── Helpers ────────────────────────────────────────────────
function detectDevice(ua: string): "mobile" | "desktop" | "tablet" {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked =
    local.length <= 2
      ? "*".repeat(local.length)
      : local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  return `${masked}@${domain}`;
}

function rowToTrackingEvent(row: typeof events.$inferSelect): TrackingEvent {
  return {
    id: String(row.id),
    type: row.type as EventType,
    timestamp: row.timestamp.toISOString(),
    page: row.page,
    referrer: row.referrer ?? undefined,
    userAgent: row.userAgent ?? undefined,
    device: row.device as "mobile" | "desktop" | "tablet",
    email: row.email ?? undefined,
    source: row.source ?? undefined,
    sessionId: row.sessionId,
    variantId: row.variantId ?? undefined,
    meta: (row.meta as Record<string, string>) ?? undefined,
  };
}

// ── Public API ─────────────────────────────────────────────
export async function recordEvent(
  type: EventType,
  page: string,
  options?: {
    referrer?: string;
    userAgent?: string;
    email?: string;
    source?: string;
    sessionId?: string;
    variantId?: string;
    meta?: Record<string, string>;
  }
): Promise<TrackingEvent> {
  const now = new Date();
  const device = options?.userAgent ? detectDevice(options.userAgent) : "desktop";

  const [inserted] = await db
    .insert(events)
    .values({
      type,
      timestamp: now,
      page,
      referrer: options?.referrer ?? null,
      userAgent: options?.userAgent ?? null,
      device,
      email: options?.email ? maskEmail(options.email) : null,
      source: options?.source ?? null,
      sessionId: options?.sessionId ?? "unknown",
      variantId: options?.variantId ?? null,
      meta: options?.meta ?? null,
    })
    .returning();

  return rowToTrackingEvent(inserted);
}

export async function getEvents(filters?: {
  type?: EventType;
  since?: Date;
  until?: Date;
  page?: string;
}): Promise<TrackingEvent[]> {
  const conditions = [];

  if (filters?.type) {
    conditions.push(eq(events.type, filters.type));
  }
  if (filters?.since) {
    conditions.push(gte(events.timestamp, filters.since));
  }
  if (filters?.until) {
    conditions.push(lte(events.timestamp, filters.until));
  }
  if (filters?.page) {
    conditions.push(eq(events.page, filters.page));
  }

  const rows = await db
    .select()
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(events.timestamp));

  return rows.map(rowToTrackingEvent);
}

// ── Aggregate Stats ────────────────────────────────────────
export interface PeriodStats {
  visitors: number;
  signups: number;
  conversionRate: number;
  skoolTrials: number;
}

export interface PageStats {
  page: string;
  views: number;
  signups: number;
  conversionRate: number;
}

export interface ReferrerStats {
  referrer: string;
  count: number;
}

export interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

export interface LeadEntry {
  email: string;
  date: string;
  source: string;
}

export interface DashboardStats {
  today: PeriodStats;
  thisWeek: PeriodStats;
  thisMonth: PeriodStats;
  previousDay: PeriodStats;
  previousWeek: PeriodStats;
  previousMonth: PeriodStats;
}

export async function computePeriodStats(since: Date, until: Date): Promise<PeriodStats> {
  const result = await db
    .select({
      type: events.type,
      cnt: count(),
    })
    .from(events)
    .where(and(gte(events.timestamp, since), lte(events.timestamp, until)))
    .groupBy(events.type);

  let visitors = 0;
  let signups = 0;
  let skoolTrials = 0;

  for (const row of result) {
    if (row.type === "pageview") visitors = Number(row.cnt);
    if (row.type === "signup") signups = Number(row.cnt);
    if (row.type === "skool_trial") skoolTrials = Number(row.cnt);
  }

  return {
    visitors,
    signups,
    conversionRate: visitors > 0 ? (signups / visitors) * 100 : 0,
    skoolTrials,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();

  const todayStart = startOfDay(now);
  const yesterdayStart = subDays(todayStart, 1);

  // Rolling 7-day windows (not calendar weeks) for fair comparison
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);

  const monthStart = startOfMonth(now);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const [today, thisWeek, thisMonth, previousDay, previousWeek, previousMonth] =
    await Promise.all([
      computePeriodStats(todayStart, now),
      computePeriodStats(sevenDaysAgo, now),
      computePeriodStats(monthStart, now),
      computePeriodStats(yesterdayStart, todayStart),
      computePeriodStats(fourteenDaysAgo, sevenDaysAgo),
      computePeriodStats(prevMonthStart, monthStart),
    ]);

  return { today, thisWeek, thisMonth, previousDay, previousWeek, previousMonth };
}

export async function getPageStats(from?: Date, to?: Date): Promise<PageStats[]> {
  const since = from ?? startOfWeek(new Date(), { weekStartsOn: 1 });
  const until = to ?? new Date();

  const rows = await db
    .select({
      page: events.page,
      type: events.type,
      cnt: count(),
    })
    .from(events)
    .where(and(gte(events.timestamp, since), lte(events.timestamp, until)))
    .groupBy(events.page, events.type);

  const pages = new Map<string, { views: number; signups: number }>();

  for (const row of rows) {
    if (!pages.has(row.page)) pages.set(row.page, { views: 0, signups: 0 });
    const p = pages.get(row.page)!;
    if (row.type === "pageview") p.views = Number(row.cnt);
    if (row.type === "signup") p.signups = Number(row.cnt);
  }

  return Array.from(pages.entries())
    .map(([page, { views, signups }]) => ({
      page,
      views,
      signups,
      conversionRate: views > 0 ? (signups / views) * 100 : 0,
    }))
    .sort((a, b) => b.views - a.views);
}

export async function getRecentLeads(limit = 50): Promise<LeadEntry[]> {
  const rows = await db
    .select({
      email: events.email,
      timestamp: events.timestamp,
      page: events.page,
    })
    .from(events)
    .where(eq(events.type, "signup"))
    .orderBy(desc(events.timestamp))
    .limit(limit);

  return rows.map((r) => ({
    email: r.email || "unknown",
    date: r.timestamp.toISOString(),
    source: r.page,
  }));
}

export async function getTrafficStats(): Promise<{
  topPages: { page: string; views: number }[];
  referrers: ReferrerStats[];
  devices: DeviceStats[];
}> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const pageviewCondition = and(
    eq(events.type, "pageview"),
    gte(events.timestamp, weekStart)
  );

  // Run all three aggregations in parallel
  const [pageRows, refRows, devRows] = await Promise.all([
    // Top pages
    db
      .select({ page: events.page, cnt: count() })
      .from(events)
      .where(pageviewCondition)
      .groupBy(events.page)
      .orderBy(desc(count()))
      .limit(20),

    // Referrers
    db
      .select({
        referrer: sql<string>`coalesce(${events.referrer}, 'Direct')`,
        cnt: count(),
      })
      .from(events)
      .where(pageviewCondition)
      .groupBy(sql`coalesce(${events.referrer}, 'Direct')`)
      .orderBy(desc(count()))
      .limit(15),

    // Devices
    db
      .select({ device: events.device, cnt: count() })
      .from(events)
      .where(pageviewCondition)
      .groupBy(events.device)
      .orderBy(desc(count())),
  ]);

  const topPages = pageRows.map((r) => ({
    page: r.page,
    views: Number(r.cnt),
  }));

  const referrers = refRows.map((r) => ({
    referrer: r.referrer,
    count: Number(r.cnt),
  }));

  const totalDevices = devRows.reduce((sum, r) => sum + Number(r.cnt), 0) || 1;
  const devices = devRows.map((r) => ({
    device: r.device,
    count: Number(r.cnt),
    percentage: (Number(r.cnt) / totalDevices) * 100,
  }));

  return { topPages, referrers, devices };
}

export async function getLeadTotals(): Promise<{
  today: number;
  thisWeek: number;
  thisMonth: number;
  previousDay: number;
  previousWeek: number;
  previousMonth: number;
}> {
  const now = new Date();

  const todayStart = startOfDay(now);
  const yesterdayStart = subDays(todayStart, 1);

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const prevWeekStart = subDays(weekStart, 7);

  const monthStart = startOfMonth(now);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  async function countSignups(since: Date, until: Date): Promise<number> {
    const [result] = await db
      .select({ cnt: count() })
      .from(events)
      .where(
        and(
          eq(events.type, "signup"),
          gte(events.timestamp, since),
          lte(events.timestamp, until)
        )
      );
    return Number(result.cnt);
  }

  const [today, thisWeek, thisMonth, previousDay, previousWeek, previousMonth] =
    await Promise.all([
      countSignups(todayStart, now),
      countSignups(weekStart, now),
      countSignups(monthStart, now),
      countSignups(yesterdayStart, todayStart),
      countSignups(prevWeekStart, weekStart),
      countSignups(prevMonthStart, monthStart),
    ]);

  return { today, thisWeek, thisMonth, previousDay, previousWeek, previousMonth };
}

// ── NEW: Date-range stats ─────────────────────────────────
export async function getStatsForRange(
  from: Date,
  to: Date
): Promise<{
  period: PeriodStats;
  pages: PageStats[];
  traffic: {
    topPages: { page: string; views: number }[];
    referrers: ReferrerStats[];
    devices: DeviceStats[];
  };
  leads: LeadEntry[];
}> {
  const rangeCondition = and(gte(events.timestamp, from), lte(events.timestamp, to));
  const pageviewInRange = and(eq(events.type, "pageview"), rangeCondition);

  // Run all queries in parallel
  const [periodRows, pageRows, topPageRows, refRows, devRows, leadRows] =
    await Promise.all([
      // Period stats by type
      db
        .select({ type: events.type, cnt: count() })
        .from(events)
        .where(rangeCondition)
        .groupBy(events.type),

      // Page stats (views + signups per page)
      db
        .select({ page: events.page, type: events.type, cnt: count() })
        .from(events)
        .where(rangeCondition)
        .groupBy(events.page, events.type),

      // Top pages (pageviews only)
      db
        .select({ page: events.page, cnt: count() })
        .from(events)
        .where(pageviewInRange)
        .groupBy(events.page)
        .orderBy(desc(count()))
        .limit(20),

      // Referrers
      db
        .select({
          referrer: sql<string>`coalesce(${events.referrer}, 'Direct')`,
          cnt: count(),
        })
        .from(events)
        .where(pageviewInRange)
        .groupBy(sql`coalesce(${events.referrer}, 'Direct')`)
        .orderBy(desc(count()))
        .limit(15),

      // Devices
      db
        .select({ device: events.device, cnt: count() })
        .from(events)
        .where(pageviewInRange)
        .groupBy(events.device)
        .orderBy(desc(count())),

      // Leads
      db
        .select({
          email: events.email,
          timestamp: events.timestamp,
          page: events.page,
        })
        .from(events)
        .where(and(eq(events.type, "signup"), rangeCondition))
        .orderBy(desc(events.timestamp))
        .limit(50),
    ]);

  // Assemble period stats
  let visitors = 0;
  let signups = 0;
  let skoolTrials = 0;
  for (const row of periodRows) {
    if (row.type === "pageview") visitors = Number(row.cnt);
    if (row.type === "signup") signups = Number(row.cnt);
    if (row.type === "skool_trial") skoolTrials = Number(row.cnt);
  }
  const period: PeriodStats = {
    visitors,
    signups,
    conversionRate: visitors > 0 ? (signups / visitors) * 100 : 0,
    skoolTrials,
  };

  // Assemble page stats
  const pageMap = new Map<string, { views: number; signups: number }>();
  for (const row of pageRows) {
    if (!pageMap.has(row.page)) pageMap.set(row.page, { views: 0, signups: 0 });
    const p = pageMap.get(row.page)!;
    if (row.type === "pageview") p.views = Number(row.cnt);
    if (row.type === "signup") p.signups = Number(row.cnt);
  }
  const pages = Array.from(pageMap.entries())
    .map(([page, { views, signups: s }]) => ({
      page,
      views,
      signups: s,
      conversionRate: views > 0 ? (s / views) * 100 : 0,
    }))
    .sort((a, b) => b.views - a.views);

  // Assemble traffic
  const topPages = topPageRows.map((r) => ({
    page: r.page,
    views: Number(r.cnt),
  }));
  const referrers = refRows.map((r) => ({
    referrer: r.referrer,
    count: Number(r.cnt),
  }));
  const totalDev = devRows.reduce((s, r) => s + Number(r.cnt), 0) || 1;
  const devices = devRows.map((r) => ({
    device: r.device,
    count: Number(r.cnt),
    percentage: (Number(r.cnt) / totalDev) * 100,
  }));

  // Assemble leads
  const leads = leadRows.map((r) => ({
    email: r.email || "unknown",
    date: r.timestamp.toISOString(),
    source: r.page,
  }));

  return { period, pages, traffic: { topPages, referrers, devices }, leads };
}

// ── Experiment results aggregation ────────────────────────

export async function getExperimentResults(
  variantIds: string[],
  page: string
): Promise<ABResult[]> {
  if (variantIds.length === 0) return [];

  const rows = await db
    .select({
      variantId: events.variantId,
      type: events.type,
      cnt: count(),
    })
    .from(events)
    .where(
      and(
        sql`${events.variantId} IN (${sql.join(
          variantIds.map((id) => sql`${id}`),
          sql`, `
        )})`,
        eq(events.page, page)
      )
    )
    .groupBy(events.variantId, events.type);

  // Build per-variant counts
  const variantMap = new Map<string, { impressions: number; conversions: number }>();
  for (const id of variantIds) {
    variantMap.set(id, { impressions: 0, conversions: 0 });
  }
  for (const row of rows) {
    if (!row.variantId) continue;
    const entry = variantMap.get(row.variantId);
    if (!entry) continue;
    if (row.type === "pageview") entry.impressions = Number(row.cnt);
    if (row.type === "signup") entry.conversions = Number(row.cnt);
  }

  const controlId = variantIds[0];
  const control = variantMap.get(controlId)!;

  const results: ABResult[] = variantIds.map((id) => {
    const data = variantMap.get(id)!;
    const conversionRate = data.impressions > 0 ? data.conversions / data.impressions : 0;

    if (id === controlId) {
      return {
        variantId: id,
        impressions: data.impressions,
        conversions: data.conversions,
        conversionRate,
        isSignificant: false,
        confidence: 0,
      };
    }

    const chi = calculateChiSquared(
      control.impressions,
      control.conversions,
      data.impressions,
      data.conversions
    );

    return {
      variantId: id,
      impressions: data.impressions,
      conversions: data.conversions,
      conversionRate,
      isSignificant: chi.significant,
      confidence: chi.confidence,
    };
  });

  return results;
}

// ── Chart data helpers ────────────────────────────────────

export async function getDailyBreakdown(
  from: Date,
  to: Date
): Promise<{ date: string; visitors: number; signups: number; trials: number }[]> {
  const rows = await db
    .select({
      day: sql<string>`DATE(${events.timestamp})`,
      type: events.type,
      cnt: count(),
    })
    .from(events)
    .where(and(gte(events.timestamp, from), lte(events.timestamp, to)))
    .groupBy(sql`DATE(${events.timestamp})`, events.type)
    .orderBy(sql`DATE(${events.timestamp})`);

  const dayMap = new Map<string, { visitors: number; signups: number; trials: number }>();
  for (const row of rows) {
    if (!dayMap.has(row.day)) dayMap.set(row.day, { visitors: 0, signups: 0, trials: 0 });
    const d = dayMap.get(row.day)!;
    if (row.type === "pageview") d.visitors = Number(row.cnt);
    if (row.type === "signup") d.signups = Number(row.cnt);
    if (row.type === "skool_trial") d.trials = Number(row.cnt);
  }

  return Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDailyVisitors(
  from: Date,
  to: Date
): Promise<{ date: string; visitors: number }[]> {
  const rows = await db
    .select({
      day: sql<string>`DATE(${events.timestamp})`,
      cnt: count(),
    })
    .from(events)
    .where(
      and(
        eq(events.type, "pageview"),
        gte(events.timestamp, from),
        lte(events.timestamp, to)
      )
    )
    .groupBy(sql`DATE(${events.timestamp})`)
    .orderBy(sql`DATE(${events.timestamp})`);

  return rows.map((r) => ({
    date: r.day,
    visitors: Number(r.cnt),
  }));
}

export async function getRevenueSnapshots(
  from: Date,
  to: Date
): Promise<{ date: string; revenue: number }[]> {
  const { stripeSnapshots } = await import("@/lib/db/schema");

  const rows = await db
    .select({
      snapshotDate: stripeSnapshots.snapshotDate,
      totalRevenueCents: stripeSnapshots.totalRevenueCents,
    })
    .from(stripeSnapshots)
    .where(
      and(
        gte(stripeSnapshots.snapshotDate, from.toISOString().split("T")[0]),
        lte(stripeSnapshots.snapshotDate, to.toISOString().split("T")[0])
      )
    )
    .orderBy(stripeSnapshots.snapshotDate);

  return rows.map((r) => ({
    date: r.snapshotDate,
    revenue: r.totalRevenueCents / 100,
  }));
}
