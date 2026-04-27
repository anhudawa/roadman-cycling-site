// W'/CP balance tracking and heuristic variable-power pacing optimisation.

import type {
  Course,
  Environment,
  PacingPlan,
  RiderProfile,
  WPrimeBalanceTrace,
} from './types';
import { fitCpModel, sustainablePower } from './rider';
import { simulateCourse } from './engine';
import { segmentAirState } from './environment';

interface TrackArgs {
  cp: number;
  wPrime: number;
  powerSamples: { power: number; duration: number }[];
  /** Starting balance, defaults to wPrime full. */
  initialBalance?: number;
}

/**
 * Skiba-style W'_balance integration.
 *
 * Above CP: balance depletes at (P − CP) · dt, clamped to 0.
 * Below CP: closed-form recovery with τ ≈ 500s:
 *   W'(t+dt) = W'_max − (W'_max − W'(t)) · exp(−dt / τ)
 */
export function trackWPrimeBalance(args: TrackArgs): WPrimeBalanceTrace[] {
  const tau = 500;
  let balance = args.initialBalance ?? args.wPrime;
  let t = 0;
  const trace: WPrimeBalanceTrace[] = [{ time: 0, wPrimeBalance: balance }];

  for (const sample of args.powerSamples) {
    const dcp = sample.power - args.cp;
    if (dcp > 0) {
      balance = Math.max(0, balance - dcp * sample.duration);
    } else {
      const target = args.wPrime;
      balance = target - (target - balance) * Math.exp(-sample.duration / tau);
      if (balance > target) balance = target;
    }
    t += sample.duration;
    trace.push({ time: t, wPrimeBalance: balance });
  }
  return trace;
}

interface OptimizePacingArgs {
  course: Course;
  rider: RiderProfile;
  environment: Environment;
  /** Average target intensity factor (avg power / CP). Default 0.85. */
  targetIF?: number;
  /** Maximum surge above mean target as a fraction. Default 0.20 (±20%). */
  surgeCeiling?: number;
}

/**
 * Heuristic variable-power pacing.
 *
 *   1. Estimate CP from rider profile.
 *   2. Run constant-power baseline at target IF · CP to estimate duration.
 *   3. Compute durability-adjusted sustainable power for that duration; cap target there.
 *   4. Bias power per segment by:
 *        + on uphill (ease past 8% steep ramps)
 *        − on descent (large negative bias on >6% descents)
 *        + into headwind, − with tailwind
 *   5. Clamp to ±surgeCeiling around target, then re-normalise time-weighted average.
 *
 * Full nonlinear-program optimisation is Phase 4. This heuristic captures the principle
 * (push slow segments, ease where speed is given by gravity/aero) without the complexity.
 */
export function optimizePacing(args: OptimizePacingArgs): PacingPlan {
  const { course, rider, environment } = args;
  const targetIF = args.targetIF ?? 0.85;
  const surgeCeiling = args.surgeCeiling ?? 0.20;
  const cpModel = fitCpModel(rider.powerProfile);

  // Pass 1: constant-power baseline to estimate duration.
  const baselinePower = cpModel.cp * targetIF;
  const baselinePlan = course.segments.map(() => baselinePower);
  const baseline = simulateCourse({
    course,
    rider,
    environment,
    pacing: baselinePlan,
  });
  const expectedSeconds = baseline.totalTime;
  const sustainable = sustainablePower(
    { ...cpModel, durabilityFactor: rider.powerProfile.durabilityFactor },
    expectedSeconds,
  );
  const meanTarget = Math.min(baselinePower, sustainable);

  // Pass 2: bias per segment.
  const biases = course.segments.map((seg) => {
    let bias = 0;
    const gradePct = Math.tan(seg.gradient) * 100;
    if (gradePct > 1) bias += Math.min(gradePct, 8) * 0.015;
    if (gradePct > 8) bias -= (gradePct - 8) * 0.01;
    if (gradePct < -2) bias -= 0.05;
    if (gradePct < -6) bias -= 0.10;

    const altitude = (seg.startElevation + seg.endElevation) / 2;
    const air = segmentAirState(environment, { roadHeading: seg.heading, altitude });
    if (air.headwindComponent > 2) {
      bias += Math.min(air.headwindComponent, 8) * 0.01;
    }
    if (air.headwindComponent < -2) {
      bias -= Math.min(-air.headwindComponent, 8) * 0.01;
    }
    return bias;
  });

  // Provisional plan + clamp.
  const ceiling = meanTarget * (1 + surgeCeiling);
  const floor = meanTarget * (1 - surgeCeiling);
  const clamped = biases.map((b) =>
    Math.max(floor, Math.min(ceiling, meanTarget * (1 + b))),
  );

  // Re-normalise time-weighted mean to meanTarget using baseline durations as weights.
  const segDurations = baseline.segmentResults.map((r) => r.duration);
  const totalDuration = segDurations.reduce((s, d) => s + d, 0);
  const weightedSum = clamped.reduce((s, p, i) => s + p * segDurations[i], 0);
  const currentMean = totalDuration > 0 ? weightedSum / totalDuration : meanTarget;
  const scale = currentMean > 0 ? meanTarget / currentMean : 1;
  return clamped.map((p) => p * scale);
}
