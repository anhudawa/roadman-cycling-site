"use client";

import { useEffect, useState, type ComponentType } from "react";
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
  // Self-contained affiliate discovery surface. Exit-intent and sticky
  // coaching CTAs compete with product comparison and retailer actions.
  "/recommends",
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
  // Authenticated/admin and self-contained product areas do not use the
  // public acquisition overlays.
  "/admin",
  "/method",
];

export function isLeanRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return LEAN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

export function isApplicationRoute(pathname: string | null): boolean {
  return pathname === "/apply" || pathname?.startsWith("/apply/") === true;
}

export function isBannerlessRoute(pathname: string | null): boolean {
  if (!pathname) return true;
  if (isLeanRoute(pathname) || isApplicationRoute(pathname)) return true;
  return (
    pathname === "/inner-circle" || pathname.startsWith("/inner-circle/")
  );
}

export function ConversionChrome() {
  const pathname = usePathname();
  const [loaded, setLoaded] = useState<{
    variant: "home" | "full";
    Component: ComponentType;
  } | null>(null);

  const applicationRoute = isApplicationRoute(pathname);
  const skipChrome = isLeanRoute(pathname) || applicationRoute;
  const variant = pathname === "/" ? "home" : "full";
  const canLoad = Boolean(pathname) && !skipChrome;

  useEffect(() => {
    if (!canLoad) return;

    let active = true;
    const componentPromise =
      variant === "home"
        ? import("@/components/features/conversion/MobileStickyApply").then(
            (mod) => mod.MobileStickyApply,
          )
        : import("./FullConversionChrome").then(
            (mod) => mod.FullConversionChrome,
          );

    componentPromise
      .then((Component) => {
        if (active) setLoaded({ variant, Component });
      })
      .catch(() => {
        // Optional conversion chrome must never take down a page.
      });
    return () => {
      active = false;
    };
  }, [canLoad, variant]);

  if (isLeanRoute(pathname)) return null;
  if (skipChrome || !pathname || loaded?.variant !== variant) return null;

  const LoadedChrome = loaded.Component;
  return <LoadedChrome />;
}
