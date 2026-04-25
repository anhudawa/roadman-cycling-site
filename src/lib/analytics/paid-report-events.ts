/**
 * Typed wrapper for paid-report analytics.
 *
 * Mirrors tool-events.ts / ask-events.ts so every paid-report touch
 * point fires a consistently named event with the same meta shape.
 * Two entry points:
 *
 *  - `trackPaidReport` runs in the browser (client components and
 *    the global `data-track` dispatcher).
 *  - `recordPaidReportServerEvent` runs in route handlers + the
 *    generator so webhook-driven state transitions show up in the
 *    same event stream the marketing team already queries.
 */

import { trackAnalyticsEvent } from "./client";
import { recordEvent } from "@/lib/admin/events-store";

export const PAID_REPORT_EVENTS = {
  CHECKOUT_START: "paid_report_checkout_start",
  CHECKOUT_SUCCESS: "paid_report_checkout_success",
  GENERATED: "paid_report_generated",
  DELIVERED: "paid_report_delivered",
  FAILED: "paid_report_failed",
  DOWNLOADED: "paid_report_downloaded",
  VIEWED: "paid_report_viewed",
  ASK_HANDOFF: "paid_report_ask_handoff",
  UPSELL_VIEW: "tool_result_upsell_view",
  TOOL_ASK_HANDOFF: "tool_result_ask_handoff",
} as const;

export type PaidReportEventName =
  (typeof PAID_REPORT_EVENTS)[keyof typeof PAID_REPORT_EVENTS];

export interface TrackPaidReportInput {
  name: PaidReportEventName;
  productSlug?: string;
  reportId?: number;
  orderId?: number;
  toolResultSlug?: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
}

function stringifyMeta(
  input: TrackPaidReportInput,
): Record<string, string> | undefined {
  const merged: Record<string, string | number | boolean | null | undefined> = {
    product_slug: input.productSlug,
    report_id: input.reportId,
    order_id: input.orderId,
    tool_result_slug: input.toolResultSlug,
    ...input.meta,
  };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v == null) continue;
    out[k] = typeof v === "string" ? v : String(v);
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Browser-side dispatcher. No-ops in SSR so it's safe to call from a
 * hook without a `typeof window` guard.
 */
export function trackPaidReport(input: TrackPaidReportInput): void {
  trackAnalyticsEvent({
    type: input.name,
    page:
      typeof window !== "undefined"
        ? window.location.pathname
        : `/reports/${input.productSlug ?? "unknown"}`,
    meta: stringifyMeta(input),
  });
}

/**
 * Server-side recorder. Safe to call from webhook handlers + the
 * generator — wraps `recordEvent` and swallows errors so analytics
 * writes never block a paid-report state transition.
 */
export async function recordPaidReportServerEvent(
  input: TrackPaidReportInput & { page: string; email?: string | null },
): Promise<void> {
  try {
    await recordEvent(input.name, input.page, {
      email: input.email ?? undefined,
      meta: stringifyMeta(input),
    });
  } catch (err) {
    console.error("[paid-report-events] recordEvent failed:", err);
  }
}
