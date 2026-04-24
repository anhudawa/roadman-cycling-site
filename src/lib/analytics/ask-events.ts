/**
 * Typed Ask Roadman analytics wrapper.
 *
 * Every Ask-related event funnels through here so the event names stay
 * consistent (no typos, no case drift) and the `meta` payloads are
 * documented in one place. Fire-and-forget, never throws.
 */

import { trackAnalyticsEvent } from "./client";

export const ASK_EVENTS = {
  SESSION_STARTED: "ask_session_started",
  QUESTION_SUBMITTED: "ask_question_submitted",
  INTENT_CLASSIFIED: "ask_intent_classified",
  RETRIEVAL_COMPLETED: "ask_retrieval_completed",
  ANSWER_STREAMED: "ask_answer_streamed",
  CITATION_SHOWN: "ask_citation_shown",
  CTA_SHOWN: "ask_cta_shown",
  CTA_CLICKED: "ask_cta_clicked",
  SAFETY_TRIGGERED: "ask_safety_triggered",
  MESSAGE_FLAGGED: "ask_message_flagged",
  FEEDBACK_SUBMITTED: "ask_feedback_submitted",
  PROFILE_SAVED: "ask_profile_saved",
  STARTER_PROMPT_CLICKED: "ask_starter_prompt_clicked",
  RATE_LIMITED: "ask_rate_limited",
  ERROR_SHOWN: "ask_error_shown",
  SEED_LOADED: "ask_seed_loaded",
} as const;

export type AskEventName = (typeof ASK_EVENTS)[keyof typeof ASK_EVENTS];

export interface TrackAskInput {
  name: AskEventName;
  sessionId?: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
}

function stringifyMeta(
  meta: Record<string, string | number | boolean | null | undefined> | undefined,
): Record<string, string> | undefined {
  if (!meta) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v == null) continue;
    out[k] = typeof v === "string" ? v : String(v);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function trackAsk(input: TrackAskInput): void {
  trackAnalyticsEvent({
    type: input.name,
    page: typeof window !== "undefined" ? window.location.pathname : "/ask",
    sessionId: input.sessionId,
    meta: stringifyMeta(input.meta),
  });
}
