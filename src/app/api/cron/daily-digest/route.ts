import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamUsers } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import type { TeamUser, TeamUserRole } from "@/lib/admin/auth";
import { getMyDayData } from "@/lib/crm/dashboard";
import { hasActionable, renderDailyDigest, sendDigestEmail } from "@/lib/crm/digest";
import { startCronRun, finishCronRun } from "@/lib/crm/cron-runs";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

function toTeamUser(row: typeof teamUsers.$inferSelect): TeamUser {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    email: row.email,
    role: (row.role === "admin" ? "admin" : "member") as TeamUserRole,
  };
}

interface SentEntry {
  slug: string;
  status: "sent" | "failed";
  resendId?: string;
}
interface SkippedEntry {
  slug: string;
  reason: string;
}
interface ErrorEntry {
  slug: string;
  error: string;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const slugParam = url.searchParams.get("slug");

  const whereClause = slugParam
    ? and(eq(teamUsers.active, true), eq(teamUsers.slug, slugParam))
    : eq(teamUsers.active, true);

  const { id: runId } = await startCronRun("daily_digest");

  const rows = await db.select().from(teamUsers).where(whereClause);

  const sent: SentEntry[] = [];
  const skipped: SkippedEntry[] = [];
  const errors: ErrorEntry[] = [];

  try {
  for (const row of rows) {
    const user = toTeamUser(row);
    try {
      const data = await getMyDayData(user);
      if (!hasActionable(data)) {
        skipped.push({ slug: user.slug, reason: "nothing actionable" });
        continue;
      }
      const rendered = renderDailyDigest(user, data);
      const result = await sendDigestEmail(user, rendered);
      if (result.status === "sent") {
        sent.push({ slug: user.slug, status: "sent", resendId: result.resendId });
      } else {
        errors.push({ slug: user.slug, error: result.errorMessage ?? "send failed" });
      }
    } catch (err) {
      errors.push({
        slug: user.slug,
        error: err instanceof Error ? err.message : "unknown error",
      });
    }
  }

  await finishCronRun(runId, errors.length === 0 ? "success" : "error", {
    result: {
      sent: sent.length,
      skipped: skipped.length,
      errors: errors.length,
      sentSlugs: sent.map((s) => s.slug),
      skippedSlugs: skipped.map((s) => s.slug),
    },
    error: errors.length ? errors.map((e) => `${e.slug}: ${e.error}`).join("; ") : null,
  });

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    sent,
    skipped,
    errors,
  });
  } catch (err) {
    await finishCronRun(runId, "error", {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
