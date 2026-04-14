import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin/auth";
import { listRecentRuns } from "@/lib/crm/sync";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runs = await listRecentRuns(20);
  return NextResponse.json({
    runs: runs.map((r) => ({
      id: r.id,
      source: r.source,
      status: r.status,
      result: r.result,
      error: r.error,
      startedAt: r.startedAt.toISOString(),
      finishedAt: r.finishedAt ? r.finishedAt.toISOString() : null,
    })),
  });
}
