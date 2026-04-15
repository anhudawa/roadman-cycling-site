import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { listAllTags } from "@/lib/crm/tags";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tags = await listAllTags();
  return NextResponse.json({ tags });
}
