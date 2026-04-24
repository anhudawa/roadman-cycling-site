import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { toolResults, paidReports, orders } from "@/lib/db/schema";
import { loadById, updateLeadScore } from "@/lib/rider-profile/store";
import type { RiderProfile } from "@/lib/rider-profile/types";

/**
 * Lead-score heuristics — zero-sum buckets summed to a single integer
 * so admin can sort by a single column. Score is a signal, not a
 * decision: admin dashboards show the breakdown so we can tune
 * weights as the funnel matures.
 *
 * Contributors (mirrors the rider's commercial intent):
 *
 *   +25 has_paid_report            — bought any report
 *   +15 per additional paid report (capped +30)
 *   +15 completed_multiple_tools   — 2+ distinct tools saved
 *   +10 fuelling_completed
 *   +10 ftp_zones_completed
 *   +10 plateau_completed
 *   +15 plateau_severe_multi_system (if the plateau primary_result hints at overreach)
 *   +15 coaching_interest_high     — coaching_interest_level >= 4
 *   +20 coaching_status_unsure     — actively evaluating coaching
 *   +10 target_event_within_90d    — event soon means urgency
 *   +10 marketing_consent          — opted in to email nurture
 *
 * Cap at 100 so the admin sort is stable and a runaway summation
 * doesn't dominate the leaderboard.
 */

export interface LeadScoreBreakdown {
  score: number;
  factors: Array<{ key: string; label: string; points: number }>;
}

const CAP = 100;

export async function scoreRider(
  riderProfileId: number,
): Promise<LeadScoreBreakdown> {
  const profile = await loadById(riderProfileId);
  if (!profile) return { score: 0, factors: [] };

  const factors: LeadScoreBreakdown["factors"] = [];

  const toolRows = await db
    .select({
      toolSlug: toolResults.toolSlug,
      primaryResult: toolResults.primaryResult,
    })
    .from(toolResults)
    .where(eq(toolResults.riderProfileId, riderProfileId))
    .orderBy(desc(toolResults.createdAt));

  const distinctTools = new Set(toolRows.map((r) => r.toolSlug));
  if (toolRows.some((r) => r.toolSlug === "plateau"))
    factors.push({ key: "plateau_completed", label: "Plateau Diagnostic", points: 10 });
  if (toolRows.some((r) => r.toolSlug === "fuelling"))
    factors.push({ key: "fuelling_completed", label: "Fuelling Calculator", points: 10 });
  if (toolRows.some((r) => r.toolSlug === "ftp_zones"))
    factors.push({ key: "ftp_zones_completed", label: "FTP Zone Calculator", points: 10 });
  if (distinctTools.size >= 2)
    factors.push({ key: "completed_multiple_tools", label: "2+ tools", points: 15 });

  if (
    toolRows.some(
      (r) =>
        r.toolSlug === "plateau" &&
        r.primaryResult === "underRecovered",
    )
  )
    factors.push({
      key: "plateau_severe_multi_system",
      label: "Plateau: under-recovered / multi-system",
      points: 15,
    });

  const paidRows = await db
    .select({ productSlug: paidReports.productSlug })
    .from(paidReports)
    .innerJoin(orders, eq(paidReports.orderId, orders.id))
    .where(eq(orders.riderProfileId, riderProfileId));

  if (paidRows.length > 0)
    factors.push({ key: "has_paid_report", label: "Bought a report", points: 25 });
  if (paidRows.length > 1)
    factors.push({
      key: "additional_paid_reports",
      label: `${paidRows.length - 1} additional report(s)`,
      points: Math.min(30, 15 * (paidRows.length - 1)),
    });

  if ((profile.coachingInterestLevel ?? 0) >= 4)
    factors.push({ key: "coaching_interest_high", label: "Coaching interest ≥ 4", points: 15 });
  if (profile.coachingStatus === "unsure")
    factors.push({
      key: "coaching_status_unsure",
      label: "Evaluating coaching",
      points: 20,
    });

  if (isTargetEventWithin90d(profile))
    factors.push({
      key: "target_event_within_90d",
      label: "Target event within 90d",
      points: 10,
    });

  if (profile.marketingConsent)
    factors.push({ key: "marketing_consent", label: "Opted in to email", points: 10 });

  const raw = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.min(CAP, raw);
  return { score, factors };
}

function isTargetEventWithin90d(profile: RiderProfile): boolean {
  // Placeholder — we don't yet persist target_event_date on the profile
  // shape, only the text. When Phase 2d adds the date, flip this to
  // read from profile and compare to Date.now() + 90 days.
  void profile;
  return false;
}

/**
 * Re-score + persist. Call this at the end of completeToolResult and
 * after Stripe webhook confirms payment — anywhere a new signal lands.
 */
export async function refreshLeadScore(
  riderProfileId: number,
): Promise<number> {
  const { score } = await scoreRider(riderProfileId);
  await updateLeadScore(riderProfileId, score);
  return score;
}
