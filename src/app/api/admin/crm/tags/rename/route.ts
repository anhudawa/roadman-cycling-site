import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { renameTag } from "@/lib/crm/tags";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { old?: unknown; new?: unknown };
  const oldName = typeof body.old === "string" ? body.old : "";
  const newName = typeof body.new === "string" ? body.new : "";
  if (!oldName || !newName) {
    return NextResponse.json({ error: "old and new required" }, { status: 400 });
  }
  const touched = await renameTag(oldName, newName);
  return NextResponse.json({ ok: true, touched });
}
