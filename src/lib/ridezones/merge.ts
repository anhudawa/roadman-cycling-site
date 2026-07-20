/**
 * Merging imports from multiple platforms without double-counting.
 *
 * The same ride often lives in both Strava and TrainingPeaks. Two
 * activities are treated as duplicates when they're on the same day and
 * within a few minutes of the same length — in that case the richer record
 * (power data beats no power data) wins.
 */

import type { Activity } from "./types";

const DURATION_TOLERANCE_SEC = 5 * 60;

function richness(activity: Activity): number {
  let score = 0;
  if (activity.normalizedPower) score += 4;
  if (activity.avgPower) score += 3;
  if (activity.zoneTimesSec) score += 3;
  if (activity.avgHr) score += 1;
  if (activity.distanceKm) score += 1;
  return score;
}

function isDuplicate(a: Activity, b: Activity): boolean {
  return (
    a.date === b.date &&
    Math.abs(a.durationSec - b.durationSec) <= DURATION_TOLERANCE_SEC
  );
}

/**
 * Merge `incoming` into `existing`, dropping duplicates. Returns the merged
 * list plus how many incoming rides were treated as already present.
 */
export function mergeActivities(
  existing: Activity[],
  incoming: Activity[]
): { merged: Activity[]; duplicates: number } {
  const merged = [...existing];
  let duplicates = 0;

  for (const candidate of incoming) {
    const matchIndex = merged.findIndex((a) => isDuplicate(a, candidate));
    if (matchIndex === -1) {
      merged.push(candidate);
      continue;
    }
    duplicates++;
    if (richness(candidate) > richness(merged[matchIndex])) {
      merged[matchIndex] = candidate;
    }
  }

  merged.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { merged, duplicates };
}
