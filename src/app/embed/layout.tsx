import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

/**
 * Layout for the public embeddable widget routes.
 *
 * The iframe-friendly calculators at /embed/<tool> are designed to be
 * dropped onto third-party sites. They inherit the root layout (fonts,
 * analytics, podcast player provider) but the global ConversionChrome,
 * cookie banner, and mini player are all path-suppressed for /embed —
 * see ConversionChrome.tsx, CookieConsent.tsx, MiniPlayer.tsx.
 *
 * Setting `robots: noindex` here prevents the bare embed pages from
 * competing with the canonical /tools/<name> pages in search.
 */

export const metadata: Metadata = {
  title: {
    absolute: "Roadman Cycling — Embeddable Widgets",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#210140",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return children;
}
