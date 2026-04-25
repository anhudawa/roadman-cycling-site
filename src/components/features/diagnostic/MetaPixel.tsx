"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Lightweight Meta (Facebook) Pixel loader. Drops the standard fbq
 * snippet and fires a PageView on mount. When an `event` prop is
 * passed, fires that standard event in addition to PageView $€” used on
 * the results page to emit a `Lead` conversion.
 *
 * Completely no-op when `NEXT_PUBLIC_META_PIXEL_ID` isn't set, so this
 * is safe to drop into pages without guarding at every call site.
 *
 * Server-side (Conversions API) deduplication isn't wired yet $€” when
 * Anthony plugs in the CAPI token, make sure server and client events
 * share the same `eventID` per Meta's dedup rules.
 */
export function MetaPixel({
  event,
  eventParams,
}: {
  event?: "Lead" | "CompleteRegistration" | "ViewContent";
  eventParams?: Record<string, string | number | boolean>;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

  useEffect(() => {
    if (!pixelId) return;
    if (typeof window === "undefined") return;
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void })
      .fbq;
    if (!fbq) return;
    fbq("track", "PageView");
    if (event) fbq("track", event, eventParams ?? {});
  }, [pixelId, event, eventParams]);

  if (!pixelId) return null;

  const snippet = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');`;

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {snippet}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
