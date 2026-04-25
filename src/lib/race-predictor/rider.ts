// Rider power-duration model: 2-parameter critical-power fit + durability decay.

import type { CPModel, PowerProfile } from './types';

/**
 * Fit a 2-parameter CP/W' model from the 20-min and 60-min anchors.
 *   P(t) = CP + W' / t
 * Two anchors give a closed form:
 *   p20 = CP + W'/1200
 *   p60 = CP + W'/3600
 * → W' = (p20 − p60) · 1800
 *   CP = p60 − W'/3600
 */
export function fitCpModel(profile: PowerProfile): CPModel {
  const wPrime = (profile.p20min - profile.p60min) * 1800;
  const cp = profile.p60min - wPrime / 3600;
  return { cp, wPrime };
}

interface FullModel extends CPModel {
  durabilityFactor: number;
}

/**
 * Sustainable power for a target duration (s), with durability decay past 1 hour.
 *   t ≤ 3600s: classic CP/W' → P = CP + W'/t
 *   t > 3600s: P = CP · (1 − k · ln(t / 3600))
 */
export function sustainablePower(model: FullModel, durationSec: number): number {
  if (durationSec <= 0) return Infinity;
  const base = model.cp + model.wPrime / durationSec;
  if (durationSec <= 3600) return base;
  const decay = 1 - model.durabilityFactor * Math.log(durationSec / 3600);
  return Math.max(0, model.cp * decay);
}

/**
 * Time the rider can hold a given power (s). Returns Infinity at or below CP.
 *   t = W' / (P − CP)  for P > CP
 */
export function sustainableDuration(model: FullModel, power: number): number {
  if (power <= model.cp) return Infinity;
  return model.wPrime / (power - model.cp);
}
