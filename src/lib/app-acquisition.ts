export const APP_ACQUISITION_SOURCES = new Set([
  "active-recovery-guide",
  "best-cycling-apps-structured-training",
  "best-cycling-recovery-apps",
  "best-cycling-strength-training-apps",
  "best-cycling-training-apps",
  "derek-teel-exercises",
  "gym-exercises",
  "masters-hub",
  "recovery-guide",
  "recovery-hub",
  "recovery-screen",
  "strength-guide",
  "strength-hub",
  "strength-plan",
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
