"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

const STORAGE_KEY = "roadman_cookie_consent";

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (
      !!stored &&
      (JSON.parse(stored) as { analytics?: boolean }).analytics === true
    );
  } catch {
    return false;
  }
}

export function ConsentAwareVercelAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (hasAnalyticsConsent()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- consent is read after hydration
      setEnabled(true);
    }

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ analytics?: boolean }>).detail;
      setEnabled(detail?.analytics === true);
    };

    window.addEventListener("consent-updated", onConsentUpdated);
    return () =>
      window.removeEventListener("consent-updated", onConsentUpdated);
  }, []);

  return enabled ? (
    <Analytics
      beforeSend={(event) => (hasAnalyticsConsent() ? event : null)}
    />
  ) : null;
}
