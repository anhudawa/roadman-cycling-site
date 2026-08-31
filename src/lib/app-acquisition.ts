export const APP_ACQUISITION_SOURCES = new Set([
  "active-recovery-guide",
  "beginner-strength-plan",
  "best-cycling-apps-structured-training",
  "best-cycling-recovery-apps",
  "best-cycling-strength-training-apps",
  "best-cycling-training-apps",
  "core-progressions",
  "core-workout",
  "derek-teel-exercises",
  "fatigue-guide",
  "gym-exercises",
  "glute-guide",
  "hrv-guide",
  "magnesium-guide",
  "masters-hub",
  "mobility-guide",
  "off-season-strength",
  "recovery-guide",
  "recovery-hub",
  "recovery-nutrition",
  "recovery-screen",
  "recovery-week",
  "rest-day-guide",
  "rhr-guide",
  "sleep-guide",
  "strength-guide",
  "strength-hub",
  "strength-plan",
  "strength-over-50-guide",
  "strength-session-planner",
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
