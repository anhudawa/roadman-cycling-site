import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { addActivity, getContactById, type ActivityType } from "@/lib/crm/contacts";

const ALLOWED: ActivityType[] = [
  "note",
  "email_sent",
  "call_logged",
];

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
  const type = (body.type ?? "note") as ActivityType;
  if (!ALLOWED.includes(type)) {
    return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const author = request.headers.get("X-CRM-User") ?? "admin";
  const activity = await addActivity(id, {
    type,
    title,
    body: typeof body.body === "string" ? body.body : null,
    meta: body.meta ?? null,
    authorName: author,
  });

  return NextResponse.json({
    activity: {
      ...activity,
      meta: activity.meta ?? null,
      createdAt: activity.createdAt.toISOString(),
    },
  });
}
