import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// ── Types ──────────────────────────────────────────────────
export type EventType = "pageview" | "signup" | "form_submit" | "skool_trial";

export interface TrackingEvent {
  id: string;
  type: EventType;
  timestamp: string; // ISO string
  page: string;
  referrer?: string;
  userAgent?: string;
  device?: "mobile" | "desktop" | "tablet";
  email?: string; // masked for signups
  source?: string;
  meta?: Record<string, string>;
}

interface EventsFile {
  events: TrackingEvent[];
}

// ── Storage Path ───────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");

// ── Helpers ────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function detectDevice(ua: string): "mobile" | "desktop" | "tablet" {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.length <= 2 ? "*".repeat(local.length) : local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  return `${masked}@${domain}`;
}

// ── Read / Write ───────────────────────────────────────────
async function readEvents(): Promise<EventsFile> {
  try {
    if (!existsSync(EVENTS_FILE)) {
      return { events: [] };
    }
    const raw = await readFile(EVENTS_FILE, "utf-8");
    return JSON.parse(raw) as EventsFile;
  } catch {
    return { events: [] };
  }
}

async function writeEvents(data: EventsFile): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  await writeFile(EVENTS_FILE, JSON.stringify(data, null, 2), "utf-8");
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
    meta?: Record<string, string>;
  }
): Promise<TrackingEvent> {
  const data = await readEvents();

  const event: TrackingEvent = {
    id: generateId(),
    type,
    timestamp: new Date().toISOString(),
    page,
    referrer: options?.referrer,
    userAgent: options?.userAgent,
    device: options?.userAgent ? detectDevice(options.userAgent) : "desktop",
    email: options?.email ? maskEmail(options.email) : undefined,
    source: options?.source,
    meta: options?.meta,
  };

  data.events.push(event);

  // Keep last 50k events to prevent file bloat
  if (data.events.length > 50000) {
    data.events = data.events.slice(-50000);
  }

  await writeEvents(data);
  return event;
}

export async function getEvents(filters?: {
  type?: EventType;
  since?: Date;
  until?: Date;
  page?: string;
}): Promise<TrackingEvent[]> {
  const data = await readEvents();
  let events = data.events;

  if (filters?.type) {
    events = events.filter((e) => e.type === filters.type);
  }
  if (filters?.since) {
    const sinceISO = filters.since.toISOString();
    events = events.filter((e) => e.timestamp >= sinceISO);
  }
  if (filters?.until) {
    const untilISO = filters.until.toISOString();
    events = events.filter((e) => e.timestamp <= untilISO);
  }
  if (filters?.page) {
    events = events.filter((e) => e.page === filters.page);
  }

  return events;
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

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computePeriodStats(events: TrackingEvent[]): PeriodStats {
  const visitors = events.filter((e) => e.type === "pageview").length;
  const signups = events.filter((e) => e.type === "signup").length;
  const skoolTrials = events.filter((e) => e.type === "skool_trial").length;
  return {
    visitors,
    signups,
    conversionRate: visitors > 0 ? (signups / visitors) * 100 : 0,
    skoolTrials,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const allEvents = await getEvents();
  const now = new Date();

  const todayStart = getStartOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const weekStart = getStartOfWeek(now);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const monthStart = getStartOfMonth(now);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const filterPeriod = (since: Date, until: Date) =>
    allEvents.filter((e) => e.timestamp >= since.toISOString() && e.timestamp < until.toISOString());

  return {
    today: computePeriodStats(filterPeriod(todayStart, now)),
    thisWeek: computePeriodStats(filterPeriod(weekStart, now)),
    thisMonth: computePeriodStats(filterPeriod(monthStart, now)),
    previousDay: computePeriodStats(filterPeriod(yesterdayStart, todayStart)),
    previousWeek: computePeriodStats(filterPeriod(prevWeekStart, weekStart)),
    previousMonth: computePeriodStats(filterPeriod(prevMonthStart, monthStart)),
  };
}

export async function getPageStats(): Promise<PageStats[]> {
  const weekStart = getStartOfWeek(new Date());
  const events = await getEvents({ since: weekStart });

  const pages = new Map<string, { views: number; signups: number }>();

  for (const e of events) {
    const key = e.page;
    if (!pages.has(key)) pages.set(key, { views: 0, signups: 0 });
    const p = pages.get(key)!;
    if (e.type === "pageview") p.views++;
    if (e.type === "signup") p.signups++;
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
  const events = await getEvents({ type: "signup" });
  return events
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
    .map((e) => ({
      email: e.email || "unknown",
      date: e.timestamp,
      source: e.page,
    }));
}

export async function getTrafficStats(): Promise<{
  topPages: { page: string; views: number }[];
  referrers: ReferrerStats[];
  devices: DeviceStats[];
}> {
  const weekStart = getStartOfWeek(new Date());
  const events = await getEvents({ type: "pageview", since: weekStart });

  // Top pages
  const pageCounts = new Map<string, number>();
  for (const e of events) {
    pageCounts.set(e.page, (pageCounts.get(e.page) || 0) + 1);
  }
  const topPages = Array.from(pageCounts.entries())
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  // Referrers
  const refCounts = new Map<string, number>();
  for (const e of events) {
    const ref = e.referrer || "Direct";
    refCounts.set(ref, (refCounts.get(ref) || 0) + 1);
  }
  const referrers = Array.from(refCounts.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Devices
  const devCounts = new Map<string, number>();
  for (const e of events) {
    const dev = e.device || "unknown";
    devCounts.set(dev, (devCounts.get(dev) || 0) + 1);
  }
  const total = events.length || 1;
  const devices = Array.from(devCounts.entries())
    .map(([device, count]) => ({
      device,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);

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
  const allSignups = await getEvents({ type: "signup" });
  const now = new Date();

  const todayStart = getStartOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const weekStart = getStartOfWeek(now);
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const monthStart = getStartOfMonth(now);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const count = (since: Date, until: Date) =>
    allSignups.filter((e) => e.timestamp >= since.toISOString() && e.timestamp < until.toISOString()).length;

  return {
    today: count(todayStart, now),
    thisWeek: count(weekStart, now),
    thisMonth: count(monthStart, now),
    previousDay: count(yesterdayStart, todayStart),
    previousWeek: count(prevWeekStart, weekStart),
    previousMonth: count(prevMonthStart, monthStart),
  };
}
