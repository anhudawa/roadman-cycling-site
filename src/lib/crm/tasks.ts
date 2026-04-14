import { db } from "@/lib/db";
import { tasks, contacts } from "@/lib/db/schema";
import { and, asc, desc, eq, gte, isNull, lt, lte, sql, isNotNull } from "drizzle-orm";

export type Task = typeof tasks.$inferSelect;

export type TaskDueFilter = "today" | "this_week" | "overdue" | "any";
export type TaskStatusFilter = "open" | "completed" | "all";

export interface ListTasksParams {
  assignedTo?: string | null;
  status?: TaskStatusFilter;
  due?: TaskDueFilter;
  limit?: number;
  offset?: number;
}

export interface TaskRow {
  id: number;
  title: string;
  notes: string | null;
  dueAt: string | null;
  completedAt: string | null;
  assignedTo: string | null;
  createdBy: string | null;
  createdAt: string;
  contactId: number | null;
  contactName: string | null;
  contactEmail: string | null;
}

export interface ListTasksResult {
  rows: TaskRow[];
  total: number;
}

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

function endOfThisWeek(): Date {
  // End of Sunday from today (ISO week end). Simple: 7 days from start of today.
  const d = startOfToday();
  d.setDate(d.getDate() + 7);
  return d;
}

export async function listTasks(params: ListTasksParams = {}): Promise<ListTasksResult> {
  const limit = Math.min(params.limit ?? 100, 500);
  const offset = params.offset ?? 0;
  const status = params.status ?? "open";
  const due = params.due ?? "any";

  const conditions = [];

  if (params.assignedTo) {
    conditions.push(eq(tasks.assignedTo, params.assignedTo));
  }

  if (status === "open") {
    conditions.push(isNull(tasks.completedAt));
  } else if (status === "completed") {
    conditions.push(isNotNull(tasks.completedAt));
  }

  const now = new Date();
  if (due === "today") {
    conditions.push(and(gte(tasks.dueAt, startOfToday()), lte(tasks.dueAt, endOfToday()))!);
  } else if (due === "this_week") {
    conditions.push(and(gte(tasks.dueAt, startOfToday()), lte(tasks.dueAt, endOfThisWeek()))!);
  } else if (due === "overdue") {
    conditions.push(and(isNotNull(tasks.dueAt), lt(tasks.dueAt, now), isNull(tasks.completedAt))!);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rowsQuery = db
    .select({
      id: tasks.id,
      title: tasks.title,
      notes: tasks.notes,
      dueAt: tasks.dueAt,
      completedAt: tasks.completedAt,
      assignedTo: tasks.assignedTo,
      createdBy: tasks.createdBy,
      createdAt: tasks.createdAt,
      contactId: tasks.contactId,
      contactName: contacts.name,
      contactEmail: contacts.email,
    })
    .from(tasks)
    .leftJoin(contacts, eq(tasks.contactId, contacts.id))
    .orderBy(
      // Completed at the bottom; then by due date asc (nulls last), then created desc.
      asc(sql`${tasks.completedAt} IS NOT NULL`),
      sql`${tasks.dueAt} ASC NULLS LAST`,
      desc(tasks.createdAt)
    )
    .limit(limit)
    .offset(offset);

  const countQuery = db.select({ count: sql<number>`count(*)::int` }).from(tasks);

  const [rows, countResult] = await Promise.all([
    whereClause ? rowsQuery.where(whereClause) : rowsQuery,
    whereClause ? countQuery.where(whereClause) : countQuery,
  ]);

  return {
    rows: rows.map((r) => ({
      id: r.id,
      title: r.title,
      notes: r.notes,
      dueAt: r.dueAt ? r.dueAt.toISOString() : null,
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
      assignedTo: r.assignedTo,
      createdBy: r.createdBy,
      createdAt: r.createdAt.toISOString(),
      contactId: r.contactId,
      contactName: r.contactName,
      contactEmail: r.contactEmail,
    })),
    total: countResult[0]?.count ?? 0,
  };
}

export async function countOpenTasksFor(assignedTo: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(and(eq(tasks.assignedTo, assignedTo), isNull(tasks.completedAt)));
  return result[0]?.count ?? 0;
}

export async function countOverdueTasksFor(assignedTo: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(
      and(
        eq(tasks.assignedTo, assignedTo),
        isNull(tasks.completedAt),
        isNotNull(tasks.dueAt),
        lt(tasks.dueAt, new Date())
      )
    );
  return result[0]?.count ?? 0;
}
