// Generate the "1 free key insight" surfaced on the public prediction page.
// This is intentionally small: paid Race Reports get the full breakdown.

import type { Course, CourseResult, RiderProfile, ClimbCategory } from "./types";

export interface KeyInsight {
  /** One-line punchy headline. */
  headline: string;
  /** 1–2 sentences of context. */
  body: string;
  /** Tag for the upgrade CTA targeting. */
  tag: "climb" | "wind" | "fuel" | "pacing" | "durability" | "general";
}

/**
 * Pick the single most actionable insight from a prediction. Order of
 * preference: severe climb risk > headwind risk > durability gap > pacing
 * variability > general overview. Aim is one strong line that earns trust
 * and primes the upgrade.
 */
export function pickKeyInsight(args: {
  course: Course;
  result: CourseResult;
  rider: RiderProfile;
}): KeyInsight {
  const { course, result, rider } = args;

  // Climb dominance: pull out the longest hard climb.
  const hardClimbs = course.climbs
    .filter((c) => c.category === "cat1" || c.category === "hc")
    .sort((a, b) => b.length - a.length);

  if (hardClimbs.length > 0) {
    const c = hardClimbs[0];
    const climbResults = result.segmentResults.slice(
      c.startSegmentIndex,
      c.endSegmentIndex + 1,
    );
    const avgKmh =
      climbResults.length > 0
        ? (climbResults.reduce((s, r) => s + r.averageSpeed, 0) /
            climbResults.length) *
          3.6
        : 0;
    const lengthKm = (c.length / 1000).toFixed(1);
    const gradePct = (Math.tan(c.averageGradient) * 100).toFixed(1);
    return {
      headline: `Your ${labelClimb(c.category)} climb pace will drop to ${avgKmh.toFixed(0)} km/h on the ${gradePct}% ramps`,
      body: `${lengthKm} km at ${gradePct}% gives a ${formatTime(climbResults.reduce((s, r) => s + r.duration, 0))} climb. That single climb is where the day is won or lost — pacing it 5 % too hard costs more time than 30 km of bad fuelling.`,
      tag: "climb",
    };
  }

  // Headwind risk
  const hwSegments = result.segmentResults.filter(
    (r) => r.headwind > 3,
  ).length;
  if (hwSegments > result.segmentResults.length * 0.2) {
    const avgHw =
      result.segmentResults.reduce((s, r) => s + Math.max(0, r.headwind), 0) /
      Math.max(1, result.segmentResults.length);
    return {
      headline: `Headwind across ~${Math.round((100 * hwSegments) / result.segmentResults.length)}% of the course costs ~${(avgHw * 3.6).toFixed(0)} km/h`,
      body: `In a sustained headwind, holding the same wattage as a calm day can cost 4–6 minutes per hour — your pacing plan needs to push power into the wind, not save it for after.`,
      tag: "wind",
    };
  }

  // Durability gap
  if (
    rider.powerProfile.durabilityFactor >= 0.06 &&
    result.totalTime > 4 * 3600
  ) {
    return {
      headline: `At ${(result.totalTime / 3600).toFixed(1)} h you're well into durability territory`,
      body: `Your power-duration profile (k = ${rider.powerProfile.durabilityFactor.toFixed(2)}) typically loses 8–12 % past 4 h on long events. The pacing plan needs to bake that decay in from km 1, not absorb it on the last climb.`,
      tag: "durability",
    };
  }

  // Pacing variability — gentle nudge for flatter courses
  if (result.variabilityIndex > 1.05) {
    return {
      headline: `Your effort is ${((result.variabilityIndex - 1) * 100).toFixed(1)}% spikier than your average`,
      body: `A high VI means surges are eating W' you'll need at the end. Even on rolling roads a tighter band saves 1–2 minutes over a 3-hour ride at the same average power.`,
      tag: "pacing",
    };
  }

  // General fallback
  return {
    headline: `${(result.totalDistance / 1000).toFixed(0)} km in ${formatTime(result.totalTime)} at ${(result.averageSpeed * 3.6).toFixed(1)} km/h`,
    body: `Solid baseline at this power. The Race Report breaks pacing, fuelling, and equipment scenarios down minute by minute so you ride a 50/50 day as a 60/40 day in your favour.`,
    tag: "general",
  };
}

function labelClimb(cat: ClimbCategory): string {
  switch (cat) {
    case "cat4":
      return "category-4";
    case "cat3":
      return "category-3";
    case "cat2":
      return "category-2";
    case "cat1":
      return "category-1";
    case "hc":
      return "HC";
  }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Confidence bracket around predicted time.
 *
 * Bracket width depends on how confident we are in the inputs:
 *   - precision="high":   ±1.5 %  (rider supplied explicit CdA + Crr + full PD curve)
 *   - precision="default": ±3 %    (FTP-only, position preset, surface preset)
 *   - precision="low":     ±5 %    (AI translator with low confidence, defaults)
 *
 * Ties out to "<2 % error vs reality" target. The default bracket sits a
 * touch wider than that target so we under-promise even when the engine
 * could do better — riders punish over-promising more than they punish a
 * tight prediction that they beat.
 */
export type Precision = "high" | "default" | "low";

const BRACKET_FRACTIONS: Record<Precision, number> = {
  high: 0.015,
  default: 0.03,
  low: 0.05,
};

export function confidenceBracket(
  predictedSeconds: number,
  options: { precision?: Precision } = {},
): { low: number; high: number } {
  const fraction = BRACKET_FRACTIONS[options.precision ?? "default"];
  return {
    low: Math.round(predictedSeconds * (1 - fraction)),
    high: Math.round(predictedSeconds * (1 + fraction)),
  };
}
