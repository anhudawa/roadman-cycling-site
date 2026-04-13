import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cohortApplications } from "@/lib/db/schema";
import { desc, isNull, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

// GET /api/admin/applications — list applications + unread count
export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get("count") === "1";

  if (countOnly) {
    const unread = await db
      .select({ id: cohortApplications.id })
      .from(cohortApplications)
      .where(isNull(cohortApplications.readAt));
    return NextResponse.json({ unread: unread.length });
  }

  const applications = await db
    .select()
    .from(cohortApplications)
    .orderBy(desc(cohortApplications.createdAt))
    .limit(100);

  return NextResponse.json({ applications });
}

// PATCH /api/admin/applications — mark as read and/or update status
export async function PATCH(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (status) {
    const validStatuses = ["awaiting_response", "responded", "follow_up", "signed_up"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = status;
  }

  // Always mark as read when patching
  updates.readAt = new Date();

  await db
    .update(cohortApplications)
    .set(updates)
    .where(eq(cohortApplications.id, id));

  return NextResponse.json({ success: true });
}
