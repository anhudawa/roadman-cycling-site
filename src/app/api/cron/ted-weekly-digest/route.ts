import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  tedDrafts,
  tedEdits,
  tedWelcomeQueue,
  tedSurfaced,
  tedKillSwitch,
} from "@/lib/db/schema";
import { gte } from "drizzle-orm";

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

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [drafts, edits, welcomes, surfaces, killSwitch] = await Promise.all([
    db
      .select({ status: tedDrafts.status, id: tedDrafts.id })
      .from(tedDrafts)
      .where(gte(tedDrafts.createdAt, weekAgo)),
    db
      .select({ draftId: tedEdits.draftId, charsChanged: tedEdits.charsChanged })
      .from(tedEdits)
      .where(gte(tedEdits.createdAt, weekAgo)),
    db
      .select({ status: tedWelcomeQueue.status })
      .from(tedWelcomeQueue)
      .where(gte(tedWelcomeQueue.createdAt, weekAgo)),
    db
      .select({ id: tedSurfaced.id, surfaceType: tedSurfaced.surfaceType })
      .from(tedSurfaced)
      .where(gte(tedSurfaced.surfacedAt, weekAgo)),
    db.select().from(tedKillSwitch).limit(1),
  ]);

  const postedDrafts = drafts.filter((d) => d.status === "posted").length;
  const flaggedDrafts = drafts.filter((d) => d.status === "voice_flagged").length;
  const failedDrafts = drafts.filter((d) => d.status === "failed").length;
  const editedDraftIds = new Set(edits.map((e) => e.draftId));
  const editRate = drafts.length > 0 ? editedDraftIds.size / drafts.length : 0;

  const welcomesPosted = welcomes.filter((w) => w.status === "posted").length;
  const welcomesFailed = welcomes.filter((w) => w.status === "failed").length;

  const summary = {
    windowStart: weekAgo.toISOString(),
    drafts: {
      total: drafts.length,
      posted: postedDrafts,
      voiceFlagged: flaggedDrafts,
      failed: failedDrafts,
      edited: editedDraftIds.size,
      editRate: Number(editRate.toFixed(2)),
    },
    welcomes: {
      total: welcomes.length,
      posted: welcomesPosted,
      failed: welcomesFailed,
    },
    surfaces: {
      total: surfaces.length,
      byType: {
        tag: surfaces.filter((s) => s.surfaceType === "tag").length,
        link: surfaces.filter((s) => s.surfaceType === "link").length,
        summary: surfaces.filter((s) => s.surfaceType === "summary").length,
      },
    },
    killSwitch: killSwitch[0] ?? null,
  };

  await sendDigestEmail(summary);

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), summary });
}

async function sendDigestEmail(summary: Record<string, unknown>): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TED_ADMIN_ALERT_EMAIL;
  const from = process.env.TED_ALERT_FROM ?? "ted@roadmancycling.com";
  if (!apiKey || !to) return;

  const body = JSON.stringify(summary, null, 2);
  const lines = [
    "Ted — weekly digest",
    "",
    `Posted prompts:     ${(summary.drafts as { posted: number }).posted}`,
    `Voice-flagged:      ${(summary.drafts as { voiceFlagged: number }).voiceFlagged}`,
    `Edit rate:          ${(summary.drafts as { editRate: number }).editRate}`,
    `Welcomes posted:    ${(summary.welcomes as { posted: number }).posted}`,
    `Threads surfaced:   ${(summary.surfaces as { total: number }).total}`,
    "",
    "Raw:",
    body,
  ];

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Ted weekly digest — ${new Date().toISOString().slice(0, 10)}`,
      text: lines.join("\n"),
    }),
  });
}
