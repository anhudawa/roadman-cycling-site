// Power and yaw analysis: Normalised Power, Variability Index, yaw histogram.

import type { SegmentResult } from './types';

/**
 * Normalised power: 4th-power weighted average over the prediction.
 *
 * The classical NP is computed over 30s rolling windows; we approximate by
 * weighting per-segment 4th-power by segment duration. Engine segments are
 * typically a few seconds long, so the approximation is close.
 */
export function normalizedPower(segments: SegmentResult[]): number {
  if (segments.length === 0) return 0;
  let totalDuration = 0;
  let weighted4 = 0;
  for (const s of segments) {
    weighted4 += Math.pow(s.riderPower, 4) * s.duration;
    totalDuration += s.duration;
  }
  if (totalDuration === 0) return 0;
  return Math.pow(weighted4 / totalDuration, 0.25);
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
