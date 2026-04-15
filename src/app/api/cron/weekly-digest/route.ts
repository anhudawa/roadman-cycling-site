import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamUsers } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import {
  buildWeeklyDigestData,
  renderWeeklyDigest,
  sendWeeklyDigestEmail,
} from "@/lib/crm/weekly-digest";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admins = await db
    .select()
    .from(teamUsers)
    .where(and(eq(teamUsers.active, true), eq(teamUsers.role, "admin")));

  const data = await buildWeeklyDigestData();
  const rendered = renderWeeklyDigest(data);

  const sent: Array<{ slug: string; resendId?: string }> = [];
  const errors: Array<{ slug: string; error: string }> = [];

  for (const admin of admins) {
    try {
      const result = await sendWeeklyDigestEmail(admin.email, rendered);
      if (result.status === "sent") {
        sent.push({ slug: admin.slug, resendId: result.resendId });
      } else {
        errors.push({ slug: admin.slug, error: result.errorMessage ?? "send failed" });
      }
    } catch (err) {
      errors.push({
        slug: admin.slug,
        error: err instanceof Error ? err.message : "unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    subject: rendered.subject,
    sent,
    errors,
  });
}
