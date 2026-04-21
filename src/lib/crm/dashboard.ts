import { db } from "@/lib/db";
import {
  contacts,
  contactActivities,
  tasks,
  cohortApplications,
  emailMessages,
  teamUsers,
} from "@/lib/db/schema";
import { alias } from "drizzle-orm/pg-core";
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
import { getTodayForUser as getBookingsToday, getUpcomingForUser as getBookingsUpcoming, type BookingRow } from "@/lib/crm/bookings";

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

export interface MyDayTaskRequestRow {
  id: number;
  title: string;
  notes: string | null;
  dueAt: string | null;
  createdAt: string;
  respondedAt: string | null;
  requestStatus: string; // 'requested' | 'accepted' | 'declined'
  responseMessage: string | null;
  createdBy: string | null; // slug
  createdByName: string | null;
  assignedTo: string; // slug
  assignedToName: string | null;
  contactId: number | null;
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
  todayBookings: BookingRow[];
  upcomingBookings: BookingRow[];
  /** Incoming task requests awaiting this user's accept/decline/reply. */
  incomingTaskRequests: MyDayTaskRequestRow[];
  /** Outgoing task requests this user has sent that are still pending. */
  outgoingTaskRequests: MyDayTaskRequestRow[];
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

  // Tasks in "requested" or "declined" state aren't real tasks yet — they
  // live in the peer-to-peer task-request inbox and must be accepted first.
  const notPendingRequest = sql`(${tasks.requestStatus} IS NULL OR ${tasks.requestStatus} = 'accepted')`;

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
        gte(tasks.dueAt, todayStart),
        notPendingRequest
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
        lt(tasks.dueAt, todayStart),
        notPendingRequest
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
    .where(eq(contactActivities.authorSlug, user.slug))
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

  // ── Bookings ─────────────────────────────────────────
  const [todayBookings, upcomingBookings] = await Promise.all([
    getBookingsToday(user.slug).catch(() => []),
    getBookingsUpcoming(user.slug, { hours: 24 }).catch(() => []),
  ]);

  // ── Peer-to-peer task requests ───────────────────────
  const creatorUsers = alias(teamUsers, "creator_users");
  const assigneeUsers = alias(teamUsers, "assignee_users");

  const taskRequestColumns = {
    id: tasks.id,
    title: tasks.title,
    notes: tasks.notes,
    dueAt: tasks.dueAt,
    createdAt: tasks.createdAt,
    respondedAt: tasks.respondedAt,
    requestStatus: tasks.requestStatus,
    responseMessage: tasks.responseMessage,
    createdBy: tasks.createdBy,
    createdByName: creatorUsers.name,
    assignedTo: tasks.assignedTo,
    assignedToName: assigneeUsers.name,
    contactId: tasks.contactId,
    contactName: contacts.name,
    contactEmail: contacts.email,
  };

  const [incomingRaw, outgoingRaw] = await Promise.all([
    db
      .select(taskRequestColumns)
      .from(tasks)
      .leftJoin(contacts, eq(tasks.contactId, contacts.id))
      .leftJoin(creatorUsers, eq(creatorUsers.slug, tasks.createdBy))
      .leftJoin(assigneeUsers, eq(assigneeUsers.slug, tasks.assignedTo))
      .where(
        and(
          eq(tasks.assignedTo, user.slug),
          eq(tasks.requestStatus, "requested")
        )
      )
      .orderBy(desc(tasks.createdAt))
      .limit(50),
    db
      .select(taskRequestColumns)
      .from(tasks)
      .leftJoin(contacts, eq(tasks.contactId, contacts.id))
      .leftJoin(creatorUsers, eq(creatorUsers.slug, tasks.createdBy))
      .leftJoin(assigneeUsers, eq(assigneeUsers.slug, tasks.assignedTo))
      .where(
        and(
          eq(tasks.createdBy, user.slug),
          eq(tasks.requestStatus, "requested")
        )
      )
      .orderBy(desc(tasks.createdAt))
      .limit(50),
  ]);

  const mapRequest = (r: typeof incomingRaw[number]): MyDayTaskRequestRow => ({
    id: r.id,
    title: r.title,
    notes: r.notes ?? null,
    dueAt: r.dueAt ? r.dueAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    respondedAt: r.respondedAt ? r.respondedAt.toISOString() : null,
    requestStatus: r.requestStatus ?? "requested",
    responseMessage: r.responseMessage ?? null,
    createdBy: r.createdBy ?? null,
    createdByName: r.createdByName ?? null,
    assignedTo: r.assignedTo ?? "",
    assignedToName: r.assignedToName ?? null,
    contactId: r.contactId ?? null,
    contactName: r.contactName ?? null,
    contactEmail: r.contactEmail ?? null,
  });

  const incomingTaskRequests = incomingRaw.map(mapRequest);
  const outgoingTaskRequests = outgoingRaw.map(mapRequest);

  return {
    stats,
    todaysTasks: todaysTasksRaw.map(mapTask),
    overdueTasks: overdueTasksRaw.map(mapTask),
    applicationsWaiting,
    recentActivity,
    staleContacts,
    recentEmails,
    todayBookings,
    upcomingBookings,
    incomingTaskRequests,
    outgoingTaskRequests,
  };
}
