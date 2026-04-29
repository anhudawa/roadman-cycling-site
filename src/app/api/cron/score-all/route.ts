import { NextRequest, NextResponse } from "next/server";
import { scoreAllContacts } from "@/lib/crm/scoring";
import { startCronRun, finishCronRun } from "@/lib/crm/cron-runs";
import { verifyBearer } from "@/lib/security/bearer";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false; // fail-closed: missing secret is a misconfig, not a bypass
  const authHeader = req.headers.get("authorization");
  return verifyBearer(authHeader, cronSecret);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: runId } = await startCronRun("score_all");
  try {
    const result = await scoreAllContacts();
    await finishCronRun(runId, result.errors.length === 0 ? "success" : "error", {
      result: {
        scored: (result as unknown as { scored?: number }).scored ?? null,
        errorCount: result.errors.length,
      },
      error: result.errors.length ? result.errors.join("; ") : null,
    });
    return NextResponse.json({ ok: result.errors.length === 0, ...result });
  } catch (err) {
    await finishCronRun(runId, "error", {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
