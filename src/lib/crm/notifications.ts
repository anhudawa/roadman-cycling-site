import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

export type NotificationType = "mention" | "task_assigned" | "stage_change";

export const TEAM_SLUGS = ["ted", "sarah", "wes", "matthew"] as const;
export type TeamSlug = (typeof TEAM_SLUGS)[number];

export interface NotificationRow {
  id: number;
  recipientSlug: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface CreateNotificationParams {
  recipientSlug: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
}

export async function createNotification(
  params: CreateNotificationParams
): Promise<NotificationRow | null> {
  if (!params.recipientSlug || !params.title) return null;
  const inserted = await db
    .insert(notifications)
    .values({
      recipientSlug: params.recipientSlug,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      link: params.link ?? null,
    })
    .returning();
  const row = inserted[0];
  if (!row) return null;
  return serializeRow(row);
}

export async function listNotifications(
  slug: string,
  opts: { limit?: number; unreadOnly?: boolean } = {}
): Promise<NotificationRow[]> {
  const limit = Math.min(opts.limit ?? 20, 100);
  const conditions = [eq(notifications.recipientSlug, slug)];
  if (opts.unreadOnly) {
    conditions.push(isNull(notifications.readAt));
  }
  const rows = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows.map(serializeRow);
}

export async function countUnread(slug: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.recipientSlug, slug), isNull(notifications.readAt)));
  return result[0]?.count ?? 0;
}

export async function markRead(id: number, slug: string): Promise<boolean> {
  const updated = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.recipientSlug, slug)))
    .returning({ id: notifications.id });
  return updated.length > 0;
}

export async function markAllRead(slug: string): Promise<number> {
  const updated = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.recipientSlug, slug), isNull(notifications.readAt)))
    .returning({ id: notifications.id });
  return updated.length;
}

/** Extract @slug mentions from a body string. Only recognized team slugs. */
export function extractMentions(body: string | null | undefined): TeamSlug[] {
  if (!body) return [];
  const found = new Set<TeamSlug>();
  const re = /@([a-z]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    const slug = match[1].toLowerCase();
    if ((TEAM_SLUGS as readonly string[]).includes(slug)) {
      found.add(slug as TeamSlug);
    }
  }
  return Array.from(found);
}

function serializeRow(row: typeof notifications.$inferSelect): NotificationRow {
  return {
    id: row.id,
    recipientSlug: row.recipientSlug,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}
