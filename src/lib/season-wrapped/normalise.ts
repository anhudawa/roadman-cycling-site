/**
 * Form input → WrappedData. Pure conversion, with sensible fallbacks
 * when optional fields are blank. Server-safe — used by /api/wrapped.
 */

import type {
  MonthlyStat,
  WrappedData,
  WrappedFormInput,
  Streak,
} from "./types";
import { inferPersonality, personalityProfile } from "./cards";

/** Spread total volume across 12 months in a roughly seasonal curve. */
function seasonalDistribution(totals: {
  distanceM: number;
  elevationM: number;
  timeS: number;
  rides: number;
}): MonthlyStat[] {
  // Northern-hemisphere-ish curve: peaks in May–August.
  const weights = [0.04, 0.045, 0.06, 0.085, 0.105, 0.12, 0.115, 0.12, 0.10, 0.085, 0.07, 0.055];
  const sum = weights.reduce((s, w) => s + w, 0);
  return weights.map((w, i) => {
    const f = w / sum;
    return {
      month: i + 1,
      distanceM: Math.round(totals.distanceM * f),
      elevationM: Math.round(totals.elevationM * f),
      timeS: Math.round(totals.timeS * f),
      rides: Math.max(1, Math.round(totals.rides * f)),
    };
  });
}

export function buildWrappedFromInput(input: WrappedFormInput): WrappedData {
  const distanceM = Math.max(0, input.totalDistanceKm * 1000);
  const elevationM = Math.max(0, input.totalElevationM);
  const timeS = Math.max(0, Math.round(input.totalTimeHours * 3600));
  const rides = Math.max(1, Math.round(input.totalRides));

  let monthly = seasonalDistribution({ distanceM, elevationM, timeS, rides });

  // If the rider explicitly named a "biggest month", boost that one.
  if (input.biggestMonth && input.biggestMonth >= 1 && input.biggestMonth <= 12) {
    const idx = input.biggestMonth - 1;
    const others = monthly.filter((_, i) => i !== idx);
    const otherTotal = others.reduce((s, m) => s + m.distanceM, 0);
    // Make the biggest month at least 18% of total (or its current level — whichever larger).
    const minBiggest = Math.round(distanceM * 0.18);
    if (monthly[idx].distanceM < minBiggest) {
      const transfer = minBiggest - monthly[idx].distanceM;
      monthly[idx].distanceM += transfer;
      monthly = monthly.map((m, i) =>
        i === idx
          ? m
          : {
              ...m,
              distanceM: Math.max(
                0,
                Math.round(m.distanceM - (transfer * (m.distanceM / Math.max(1, otherTotal)))),
              ),
            },
      );
    }
  }

  const ftpStart = input.ftpStart && input.ftpStart > 0 ? input.ftpStart : 240;
  const ftpEnd = input.ftpEnd && input.ftpEnd > 0 ? input.ftpEnd : ftpStart + 12;

  const longestRideElev =
    input.longestRideElevationM ??
    Math.round(elevationM * 0.06); // ballpark — 6% of yearly vertical in one day

  const biggestClimbDayElev =
    input.biggestClimbDayElevationM ?? Math.max(longestRideElev, Math.round(elevationM * 0.04));

  const streak: Streak = {
    longestWeeksUnbroken: Math.min(52, input.weeklyStreak ?? estimateStreak(rides)),
    daysRidden: input.rideDays ?? Math.min(365, Math.round(rides * 1.05)),
    weeksRidden: Math.min(52, Math.round((input.rideDays ?? rides * 1.05) / 7)),
  };

  const archetype =
    input.personality ??
    inferPersonality({
      year: input.year,
      rider: { firstName: input.firstName, weightKg: input.weightKg },
      totals: { distanceM, elevationM, timeS, rides },
      longestRide: { date: "", distanceM: input.longestRideKm * 1000, elevationM: longestRideElev },
      biggestClimbDay: { date: "", elevationM: biggestClimbDayElev },
      monthly,
      ftp: {
        start: { date: `${input.year}-01-01`, watts: ftpStart },
        end: { date: `${input.year}-12-15`, watts: ftpEnd },
      },
      streak,
      personality: personalityProfile("all_rounder"),
      percentile: { distance: 50, elevation: 50, hours: 50 },
    });

  return {
    year: input.year,
    rider: { firstName: input.firstName?.trim() || "You", weightKg: input.weightKg },
    totals: { distanceM, elevationM, timeS, rides },
    longestRide: {
      date: `${input.year}-07-15`,
      distanceM: Math.max(0, input.longestRideKm * 1000),
      elevationM: longestRideElev,
      name: input.longestRideName?.trim() || undefined,
    },
    biggestClimbDay: {
      date: `${input.year}-08-04`,
      elevationM: biggestClimbDayElev,
    },
    monthly,
    ftp: {
      start: { date: `${input.year}-01-01`, watts: ftpStart },
      end: { date: `${input.year}-12-15`, watts: ftpEnd },
    },
    streak,
    personality: personalityProfile(archetype),
    percentile: derivePercentile({ distanceM, elevationM, timeS }),
  };
}

function estimateStreak(rides: number): number {
  // 100 rides ≈ ~10 weeks unbroken; 250 ≈ ~30+; cap at 50.
  if (rides < 50) return Math.max(2, Math.round(rides / 8));
  if (rides < 150) return Math.max(8, Math.round(rides / 5));
  return Math.min(50, Math.round(rides / 4));
}

/** Crude percentile lookup — rider audience benchmarks. */
function derivePercentile(t: { distanceM: number; elevationM: number; timeS: number }) {
  const km = t.distanceM / 1000;
  const elevK = t.elevationM / 1000;
  const hours = t.timeS / 3600;
  const distance = bucket(km, [3000, 5000, 7500, 10000, 13000, 16000]);
  const elevation = bucket(elevK, [25, 50, 80, 110, 150, 200]);
  const hoursR = bucket(hours, [120, 200, 280, 380, 500, 650]);
  return { distance, elevation, hours: hoursR };
}

function bucket(value: number, breakpoints: number[]): number {
  // breakpoints map to 30,45,60,75,85,93 percentile.
  const pcts = [30, 45, 60, 75, 85, 93];
  for (let i = 0; i < breakpoints.length; i++) {
    if (value < breakpoints[i]) return pcts[i];
  }
  return 97;
}
