import { db } from "@/lib/db";
import { contacts, contactActivities } from "@/lib/db/schema";
import { and, desc, eq, ilike, or, sql, gte, lte, inArray } from "drizzle-orm";
import type { ActivityType, ContactActivity } from "./contacts";

export type ActivityFeedFilters = {
  types?: ActivityType[];
  authorSlug?: string;
  contactId?: number;
  after?: Date;
  before?: Date;
  search?: string;
};

export type ActivityFeedRow = ContactActivity & {
  contactEmail: string;
  contactName: string | null;
};

export async function listActivityFeed(
  filters: ActivityFeedFilters,
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<{ rows: ActivityFeedRow[]; total: number }> {
  const lim = Math.min(Math.max(limit, 1), 200);
  const off = Math.max(offset, 0);

  const conds = [];
  if (filters.types && filters.types.length > 0) {
    conds.push(inArray(contactActivities.type, filters.types as string[]));
  }
  if (filters.authorSlug) {
    conds.push(eq(contactActivities.authorSlug, filters.authorSlug));
  }
  if (typeof filters.contactId === "number") {
    conds.push(eq(contactActivities.contactId, filters.contactId));
  }
  if (filters.after) {
    conds.push(gte(contactActivities.createdAt, filters.after));
  }
  if (filters.before) {
    conds.push(lte(contactActivities.createdAt, filters.before));
  }
  if (filters.search && filters.search.trim()) {
    const q = `%${filters.search.trim()}%`;
    const orExpr = or(ilike(contactActivities.title, q), ilike(contactActivities.body, q));
    if (orExpr) conds.push(orExpr);
  }

  const where = conds.length > 0 ? and(...conds) : undefined;

  const baseRows = db
    .select({
      id: contactActivities.id,
      contactId: contactActivities.contactId,
      type: contactActivities.type,
      title: contactActivities.title,
      body: contactActivities.body,
      meta: contactActivities.meta,
      authorName: contactActivities.authorName,
      authorSlug: contactActivities.authorSlug,
      createdAt: contactActivities.createdAt,
      contactEmail: contacts.email,
      contactName: contacts.name,
    })
    .from(contactActivities)
    .innerJoin(contacts, eq(contactActivities.contactId, contacts.id))
    .orderBy(desc(contactActivities.createdAt))
    .limit(lim)
    .offset(off);

  const baseCount = db
    .select({ count: sql<number>`count(*)::int` })
    .from(contactActivities)
    .innerJoin(contacts, eq(contactActivities.contactId, contacts.id));

  const [rows, countRes] = await Promise.all([
    where ? baseRows.where(where) : baseRows,
    where ? baseCount.where(where) : baseCount,
  ]);

  return {
    rows: rows as ActivityFeedRow[],
    total: countRes[0]?.count ?? 0,
  };
}

export async function listDistinctAuthors(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ slug: contactActivities.authorSlug })
    .from(contactActivities);
  return rows
    .map((r) => r.slug)
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .sort();
}

export const ALL_ACTIVITY_TYPES: ActivityType[] = [
  "contact_submission",
  "cohort_application",
  "note",
  "email_sent",
  "email_opened",
  "email_clicked",
  "assigned",
  "tag_added",
  "tag_removed",
  "stage_change",
  "call_logged",
  "task_created",
  "task_completed",
  "enrichment_beehiiv",
  "enrichment_stripe_purchase",
  "file_uploaded",
  "file_removed",
  "contact_merged",
];
