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

const CohortBanner = dynamic(
  () =>
    import("@/components/features/conversion/CohortBanner").then(
      (mod) => mod.CohortBanner,
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
  const pathname = usePathname();
  if (isLeanRoute(pathname)) return null;
  return (
    <>
      <SmoothCursorWrapper />
      <CohortBanner />
      <MobileStickyApply />
      <LazyExitIntent />
    </>
  );
}
