/**
 * The race recipe — what your best block was actually made of.
 *
 * Scans every 6-week window in the rider's history, scores each as a
 * training block (fitness gained, volume held, key sessions done, without
 * digging an unrecoverable fatigue hole), names the best one, and compares
 * it with the current block. The gaps are the story.
 */

import { round1, shiftDate } from "./load";
import type {
  AnalyzedActivity,
  BlockSummary,
  LoadPoint,
  RaceRecipe,
  RecipeGap,
} from "./types";

const BLOCK_DAYS = 42;

export function summarizeBlock(
  activities: AnalyzedActivity[],
  load: LoadPoint[],
  startDate: string,
  endDate: string
): BlockSummary | null {
  const rides = activities.filter((a) => a.date >= startDate && a.date <= endDate);
  if (rides.length === 0) return null;

  const weeks = BLOCK_DAYS / 7;
  let totalHours = 0;
  let totalTss = 0;
  let easyHours = 0;
  let longest = 0;
  const longRideHours: number[] = [];
  let keySessions = 0;

  for (const ride of rides) {
    const hours = ride.durationSec / 3600;
    totalHours += hours;
    totalTss += ride.tss;
    longest = Math.max(longest, hours);
    if (hours >= 2.75) longRideHours.push(hours);
    if (
      ride.purpose === "threshold" ||
      ride.purpose === "sweet-spot" ||
      ride.purpose === "vo2"
    ) {
      keySessions += 1;
    }
    if (
      ride.purpose === "endurance" ||
      ride.purpose === "long-ride" ||
      ride.purpose === "recovery"
    ) {
      easyHours += hours;
    }
  }

  const startPoint = load.find((p) => p.date >= startDate);
  const endPoint = [...load].reverse().find((p) => p.date <= endDate);

  return {
    startDate,
    endDate,
    weeklyHours: round1(totalHours / weeks),
    weeklyTss: Math.round(totalTss / weeks),
    longestRideHours: round1(longest),
    avgLongRideHours:
      longRideHours.length > 0
        ? round1(longRideHours.reduce((s, h) => s + h, 0) / longRideHours.length)
        : 0,
    easyShare: totalHours > 0 ? round1(easyHours / totalHours * 100) / 100 : 0,
    keySessionsPerWeek: round1(keySessions / weeks),
    ctlGain: round1((endPoint?.ctl ?? 0) - (startPoint?.ctl ?? 0)),
    endTsb: endPoint?.tsb ?? 0,
    rideCount: rides.length,
  };
}

function blockScore(block: BlockSummary): number {
  const fatiguePenalty = Math.max(0, -block.endTsb - 25) * 0.5;
  return (
    block.ctlGain * 2 +
    block.weeklyHours * 1.5 +
    block.keySessionsPerWeek * 4 +
    block.avgLongRideHours * 2 -
    fatiguePenalty
  );
}

export function buildRaceRecipe(
  activities: AnalyzedActivity[],
  load: LoadPoint[],
  asOf: string
): RaceRecipe {
  const currentStart = shiftDate(asOf, -(BLOCK_DAYS - 1));
  const current = summarizeBlock(activities, load, currentStart, asOf);

  if (activities.length === 0 || load.length === 0) {
    return {
      best: null,
      current,
      gaps: [],
      headline: "Import your history and RideZones will name the block behind your best form.",
    };
  }

  // Slide week by week over everything that ended before the current block.
  let best: BlockSummary | null = null;
  let bestScore = -Infinity;
  const firstDate = load[0].date;
  for (
    let end = shiftDate(currentStart, -1);
    shiftDate(end, -(BLOCK_DAYS - 1)) >= firstDate;
    end = shiftDate(end, -7)
  ) {
    const start = shiftDate(end, -(BLOCK_DAYS - 1));
    const block = summarizeBlock(activities, load, start, end);
    if (!block || block.rideCount < 10) continue;
    const score = blockScore(block);
    if (score > bestScore) {
      bestScore = score;
      best = block;
    }
  }

  if (!best || !current) {
    return {
      best,
      current,
      gaps: [],
      headline:
        "Not enough history yet to separate a best block from the current one. Keep importing — the recipe needs about three months of rides.",
    };
  }

  const gaps = compareBlocks(best, current);
  const major = gaps.filter((g) => g.severity === "major");
  const headline =
    major.length === 0
      ? "Your current block matches the recipe behind your best form. Hold the line."
      : `Your best block had ${major.length === 1 ? "one ingredient" : `${major.length} ingredients`} your current riding is missing: ${major
          .map((g) => g.label.toLowerCase())
          .join(", ")}.`;

  return { best, current, gaps, headline };
}

function gap(
  key: string,
  label: string,
  bestValue: string,
  currentValue: string,
  ratio: number,
  note: string
): RecipeGap {
  const severity = ratio < 0.65 ? "major" : ratio < 0.85 ? "minor" : "ok";
  return { key, label, bestValue, currentValue, severity, note };
}

function compareBlocks(best: BlockSummary, current: BlockSummary): RecipeGap[] {
  return [
    gap(
      "weekly-hours",
      "Weekly volume",
      `${best.weeklyHours}h`,
      `${current.weeklyHours}h`,
      safeRatio(current.weeklyHours, best.weeklyHours),
      "The single biggest ingredient in every good block: hours on the bike, week after week."
    ),
    gap(
      "long-ride",
      "Long ride",
      best.avgLongRideHours > 0 ? `${best.avgLongRideHours}h avg` : "none",
      current.avgLongRideHours > 0 ? `${current.avgLongRideHours}h avg` : "none",
      safeRatio(current.avgLongRideHours, best.avgLongRideHours),
      "Durability is built on the long ride. When it shrinks, late-ride fade comes back first."
    ),
    gap(
      "key-sessions",
      "Key sessions per week",
      `${best.keySessionsPerWeek}`,
      `${current.keySessionsPerWeek}`,
      safeRatio(current.keySessionsPerWeek, best.keySessionsPerWeek),
      "Threshold, sweet spot, VO2 — the deliberate hard days that gave the block its edge."
    ),
    gap(
      "weekly-tss",
      "Weekly training load",
      `${best.weeklyTss} TSS`,
      `${current.weeklyTss} TSS`,
      safeRatio(current.weeklyTss, best.weeklyTss),
      "Total stimulus per week. Fitness follows load — gently rising, never spiking."
    ),
    gap(
      "easy-share",
      "Easy riding share",
      `${Math.round(best.easyShare * 100)}%`,
      `${Math.round(current.easyShare * 100)}%`,
      safeRatio(current.easyShare, best.easyShare),
      "The polarised split that made the hard days land. When this drops, the grey zone is usually eating it."
    ),
  ];
}

function safeRatio(current: number, best: number): number {
  if (best <= 0) return 1;
  return current / best;
}
