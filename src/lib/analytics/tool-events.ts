/**
 * Typed tool analytics wrapper.
 *
 * Mirrors ask-events.ts $— every tool-related event funnels through
 * here so names stay consistent across plateau / fuelling / ftp-zones
 * and the `meta` payloads are documented in one place. Fire-and-forget.
 */

import { trackAnalyticsEvent } from "./client";
import type { ToolSlug } from "@/lib/tool-results/types";

export const TOOL_EVENTS = {
  STARTED: "tool_started",
  STEP_ADVANCED: "tool_step_advanced",
  COMPLETED: "tool_completed",
  DIAGNOSTIC_SAVED: "diagnostic_saved",
  EMAIL_CAPTURED: "email_captured",
  RESULT_EMAILED: "result_emailed",
  RESULT_VIEWED: "result_viewed",
  HISTORY_VIEWED: "history_viewed",
  DIAGNOSTIC_TO_AI_HANDOFF: "diagnostic_to_ai_handoff",
  ERROR_SHOWN: "tool_error_shown",
} as const;

export type ToolEventName = (typeof TOOL_EVENTS)[keyof typeof TOOL_EVENTS];

export interface TrackToolInput {
  name: ToolEventName;
  tool: ToolSlug;
  /** tool_result slug once the row exists */
  resultSlug?: string;
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

export function trackTool(input: TrackToolInput): void {
  const meta = stringifyMeta({
    tool: input.tool,
    result_slug: input.resultSlug,
    ...input.meta,
  });
  trackAnalyticsEvent({
    type: input.name,
    page: typeof window !== "undefined" ? window.location.pathname : `/tools/${input.tool}`,
    meta,
  });
}
