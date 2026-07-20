/**
 * Session purpose classification — what a ride actually was, read from the
 * data. This is where the grey zone gets named: the ride that was too hard
 * to build the aerobic base and too easy to move threshold. When per-zone
 * time is available it drives the call; otherwise intensity factor and
 * duration carry it.
 */

import type { Activity, SessionPurpose } from "./types";

const LONG_RIDE_HOURS = 2.75;

interface ZoneShares {
  /** Share of time in Z1–Z2. */
  easy: number;
  /** Share of time in Z3. */
  tempo: number;
  /** Share of time in Z4. */
  threshold: number;
  /** Share of time in Z5+. */
  hard: number;
}

export function zoneShares(activity: Activity): ZoneShares | null {
  const times = activity.zoneTimesSec;
  if (!times || times.length < 7) return null;
  const total = times.reduce((sum, t) => sum + t, 0);
  if (total <= 0) return null;
  return {
    easy: (times[0] + times[1]) / total,
    tempo: times[2] / total,
    threshold: times[3] / total,
    hard: (times[4] + times[5] + times[6]) / total,
  };
}

export function classifyPurpose(
  activity: Activity,
  intensityFactor: number | null
): SessionPurpose {
  const hours = activity.durationSec / 3600;
  const shares = zoneShares(activity);

  if (shares) {
    // Interval work first — meaningful time above threshold outranks
    // whatever the averages say.
    if (shares.hard * activity.durationSec >= 8 * 60) return "vo2";
    if (shares.threshold * activity.durationSec >= 18 * 60) {
      // Sweet spot lives at the top of Z3 / bottom of Z4; a ride that pairs
      // solid Z4 time with a large tempo share was ridden there deliberately.
      return shares.tempo > shares.threshold ? "sweet-spot" : "threshold";
    }
    if (hours >= LONG_RIDE_HOURS && shares.easy >= 0.6) return "long-ride";
    // The classic leak: a third of the ride in Z3 with no actual session in it.
    if (shares.tempo >= 0.28 && shares.easy < 0.65) return "grey-zone";
    if (shares.tempo >= 0.45) return "tempo";
    if (shares.easy >= 0.85 && (intensityFactor ?? 0) < 0.6 && hours <= 1.25) {
      return "recovery";
    }
    if (shares.easy >= 0.7) return "endurance";
    return "grey-zone";
  }

  if (intensityFactor === null) {
    return hours <= 0.75 ? "recovery" : "unknown";
  }

  if (intensityFactor < 0.6) return hours <= 1.25 ? "recovery" : "endurance";
  if (intensityFactor <= 0.77) {
    return hours >= LONG_RIDE_HOURS ? "long-ride" : "endurance";
  }
  if (intensityFactor <= 0.84) {
    // Without zone data, a 78–84% ride under ~2.5h is the grey-zone
    // signature; past long-ride duration it's more likely a hard club run
    // ridden as tempo.
    return hours >= 2.5 ? "tempo" : "grey-zone";
  }
  if (intensityFactor <= 0.88) return "sweet-spot";
  if (intensityFactor <= 0.98) return "threshold";
  return "vo2";
}

export const PURPOSE_LABELS: Record<SessionPurpose, string> = {
  recovery: "Recovery",
  endurance: "Endurance",
  "long-ride": "Long ride",
  "grey-zone": "Grey zone",
  tempo: "Tempo",
  "sweet-spot": "Sweet spot",
  threshold: "Threshold",
  vo2: "VO2",
  unknown: "Unclassified",
};
