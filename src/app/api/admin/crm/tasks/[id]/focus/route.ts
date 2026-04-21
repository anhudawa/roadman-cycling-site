import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks as tasksTable } from "@/lib/db/schema";
import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

/**
 * POST /api/admin/crm/tasks/[id]/focus
 * Body: { action: "pin" | "unpin" | "reorder", position?: number }
 *
 * "pin"       → add this task to the assignee's Main Focus list at the end
 *               (or at `position` if supplied).
 * "unpin"     → clear focus_order, task drops into "All other tasks".
 * "reorder"   → move within Main Focus to `position` (0-based).
 *
 * Re-indexes focus_order to 1..N after every mutation so the list stays
 * tight and drag operations are O(N) in DB writes (N ≤ ~20 realistic).
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

  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const position =
    body.position === undefined
      ? null
      : Number.parseInt(String(body.position), 10);

  if (!["pin", "unpin", "reorder"].includes(action)) {
    return NextResponse.json(
      { error: "action must be pin | unpin | reorder" },
      { status: 400 }
    );
  }

  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .limit(1);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the assignee may rearrange their own focus list.
  if (task.assignedTo !== user.slug) {
    return NextResponse.json({ error: "Not your task" }, { status: 403 });
  }

  // Pull the current focus list for this user (ordered).
  const currentFocus = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.assignedTo, user.slug),
        isNull(tasksTable.completedAt),
        isNotNull(tasksTable.focusOrder)
      )
    )
    .orderBy(asc(tasksTable.focusOrder));

  // Drop the task being moved (if present) and then re-insert / remove.
  const withoutTask = currentFocus.filter((t) => t.id !== id);

  let nextList: typeof currentFocus;
  if (action === "unpin") {
    nextList = withoutTask;
  } else {
    // pin or reorder — compute the target index
    let idx: number;
    if (position === null || Number.isNaN(position)) {
      idx = withoutTask.length; // append
    } else {
      idx = Math.max(0, Math.min(position, withoutTask.length));
    }
    // Insert the task at idx
    nextList = [
      ...withoutTask.slice(0, idx),
      task,
      ...withoutTask.slice(idx),
    ];
  }

  // Apply new focus_order in a single batch — null the moved task if unpinned,
  // then reassign 1..N for the remaining focused list.
  if (action === "unpin") {
    await db
      .update(tasksTable)
      .set({ focusOrder: null })
      .where(eq(tasksTable.id, id));
  }
  // Re-index everything (simple, safe for small lists)
  for (let i = 0; i < nextList.length; i++) {
    await db
      .update(tasksTable)
      .set({ focusOrder: i + 1 })
      .where(eq(tasksTable.id, nextList[i].id));
  }

  void sql; // keep import list explicit

  return NextResponse.json({
    ok: true,
    focusOrder: action === "unpin" ? null : nextList.findIndex((t) => t.id === id) + 1,
    focusList: nextList.map((t) => ({ id: t.id, title: t.title })),
  });
}
