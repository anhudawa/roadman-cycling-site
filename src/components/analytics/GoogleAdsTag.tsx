"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = "AW-18123737652";
const STORAGE_KEY = "roadman_cookie_consent";

function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const preferences = JSON.parse(stored) as { marketing?: boolean };
    return preferences.marketing === true;
  } catch {
    return false;
  }
}

export function GoogleAdsTag() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (hasMarketingConsent()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- consent is read after hydration
      setEnabled(true);
    }

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ marketing?: boolean }>).detail;
      setEnabled(detail?.marketing === true);
    };

    window.addEventListener("consent-updated", onConsentUpdated);
    return () =>
      window.removeEventListener("consent-updated", onConsentUpdated);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        id="gtag-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script
        id="gtag-config"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }}
      />
    </>
  );
}
