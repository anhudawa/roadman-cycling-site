// The decision shown on /apply/next comes from the server, never from a timer.
// REVIEWED mode: /api/cohort/application-status resolves the emailed access
// token against the application's pipeline stage, and the page shows the offer
// only when a human has approved it.
export type ApplicationDecision = "approved" | "pending" | "invalid";
export type ApplicationDecisionView = ApplicationDecision | "checking";

export const APPLICATION_CHECKING_MESSAGE = "Checking your application";

export const APPLICATION_DECISION_HAPTIC_PATTERN = [24, 48, 36] as const;

/**
 * Narrow an untrusted API payload to a decision. Anything unrecognised — an
 * error page, a truncated body, a proxy's response — resolves to "pending" so
 * no offer is ever shown on a response we did not understand.
 */
export function readApplicationDecision(value: unknown): ApplicationDecision {
  if (value === "approved" || value === "invalid") return value;
  return "pending";
}

export function triggerApplicationHaptic(pattern: number | readonly number[]) {
  if (typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches) return false;
  if (typeof window.navigator.vibrate !== "function") return false;
  return window.navigator.vibrate(typeof pattern === "number" ? pattern : [...pattern]);
}
