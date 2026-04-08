import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStatsForRange } from "@/lib/admin/events-store";
import { generateWeeklyReport } from "@/lib/agent/weekly-analysis";
import { COOKIE_NAME } from "@/lib/admin/auth";

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Check CRON_SECRET header first (for automated calls)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }

  // Fall back to admin session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  return !!sessionCookie;
}

export async function GET(req: NextRequest) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get last 7 days of data
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await getStatsForRange(sevenDaysAgo, now);

    const report = await generateWeeklyReport({
      pageStats: stats.pages,
      trafficStats: stats.traffic,
      leadStats: stats.leads,
      period: stats.period,
    });

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      periodStart: sevenDaysAgo.toISOString(),
      periodEnd: now.toISOString(),
      report,
    });
  } catch (err) {
    console.error("[WeeklyAnalysis API] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate weekly analysis" },
      { status: 500 }
    );
  }
}
