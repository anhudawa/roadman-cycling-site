// Power and yaw analysis: Normalised Power, Variability Index, yaw histogram,
// and per-checkpoint timing splits.

import type {
  CheckpointSplit,
  Course,
  CourseResult,
  SegmentResult,
} from './types';

/** Normalised-power smoothing window, seconds (Coggan/Allen canonical). */
const NP_WINDOW_S = 30;

/**
 * Normalised power, computed the canonical way: resample the ride to a 1 Hz
 * power series, take a 30-second rolling mean, raise to the 4th power, average,
 * then take the 4th root.
 *
 * The previous implementation 4th-power-weighted each engine segment directly.
 * Engine segments are only a few seconds long, so that skipped the 30 s
 * smoothing entirely and over-reported NP under variable pacing — riders then
 * read their (correctly smoothed) head-unit NP as lower and assumed they
 * under-performed. This matches what a Garmin/Wahoo computes.
 *
 * Rides shorter than the smoothing window fall back to the duration-weighted
 * 4th-power mean (you cannot take a 30 s rolling mean of a 20 s effort).
 */
export function normalizedPower(segments: SegmentResult[]): number {
  if (segments.length === 0) return 0;

  let totalDuration = 0;
  const cumulative: number[] = [];
  for (const s of segments) {
    totalDuration += s.duration;
    cumulative.push(totalDuration);
  }
  if (totalDuration <= 0) return 0;

  const sampleCount = Math.max(1, Math.round(totalDuration));

  // Short ride: no room for a 30 s window — duration-weighted 4th-power mean.
  if (sampleCount <= NP_WINDOW_S) {
    let weighted4 = 0;
    for (const s of segments) weighted4 += Math.pow(s.riderPower, 4) * s.duration;
    return Math.pow(weighted4 / totalDuration, 0.25);
  }

  // Resample power to 1 Hz (two-pointer walk over cumulative segment times).
  const power = new Array<number>(sampleCount);
  let seg = 0;
  for (let k = 0; k < sampleCount; k++) {
    const t = k + 0.5;
    while (seg < segments.length - 1 && t > cumulative[seg]) seg++;
    power[k] = segments[seg].riderPower;
  }

  // 30 s rolling mean via prefix sums, then 4th-power mean, then 4th root.
  const prefix = new Array<number>(sampleCount + 1);
  prefix[0] = 0;
  for (let k = 0; k < sampleCount; k++) prefix[k + 1] = prefix[k] + power[k];

  let sum4 = 0;
  let windows = 0;
  for (let k = 0; k + NP_WINDOW_S <= sampleCount; k++) {
    const mean = (prefix[k + NP_WINDOW_S] - prefix[k]) / NP_WINDOW_S;
    sum4 += mean * mean * mean * mean;
    windows++;
  }
  if (windows === 0) return 0;
  return Math.pow(sum4 / windows, 0.25);
}

/** VI = NP / AP. */
export function variabilityIndex(segments: SegmentResult[]): number {
  if (segments.length === 0) return 1;
  let totalDuration = 0;
  let energy = 0;
  for (const s of segments) {
    energy += s.riderPower * s.duration;
    totalDuration += s.duration;
  }
  const ap = totalDuration > 0 ? energy / totalDuration : 0;
  if (ap <= 0) return 1;
  return normalizedPower(segments) / ap;
}

export interface YawBin {
  /** Bin centre in degrees. */
  binCenter: number;
  /** Total time spent in this bin, seconds. */
  timeS: number;
}

/**
 * Histogram of yaw angles (degrees) weighted by segment duration.
 * Bin width defaults to 5°.
 */
export function yawHistogram(segments: SegmentResult[], binWidthDeg = 5): YawBin[] {
  const bins = new Map<number, number>();
  for (const s of segments) {
    const yawDeg = (s.yawAngle * 180) / Math.PI;
    const binIndex = Math.round(yawDeg / binWidthDeg);
    const center = binIndex * binWidthDeg;
    bins.set(center, (bins.get(center) ?? 0) + s.duration);
  }
  return [...bins.entries()]
    .map(([binCenter, timeS]) => ({ binCenter, timeS }))
    .sort((a, b) => a.binCenter - b.binCenter);
}

/** Pick a round distance-marker spacing (m) appropriate to the route length. */
function splitSpacing(totalDistanceM: number): number {
  const km = totalDistanceM / 1000;
  if (km <= 25) return 5_000;
  if (km <= 60) return 10_000;
  if (km <= 130) return 20_000;
  if (km <= 260) return 25_000;
  return 50_000;
}

/**
 * Per-checkpoint timing splits — the "where will I be at each point" table that
 * Best Bike Split sells. Combines two checkpoint kinds:
 *   • Round distance markers (spacing scales with route length).
 *   • Each detected climb's foot and top (the points riders actually care about).
 * Every checkpoint reports cumulative time/elevation plus the average speed and
 * power of the leg *since the previous checkpoint*, so a rider can read pacing
 * off the table directly. Markers are de-duplicated and sorted by distance.
 *
 * When `laps > 1` the course has been expanded to an N-lap circuit: distance
 * markers gain a `Lap k/N — ` prefix, and an explicit `Lap k/N complete`
 * checkpoint is added at each lap boundary. The lap context lives entirely in
 * the label string — the CheckpointSplit type is unchanged.
 */
export function checkpointSplits(
  course: Course,
  result: CourseResult,
  laps = 1,
): CheckpointSplit[] {
  const segs = result.segmentResults;
  if (segs.length === 0 || course.segments.length === 0) return [];

  // Cumulative time / distance / elevation gain at the END of each segment.
  const n = course.segments.length;
  const cumTime = new Array<number>(n);
  const cumDist = new Array<number>(n);
  const cumGain = new Array<number>(n);
  let t = 0;
  let d = 0;
  let g = 0;
  for (let i = 0; i < n; i++) {
    const seg = course.segments[i];
    t += segs[i]?.duration ?? 0;
    d += seg.distance;
    const rise = seg.endElevation - seg.startElevation;
    if (rise > 0) g += rise;
    cumTime[i] = t;
    cumDist[i] = d;
    cumGain[i] = g;
  }
  const totalDistance = cumDist[n - 1];

  // Segment whose cumulative distance first reaches `target` metres.
  const segAtDistance = (target: number): number => {
    for (let i = 0; i < n; i++) if (cumDist[i] >= target - 1e-6) return i;
    return n - 1;
  };

  // Multi-lap circuit context. lapAware tags distance markers with their lap
  // and inserts explicit lap-boundary checkpoints; laps <= 1 is unchanged.
  const lapAware = laps > 1;
  const lapDistance = lapAware ? totalDistance / laps : 0;

  // Collect (distance, label, kind) markers.
  const markers: { distance: number; label: string; kind: CheckpointSplit['kind'] }[] = [];
  const spacing = splitSpacing(totalDistance);
  for (let mark = spacing; mark < totalDistance - spacing * 0.25; mark += spacing) {
    const lapPrefix = lapAware
      ? `Lap ${Math.min(laps, Math.floor(mark / lapDistance) + 1)}/${laps} — `
      : '';
    markers.push({
      distance: mark,
      label: `${lapPrefix}${Math.round(mark / 1000)} km`,
      kind: 'distance',
    });
  }
  if (lapAware) {
    for (let k = 1; k < laps; k++) {
      markers.push({
        distance: k * lapDistance,
        label: `Lap ${k}/${laps} complete`,
        kind: 'distance',
      });
    }
  }
  course.climbs.forEach((climb, idx) => {
    const name = course.name ? `climb ${idx + 1}` : `climb ${idx + 1}`;
    markers.push({
      distance: climb.startDistance,
      label: `Foot of ${name}`,
      kind: 'climb_start',
    });
    markers.push({
      distance: climb.endDistance,
      label: `Top of ${name}`,
      kind: 'climb_top',
    });
  });
  markers.push({ distance: totalDistance, label: 'Finish', kind: 'finish' });

  // Sort, de-dupe near-identical distances (keep the more specific climb label).
  markers.sort((a, b) => a.distance - b.distance);
  const splits: CheckpointSplit[] = [];
  let prevSegEnd = -1;
  let prevTime = 0;
  let prevDist = 0;
  for (const m of markers) {
    const segIdx = segAtDistance(m.distance);
    if (segIdx <= prevSegEnd && m.kind !== 'finish') continue; // collapse duplicates
    const cumulativeTime = cumTime[segIdx];
    const distance = cumDist[segIdx];
    const legTime = cumulativeTime - prevTime;
    const legDist = distance - prevDist;
    // Average power across the leg's segments, time-weighted.
    let legEnergy = 0;
    let legDur = 0;
    for (let i = prevSegEnd + 1; i <= segIdx; i++) {
      legEnergy += (segs[i]?.riderPower ?? 0) * (segs[i]?.duration ?? 0);
      legDur += segs[i]?.duration ?? 0;
    }
    splits.push({
      label: m.label,
      kind: m.kind,
      distance,
      cumulativeTime,
      cumulativeElevationGain: cumGain[segIdx],
      legSpeed: legTime > 0 ? legDist / legTime : 0,
      legPower: legDur > 0 ? legEnergy / legDur : 0,
    });
    prevSegEnd = segIdx;
    prevTime = cumulativeTime;
    prevDist = distance;
  }
  return splits;
}
