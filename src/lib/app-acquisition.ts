export const APP_ACQUISITION_SOURCES = new Set([
  "active-recovery-guide",
  "autonomic-recovery-guide",
  "between-sessions-guide",
  "beginner-strength-plan",
  "blood-testing-guide",
  "best-cycling-apps-structured-training",
  "best-cycling-recovery-apps",
  "best-cycling-strength-training-apps",
  "best-cycling-training-apps",
  "core-progressions",
  "core-workout",
  "cold-water-guide",
  "cortisol-guide",
  "creatine-guide",
  "derek-teel-exercises",
  "energy-availability-estimate",
  "fatigue-guide",
  "foam-rolling-guide",
  "gym-exercises",
  "glute-guide",
  "hrv-guide",
  "iron-guide",
  "magnesium-guide",
  "massage-gun-guide",
  "masters-hub",
  "masters-app",
  "masters-hormones-guide",
  "mobility-guide",
  "off-season-strength",
  "overreaching-guide",
  "overtraining-recovery-guide",
  "persistent-fatigue-guide",
  "recovery-guide",
  "recovery-hub",
  "recovery-nutrition",
  "recovery-screen",
  "recovery-week",
  "reds-guide",
  "rest-day-guide",
  "rhr-guide",
  "sleep-guide",
  "strength-guide",
  "strength-hub",
  "strength-plan",
  "strength-over-50-guide",
  "strength-session-planner",
  "tart-cherry-guide",
  "testosterone-guide",
  "thyroid-guide",
  "time-crunched-guide",
  "training-readiness",
]);

export type AppWaitlistPlacement = "hero" | "bottom";

export function normaliseAppAcquisitionSource(
  value: string | string[] | null | undefined,
): string | null {
  const source = Array.isArray(value) ? value[0] : value;
  return source && APP_ACQUISITION_SOURCES.has(source) ? source : null;
}

export function buildAppWaitlistSource(
  acquisitionSource: string | string[] | null | undefined,
  placement: AppWaitlistPlacement,
): string {
  const source = normaliseAppAcquisitionSource(acquisitionSource);
  return source
    ? `roadman-app-waitlist-${source}-${placement}`
    : `roadman-app-waitlist-${placement}`;
}
