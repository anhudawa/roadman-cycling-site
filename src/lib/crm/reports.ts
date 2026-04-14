import { db } from "@/lib/db";
import {
  cohortApplications,
  emailMessages,
  tasks,
  teamUsers,
} from "@/lib/db/schema";
import { and, eq, gte, isNull, isNotNull, sql } from "drizzle-orm";
import { APPLICATION_STAGES, type ApplicationStage } from "./pipeline";

export interface PipelineFunnelRow {
  stage: ApplicationStage;
  count: number;
  conversionFromPrev: number | null; // % conversion from previous stage, null for first
}

export interface WeeklyApplicationsRow {
  weekStart: string; // ISO date (Monday)
  label: string; // e.g. "3 Feb"
  count: number;
}

export interface OwnerBreakdownRow {
  slug: string;
  name: string;
  total: number;
  perStage: Record<ApplicationStage, number>;
}

export interface EmailEngagementMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  deliveryRate: number; // delivered / sent
  openRate: number; // opened / delivered
  clickRate: number; // clicked / delivered
}

export interface TaskThroughputRow {
  slug: string;
  name: string;
  completedLast7d: number;
  open: number;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function getPipelineFunnel(): Promise<PipelineFunnelRow[]> {
  const rows = await db
    .select({
      status: cohortApplications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(cohortApplications)
    .groupBy(cohortApplications.status);

  const byStatus = new Map<string, number>();
  for (const r of rows) byStatus.set(r.status, r.count);

  const result: PipelineFunnelRow[] = [];
  let prev: number | null = null;
  for (const stage of APPLICATION_STAGES) {
    const count = byStatus.get(stage) ?? 0;
    const conv =
      prev === null ? null : prev === 0 ? 0 : Math.round((count / prev) * 100);
    result.push({ stage, count, conversionFromPrev: conv });
    prev = count;
  }
  return result;
}

export async function getApplicationsPerWeek(): Promise<WeeklyApplicationsRow[]> {
  // 12 weeks back, grouped by ISO week (Mon start)
  const cutoff = daysAgo(12 * 7);
  const rows = await db
    .select({
      weekStart: sql<string>`to_char(date_trunc('week', ${cohortApplications.createdAt}), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(cohortApplications)
    .where(gte(cohortApplications.createdAt, cutoff))
    .groupBy(sql`date_trunc('week', ${cohortApplications.createdAt})`)
    .orderBy(sql`date_trunc('week', ${cohortApplications.createdAt})`);

  const byWeek = new Map<string, number>();
  for (const r of rows) byWeek.set(r.weekStart, r.count);

  // Build 12-week series ending this week
  const now = new Date();
  const day = now.getUTCDay() || 7; // Sun=0 -> 7
  const thisMonday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (day - 1))
  );

  const out: WeeklyApplicationsRow[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(thisMonday);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const iso = d.toISOString().slice(0, 10);
    out.push({
      weekStart: iso,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      count: byWeek.get(iso) ?? 0,
    });
  }
  return out;
}

export async function getOwnerBreakdown(): Promise<OwnerBreakdownRow[]> {
  // Applications have no owner column directly — task spec says cohort_applications.owner.
  // Schema lacks it; derive via contacts.owner joined on email.
  // To keep this simple and match the task's intent, we use contacts.owner.
  const rows = await db.execute(sql`
    SELECT
      coalesce(c.owner, '_unassigned') AS slug,
      a.status AS status,
      count(*)::int AS count
    FROM cohort_applications a
    LEFT JOIN contacts c ON c.email = lower(a.email)
    GROUP BY coalesce(c.owner, '_unassigned'), a.status
  `);

  const users = await db.select().from(teamUsers);
  const nameBySlug = new Map<string, string>();
  for (const u of users) nameBySlug.set(u.slug, u.name);

  const bySlug = new Map<string, OwnerBreakdownRow>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of rows as unknown as Array<{ slug: string; status: string; count: number }>) {
    const slug = r.slug;
    if (!bySlug.has(slug)) {
      bySlug.set(slug, {
        slug,
        name: slug === "_unassigned" ? "Unassigned" : nameBySlug.get(slug) ?? slug,
        total: 0,
        perStage: {
          awaiting_response: 0,
          contacted: 0,
          qualified: 0,
          offered: 0,
          accepted: 0,
          rejected: 0,
        },
      });
    }
    const row = bySlug.get(slug)!;
    row.total += r.count;
    if ((APPLICATION_STAGES as readonly string[]).includes(r.status)) {
      row.perStage[r.status as ApplicationStage] += r.count;
    }
  }

  return Array.from(bySlug.values()).sort((a, b) => b.total - a.total);
}

export async function getEmailEngagement(): Promise<EmailEngagementMetrics> {
  const cutoff = daysAgo(30);
  const [row] = await db
    .select({
      sent: sql<number>`count(*) filter (where ${emailMessages.sentAt} is not null)::int`,
      delivered: sql<number>`count(*) filter (where ${emailMessages.deliveredAt} is not null)::int`,
      opened: sql<number>`count(*) filter (where ${emailMessages.openedAt} is not null)::int`,
      clicked: sql<number>`count(*) filter (where ${emailMessages.clickedAt} is not null)::int`,
    })
    .from(emailMessages)
    .where(
      and(isNotNull(emailMessages.sentAt), gte(emailMessages.sentAt, cutoff))
    );

  const sent = row?.sent ?? 0;
  const delivered = row?.delivered ?? 0;
  const opened = row?.opened ?? 0;
  const clicked = row?.clicked ?? 0;
  const pct = (num: number, den: number) =>
    den === 0 ? 0 : Math.round((num / den) * 1000) / 10;

  return {
    sent,
    delivered,
    opened,
    clicked,
    deliveryRate: pct(delivered, sent),
    openRate: pct(opened, delivered),
    clickRate: pct(clicked, delivered),
  };
}

export async function getTaskThroughput(): Promise<TaskThroughputRow[]> {
  const cutoff = daysAgo(7);

  const completedRows = await db
    .select({
      slug: tasks.assignedTo,
      count: sql<number>`count(*)::int`,
    })
    .from(tasks)
    .where(and(isNotNull(tasks.completedAt), gte(tasks.completedAt, cutoff)))
    .groupBy(tasks.assignedTo);

  const openRows = await db
    .select({
      slug: tasks.assignedTo,
      count: sql<number>`count(*)::int`,
    })
    .from(tasks)
    .where(isNull(tasks.completedAt))
    .groupBy(tasks.assignedTo);

  const users = await db.select().from(teamUsers);
  const nameBySlug = new Map<string, string>();
  for (const u of users) nameBySlug.set(u.slug, u.name);

  const bySlug = new Map<string, TaskThroughputRow>();
  const ensure = (slug: string | null) => {
    const key = slug ?? "_unassigned";
    if (!bySlug.has(key)) {
      bySlug.set(key, {
        slug: key,
        name: key === "_unassigned" ? "Unassigned" : nameBySlug.get(key) ?? key,
        completedLast7d: 0,
        open: 0,
      });
    }
    return bySlug.get(key)!;
  };

  for (const r of completedRows) ensure(r.slug).completedLast7d = r.count;
  for (const r of openRows) ensure(r.slug).open = r.count;

  return Array.from(bySlug.values()).sort(
    (a, b) => b.completedLast7d + b.open - (a.completedLast7d + a.open)
  );
}

export async function getAllReports() {
  const [funnel, weekly, owners, email, throughput] = await Promise.all([
    getPipelineFunnel(),
    getApplicationsPerWeek(),
    getOwnerBreakdown(),
    getEmailEngagement(),
    getTaskThroughput(),
  ]);
  return { funnel, weekly, owners, email, throughput };
}
