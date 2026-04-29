import { NextRequest, NextResponse } from "next/server";
import {
  fetchSubscriberStats,
  fetchNewsletterPosts,
} from "@/lib/integrations/beehiiv";
import { verifyBearer } from "@/lib/security/bearer";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // Fail closed: a missing secret must NEVER be treated as "no auth required".
  // Beehiiv subscriber data + posts are not for public consumption.
  if (!cronSecret) return false;

  const authHeader = req.headers.get("authorization");
  return verifyBearer(authHeader, cronSecret);
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
