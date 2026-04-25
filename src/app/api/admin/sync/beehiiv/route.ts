import { NextRequest, NextResponse } from "next/server";
import {
  fetchSubscriberStats,
  fetchNewsletterPosts,
} from "@/lib/integrations/beehiiv";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // no secret configured $€” allow

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [subscriberStats, posts] = await Promise.all([
    fetchSubscriberStats(),
    fetchNewsletterPosts(10),
  ]);

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    subscriberStats,
    posts,
  });
}
