// What-if scenario comparison engine. Drives the Time Analysis sliders.

import type {
  Course,
  Environment,
  PacingPlan,
  PowerProfile,
  RiderProfile,
  ScenarioDelta,
  ScenarioResult,
} from './types';
import { simulateCourse } from './engine';

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/**
 * Re-scale a power-duration profile for a change in FTP (threshold fitness).
 *
 * A change in FTP is a change in the *threshold* system, so only the
 * threshold-relevant anchors move: p60min (the FTP/CP proxy) tracks the delta
 * one-for-one, and p20min — the other threshold anchor that feeds the CP/W'
 * fit — moves with it by the same number of watts. The neuromuscular and
 * anaerobic anchors (p5s, p1min, p5min) describe a separate physiological
 * system and are deliberately left untouched: a +30 W FTP gain does not add
 * watts to a 5-second sprint. A caller who has actually re-measured those
 * anchors should override them explicitly rather than rely on this scaler.
 *
 * @param profile  baseline power profile
 * @param ftpDelta signed change in FTP, W
 */
export function scalePowerProfileForFtp(
  profile: PowerProfile,
  ftpDelta: number,
): PowerProfile {
  const newFtp = Math.max(80, profile.p60min + ftpDelta);
  const appliedDelta = newFtp - profile.p60min;
  return {
    ...profile,
    p20min: Math.max(80, profile.p20min + appliedDelta),
    p60min: newFtp,
  };
}

/**
 * Compose an FTP re-anchor with a pacing-slider bias into one pacing
 * multiplier, WITHOUT compounding them multiplicatively.
 *
 * An FTP change re-anchors the sustainable pacing target to the new
 * threshold (`ftpScale = newFtp / baselineFtp`); the slider then biases
 * *around* that anchor. Treating both as fractional offsets that ADD keeps
 * the moves independent:
 *
 *   multiplier = ftpScale + (clamp(slider) − 1)
 *
 * So +10% FTP with a +10% slider gives 1.10 + 0.10 = 1.20 — the two effects
 * add, rather than multiplying to 1.21. At a neutral slider (1.0) the result
 * is exactly `ftpScale` (pure re-anchor); with FTP unchanged it is exactly
 * `clamp(slider)` (pure slider). Floored at a small positive value so no
 * combination can invert the pacing target.
 */
export function composePacingMultiplier(
  baselineFtp: number,
  newFtp: number,
  pacingSlider: number,
): number {
  const ftpScale = baselineFtp > 0 ? newFtp / baselineFtp : 1;
  const sliderBias = clamp(pacingSlider, 0.7, 1.15) - 1;
  return Math.max(0.1, ftpScale + sliderBias);
}

interface RunArgs {
  course: Course;
  rider: RiderProfile;
  environment: Environment;
  pacing: PacingPlan;
  scenarios: ScenarioDelta[];
}

/**
 * Run a baseline simulation and N scenario simulations; return per-scenario time deltas.
 * Each scenario applies optional patches to rider, environment, and pacing.
 *
 * Total time delta = scenario - baseline (negative = faster).
 * Per-segment time deltas always sum to total time delta (algebraic identity).
 */
export function runScenarioComparison(args: RunArgs): ScenarioResult[] {
  const baseline = simulateCourse({
    course: args.course,
    rider: args.rider,
    environment: args.environment,
    pacing: args.pacing,
  });

  return args.scenarios.map((scenario) => {
    const rider: RiderProfile = scenario.riderPatch
      ? { ...args.rider, ...scenario.riderPatch }
      : args.rider;
    const environment: Environment = scenario.environmentPatch
      ? { ...args.environment, ...scenario.environmentPatch }
      : args.environment;
    const pacing: PacingPlan = scenario.pacingPatch
      ? args.pacing.map((p) => p * scenario.pacingPatch!.multiplier)
      : args.pacing;

    const result = simulateCourse({
      course: args.course,
      rider,
      environment,
      pacing,
    });
    const segmentTimeDeltas = result.segmentResults.map(
      (r, i) => r.duration - baseline.segmentResults[i].duration,
    );
    return {
      name: scenario.name,
      totalTimeDelta: result.totalTime - baseline.totalTime,
      averageSpeedDelta: result.averageSpeed - baseline.averageSpeed,
      segmentTimeDeltas,
    };
  });
}
