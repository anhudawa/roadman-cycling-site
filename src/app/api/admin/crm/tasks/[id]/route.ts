import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity } from "@/lib/crm/contacts";

const ALLOWED_ASSIGNEES = ["sarah", "wes", "matthew", "ted"];

export async function PATCH(
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

  const existingRows = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .limit(1);
  const existing = existingRows[0];
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const updates: Partial<typeof tasksTable.$inferInsert> = {};
  let completedNow = false;

  if (Object.prototype.hasOwnProperty.call(body, "title") && typeof body.title === "string") {
    updates.title = body.title.trim();
  }
  if (Object.prototype.hasOwnProperty.call(body, "notes")) {
    updates.notes = body.notes === "" || body.notes === null ? null : String(body.notes);
  }
  if (Object.prototype.hasOwnProperty.call(body, "dueAt")) {
    if (!body.dueAt) {
      updates.dueAt = null;
    } else {
      const d = new Date(body.dueAt);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid dueAt" }, { status: 400 });
      }
      updates.dueAt = d;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "assignedTo")) {
    if (body.assignedTo === null || body.assignedTo === "") {
      updates.assignedTo = null;
    } else if (!ALLOWED_ASSIGNEES.includes(body.assignedTo)) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    } else {
      updates.assignedTo = body.assignedTo;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "completed")) {
    if (body.completed && !existing.completedAt) {
      updates.completedAt = new Date();
      completedNow = true;
    } else if (!body.completed) {
      updates.completedAt = null;
    }
  }

  const updated = await db
    .update(tasksTable)
    .set(updates)
    .where(eq(tasksTable.id, id))
    .returning();
  const task = updated[0];

  let activity = null;
  if (completedNow && task.contactId) {
    const author = user.name;
    activity = await addActivity(task.contactId, {
      type: "task_completed",
      title: `Task completed: ${task.title}`,
      meta: { taskId: task.id },
      authorName: author,
      authorSlug: user.slug,
    });
  }

  return NextResponse.json({
    task: {
      ...task,
      dueAt: task.dueAt ? task.dueAt.toISOString() : null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
    },
    activity: activity
      ? { ...activity, meta: activity.meta ?? null, createdAt: activity.createdAt.toISOString() }
      : null,
  });
}

export async function DELETE(
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

  const [existing] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .limit(1);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the assignee or the creator may delete a task. (Admins can also
  // delete anything $€” kept permissive for the small internal team.)
  const canDelete =
    existing.assignedTo === user.slug ||
    existing.createdBy === user.slug ||
    user.role === "admin";
  if (!canDelete) {
    return NextResponse.json(
      { error: "Not allowed" },
      { status: 403 }
    );
  }

  await db.delete(tasksTable).where(eq(tasksTable.id, id));
  return NextResponse.json({ ok: true });
}
