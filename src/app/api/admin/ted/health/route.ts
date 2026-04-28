import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tedActivityLog, tedKillSwitch, tedDrafts } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { verifyBearer } from "@/lib/security/bearer";

export const dynamic = "force-dynamic";

type Status = "ok" | "warn" | "error";

interface Check {
  name: string;
  status: Status;
  detail: string;
}

function isCronAuthed(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return verifyBearer(req.headers.get("authorization"), cronSecret);
}

// GET /api/admin/ted/health — JSON health summary.
// Accepts either an authenticated admin session OR a Bearer <CRON_SECRET> header
// so external monitors (UptimeRobot, Pingdom, Better Uptime) can hit it.
export async function GET(req: NextRequest) {
  const authedByCron = isCronAuthed(req);
  if (!authedByCron) {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const checks: Check[] = [];

  // DB connectivity
  try {
    await db.execute(sql`SELECT 1`);
    checks.push({ name: "database", status: "ok", detail: "SELECT 1 succeeded" });
  } catch (err) {
    checks.push({
      name: "database",
      status: "error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // Required env vars
  for (const name of ["ANTHROPIC_API_KEY", "POSTGRES_URL"] as const) {
    const present = typeof process.env[name] === "string" && process.env[name]!.length > 0;
    checks.push({
      name: `env:${name}`,
      status: present ? "ok" : "error",
      detail: present ? "set" : "missing",
    });
  }

  // Optional env vars
  for (const name of ["RESEND_API_KEY", "TED_ADMIN_ALERT_EMAIL"] as const) {
    const present = typeof process.env[name] === "string" && process.env[name]!.length > 0;
    checks.push({
      name: `env:${name}`,
      status: present ? "ok" : "warn",
      detail: present ? "set" : "missing (optional)",
    });
  }

  // Kill-switch state
  let paused = false;
  try {
    const ks = await db
      .select()
      .from(tedKillSwitch)
      .where(eq(tedKillSwitch.id, 1))
      .limit(1);
    if (ks[0]) {
      paused = ks[0].paused;
      checks.push({
        name: "kill-switch",
        status: paused ? "warn" : "ok",
        detail: paused
          ? `paused by ${ks[0].pausedBySlug ?? "unknown"} — ${ks[0].reason ?? "no reason"}`
          : "running",
      });
    } else {
      checks.push({
        name: "kill-switch",
        status: "warn",
        detail: "singleton row missing — migration not seeded",
      });
    }
  } catch (err) {
    checks.push({
      name: "kill-switch",
      status: "error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // Activity freshness — only alert if not paused (a paused Ted is legitimately quiet)
  try {
    const latest = await db
      .select({ timestamp: tedActivityLog.timestamp })
      .from(tedActivityLog)
      .orderBy(desc(tedActivityLog.timestamp))
      .limit(1);
    if (latest[0]) {
      const ageHours = (Date.now() - latest[0].timestamp.getTime()) / (60 * 60 * 1000);
      const status: Status = paused
        ? "ok"
        : ageHours < 12
          ? "ok"
          : ageHours < 36
            ? "warn"
            : "error";
      checks.push({
        name: "activity-freshness",
        status,
        detail: `last entry ${Math.round(ageHours)}h ago`,
      });
    } else {
      checks.push({
        name: "activity-freshness",
        status: "warn",
        detail: "no activity logged yet",
      });
    }
  } catch (err) {
    checks.push({
      name: "activity-freshness",
      status: "error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  // Drafts backlog
  try {
    const backlog = await db
      .select({ count: sql<number>`count(*)` })
      .from(tedDrafts)
      .where(eq(tedDrafts.status, "voice_flagged"));
    const flagged = Number(backlog[0]?.count ?? 0);
    checks.push({
      name: "voice-flagged-backlog",
      status: flagged === 0 ? "ok" : flagged < 5 ? "warn" : "error",
      detail: `${flagged} flagged drafts awaiting human review`,
    });
  } catch (err) {
    checks.push({
      name: "voice-flagged-backlog",
      status: "error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  const overall: Status = checks.some((c) => c.status === "error")
    ? "error"
    : checks.some((c) => c.status === "warn")
      ? "warn"
      : "ok";

  return NextResponse.json(
    {
      status: overall,
      checkedAt: new Date().toISOString(),
      checks,
    },
    {
      status: overall === "error" ? 503 : 200,
    }
  );
}
