import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedActivityLog } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/ted/log?job=&limit=&level=
export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const job = searchParams.get("job");
  const level = searchParams.get("level");
  const limit = Math.min(Number(searchParams.get("limit") ?? "100"), 500);

  const baseQuery = db.select().from(tedActivityLog);
  const rows = job
    ? await baseQuery.where(eq(tedActivityLog.job, job)).orderBy(desc(tedActivityLog.timestamp)).limit(limit)
    : level
      ? await baseQuery.where(eq(tedActivityLog.level, level)).orderBy(desc(tedActivityLog.timestamp)).limit(limit)
      : await baseQuery.orderBy(desc(tedActivityLog.timestamp)).limit(limit);

  return NextResponse.json({ entries: rows });
}
