"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(
  () =>
    import("@/components/features/consent/CookieConsent").then(
      (mod) => mod.CookieConsent
    ),
  { ssr: false }
);

export function LazyCookieConsent() {
  return <CookieConsent />;
}
