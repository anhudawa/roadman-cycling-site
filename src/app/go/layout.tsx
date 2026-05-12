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
    absolute: "Stuck on a Plateau? Find Out Why in 4 Minutes — Roadman Cycling",
  },
  description:
    "Your FTP is stuck. Your training isn't working. Twelve questions, four minutes, a specific answer for why you've stopped getting faster.",
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
