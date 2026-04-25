import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedActivityLog } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/ted/log/export $€” stream the last N log entries as JSONL.
// Query: ?limit=N  (default 1000, max 5000)
export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "1000"), 5000);

  const rows = await db
    .select()
    .from(tedActivityLog)
    .orderBy(desc(tedActivityLog.timestamp))
    .limit(limit);

  const body = rows
    .map((r) =>
      JSON.stringify({
        id: r.id,
        timestamp: r.timestamp.toISOString(),
        job: r.job,
        action: r.action,
        level: r.level,
        payload: r.payload,
        error: r.error,
      })
    )
    .join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Content-Disposition": `attachment; filename="ted-log-${date}.jsonl"`,
      "Cache-Control": "no-store",
    },
  });
}
