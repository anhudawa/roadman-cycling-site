import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { and, eq, lt, sql } from "drizzle-orm";
import { startCronRun, finishCronRun } from "@/lib/crm/cron-runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false; // fail-closed
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Mark bookings whose scheduled end time has passed as "completed".
 *
 * Without this, past scheduled calls sit in "scheduled" forever $€” the
 * dashboard shows them as future work, nobody gets a "did it happen?" nudge,
 * and conversion metrics can't compute a real completion rate.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: runId } = await startCronRun("complete_past_bookings");
  try {
    // scheduled_at + duration * 1min < now()  AND  status = 'scheduled'
    const updated = await db
      .update(bookings)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(bookings.status, "scheduled"),
          lt(
            sql`${bookings.scheduledAt} + (${bookings.durationMinutes} || ' minutes')::interval`,
            sql`now()`
          )
        )
      )
      .returning({ id: bookings.id });

    await finishCronRun(runId, "success", {
      result: { completed: updated.length },
      error: null,
    });

    return NextResponse.json({
      ok: true,
      completed: updated.length,
      ids: updated.map((r) => r.id),
    });
  } catch (err) {
    await finishCronRun(runId, "error", {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
