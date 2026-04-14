import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity, getContactById } from "@/lib/crm/contacts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getContactById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const tag = typeof body.tag === "string" ? body.tag.trim() : "";
  if (!tag) return NextResponse.json({ error: "Tag required" }, { status: 400 });

  const currentTags = Array.isArray(existing.tags) ? existing.tags : [];
  if (currentTags.includes(tag)) {
    return NextResponse.json({
      contact: serialize(existing),
      activity: null,
    });
  }

  const nextTags = [...currentTags, tag];
  const updated = await db
    .update(contacts)
    .set({ tags: nextTags, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning();

  const author = user.name;
  const activity = await addActivity(id, {
    type: "tag_added",
    title: `Tag added: ${tag}`,
    meta: { tag },
    authorName: author,
  });

  return NextResponse.json({
    contact: serialize(updated[0]),
    activity: {
      ...activity,
      meta: activity.meta ?? null,
      createdAt: activity.createdAt.toISOString(),
    },
  });
}

function serialize(c: typeof contacts.$inferSelect) {
  return {
    ...c,
    tags: Array.isArray(c.tags) ? c.tags : [],
    customFields: (c.customFields ?? {}) as Record<string, unknown>,
    firstSeenAt: c.firstSeenAt ? c.firstSeenAt.toISOString() : null,
    lastActivityAt: c.lastActivityAt ? c.lastActivityAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}
