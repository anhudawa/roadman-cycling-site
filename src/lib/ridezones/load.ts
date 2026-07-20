/**
 * Training-load math: TSS per ride and the CTL/ATL/TSB timeline.
 *
 * Power-based TSS is the standard Coggan formula. Rides without power fall
 * back to an LTHR-derived intensity factor; rides with neither get a
 * conservative duration-only estimate so the timeline never has silent holes.
 */

import type { Activity, LoadPoint, LoadSource, RiderSettings } from "./types";

/**
 * Variability index applied when a ride reports average power but no
 * normalized power. 1.05 is typical for a steady outdoor endurance ride.
 */
const DEFAULT_VARIABILITY_INDEX = 1.05;

/** TSS per hour assumed when a ride has no power and no heart rate. */
const DURATION_ONLY_TSS_PER_HOUR = 45;

export interface RideLoad {
  tss: number;
  intensityFactor: number | null;
  loadSource: LoadSource;
}

export function estimateNormalizedPower(activity: Activity): number | null {
  if (activity.normalizedPower && activity.normalizedPower > 0) {
    return activity.normalizedPower;
  }
  if (activity.avgPower && activity.avgPower > 0) {
    return activity.avgPower * DEFAULT_VARIABILITY_INDEX;
  }
  return null;
}

export function computeRideLoad(
  activity: Activity,
  settings: Pick<RiderSettings, "ftp" | "lthr">
): RideLoad {
  const hours = activity.durationSec / 3600;
  const np = estimateNormalizedPower(activity);

  if (np !== null && settings.ftp > 0) {
    const intensityFactor = np / settings.ftp;
    return {
      tss: round1(hours * intensityFactor * intensityFactor * 100),
      intensityFactor: round2(intensityFactor),
      loadSource: "power",
    };
  }

  if (activity.avgHr && settings.lthr && settings.lthr > 0) {
    // hrTSS approximation: treat %LTHR as the intensity factor. Clamped so a
    // mis-set LTHR or a warmup-heavy average can't produce absurd loads.
    const intensityFactor = clamp(activity.avgHr / settings.lthr, 0.4, 1.15);
    return {
      tss: round1(hours * intensityFactor * intensityFactor * 100),
      intensityFactor: round2(intensityFactor),
      loadSource: "hr",
    };
  }

  return {
    tss: round1(hours * DURATION_ONLY_TSS_PER_HOUR),
    intensityFactor: null,
    loadSource: "duration",
  };
}

const CTL_DAYS = 42;
const ATL_DAYS = 7;

/**
 * Build the daily CTL/ATL/TSB series from analyzed rides.
 *
 * Runs from the first activity to `endDate` inclusive, one point per day.
 * TSB for a given day uses the previous day's CTL/ATL — the freshness you
 * woke up with, not the freshness after today's ride.
 */
export function buildLoadSeries(
  rides: Array<{ date: string; tss: number }>,
  endDate: string
): LoadPoint[] {
  if (rides.length === 0) return [];

  const tssByDate = new Map<string, number>();
  for (const ride of rides) {
    tssByDate.set(ride.date, (tssByDate.get(ride.date) ?? 0) + ride.tss);
  }

  const sortedDates = [...tssByDate.keys()].sort();
  const start = utcDate(sortedDates[0]);
  const end = utcDate(endDate);
  if (end.getTime() < start.getTime()) return [];

  const points: LoadPoint[] = [];
  let ctl = 0;
  let atl = 0;

  for (let t = start.getTime(); t <= end.getTime(); t += 86_400_000) {
    const date = isoDate(new Date(t));
    const tss = tssByDate.get(date) ?? 0;
    const prevCtl = ctl;
    const prevAtl = atl;
    ctl = ctl + (tss - ctl) / CTL_DAYS;
    atl = atl + (tss - atl) / ATL_DAYS;
    points.push({
      date,
      tss: round1(tss),
      ctl: round1(ctl),
      atl: round1(atl),
      tsb: round1(prevCtl - prevAtl),
    });
  }

  return points;
}

/** CTL change over the trailing `days` of the series. */
export function rampRate(load: LoadPoint[], days = 7): number {
  if (load.length === 0) return 0;
  const last = load[load.length - 1];
  const earlier = load[Math.max(0, load.length - 1 - days)];
  return round1(last.ctl - earlier.ctl);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function utcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** ISO date `days` before (positive) or after (negative `days`) the given day. */
export function shiftDate(iso: string, days: number): string {
  return isoDate(new Date(utcDate(iso).getTime() + days * 86_400_000));
}
