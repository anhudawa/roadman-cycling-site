import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity, getContactById } from "@/lib/crm/contacts";

const ALLOWED_ASSIGNEES = ["sarah", "wes", "matthew", "ted"];

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  let contactId: number | null = null;
  if (body.contactId !== undefined && body.contactId !== null && body.contactId !== "") {
    const parsed = typeof body.contactId === "number" ? body.contactId : parseInt(String(body.contactId), 10);
    if (Number.isNaN(parsed)) {
      return NextResponse.json({ error: "Invalid contactId" }, { status: 400 });
    }
    const existing = await getContactById(parsed);
    if (!existing) return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    contactId = parsed;
  }

  let assignedTo: string | null = null;
  if (body.assignedTo) {
    if (!ALLOWED_ASSIGNEES.includes(body.assignedTo)) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
    assignedTo = body.assignedTo;
  } else {
    assignedTo = user.slug;
  }

  let dueAt: Date | null = null;
  if (body.dueAt) {
    const d = new Date(body.dueAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid dueAt" }, { status: 400 });
    }
    dueAt = d;
  }

  const inserted = await db
    .insert(tasksTable)
    .values({
      contactId,
      title,
      notes: typeof body.notes === "string" ? body.notes : null,
      dueAt,
      assignedTo,
      createdBy: user.name,
    })
    .returning();

  const task = inserted[0];

  let activity = null;
  if (contactId) {
    activity = await addActivity(contactId, {
      type: "task_created",
      title: `Task created: ${title}`,
      meta: { taskId: task.id, assignedTo, dueAt: dueAt ? dueAt.toISOString() : null },
      authorName: user.name,
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
