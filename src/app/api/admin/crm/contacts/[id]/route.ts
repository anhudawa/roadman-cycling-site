import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity, getContactById } from "@/lib/crm/contacts";
import type { TeamUser } from "@/lib/admin/auth";

const ALLOWED_STAGES = ["lead", "contacted", "qualified", "customer", "churned"];
const ALLOWED_OWNERS = ["sarah", "wes", "matthew", "ted"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user: TeamUser;
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
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const author = user.name;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  let stageActivity: { prev: string; next: string } | null = null;
  let ownerActivity: { prev: string | null; next: string | null } | null = null;

  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    updates.name = body.name === "" ? null : body.name;
  }
  if (Object.prototype.hasOwnProperty.call(body, "phone")) {
    updates.phone = body.phone === "" ? null : body.phone;
  }
  if (Object.prototype.hasOwnProperty.call(body, "owner")) {
    const newOwner: string | null = body.owner === null || body.owner === "" ? null : body.owner;
    if (newOwner !== null && !ALLOWED_OWNERS.includes(newOwner)) {
      return NextResponse.json({ error: "Invalid owner" }, { status: 400 });
    }
    if (newOwner !== existing.owner) {
      updates.owner = newOwner;
      ownerActivity = { prev: existing.owner, next: newOwner };
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "lifecycleStage")) {
    const next = body.lifecycleStage;
    if (!ALLOWED_STAGES.includes(next)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    if (next !== existing.lifecycleStage) {
      updates.lifecycleStage = next;
      stageActivity = { prev: existing.lifecycleStage, next };
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "customFields") && body.customFields && typeof body.customFields === "object") {
    updates.customFields = { ...(existing.customFields ?? {}), ...body.customFields };
  }

  const updated = await db
    .update(contacts)
    .set(updates)
    .where(eq(contacts.id, id))
    .returning();

  let activity = null;
  if (stageActivity) {
    activity = await addActivity(id, {
      type: "stage_change",
      title: `Stage changed: ${stageActivity.prev} -> ${stageActivity.next}`,
      meta: { prev: stageActivity.prev, next: stageActivity.next },
      authorName: author,
    });
  }
  if (ownerActivity) {
    const a = await addActivity(id, {
      type: "assigned",
      title: ownerActivity.next
        ? `Assigned to ${ownerActivity.next}`
        : "Unassigned",
      meta: { prev: ownerActivity.prev, next: ownerActivity.next },
      authorName: author,
    });
    if (!activity) activity = a;
  }

  return NextResponse.json({
    contact: serializeContact(updated[0]),
    activity: activity
      ? { ...activity, meta: activity.meta ?? null, createdAt: activity.createdAt.toISOString() }
      : null,
  });
}

function serializeContact(c: typeof contacts.$inferSelect) {
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
