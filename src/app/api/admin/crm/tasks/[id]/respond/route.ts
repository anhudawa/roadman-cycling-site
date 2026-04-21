import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks as tasksTable, teamUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { createNotification } from "@/lib/crm/notifications";

/**
 * POST /api/admin/crm/tasks/[id]/respond
 * Body: { action: "accept" | "decline" | "reply", message?: string }
 *
 * Receiver (assignee) of a requested task can accept, decline, or reply with
 * a message. Reply doesn't change status — it just nudges the sender to
 * renegotiate. Sender gets a notification on every response.
 */
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
  if (Number.isNaN(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json();
  const action = String(body.action ?? "");
  const message =
    typeof body.message === "string" ? body.message.trim() : null;

  if (!["accept", "decline", "reply"].includes(action)) {
    return NextResponse.json(
      { error: "action must be accept | decline | reply" },
      { status: 400 }
    );
  }
  if (action === "reply" && !message) {
    return NextResponse.json(
      { error: "reply requires a message" },
      { status: 400 }
    );
  }

  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .limit(1);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the assignee of a requested task may respond (or the original sender,
  // who can cancel by declining — we handle that loosely here).
  if (task.assignedTo !== user.slug && task.createdBy !== user.slug) {
    return NextResponse.json(
      { error: "Not your task to respond to" },
      { status: 403 }
    );
  }

  const now = new Date();
  const patch: Partial<typeof tasksTable.$inferInsert> = {
    respondedAt: now,
    responseMessage: message ?? task.responseMessage ?? null,
  };
  if (action === "accept") patch.requestStatus = "accepted";
  if (action === "decline") patch.requestStatus = "declined";
  // action === "reply" → status unchanged

  await db.update(tasksTable).set(patch).where(eq(tasksTable.id, id));

  // Notify the sender (createdBy) if different from the responder.
  if (task.createdBy && task.createdBy !== user.slug) {
    const [senderRow] = await db
      .select({ name: teamUsers.name })
      .from(teamUsers)
      .where(eq(teamUsers.slug, task.createdBy))
      .limit(1);
    void senderRow; // not strictly needed
    const actionLabel =
      action === "accept"
        ? "accepted"
        : action === "decline"
          ? "declined"
          : "replied to";
    try {
      await createNotification({
        recipientSlug: task.createdBy,
        type: "task_assigned",
        title: `${user.name} ${actionLabel} your task`,
        body: message
          ? `"${message.slice(0, 140)}" — re: ${task.title}`
          : task.title,
        link: "/admin/my-day",
      });
    } catch (err) {
      console.error("[tasks/respond] notify sender failed", err);
    }
  }

  const [updated] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .limit(1);

  return NextResponse.json({
    ok: true,
    task: updated
      ? {
          ...updated,
          dueAt: updated.dueAt ? updated.dueAt.toISOString() : null,
          completedAt: updated.completedAt
            ? updated.completedAt.toISOString()
            : null,
          respondedAt: updated.respondedAt
            ? updated.respondedAt.toISOString()
            : null,
          createdAt: updated.createdAt.toISOString(),
        }
      : null,
  });
}
