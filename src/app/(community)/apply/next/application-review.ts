export const APPLICATION_REVIEW_STEPS = [
  "Processing your application",
  "Assessing your suitability for the programme",
  "Checking available places",
  "Reviewing your start date",
] as const;

export const APPLICATION_REVIEW_STEP_MS = 2_000;

export const APPLICATION_REVIEW_HAPTIC_MS = 12;
export const APPLICATION_DECISION_HAPTIC_PATTERN = [24, 48, 36] as const;

export function triggerApplicationHaptic(pattern: number | readonly number[]) {
  if (typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches) return false;
  if (typeof window.navigator.vibrate !== "function") return false;
  return window.navigator.vibrate(typeof pattern === "number" ? pattern : [...pattern]);
}
