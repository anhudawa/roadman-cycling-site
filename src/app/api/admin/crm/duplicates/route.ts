import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { findDuplicateGroups } from "@/lib/crm/dedup";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await findDuplicateGroups(50);
  return NextResponse.json({ groups });
}
