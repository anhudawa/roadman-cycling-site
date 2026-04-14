import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { markAllRead } from "@/lib/crm/notifications";

export async function POST() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await markAllRead(user.slug);
  return NextResponse.json({ ok: true, count });
}
