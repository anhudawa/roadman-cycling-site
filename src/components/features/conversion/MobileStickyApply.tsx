"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCohortState } from "@/lib/cohort";

/**
 * Mobile-only sticky APPLY bar that pins to the bottom of the viewport on
 * revenue pages. Keeps the primary CTA thumb-reachable while the visitor
 * scrolls through 800+ px of marketing copy on mobile.
 *
 * Desktop users don't see this $— they have the header CTA always visible.
 *
 * Copy is driven entirely by src/lib/cohort.ts so it flips automatically
 * between "Cohort X Open" and "Cohort X Coming Soon" with no hardcoded
 * references to any specific cohort number.
 *
 * Shown on: /coaching, /coaching/[location], /community/not-done-yet,
 *   /about, /community
 * Hidden on: /apply (already there), /admin, anything else
 */

const SHOW_ON_PATH_PREFIXES = [
  "/coaching",
  "/community/not-done-yet",
  "/community", // exact match below
  "/about",
];

const HIDE_ON_PATH_PREFIXES = ["/apply", "/admin"];

function shouldShow(pathname: string | null): boolean {
  if (!pathname) return false;
  if (
    HIDE_ON_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
    )
  ) {
    return false;
  }
  return SHOW_ON_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

export function MobileStickyApply() {
  const pathname = usePathname();
  if (!shouldShow(pathname)) return null;

  const state = getCohortState();

  return (
    <div
      className="md:hidden fixed left-0 right-0 bottom-0 z-[55] pointer-events-none"
      aria-hidden={false}
    >
      <div
        className="pointer-events-auto mx-3 mb-3 rounded-xl bg-coral shadow-[0_12px_32px_-8px_rgba(241,99,99,0.5)] overflow-hidden"
        style={{
          // Respect safe-area inset on iPhone
          marginBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
        }}
      >
        <Link
          href={state.banner.ctaHref}
          className="flex items-center justify-between px-5 py-3.5 text-off-white font-heading tracking-wider"
        >
          <span className="text-sm">
            <span className="text-[10px] font-body tracking-widest opacity-70 block uppercase">
              {state.banner.eyebrow}
            </span>
            <span className="text-base">{state.banner.cta}</span>
          </span>
          <span aria-hidden="true" className="text-xl">
            &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
