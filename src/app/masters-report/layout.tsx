import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

/**
 * Layout for the /masters-report squeeze page.
 *
 * Funnel surface — inherits root layout (fonts, analytics, podcast
 * player provider, cookie consent) but renders no shared chrome of its
 * own. The page.tsx draws its own minimal logo + footer. `robots:
 * noindex` so the squeeze surface can't compete with the canonical
 * report URL (/blog/masters-cycling-training-report-2026) in organic
 * search.
 */

const REPORT_URL = "https://roadmancycling.com/masters-report";

export const metadata: Metadata = {
  title: {
    absolute:
      "The Masters Cycling Training Report 2026 — Free 18-Section Guide",
  },
  description:
    "The 2026 reference for training as a masters cyclist. 18 sections, 40+ citations, 5 case studies, a 12-week block. Drop your email — opens straight to the report.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: REPORT_URL,
  },
  openGraph: {
    type: "website",
    title:
      "The Masters Cycling Training Report 2026",
    description:
      "18 sections. 40+ citations. The training that holds up after 40.",
    url: REPORT_URL,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Masters Cycling Training Report 2026",
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

export default function MastersReportLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
