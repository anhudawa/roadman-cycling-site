import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedWelcomeQueue } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/ted/welcomes $€” approve / edit / reject a welcome draft.
// Body: { memberEmail: string, action: "approve"|"edit"|"reject", editedBody?: string }
export async function PATCH(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    memberEmail?: string;
    action?: "approve" | "edit" | "reject";
    editedBody?: string;
  };
  const { memberEmail, action, editedBody } = body;
  if (!memberEmail || !action) {
    return NextResponse.json(
      { error: "memberEmail and action required" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(tedWelcomeQueue)
    .where(eq(tedWelcomeQueue.memberEmail, memberEmail))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Welcome not found" }, { status: 404 });
  }
  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Already posted; can't change" },
      { status: 409 }
    );
  }

  if (action === "approve") {
    await db
      .update(tedWelcomeQueue)
      .set({ status: "approved" })
      .where(eq(tedWelcomeQueue.memberEmail, memberEmail));
  } else if (action === "edit") {
    if (!editedBody || typeof editedBody !== "string") {
      return NextResponse.json(
        { error: "editedBody required for edit" },
        { status: 400 }
      );
    }
    await db
      .update(tedWelcomeQueue)
      .set({ draftBody: editedBody, status: "approved" })
      .where(eq(tedWelcomeQueue.memberEmail, memberEmail));
  } else if (action === "reject") {
    await db
      .update(tedWelcomeQueue)
      .set({ status: "skipped", failureReason: `rejected by ${user.slug}` })
      .where(eq(tedWelcomeQueue.memberEmail, memberEmail));
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
