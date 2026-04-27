import { NextRequest, NextResponse } from "next/server";
import {
  fetchRevenueForPeriod,
  fetchRecentTransactions,
} from "@/lib/integrations/stripe";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // Fail closed: a missing secret must NEVER be treated as "no auth required".
  // Otherwise rotating the secret out (or forgetting to set it on a new env)
  // exposes Stripe revenue data publicly.
  if (!cronSecret) return false;

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Default: last 30 days of revenue
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [revenue, recentTransactions] = await Promise.all([
    fetchRevenueForPeriod(thirtyDaysAgo, now),
    fetchRecentTransactions(20),
  ]);

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    revenue,
    recentTransactions,
  });
}
