import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { ndyApplicationFollowups as followups } from "@/lib/db/schema";
import { deliverApplicationEmail, deliverSarahNotification } from "@/lib/ndy/application-workflow";
import { ndyApplicationFlowEnabled } from "@/lib/ndy/application-offer";

export const maxDuration = 60;
export async function POST(request: Request) {
  try { await requireAuth(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (!ndyApplicationFlowEnabled()) return NextResponse.json({ error: "Workflow is not active" }, { status: 503 });
  let body: { id?: unknown; target?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (!body || typeof body.id !== "string" || !/^[0-9a-f-]{36}$/.test(body.id) || (body.target !== "email" && body.target !== "sarah")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const rows = body.target === "email"
    ? await db.update(followups).set({ emailAttempts: 0, emailStatus: "pending" })
      .where(and(eq(followups.id, body.id), eq(followups.emailStatus, "failed"))).returning({ id: followups.id })
    : await db.update(followups).set({ sarahAttempts: 0, sarahStatus: "pending" })
      .where(and(eq(followups.id, body.id), eq(followups.sarahStatus, "failed"), gt(followups.questionReceivedAt, new Date(Date.now() - 23 * 3600_000)))).returning({ id: followups.id });
  if (rows.length === 0) return NextResponse.json({ error: "This delivery cannot be retried safely. Check Beehiiv or reply to the applicant directly." }, { status: 409 });
  if (body.target === "email") await deliverApplicationEmail(body.id);
  else await deliverSarahNotification(body.id);
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
