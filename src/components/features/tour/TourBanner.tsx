"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getTourPhase,
  daysUntilStart,
  getTodayStage,
  getNextStage,
  isRestDay,
} from "@/lib/tour";

/**
 * Slim, yellow-accent Tour banner that sits in the same top slot as the
 * cohort apply banner (BannerStack picks one) and uses the same
 * `--cohort-banner-height` so the Header offset is unchanged.
 *
 * Copy is phase-driven:
 *   countdown → "Tour de France starts in X days"
 *   live      → today's stage (or rest-day / next-stage)
 *   fadeout   → relive the race
 *
 * Dismissible per-phase via localStorage, except on the homepage (matching
 * the cohort banner's non-dismissible homepage rule).
 */

const HIDE_ON_PATH_PREFIXES = ["/admin", "/method"];

function shouldHidePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDE_ON_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function bannerCopy(): { label: string; cta: string } | null {
  const phase = getTourPhase();
  if (phase === "countdown") {
    const d = daysUntilStart();
    return {
      label:
        d === 0
          ? "Tour de France starts tomorrow"
          : `Tour de France starts in ${d} day${d === 1 ? "" : "s"}`,
      cta: "Countdown & stages",
    };
  }
  if (phase === "live") {
    if (isRestDay()) {
      const next = getNextStage();
      return {
        label: next
          ? `Rest day · next up Stage ${next.number}: ${next.start} → ${next.finish}`
          : "Tour de France · rest day",
        cta: "Race hub",
      };
    }
    const today = getTodayStage();
    return {
      label: today
        ? `Stage ${today.number} today · ${today.start} → ${today.finish}`
        : "Tour de France · live now",
      cta: "Today's stage",
    };
  }
  if (phase === "fadeout") {
    return { label: "Tour de France — relive every stage", cta: "Race hub" };
  }
  return null;
}

export function TourBanner() {
  const pathname = usePathname();
  // Component is loaded ssr:false (via BannerStack → ConversionChrome), so
  // reading localStorage in the lazy initialiser is safe and avoids a
  // setState-in-effect.
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return (
        typeof window !== "undefined" &&
        localStorage.getItem("tour-banner-dismissed-v1") === "1"
      );
    } catch {
      return false;
    }
  });
  const [, setTick] = useState(0);

  // Minute tick so day-count / today's-stage / phase flips refresh.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const isHome = pathname === "/";
  const copy = bannerCopy();

  const hidden =
    !copy || shouldHidePath(pathname) || (dismissed && !isHome);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--cohort-banner-height", hidden ? "0px" : "44px");
    return () => {
      root.style.setProperty("--cohort-banner-height", "0px");
    };
  }, [hidden]);

  if (hidden || !copy) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("tour-banner-dismissed-v1", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-11 flex items-center bg-jersey-yellow text-charcoal"
      style={{ zIndex: 60, contain: "layout" }}
    >
      <div className="mx-auto max-w-[1400px] px-4 w-full flex items-center justify-between gap-3">
        <Link
          href="/tour-de-france"
          className="flex items-center gap-2 min-w-0 group"
          data-track="tour_banner_label"
        >
          <span className="font-heading text-xs sm:text-sm tracking-wider shrink-0">
            🇫🇷 TOUR DE FRANCE
          </span>
          <span className="text-[11px] sm:text-xs font-body truncate opacity-90 group-hover:opacity-100">
            {copy.label}
          </span>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/tour-de-france"
            className="font-heading text-xs sm:text-sm tracking-wider bg-charcoal text-jersey-yellow px-3 sm:px-4 min-h-[36px] flex items-center rounded-md hover:bg-deep-purple transition-colors whitespace-nowrap"
            data-track="tour_banner_cta"
          >
            {copy.cta} <span aria-hidden="true">→</span>
          </Link>
          {!isHome && (
            <button
              type="button"
              aria-label="Dismiss Tour de France banner"
              onClick={handleDismiss}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-black/10 transition-colors"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
