"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Cohort 2 site-wide urgency banner.
 *
 * Renders a skinny strip above the header announcing the Cohort 2 deadline
 * and linking to /apply. Dismissible — dismissal persists in localStorage
 * so the banner does not reappear on every navigation for a user who's
 * already clicked through or opted out.
 *
 * Auto-hides:
 *  - on /apply (already there — no point nagging)
 *  - on /admin/* (noindex, internal)
 *  - after the deadline has passed (COHORT_DEADLINE below)
 *
 * Update COHORT_DEADLINE below to re-enable for subsequent cohorts.
 */

/** UTC midnight at end of Friday 17 April 2026 (Europe/Dublin is UTC+1 in April). */
const COHORT_DEADLINE = new Date("2026-04-17T23:00:00Z");
const DISMISS_KEY = "cohort-banner-dismissed-v1";

const HIDE_ON_PATH_PREFIXES = ["/apply", "/admin"];

function shouldHidePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDE_ON_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

function formatDeadline(ms: number): string {
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
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      /* localStorage unavailable — ignore */
    }
    const update = () => setMsLeft(COHORT_DEADLINE.getTime() - Date.now());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  // Expose banner height to the rest of the layout (Header + first section
  // top padding) via a CSS variable on <html>. Cleared when banner hides.
  useEffect(() => {
    const root = document.documentElement;
    const hidden = dismissed || shouldHidePath(pathname) || (msLeft !== null && msLeft <= 0);
    if (hidden) {
      root.style.setProperty("--cohort-banner-height", "0px");
    } else {
      // mobile smaller than desktop — use CSS min()/max() in consumers if needed
      root.style.setProperty("--cohort-banner-height", "40px");
    }
    return () => {
      root.style.setProperty("--cohort-banner-height", "0px");
    };
  }, [dismissed, pathname, msLeft]);

  if (shouldHidePath(pathname)) return null;
  if (dismissed) return null;
  // Before hydration msLeft is null — render optimistically from static
  // deadline so SSR + first paint show the banner.
  const remaining = msLeft ?? COHORT_DEADLINE.getTime() - Date.now();
  if (remaining <= 0) return null;

  const countdown = formatDeadline(remaining);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
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
            COHORT 2 IS OPEN
          </span>
          <span className="text-xs opacity-80 font-body truncate">
            <span className="hidden sm:inline">30 places · 7-day free trial · </span>
            {countdown}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/apply"
            className="font-heading text-xs sm:text-sm tracking-wider bg-off-white text-coral px-3 sm:px-4 py-1.5 rounded-md hover:bg-off-white/90 transition-colors"
          >
            APPLY <span aria-hidden="true">→</span>
          </Link>
          <button
            type="button"
            aria-label="Dismiss Cohort 2 banner"
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
