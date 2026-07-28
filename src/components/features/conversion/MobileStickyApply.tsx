"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCohortState } from "@/lib/cohort";

/**
 * Mobile-only sticky APPLY bar that pins to the bottom of the viewport on
 * revenue pages. Keeps the primary CTA thumb-reachable while the visitor
 * scrolls through 800+ px of marketing copy on mobile.
 *
 * Desktop users don't see this — they have the header CTA always visible.
 *
 * Copy is driven entirely by src/lib/cohort.ts so we can change the
 * primary CTA in one place.
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
  if (pathname === "/") return true;
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
  const [homepageVisible, setHomepageVisible] = useState(false);
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (!isHomepage) return;

    let frame = 0;
    const checkPosition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const stopSurfaceVisible = Array.from(
          document.querySelectorAll<HTMLElement>("[data-sticky-apply-stop]"),
        ).some((element) => {
          const rect = element.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        });
        setHomepageVisible(
          window.scrollY > window.innerHeight * 0.72 && !stopSurfaceVisible,
        );
      });
    };

    checkPosition();
    window.addEventListener("scroll", checkPosition, { passive: true });
    window.addEventListener("resize", checkPosition);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, [isHomepage]);

  if (!shouldShow(pathname)) return null;

  const state = getCohortState();
  const detail = isHomepage
    ? "$195/MO · FIRST 7 DAYS FREE"
    : state.banner.eyebrow;
  const cta = isHomepage ? "START APPLICATION" : state.banner.cta;
  const isVisible = !isHomepage || homepageVisible;

  return (
    <div
      data-mobile-auxiliary-surface="true"
      data-cookie-obscurable="true"
      className={`md:hidden fixed left-0 right-0 bottom-0 z-[55] pointer-events-none transition-all duration-300 motion-reduce:transition-none ${
        !isVisible
          ? "translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
      style={{ bottom: "var(--cookie-banner-height, 0px)" }}
      aria-hidden={!isVisible}
    >
      <div
        className="pointer-events-auto mx-3 mb-3 rounded-md bg-coral text-deep-purple shadow-[0_12px_32px_-8px_rgba(241,99,99,0.5)]"
        style={{
          // Respect safe-area inset on iPhone
          marginBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
        }}
      >
        <Link
          href={state.banner.ctaHref}
          data-track={
            isHomepage
              ? "home_mobile_sticky_apply"
              : "revenue_mobile_sticky_apply"
          }
          tabIndex={isVisible ? undefined : -1}
          className="flex items-center justify-between rounded-md px-5 py-3.5 text-deep-purple font-heading tracking-wider focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-deep-purple focus-visible:outline-offset-[-5px] focus-visible:shadow-none"
        >
          <span className="text-sm">
            <span className="text-xs font-body font-semibold tracking-widest opacity-75 block uppercase">
              {detail}
            </span>
            <span className="text-base">{cta}</span>
          </span>
          <span aria-hidden="true" className="text-xl">
            &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
