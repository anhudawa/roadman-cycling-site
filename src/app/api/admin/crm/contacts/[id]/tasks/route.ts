import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/lib/db/schema";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity, getContactById } from "@/lib/crm/contacts";

const ALLOWED_ASSIGNEES = ["sarah", "wes", "matthew", "ted"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
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
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  let assignedTo: string | null = null;
  if (body.assignedTo) {
    if (!ALLOWED_ASSIGNEES.includes(body.assignedTo)) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
    assignedTo = body.assignedTo;
  }

  let dueAt: Date | null = null;
  if (body.dueAt) {
    const d = new Date(body.dueAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid dueAt" }, { status: 400 });
    }
    dueAt = d;
  }

  const author = request.headers.get("X-CRM-User") ?? "admin";

  const inserted = await db
    .insert(tasksTable)
    .values({
      contactId: id,
      title,
      notes: typeof body.notes === "string" ? body.notes : null,
      dueAt,
      assignedTo,
      createdBy: author,
    })
    .returning();

  const task = inserted[0];
  const activity = await addActivity(id, {
    type: "task_created",
    title: `Task created: ${title}`,
    meta: { taskId: task.id, assignedTo, dueAt: dueAt ? dueAt.toISOString() : null },
    authorName: author,
  });

  return NextResponse.json({
    task: {
      ...task,
      dueAt: task.dueAt ? task.dueAt.toISOString() : null,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
    },
    activity: {
      ...activity,
      meta: activity.meta ?? null,
      createdAt: activity.createdAt.toISOString(),
    },
  });
}
