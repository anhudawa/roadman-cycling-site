import { NextRequest, NextResponse } from "next/server";
import {
  fetchRevenueForPeriod,
  fetchRecentTransactions,
} from "@/lib/integrations/stripe";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // no secret configured $— allow

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
