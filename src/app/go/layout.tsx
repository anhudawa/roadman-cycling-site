import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

/**
 * Layout for the /go PPC landing surface.
 *
 * The page inherits the root layout (fonts, analytics, podcast player
 * provider, cookie consent) but renders no shared chrome of its own —
 * no Header, no Footer, no mini-player (path-suppressed in
 * MiniPlayer.tsx), no exit-intent / cohort banner / mobile sticky
 * apply (path-suppressed in ConversionChrome.tsx).
 *
 * `robots: noindex` keeps the bare ad surface out of organic search
 * so it can't dilute or compete with /plateau, which is the canonical
 * diagnostic landing page for organic traffic.
 */

export const metadata: Metadata = {
  title: {
    absolute:
      "Before You Hire a Cycling Coach — Diagnose Why Your FTP Is Stuck",
  },
  description:
    "Considering a cycling coach or another training plan? In four minutes, find out why your FTP has actually stalled — and whether you need a coach, a new plan, or three specific changes you can make this week.",
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
  viewportFit: "cover",
};

export default function GoLayout({ children }: { children: ReactNode }) {
  return children;
}
