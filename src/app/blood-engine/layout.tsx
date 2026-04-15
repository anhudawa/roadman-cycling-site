import type { Metadata } from "next";

/**
 * Root Blood Engine layout — intentionally minimal.
 *
 * Actual page chrome lives in the two nested group layouts:
 *   - (public)/layout.tsx → main Roadman Header + Footer, shown on the
 *     waiting-list landing, markers reference, login, checkout-success
 *   - (members)/layout.tsx → MembersHeader, shown once signed in
 *
 * Site-wide metadata defaults live here.
 */
export const metadata: Metadata = {
  title: {
    default: "Blood Engine — Decode your bloodwork like a pro cyclist",
    template: "%s | Blood Engine",
  },
  description:
    "Cycling-specific bloodwork interpretation for masters cyclists. Upload your results, get a report tuned to athlete-optimal ranges — not generic lab norms.",
  alternates: { canonical: "https://roadmancycling.com/blood-engine" },
  openGraph: {
    title: "Blood Engine — Decode your bloodwork like a pro cyclist",
    description:
      "Cycling-specific bloodwork interpretation for masters cyclists. Athlete-optimal ranges, not generic lab norms.",
    type: "website",
    url: "https://roadmancycling.com/blood-engine",
    siteName: "Roadman Cycling",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blood Engine — Decode your bloodwork like a pro cyclist",
    description:
      "Cycling-specific bloodwork interpretation for masters cyclists. Athlete-optimal ranges, not generic lab norms.",
  },
};

export default function BloodEngineRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
