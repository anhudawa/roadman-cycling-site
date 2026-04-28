import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  tedActivityLog,
  tedDrafts,
  tedEdits,
  tedWelcomeQueue,
  tedSurfaced,
  tedKillSwitch,
} from "@/lib/db/schema";
import { gte } from "drizzle-orm";
import { verifyBearer } from "@/lib/security/bearer";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  return verifyBearer(authHeader, cronSecret);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [drafts, edits, welcomes, surfaces, killSwitch, activity] = await Promise.all([
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
    db
      .select({ payload: tedActivityLog.payload, level: tedActivityLog.level })
      .from(tedActivityLog)
      .where(gte(tedActivityLog.timestamp, weekAgo)),
  ]);

  let totalCost = 0;
  let voicePassCount = 0;
  let voiceCheckCount = 0;
  let errorCount = 0;
  for (const entry of activity) {
    if (entry.level === "error") errorCount += 1;
    const payload = entry.payload as Record<string, unknown> | null;
    if (!payload) continue;
    if (typeof payload.cost === "number") totalCost += payload.cost;
    if (typeof payload.voiceCheckPass === "boolean") {
      voiceCheckCount += 1;
      if (payload.voiceCheckPass) voicePassCount += 1;
    }
  }
  const voicePassRate =
    voiceCheckCount > 0 ? voicePassCount / voiceCheckCount : null;

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
    activity: {
      totalCost: Number(totalCost.toFixed(4)),
      voicePassRate: voicePassRate === null ? null : Number(voicePassRate.toFixed(2)),
      voiceCheckCount,
      errorCount,
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
  const drafts = summary.drafts as {
    posted: number;
    voiceFlagged: number;
    editRate: number;
    edited: number;
    total: number;
  };
  const welcomes = summary.welcomes as { posted: number; failed: number };
  const surfaces = summary.surfaces as {
    total: number;
    byType: { tag: number; link: number; summary: number };
  };
  const activity = summary.activity as {
    totalCost: number;
    voicePassRate: number | null;
    errorCount: number;
  };

  const lines = [
    "Ted — weekly digest",
    "",
    "Prompts",
    `  Posted:          ${drafts.posted} / ${drafts.total}`,
    `  Voice-flagged:   ${drafts.voiceFlagged}`,
    `  Edits by human:  ${drafts.edited}`,
    `  Edit rate:       ${Math.round(drafts.editRate * 100)}%`,
    "",
    "Welcomes",
    `  Posted:          ${welcomes.posted}`,
    `  Failed:          ${welcomes.failed}`,
    "",
    "Surfaces",
    `  Total:           ${surfaces.total} (tag ${surfaces.byType.tag} / link ${surfaces.byType.link} / summary ${surfaces.byType.summary})`,
    "",
    "Pipeline health",
    `  Voice-pass rate: ${activity.voicePassRate === null ? "—" : `${Math.round(activity.voicePassRate * 100)}%`}`,
    `  Errors (7d):     ${activity.errorCount}`,
    `  Token cost (7d): $${activity.totalCost.toFixed(2)}`,
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
