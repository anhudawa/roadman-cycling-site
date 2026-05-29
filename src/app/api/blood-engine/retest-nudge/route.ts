import { NextResponse } from "next/server";
import { findDueRetestReports, getUserById, markRetestNudgeSent } from "@/lib/blood-engine/db";
import { sendRetestNudge } from "@/lib/blood-engine/email";
import type { InterpretationJSON } from "@/lib/blood-engine/schemas";

/**
 * Daily cron endpoint (called from Vercel Cron).
 * Finds reports where retestDueAt has passed and retestNudgeSentAt is null,
 * sends one nudge email per report, and stamps retestNudgeSentAt.
 *
 * Gated by a Bearer token matching BLOOD_ENGINE_CRON_SECRET so the endpoint
 * can't be brute-forced over the internet.
 */

export const maxDuration = 60;

export async function GET(request: Request) {
  // Accept either BLOOD_ENGINE_CRON_SECRET (dedicated) or CRON_SECRET (the
  // env var Vercel Cron automatically forwards as `Authorization: Bearer …`).
  const expectedCandidates = [
    process.env.BLOOD_ENGINE_CRON_SECRET,
    process.env.CRON_SECRET,
  ].filter((s): s is string => !!s);
  if (expectedCandidates.length === 0) {
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization");
  const ok = expectedCandidates.some((s) => auth === `Bearer ${s}`);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await findDueRetestReports(now);

  let sent = 0;
  let skipped = 0;

  for (const report of due) {
    const user = await getUserById(report.userId);
    if (!user?.email || !user.hasAccess) {
      skipped++;
      continue;
    }
    const interpretation = report.interpretation as InterpretationJSON | null;
    const focusMarkers = interpretation?.retest_recommendation?.focus_markers ?? [];
    const ok = await sendRetestNudge(user.email, report.id, focusMarkers);
    if (ok) {
      await markRetestNudgeSent(report.id);
      sent++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({ checked: due.length, sent, skipped });
}
