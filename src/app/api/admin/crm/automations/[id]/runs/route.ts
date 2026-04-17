import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { listRuns } from "@/lib/crm/automations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const runs = await listRuns(id, 50);
  return NextResponse.json({
    runs: runs.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
