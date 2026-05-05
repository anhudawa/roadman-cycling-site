"use client";

import { useEffect } from "react";
import {
  PAID_REPORT_EVENTS,
  trackPaidReport,
} from "@/lib/analytics/paid-report-events";

interface CheckoutSuccessTrackerProps {
  predictionSlug: string;
  sessionId?: string;
}

export function CheckoutSuccessTracker({
  predictionSlug,
  sessionId,
}: CheckoutSuccessTrackerProps) {
  useEffect(() => {
    trackPaidReport({
      name: PAID_REPORT_EVENTS.CHECKOUT_SUCCESS,
      productSlug: "report_race",
      toolResultSlug: predictionSlug,
      meta: {
        prediction_slug: predictionSlug,
        stripe_session_present: Boolean(sessionId),
      },
    });
  }, [predictionSlug, sessionId]);

  return null;
}
