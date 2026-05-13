import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

/**
 * Layout for the /go PPC landing surface.
 *
 * The page inherits the root layout (fonts, analytics, podcast player
 * provider, cookie consent) but renders no shared chrome of its own —
 * no Header, no Footer, no mini-player (path-suppressed in
 * MiniPlayer.tsx), no shared exit-intent / cohort banner / mobile
 * sticky apply (path-suppressed in ConversionChrome.tsx). The /go
 * page mounts its own dedicated `GoExitIntent` popup directly inside
 * page.tsx — see the file header there for the rationale.
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
  alternates: {
    canonical: "https://roadmancycling.com/go",
  },
  openGraph: {
    type: "website",
    title: "Stuck on a Plateau? Find Out Why in 4 Minutes",
    description:
      "Twelve questions, four minutes, a specific diagnosis for why your FTP has stalled.",
    url: "https://roadmancycling.com/go",
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

export default function GoLayout({ children }: { children: ReactNode }) {
  return children;
}
