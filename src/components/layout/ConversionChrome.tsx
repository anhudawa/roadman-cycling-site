"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

/**
 * Public tool routes that should ship the leanest possible JS — no
 * conversion-funnel chrome, no exit-intent, no PWA install prompt, no
 * smooth cursor. The user lands here to use a calculator/predictor/QA
 * assistant; the funnel components on top of that are pure overhead.
 *
 * Marketing/content routes still get the full chrome because the
 * conversion-to-coaching value of that surface is the point.
 */
const LEAN_PATH_PREFIXES = [
  "/predict",
  "/ask",
  "/tools",
  // Public embeddable widgets rendered inside third-party iframes —
  // exit-intent / cohort banner / sticky-apply CTAs do not belong here.
  "/embed",
  // PPC landing pages: single-CTA, zero-distraction surface for paid
  // ad traffic. Funnel chrome would compete with the primary CTA and
  // tank conversion. The page itself drives users to /plateau where
  // the full conversion machinery lives.
  "/go",
  // Lead-magnet squeeze page for the Masters Cycling Training Report.
  // Same single-purpose rationale as /go — the form is the page.
  "/masters-report",
  // Fantasy Tour: immersive game surface with its own chrome and its
  // own email gate. Exit-intent and cohort banners would fight the
  // team-builder flow (and the daily-email deep links land here).
  "/fantasy",
];

function isLeanRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return LEAN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

const SmoothCursorWrapper = dynamic(
  () =>
    import("@/components/ui/SmoothCursorWrapper").then(
      (mod) => mod.SmoothCursorWrapper,
    ),
  { ssr: false },
);

// Single top-banner slot. BannerStack renders the yellow Tour banner during
// the Tour window and the cohort apply banner otherwise — ssr:false so the
// date-driven choice never causes a hydration mismatch.
const BannerStack = dynamic(
  () =>
    import("@/components/features/tour/BannerStack").then(
      (mod) => mod.BannerStack,
    ),
  { ssr: false },
);

const MobileStickyApply = dynamic(
  () =>
    import("@/components/features/conversion/MobileStickyApply").then(
      (mod) => mod.MobileStickyApply,
    ),
  { ssr: false },
);

const LazyExitIntent = dynamic(
  () =>
    import("@/components/features/conversion/LazyExitIntent").then(
      (mod) => mod.LazyExitIntent,
    ),
  { ssr: false },
);

export function ConversionChrome() {
  // Tour overlay: BannerStack occupies the top banner slot (Tour banner vs
  // cohort apply banner) — see BannerStack.tsx.
  const pathname = usePathname();
  if (isLeanRoute(pathname)) return null;
  return (
    <>
      <SmoothCursorWrapper />
      <BannerStack />
      <MobileStickyApply />
      <LazyExitIntent />
    </>
  );
}
