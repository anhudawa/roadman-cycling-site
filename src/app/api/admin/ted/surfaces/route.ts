import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedSurfaceDrafts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/ted/surfaces — approve / edit / reject a surface draft.
// Body: { id: number, action: "approve"|"edit"|"reject", editedBody?: string }
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
    .from(tedSurfaceDrafts)
    .where(eq(tedSurfaceDrafts.id, id))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Surface draft not found" }, { status: 404 });
  }
  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Already posted; can't change" },
      { status: 409 }
    );
  }

  const now = new Date();

  if (action === "approve") {
    await db
      .update(tedSurfaceDrafts)
      .set({
        status: "approved",
        approvedBySlug: user.slug,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(tedSurfaceDrafts.id, id));
  } else if (action === "edit") {
    if (!editedBody || typeof editedBody !== "string") {
      return NextResponse.json(
        { error: "editedBody required for edit" },
        { status: 400 }
      );
    }
    await db
      .update(tedSurfaceDrafts)
      .set({
        status: "edited",
        editedBody,
        approvedBySlug: user.slug,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(tedSurfaceDrafts.id, id));
  } else if (action === "reject") {
    await db
      .update(tedSurfaceDrafts)
      .set({
        status: "rejected",
        approvedBySlug: user.slug,
        approvedAt: now,
        updatedAt: now,
        failureReason: `rejected by ${user.slug}`,
      })
      .where(eq(tedSurfaceDrafts.id, id));
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
