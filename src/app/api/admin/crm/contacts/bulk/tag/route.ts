import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { contacts, contactActivities } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import type { TeamUser } from "@/lib/admin/auth";

export async function POST(request: Request) {
  let user: TeamUser;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { contactIds?: unknown; tag?: unknown }
    | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const rawIds = Array.isArray(body.contactIds) ? body.contactIds : [];
  const contactIds = rawIds
    .map((v) => (typeof v === "number" ? v : parseInt(String(v), 10)))
    .filter((n): n is number => Number.isInteger(n) && n > 0);
  if (contactIds.length === 0) {
    return NextResponse.json({ error: "No contactIds provided" }, { status: 400 });
  }

  const rawTag = typeof body.tag === "string" ? body.tag : "";
  const tag = rawTag.trim().toLowerCase().slice(0, 40);
  if (!tag) {
    return NextResponse.json({ error: "Tag required" }, { status: 400 });
  }

  const rows = await db
    .select({ id: contacts.id, tags: contacts.tags })
    .from(contacts)
    .where(inArray(contacts.id, contactIds));

  const now = new Date();
  const activityRows: Array<typeof contactActivities.$inferInsert> = [];
  let updatedCount = 0;

  for (const row of rows) {
    const existingTags = Array.isArray(row.tags) ? row.tags : [];
    if (existingTags.includes(tag)) continue;
    const nextTags = [...existingTags, tag];
    await db
      .update(contacts)
      .set({ tags: nextTags, updatedAt: now, lastActivityAt: now })
      .where(eq(contacts.id, row.id));
    activityRows.push({
      contactId: row.id,
      type: "tag_added",
      title: `Tag added: ${tag}`,
      body: null,
      meta: { tag },
      authorName: user.name,
      authorSlug: user.slug,
    });
    updatedCount++;
  }

  if (activityRows.length > 0) {
    await db.insert(contactActivities).values(activityRows);
  }

  return NextResponse.json({ count: updatedCount });
}
