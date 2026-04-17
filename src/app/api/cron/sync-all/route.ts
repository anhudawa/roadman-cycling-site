import { NextRequest, NextResponse } from "next/server";
import {
  syncBeehiivSubscribers,
  syncStripeCustomers,
} from "@/lib/crm/sync";
import { startCronRun, finishCronRun } from "@/lib/crm/cron-runs";

export const runtime = "nodejs";
export const maxDuration = 600;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false; // fail-closed: missing secret is a misconfig, not a bypass
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: runId } = await startCronRun("sync_all");

  const out: {
    beehiiv?: unknown;
    stripe?: unknown;
    errors: string[];
  } = { errors: [] };

  try {
    const b = await syncBeehiivSubscribers();
    out.beehiiv = b.result;
  } catch (err) {
    out.errors.push(`beehiiv: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    const s = await syncStripeCustomers();
    out.stripe = s.result;
  } catch (err) {
    out.errors.push(`stripe: ${err instanceof Error ? err.message : String(err)}`);
  }

  await finishCronRun(runId, out.errors.length === 0 ? "success" : "error", {
    result: {
      beehiiv: out.beehiiv ?? null,
      stripe: out.stripe ?? null,
      errorCount: out.errors.length,
    },
    error: out.errors.length ? out.errors.join("; ") : null,
  });

  return NextResponse.json({ ok: out.errors.length === 0, ...out });
}
