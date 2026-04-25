import { desc } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { diagnosticSubmissions } from "@/lib/db/schema";

/**
 * Admin-only CSV export of every diagnostic submission. Useful for
 * offline review, ad-attribution joins, and one-off analyses without
 * needing direct DB access.
 *
 * RFC 4180 quoting (double-quote everything, escape internal " by
 * doubling). Response streams as text/csv with a content-disposition
 * filename so browsers download rather than render.
 */

const COLUMNS = [
  "slug",
  "created_at",
  "email",
  "primary_profile",
  "secondary_profile",
  "retake_number",
  "generation_source",
  "severe_multi_system",
  "close_to_breakthrough",
  "score_under_recovered",
  "score_polarisation",
  "score_strength_gap",
  "score_fueling_deficit",
  "age",
  "hours_per_week",
  "ftp",
  "goal",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // RFC 4180 $€” wrap in double quotes, double any internal quotes.
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  await requireAuth();

  const rows = await db
    .select()
    .from(diagnosticSubmissions)
    .orderBy(desc(diagnosticSubmissions.createdAt));

  const lines: string[] = [COLUMNS.join(",")];
  for (const r of rows) {
    const scores = (r.scores ?? {}) as Record<string, number>;
    lines.push(
      [
        r.slug,
        r.createdAt.toISOString(),
        r.email,
        r.primaryProfile,
        r.secondaryProfile ?? "",
        r.retakeNumber,
        r.generationSource,
        r.severeMultiSystem,
        r.closeToBreakthrough,
        scores.underRecovered ?? 0,
        scores.polarisation ?? 0,
        scores.strengthGap ?? 0,
        scores.fuelingDeficit ?? 0,
        r.age,
        r.hoursPerWeek,
        r.ftp ?? "",
        r.goal ?? "",
        r.utmSource ?? "",
        r.utmMedium ?? "",
        r.utmCampaign ?? "",
        r.utmContent ?? "",
        r.utmTerm ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  const filename = `diagnostic-submissions-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
