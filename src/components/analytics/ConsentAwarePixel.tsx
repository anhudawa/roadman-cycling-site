"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const STORAGE_KEY = "roadman_cookie_consent";
const PIXEL_ID = "649389789190949";

function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const prefs = JSON.parse(stored);
    return prefs.marketing === true;
  } catch {
    return false;
  }
}

export function ConsentAwarePixel() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check on mount
    if (hasMarketingConsent()) {
      setEnabled(true);
    }

    // Listen for consent changes mid-session
    function onConsentUpdated(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.marketing) {
        setEnabled(true);
      } else {
        setEnabled(false);
      }
    }

    window.addEventListener("consent-updated", onConsentUpdated);
    return () => window.removeEventListener("consent-updated", onConsentUpdated);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
