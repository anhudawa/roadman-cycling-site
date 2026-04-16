import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedActivityLog, tedKillSwitch } from "@/lib/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Stale threshold — if no activity (any job, any level) in this many hours,
// something is broken: GH Actions disabled, secrets rotated, DB unreachable
// from the runner, etc.
const STALE_HOURS = 36;

// De-dupe window — once we send an alert, suppress further alerts for this
// many hours even if Ted is still stale. Prevents email floods.
const DEDUPE_HOURS = 24;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Skip heartbeat entirely if Ted is deliberately paused — that state is
  // already explicit, emailing about it every 6h is noise.
  const ks = await db
    .select({ paused: tedKillSwitch.paused })
    .from(tedKillSwitch)
    .where(eq(tedKillSwitch.id, 1))
    .limit(1);
  if (ks[0]?.paused) {
    return NextResponse.json({ ok: true, skipped: "paused" });
  }

  const latest = await db
    .select({ timestamp: tedActivityLog.timestamp })
    .from(tedActivityLog)
    .orderBy(desc(tedActivityLog.timestamp))
    .limit(1);

  const now = Date.now();
  const latestAgeHours = latest[0]
    ? (now - latest[0].timestamp.getTime()) / (60 * 60 * 1000)
    : Number.POSITIVE_INFINITY;

  if (latestAgeHours < STALE_HOURS) {
    return NextResponse.json({
      ok: true,
      skipped: "fresh",
      latestAgeHours: Number(latestAgeHours.toFixed(1)),
    });
  }

  // Check for a recent de-dupe marker
  const dedupeWindow = new Date(now - DEDUPE_HOURS * 60 * 60 * 1000);
  const recentAlert = await db
    .select({ id: tedActivityLog.id })
    .from(tedActivityLog)
    .where(
      and(
        eq(tedActivityLog.job, "heartbeat"),
        eq(tedActivityLog.action, "alert-sent"),
        gte(tedActivityLog.timestamp, dedupeWindow)
      )
    )
    .limit(1);

  if (recentAlert[0]) {
    return NextResponse.json({
      ok: true,
      skipped: "already-alerted",
      latestAgeHours: Number(latestAgeHours.toFixed(1)),
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TED_ADMIN_ALERT_EMAIL;
  const from = process.env.TED_ALERT_FROM ?? "ted@roadmancycling.com";

  const staleLabel = latest[0]
    ? `${Math.round(latestAgeHours)}h (since ${latest[0].timestamp.toISOString()})`
    : "never";

  const body = [
    "Ted heartbeat alert — no activity detected.",
    "",
    `Last activity: ${staleLabel}`,
    `Stale threshold: ${STALE_HOURS}h`,
    "",
    "Most likely causes:",
    "- GitHub Actions workflow failing or disabled",
    "- Rotated ANTHROPIC_API_KEY / POSTGRES_URL / Skool credentials",
    "- Vercel Postgres unreachable from the Actions runner",
    "",
    "Next steps: check /admin/ted and /admin/ted/log, then the latest runs in the Actions tab.",
  ].join("\n");

  if (apiKey && to) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from,
          to,
          subject: "[ted-error] heartbeat — no activity",
          text: body,
        }),
      });
    } catch (err) {
      console.error("[ted-heartbeat] Resend failed:", err);
    }
  }

  // Always record the attempted alert so the de-dupe window works even if
  // Resend was down.
  await db.insert(tedActivityLog).values({
    job: "heartbeat",
    action: "alert-sent",
    level: "error",
    payload: {
      latestAgeHours: Number(latestAgeHours.toFixed(1)),
      resendConfigured: !!(apiKey && to),
    },
  });

  return NextResponse.json({
    ok: true,
    alerted: true,
    latestAgeHours: Number(latestAgeHours.toFixed(1)),
  });
}
