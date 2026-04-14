import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity, getContactById } from "@/lib/crm/contacts";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; tag: string }> }
) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr, tag: tagRaw } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const tag = decodeURIComponent(tagRaw);

  const existing = await getContactById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currentTags = Array.isArray(existing.tags) ? existing.tags : [];
  if (!currentTags.includes(tag)) {
    return NextResponse.json({ contact: serialize(existing), activity: null });
  }

  const nextTags = currentTags.filter((t) => t !== tag);
  const updated = await db
    .update(contacts)
    .set({ tags: nextTags, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning();

  const author = user.name;
  const activity = await addActivity(id, {
    type: "tag_removed",
    title: `Tag removed: ${tag}`,
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
