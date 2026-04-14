import { NextRequest, NextResponse } from "next/server";
import {
  syncBeehiivSubscribers,
  syncStripeCustomers,
} from "@/lib/crm/sync";

export const runtime = "nodejs";
export const maxDuration = 600;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  return NextResponse.json({ ok: out.errors.length === 0, ...out });
}
