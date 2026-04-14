import { db } from "@/lib/db";
import { contacts, contactActivities } from "@/lib/db/schema";
import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";

export type Contact = typeof contacts.$inferSelect;
export type ContactActivity = typeof contactActivities.$inferSelect;

export type ContactSource =
  | "contact_form"
  | "cohort_application"
  | "manual"
  | "import"
  | "subscribers";

export type ActivityType =
  | "contact_submission"
  | "cohort_application"
  | "note"
  | "email_sent"
  | "assigned"
  | "tag_added"
  | "tag_removed"
  | "stage_change"
  | "call_logged"
  | "task_created"
  | "task_completed";

export interface UpsertContactParams {
  email: string;
  name?: string | null;
  phone?: string | null;
  source?: ContactSource;
  ownerHint?: string | null;
  customFields?: Record<string, unknown>;
  firstSeenAt?: Date;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function upsertContact(params: UpsertContactParams): Promise<Contact> {
  const email = normalizeEmail(params.email);
  if (!email) throw new Error("upsertContact: email required");

  const now = new Date();
  const existing = await db
    .select()
    .from(contacts)
    .where(eq(contacts.email, email))
    .limit(1);

  if (existing.length === 0) {
    const mergedCustom = params.customFields ?? {};
    const inserted = await db
      .insert(contacts)
      .values({
        email,
        name: params.name ?? null,
        phone: params.phone ?? null,
        owner: params.ownerHint ?? null,
        source: params.source ?? "manual",
        tags: [],
        customFields: mergedCustom,
        lifecycleStage: "lead",
        firstSeenAt: params.firstSeenAt ?? now,
        lastActivityAt: now,
      })
      .returning();
    return inserted[0];
  }

  const current = existing[0];
  const updates: Partial<typeof contacts.$inferInsert> = {
    lastActivityAt: now,
    updatedAt: now,
  };
  if (!current.name && params.name) updates.name = params.name;
  if (!current.phone && params.phone) updates.phone = params.phone;
  if (!current.owner && params.ownerHint) updates.owner = params.ownerHint;
  if (params.customFields && Object.keys(params.customFields).length > 0) {
    updates.customFields = { ...(current.customFields ?? {}), ...params.customFields };
  }
  if (params.firstSeenAt && (!current.firstSeenAt || params.firstSeenAt < current.firstSeenAt)) {
    updates.firstSeenAt = params.firstSeenAt;
  }

  const updated = await db
    .update(contacts)
    .set(updates)
    .where(eq(contacts.id, current.id))
    .returning();
  return updated[0];
}

export interface AddActivityParams {
  type: ActivityType;
  title: string;
  body?: string | null;
  meta?: Record<string, unknown> | null;
  authorName?: string | null;
}

export async function addActivity(
  contactId: number,
  params: AddActivityParams
): Promise<ContactActivity> {
  const now = new Date();
  const inserted = await db
    .insert(contactActivities)
    .values({
      contactId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      meta: params.meta ?? null,
      authorName: params.authorName ?? null,
    })
    .returning();

  await db
    .update(contacts)
    .set({ lastActivityAt: now, updatedAt: now })
    .where(eq(contacts.id, contactId));

  return inserted[0];
}

export interface ApplicationLike {
  email: string;
  name?: string | null;
  goal?: string | null;
  hours?: string | null;
  ftp?: string | null;
  cohort?: string | null;
  persona?: string | null;
  createdAt?: Date | string | null;
}

export async function getOrCreateContactForApplication(
  app: ApplicationLike
): Promise<number> {
  const firstSeenAt = app.createdAt
    ? app.createdAt instanceof Date
      ? app.createdAt
      : new Date(app.createdAt)
    : undefined;
  const contact = await upsertContact({
    email: app.email,
    name: app.name ?? null,
    source: "cohort_application",
    customFields: {
      goal: app.goal ?? null,
      hours: app.hours ?? null,
      ftp: app.ftp ?? null,
      cohort: app.cohort ?? null,
      persona: app.persona ?? null,
    },
    firstSeenAt,
  });
  return contact.id;
}

export async function getContactById(id: number): Promise<Contact | null> {
  const rows = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getContactByEmail(email: string): Promise<Contact | null> {
  const e = normalizeEmail(email);
  const rows = await db.select().from(contacts).where(eq(contacts.email, e)).limit(1);
  return rows[0] ?? null;
}

export interface ListContactsParams {
  search?: string;
  owner?: string | "unassigned" | null;
  stage?: string | null;
  limit?: number;
  offset?: number;
}

export interface ListContactsResult {
  rows: Contact[];
  total: number;
}

export async function listContacts(params: ListContactsParams = {}): Promise<ListContactsResult> {
  const limit = Math.min(params.limit ?? 50, 200);
  const offset = params.offset ?? 0;

  const conditions = [];
  if (params.search && params.search.trim()) {
    const q = `%${params.search.trim()}%`;
    conditions.push(or(ilike(contacts.email, q), ilike(contacts.name, q)));
  }
  if (params.owner === "unassigned") {
    conditions.push(isNull(contacts.owner));
  } else if (params.owner) {
    conditions.push(eq(contacts.owner, params.owner));
  }
  if (params.stage) {
    conditions.push(eq(contacts.lifecycleStage, params.stage));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rowsQuery = db
    .select()
    .from(contacts)
    .orderBy(desc(contacts.lastActivityAt), desc(contacts.createdAt))
    .limit(limit)
    .offset(offset);

  const countQuery = db
    .select({ count: sql<number>`count(*)::int` })
    .from(contacts);

  const [rows, countResult] = await Promise.all([
    whereClause ? rowsQuery.where(whereClause) : rowsQuery,
    whereClause ? countQuery.where(whereClause) : countQuery,
  ]);

  return { rows, total: countResult[0]?.count ?? 0 };
}

export async function getTimeline(
  contactId: number,
  opts: { limit?: number } = {}
): Promise<ContactActivity[]> {
  const limit = Math.min(opts.limit ?? 100, 500);
  return db
    .select()
    .from(contactActivities)
    .where(eq(contactActivities.contactId, contactId))
    .orderBy(desc(contactActivities.createdAt))
    .limit(limit);
}
