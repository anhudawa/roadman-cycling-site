import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { desc, isNull, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

// GET /api/admin/inbox — list submissions + unread count
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
      .select({ id: contactSubmissions.id })
      .from(contactSubmissions)
      .where(isNull(contactSubmissions.readAt));
    return NextResponse.json({ unread: unread.length });
  }

  const submissions = await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(50);

  return NextResponse.json({ submissions });
}

// PATCH /api/admin/inbox — mark as read
export async function PATCH(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db
    .update(contactSubmissions)
    .set({ readAt: new Date() })
    .where(eq(contactSubmissions.id, id));

  return NextResponse.json({ success: true });
}
