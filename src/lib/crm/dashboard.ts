import { db } from "@/lib/db";
import {
  contacts,
  contactActivities,
  tasks,
  cohortApplications,
  emailMessages,
} from "@/lib/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  isNotNull,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { TeamUser } from "@/lib/admin/auth";

export interface MyDayStats {
  openTasks: number;
  overdueTasks: number;
  contactsOwned: number;
  staleContacts: number;
}

export interface MyDayTaskRow {
  id: number;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
  contactId: number | null;
  contactName: string | null;
  contactEmail: string | null;
}

export interface MyDayApplicationRow {
  id: number;
  name: string;
  email: string;
  status: string;
  hours: string;
  goal: string;
  createdAt: string;
  contactId: number | null;
}

export interface MyDayActivityRow {
  id: number;
  type: string;
  title: string;
  createdAt: string;
  contactId: number;
  contactName: string | null;
  contactEmail: string | null;
}

export interface MyDayStaleContactRow {
  id: number;
  name: string | null;
  email: string;
  lastActivityAt: string | null;
}

export interface MyDayEmailRow {
  id: number;
  subject: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  contactId: number;
  contactName: string | null;
  contactEmail: string | null;
}

export interface MyDayData {
  stats: MyDayStats;
  todaysTasks: MyDayTaskRow[];
  overdueTasks: MyDayTaskRow[];
  applicationsWaiting: MyDayApplicationRow[];
  recentActivity: MyDayActivityRow[];
  staleContacts: MyDayStaleContactRow[];
  recentEmails: MyDayEmailRow[];
}

const STALE_DAYS = 7;
const WAITING_STATUSES = ["awaiting_response", "contacted", "qualified", "offered"] as const;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function getMyDayData(user: TeamUser): Promise<MyDayData> {
  const now = new Date();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const staleCutoff = daysAgo(STALE_DAYS);

  // ── Stats ────────────────────────────────────────────
  const [openTasksCountRes, overdueTasksCountRes, contactsOwnedCountRes, staleCountRes] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(and(eq(tasks.assignedTo, user.slug), isNull(tasks.completedAt))),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tasks)
        .where(
          and(
            eq(tasks.assignedTo, user.slug),
            isNull(tasks.completedAt),
            isNotNull(tasks.dueAt),
            lt(tasks.dueAt, now)
          )
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(contacts)
        .where(eq(contacts.owner, user.slug)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(contacts)
        .where(
          and(
            eq(contacts.owner, user.slug),
            or(isNull(contacts.lastActivityAt), lt(contacts.lastActivityAt, staleCutoff))!
          )
        ),
    ]);

  const stats: MyDayStats = {
    openTasks: openTasksCountRes[0]?.count ?? 0,
    overdueTasks: overdueTasksCountRes[0]?.count ?? 0,
    contactsOwned: contactsOwnedCountRes[0]?.count ?? 0,
    staleContacts: staleCountRes[0]?.count ?? 0,
  };

  // ── Today's tasks ────────────────────────────────────
  const todaysTasksRaw = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      dueAt: tasks.dueAt,
      completedAt: tasks.completedAt,
      contactId: tasks.contactId,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(tasks)
    .leftJoin(contacts, eq(tasks.contactId, contacts.id))
    .where(
      and(
        eq(tasks.assignedTo, user.slug),
        isNull(tasks.completedAt),
        isNotNull(tasks.dueAt),
        lte(tasks.dueAt, todayEnd),
        gte(tasks.dueAt, todayStart)
      )
    )
    .orderBy(asc(tasks.dueAt))
    .limit(50);

  // ── Overdue tasks ────────────────────────────────────
  const overdueTasksRaw = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      dueAt: tasks.dueAt,
      completedAt: tasks.completedAt,
      contactId: tasks.contactId,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(tasks)
    .leftJoin(contacts, eq(tasks.contactId, contacts.id))
    .where(
      and(
        eq(tasks.assignedTo, user.slug),
        isNull(tasks.completedAt),
        isNotNull(tasks.dueAt),
        lt(tasks.dueAt, todayStart)
      )
    )
    .orderBy(asc(tasks.dueAt))
    .limit(50);

  const mapTask = (r: typeof todaysTasksRaw[number]): MyDayTaskRow => ({
    id: r.id,
    title: r.title,
    dueAt: r.dueAt ? r.dueAt.toISOString() : null,
    completedAt: r.completedAt ? r.completedAt.toISOString() : null,
    contactId: r.contactId,
    contactName: r.contactName,
    contactEmail: r.contactEmail,
  });

  // ── Applications waiting (joined via contacts.owner) ─
  const appsRaw = await db
    .select({
      id: cohortApplications.id,
      name: cohortApplications.name,
      email: cohortApplications.email,
      status: cohortApplications.status,
      hours: cohortApplications.hours,
      goal: cohortApplications.goal,
      createdAt: cohortApplications.createdAt,
      contactId: contacts.id,
      contactOwner: contacts.owner,
    })
    .from(cohortApplications)
    .leftJoin(contacts, eq(sql`lower(${cohortApplications.email})`, contacts.email))
    .where(
      and(
        eq(contacts.owner, user.slug),
        inArray(cohortApplications.status, WAITING_STATUSES as unknown as string[])
      )
    )
    .orderBy(desc(cohortApplications.createdAt))
    .limit(8);

  const applicationsWaiting: MyDayApplicationRow[] = appsRaw.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    status: r.status,
    hours: r.hours,
    goal: r.goal,
    createdAt: r.createdAt.toISOString(),
    contactId: r.contactId,
  }));

  // ── Recent activity (mine) ───────────────────────────
  const activitiesRaw = await db
    .select({
      id: contactActivities.id,
      type: contactActivities.type,
      title: contactActivities.title,
      createdAt: contactActivities.createdAt,
      contactId: contactActivities.contactId,
      authorName: contactActivities.authorName,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(contactActivities)
    .leftJoin(contacts, eq(contactActivities.contactId, contacts.id))
    .where(eq(contactActivities.authorName, user.name))
    .orderBy(desc(contactActivities.createdAt))
    .limit(15);

  const recentActivity: MyDayActivityRow[] = activitiesRaw.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    createdAt: r.createdAt.toISOString(),
    contactId: r.contactId,
    contactName: r.contactName,
    contactEmail: r.contactEmail,
  }));

  // ── Stale contacts ───────────────────────────────────
  const staleRaw = await db
    .select({
      id: contacts.id,
      name: contacts.name,
      email: contacts.email,
      lastActivityAt: contacts.lastActivityAt,
    })
    .from(contacts)
    .where(
      and(
        eq(contacts.owner, user.slug),
        or(isNull(contacts.lastActivityAt), lt(contacts.lastActivityAt, staleCutoff))!
      )
    )
    .orderBy(sql`${contacts.lastActivityAt} ASC NULLS FIRST`)
    .limit(10);

  const staleContacts: MyDayStaleContactRow[] = staleRaw.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    lastActivityAt: r.lastActivityAt ? r.lastActivityAt.toISOString() : null,
  }));

  // ── Recent emails (mine) ─────────────────────────────
  const emailsRaw = await db
    .select({
      id: emailMessages.id,
      subject: emailMessages.subject,
      status: emailMessages.status,
      sentAt: emailMessages.sentAt,
      createdAt: emailMessages.createdAt,
      contactId: emailMessages.contactId,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(emailMessages)
    .leftJoin(contacts, eq(emailMessages.contactId, contacts.id))
    .where(eq(emailMessages.fromUser, user.slug))
    .orderBy(sql`${emailMessages.sentAt} DESC NULLS LAST`, desc(emailMessages.createdAt))
    .limit(5);

  const recentEmails: MyDayEmailRow[] = emailsRaw.map((r) => ({
    id: r.id,
    subject: r.subject,
    status: r.status,
    sentAt: r.sentAt ? r.sentAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    contactId: r.contactId,
    contactName: r.contactName,
    contactEmail: r.contactEmail,
  }));

  return {
    stats,
    todaysTasks: todaysTasksRaw.map(mapTask),
    overdueTasks: overdueTasksRaw.map(mapTask),
    applicationsWaiting,
    recentActivity,
    staleContacts,
    recentEmails,
  };
}
