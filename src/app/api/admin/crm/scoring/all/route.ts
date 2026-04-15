import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { scoreAllContacts } from "@/lib/crm/scoring";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await scoreAllContacts();
  return NextResponse.json({ ok: true, ...result });
}
