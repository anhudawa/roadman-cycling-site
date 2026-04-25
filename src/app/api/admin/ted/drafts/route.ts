import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedDrafts, tedEdits } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/ted/drafts $— list drafts, newest first
export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

  const rows = status
    ? await db
        .select()
        .from(tedDrafts)
        .where(eq(tedDrafts.status, status))
        .orderBy(desc(tedDrafts.createdAt))
        .limit(limit)
    : await db
        .select()
        .from(tedDrafts)
        .orderBy(desc(tedDrafts.createdAt))
        .limit(limit);

  return NextResponse.json({ drafts: rows });
}

// PATCH /api/admin/ted/drafts $— approve / edit / reject a draft
// Body: { id: number, action: 'approve' | 'edit' | 'reject', editedBody?: string }
export async function PATCH(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    id?: number;
    action?: "approve" | "edit" | "reject";
    editedBody?: string;
  };
  const { id, action, editedBody } = body;
  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(tedDrafts)
    .where(eq(tedDrafts.id, id))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const now = new Date();

  if (action === "approve") {
    await db
      .update(tedDrafts)
      .set({
        status: "approved",
        approvedBySlug: user.slug,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(tedDrafts.id, id));
  } else if (action === "edit") {
    if (!editedBody || typeof editedBody !== "string") {
      return NextResponse.json({ error: "editedBody required for edit" }, { status: 400 });
    }
    const before = existing.editedBody ?? existing.originalBody;
    await db
      .update(tedDrafts)
      .set({
        status: "edited",
        editedBody,
        approvedBySlug: user.slug,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(tedDrafts.id, id));
    await db.insert(tedEdits).values({
      draftId: id,
      beforeText: before,
      afterText: editedBody,
      charsChanged: Math.abs(editedBody.length - before.length),
      editedBySlug: user.slug,
    });
  } else if (action === "reject") {
    await db
      .update(tedDrafts)
      .set({
        status: "rejected",
        approvedBySlug: user.slug,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(tedDrafts.id, id));
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
