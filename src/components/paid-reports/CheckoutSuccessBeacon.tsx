"use client";

import { useEffect } from "react";
import {
  PAID_REPORT_EVENTS,
  trackPaidReport,
} from "@/lib/analytics/paid-report-events";

/**
 * One-shot client beacon fired on the Stripe success landing. Uses
 * the typed paid-report wrapper so the event shape matches what the
 * webhook already records server-side $— letting admin dedupe / cross-
 * reference browser vs webhook timing if delivery feels slow.
 */

interface Props {
  productSlug: string;
  sessionId?: string | null;
}

export function CheckoutSuccessBeacon({ productSlug, sessionId }: Props) {
  useEffect(() => {
    trackPaidReport({
      name: PAID_REPORT_EVENTS.CHECKOUT_SUCCESS,
      productSlug,
      meta: {
        stripe_session_id: sessionId ?? undefined,
      },
    });
  }, [productSlug, sessionId]);
  return null;
}
