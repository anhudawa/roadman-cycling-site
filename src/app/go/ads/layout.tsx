import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

/**
 * Layout for the /go/ads landing surface.
 *
 * Sister page to /go, but tuned specifically for paid Google Ads
 * traffic. The site Header, Footer, mini-player and ConversionChrome
 * are already path-suppressed under /go/* via the suppression lists in
 * those components, so this layout — like /go — renders no chrome.
 *
 * Differences from /go:
 *  - No A/B variant cookie / no headline split. Ads traffic gets a
 *    single, fixed message so creative-side learnings stay clean.
 *  - No `<a>` links to external sites or to other site routes. The
 *    only link is the single CTA → /plateau?source=ads. Zero escape
 *    hatches, by design.
 *  - No legal footer. Privacy/terms aren't required on the ad
 *    landing surface itself — they're a click away on /plateau.
 *
 * `robots: noindex` keeps this off Google's organic index so it
 * doesn't compete with /plateau or /go.
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
  alternates: {
    canonical: "https://roadmancycling.com/go/ads",
  },
  openGraph: {
    type: "website",
    title: "Stuck on a Plateau? Find Out Why in 4 Minutes",
    description:
      "Twelve questions, four minutes, a specific diagnosis for why your FTP has stalled.",
    url: "https://roadmancycling.com/go/ads",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Roadman Cycling diagnostic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#210140",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function GoAdsLayout({ children }: { children: ReactNode }) {
  return children;
}
