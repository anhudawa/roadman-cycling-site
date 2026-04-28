import { NextResponse, type NextRequest } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";
import { getResendClient } from "@/lib/integrations/resend";
import { absoluteUrl } from "@/lib/site";
import { PROFILE_LABELS } from "@/lib/diagnostic/profiles";
import { escapeHtml } from "@/lib/validation";
import { verifyBearer } from "@/lib/security/bearer";
import type { Profile } from "@/lib/diagnostic/types";

/**
 * Daily digest of plateau-diagnostic activity. Sent to Anthony at
 * 8am UTC. Built deliberately small + isolated so it doesn't share
 * code with the heavier per-user `daily-digest` cron — different
 * audience, different cadence concerns.
 *
 * Skips silently when there's nothing to report (no inbox spam on
 * quiet days). CRON_SECRET-gated like the rest of the cron fleet.
 */

export const dynamic = "force-dynamic";

const NOTIFICATION_EMAIL = "anthony@roadmancycling.com";
const FROM = "Roadman Cycling <noreply@roadmancycling.com>";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  return verifyBearer(authHeader, cronSecret);
}

interface DigestPayload {
  total24h: number;
  total7d: number;
  llmCount: number;
  fallbackCount: number;
  multiSystemCount: number;
  byProfile: Record<Profile, number>;
  topUtm: Array<{ source: string; cnt: number }>;
  recent: Array<{
    slug: string;
    profile: Profile;
    source: string;
    createdAt: Date;
  }>;
}

async function buildPayload(): Promise<DigestPayload> {
  const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // One query that pulls every counter we need for the digest body.
  // Cheaper than four COUNT statements at this volume.
  const [counts] = await db
    .select({
      total24h: sql<number>`count(*) filter (where ${diagnosticSubmissions.createdAt} >= ${since24})`,
      total7d: sql<number>`count(*) filter (where ${diagnosticSubmissions.createdAt} >= ${since7})`,
      llm: sql<number>`count(*) filter (where ${diagnosticSubmissions.createdAt} >= ${since24} and ${diagnosticSubmissions.generationSource} = 'llm')`,
      fallback: sql<number>`count(*) filter (where ${diagnosticSubmissions.createdAt} >= ${since24} and ${diagnosticSubmissions.generationSource} = 'fallback')`,
      multi: sql<number>`count(*) filter (where ${diagnosticSubmissions.createdAt} >= ${since24} and ${diagnosticSubmissions.severeMultiSystem} = true)`,
    })
    .from(diagnosticSubmissions);

  const profileRows = await db
    .select({
      profile: diagnosticSubmissions.primaryProfile,
      cnt: sql<number>`count(*)`,
    })
    .from(diagnosticSubmissions)
    .where(sql`${diagnosticSubmissions.createdAt} >= ${since24}`)
    .groupBy(diagnosticSubmissions.primaryProfile);

  const byProfile: Record<Profile, number> = {
    underRecovered: 0,
    polarisation: 0,
    strengthGap: 0,
    fuelingDeficit: 0,
  };
  for (const r of profileRows) {
    const p = r.profile as Profile;
    if (p in byProfile) byProfile[p] = Number(r.cnt);
  }

  const utmRows = await db
    .select({
      source: sql<string>`coalesce(${diagnosticSubmissions.utmSource}, 'direct')`,
      cnt: sql<number>`count(*)`,
    })
    .from(diagnosticSubmissions)
    .where(sql`${diagnosticSubmissions.createdAt} >= ${since24}`)
    .groupBy(sql`coalesce(${diagnosticSubmissions.utmSource}, 'direct')`)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const recentRows = await db
    .select({
      slug: diagnosticSubmissions.slug,
      profile: diagnosticSubmissions.primaryProfile,
      source: diagnosticSubmissions.generationSource,
      createdAt: diagnosticSubmissions.createdAt,
    })
    .from(diagnosticSubmissions)
    .where(sql`${diagnosticSubmissions.createdAt} >= ${since24}`)
    .orderBy(desc(diagnosticSubmissions.createdAt))
    .limit(10);

  return {
    total24h: Number(counts?.total24h ?? 0),
    total7d: Number(counts?.total7d ?? 0),
    llmCount: Number(counts?.llm ?? 0),
    fallbackCount: Number(counts?.fallback ?? 0),
    multiSystemCount: Number(counts?.multi ?? 0),
    byProfile,
    topUtm: utmRows.map((r) => ({ source: r.source, cnt: Number(r.cnt) })),
    recent: recentRows.map((r) => ({
      slug: r.slug,
      profile: r.profile as Profile,
      source: r.source,
      createdAt: r.createdAt,
    })),
  };
}

function renderDigestHtml(p: DigestPayload): string {
  const llmRate =
    p.total24h > 0 ? Math.round((p.llmCount / p.total24h) * 100) : 0;

  const profileRows = (Object.entries(p.byProfile) as Array<[Profile, number]>)
    .sort(([, a], [, b]) => b - a)
    .map(
      ([profile, count]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeHtml(PROFILE_LABELS[profile])}</td><td style="padding:4px 0;color:#1a1a1a;font-weight:600">${count}</td></tr>`
    )
    .join("");

  const utmRows = p.topUtm
    .map(
      (r) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeHtml(r.source)}</td><td style="padding:4px 0;color:#1a1a1a;font-weight:600">${r.cnt}</td></tr>`
    )
    .join("");

  const recentRows = p.recent
    .map(
      (r) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;font-size:12px">${escapeHtml(r.createdAt.toISOString().slice(11, 16))}</td><td style="padding:4px 12px 4px 0;color:#1a1a1a">${escapeHtml(PROFILE_LABELS[r.profile])}</td><td style="padding:4px 0;font-size:12px"><a href="${escapeHtml(absoluteUrl(`/admin/diagnostic/${r.slug}`))}" style="color:#F16363">QA →</a></td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;background:#f6f6f4">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:24px;border-radius:8px">
    <p style="font-size:12px;letter-spacing:2px;color:#F16363;margin:0 0 8px;text-transform:uppercase;font-weight:600">Plateau Diagnostic · Last 24h</p>
    <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px">${p.total24h} new diagnoses</h1>
    <p style="margin:0 0 20px;color:#555">
      ${p.total7d} over the past 7 days · LLM rate ${llmRate}% (${p.llmCount} LLM / ${p.fallbackCount} fallback)
      ${p.multiSystemCount > 0 ? ` · <strong style="color:#F16363">${p.multiSystemCount} multi-system</strong>` : ""}
    </p>

    <h2 style="font-size:14px;letter-spacing:1px;text-transform:uppercase;color:#666;margin:24px 0 8px">By profile</h2>
    <table style="border-collapse:collapse;width:100%;font-size:14px">${profileRows}</table>

    ${utmRows ? `<h2 style="font-size:14px;letter-spacing:1px;text-transform:uppercase;color:#666;margin:24px 0 8px">Top sources</h2><table style="border-collapse:collapse;width:100%;font-size:14px">${utmRows}</table>` : ""}

    ${recentRows ? `<h2 style="font-size:14px;letter-spacing:1px;text-transform:uppercase;color:#666;margin:24px 0 8px">Recent</h2><table style="border-collapse:collapse;width:100%;font-size:14px">${recentRows}</table>` : ""}

    <p style="margin:32px 0 0;font-size:12px;color:#888">
      <a href="${escapeHtml(absoluteUrl("/admin/diagnostic"))}" style="color:#888">Open admin →</a>
      &middot;
      <a href="${escapeHtml(absoluteUrl("/api/admin/diagnostic/export"))}" style="color:#888">CSV export</a>
    </p>
  </div>
</body></html>`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await buildPayload();

  // Quiet days get no email — Anthony's inbox stays clean.
  if (payload.total24h === 0) {
    return NextResponse.json({ skipped: "no_submissions_24h" });
  }

  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 500 }
    );
  }

  const subject = `Plateau Diagnostic · ${payload.total24h} new in the last 24h`;
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: NOTIFICATION_EMAIL,
      subject,
      html: renderDigestHtml(payload),
    });
    return NextResponse.json({ sent: true, messageId: result.data?.id });
  } catch (err) {
    console.error("[diagnostic-digest] send failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
