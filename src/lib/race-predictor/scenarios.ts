// What-if scenario comparison engine. Drives the Time Analysis sliders.

import type {
  Course,
  Environment,
  PacingPlan,
  RiderProfile,
  ScenarioDelta,
  ScenarioResult,
} from './types';
import { simulateCourse } from './engine';

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
