/**
 * The analysis pipeline: raw activities + rider settings in, everything the
 * dashboard renders out. Pure and deterministic — same inputs, same
 * analysis, every time.
 */

import { classifyPurpose } from "./classify";
import { scoreExecution } from "./execution";
import { buildLoadSeries, computeRideLoad } from "./load";
import { buildWeekPlan } from "./plan";
import { buildFitnessProfile } from "./profile";
import { buildRaceRecipe } from "./recipe";
import type {
  Activity,
  AnalyzedActivity,
  RideZonesAnalysis,
  RiderSettings,
} from "./types";

export function analyzeActivities(
  activities: Activity[],
  settings: RiderSettings
): AnalyzedActivity[] {
  return [...activities]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((activity) => {
      const load = computeRideLoad(activity, settings);
      const purpose = classifyPurpose(activity, load.intensityFactor);
      return {
        ...activity,
        tss: load.tss,
        intensityFactor: load.intensityFactor,
        loadSource: load.loadSource,
        purpose,
        execution: scoreExecution(activity, purpose, load.intensityFactor),
      };
    });
}

export function buildAnalysis(
  activities: Activity[],
  settings: RiderSettings,
  asOf: string
): RideZonesAnalysis {
  const analyzed = analyzeActivities(activities, settings);
  const load = buildLoadSeries(analyzed, asOf);
  const profile = buildFitnessProfile(analyzed, load, settings, asOf);
  const recipe = buildRaceRecipe(analyzed, load, asOf);
  const currentTsb = load.length > 0 ? load[load.length - 1].tsb : 0;
  const plan = buildWeekPlan(settings, profile.focus.system, currentTsb);

  return { settings, activities: analyzed, load, profile, recipe, plan, asOf };
}
