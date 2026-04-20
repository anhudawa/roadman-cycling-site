"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCohortState, type CohortPhase } from "@/lib/cohort";

/**
 * Site-wide cohort banner. Driven entirely by src/lib/cohort.ts — to
 * change copy, deadlines, or flip from "open" → "waitlist", edit the
 * state lib, not this component.
 *
 * Renders differently per phase:
 *   open           — "COHORT N IS OPEN" · countdown · APPLY
 *   closing-today  — "FINAL HOURS" · urgent copy · APPLY
 *   waitlist       — "COHORT N+1 COMING SOON" · 24h early access · APPLY NOW
 *
 * Dismissible — dismissal persists in localStorage per-phase, so
 * dismissing an "open" banner doesn't hide the subsequent "waitlist"
 * banner when the site flips between phases.
 *
 * Auto-hides:
 *  - on /apply (already there)
 *  - on /admin/*
 */

const HIDE_ON_PATH_PREFIXES = ["/apply", "/admin"];

function shouldHidePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDE_ON_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

function dismissKeyFor(phase: CohortPhase, cohort: number): string {
  return `cohort-banner-dismissed-${cohort}-${phase}-v1`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} left`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"} left`;
  const mins = Math.max(1, Math.floor(ms / (1000 * 60)));
  return `${mins} min${mins === 1 ? "" : "s"} left`;
}

export function CohortBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  /** Minute-resolution tick — triggers state re-evaluation + countdown refresh. */
  const [tick, setTick] = useState(0);

  const state = getCohortState(new Date(Date.now() + tick * 0)); // tick just forces re-render

  useEffect(() => {
    // Pick up any prior dismissal for this phase + cohort
    try {
      const key = dismissKeyFor(state.phase, state.currentCohort);
      if (localStorage.getItem(key) === "1") setDismissed(true);
    } catch {
      /* ignore */
    }
    // Re-tick every minute so countdown updates and phase flips get picked up
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [state.phase, state.currentCohort]);

  const hidden = dismissed || shouldHidePath(pathname);

  // CSS variable for Header top offset. Kept in sync with visible state.
  useEffect(() => {
    const root = document.documentElement;
    if (hidden) {
      root.style.setProperty("--cohort-banner-height", "0px");
    } else {
      root.style.setProperty("--cohort-banner-height", "40px");
    }
    return () => {
      root.style.setProperty("--cohort-banner-height", "0px");
    };
  }, [hidden]);

  if (hidden) return null;

  const countdown = state.deadline
    ? formatCountdown(state.deadline.getTime() - Date.now())
    : "";

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(dismissKeyFor(state.phase, state.currentCohort), "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bg-coral text-off-white h-10 flex items-center"
      style={{ zIndex: 60 }}
    >
      <div className="mx-auto max-w-[1400px] px-4 w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-heading text-xs sm:text-sm tracking-wider shrink-0">
            {state.banner.eyebrow}
          </span>
          <span className="text-xs opacity-80 font-body truncate">
            <span className="hidden sm:inline">{state.banner.detail}</span>
            {countdown && (
              <>
                <span className="hidden sm:inline"> · </span>
                {countdown}
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={state.banner.ctaHref}
            className="font-heading text-xs sm:text-sm tracking-wider bg-off-white text-coral px-3 sm:px-4 py-1.5 rounded-md hover:bg-off-white/90 transition-colors whitespace-nowrap"
          >
            {state.banner.cta} <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            aria-label="Dismiss cohort banner"
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
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
        </div>
      </div>
    </div>
  );
}
