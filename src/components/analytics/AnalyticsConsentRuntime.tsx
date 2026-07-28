"use client";

import { ConsentAwareVercelAnalytics } from "./ConsentAwareVercelAnalytics";
import { Tracker } from "./Tracker";
import { WebVitalsReporter } from "./WebVitalsReporter";

export function AnalyticsConsentRuntime() {
  return (
    <>
      <Tracker />
      <WebVitalsReporter />
      <ConsentAwareVercelAnalytics />
    </>
  );
}
