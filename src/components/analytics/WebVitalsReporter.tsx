"use client";

import { useReportWebVitals } from "next/web-vitals";

function sendVital(metric: Parameters<Parameters<typeof useReportWebVitals>[0]>[0]) {
  const body = JSON.stringify({
    type: "web_vital",
    page: window.location.pathname,
    meta: {
      metric_name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta),
      id: metric.id,
      navigationType: metric.navigationType,
    },
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
  }
}

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
       
      console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(1)} (${metric.rating ?? "n/a"})`);
      return;
    }
    sendVital(metric);
  });
  return null;
}
