"use client";

import { useEffect, useState } from "react";

/**
 * Mobile-first sticky bottom CTA on the results page. Slides in once
 * the user has scrolled past the hero so it doesn't double up on the
 * hero CTA, and only on screens where the inline CTA falls below the
 * fold (sm and down).
 *
 * Conversion bet: every sub-second of friction matters for paid
 * traffic. A persistent CTA means an impatient reader can convert
 * without scrolling to the bottom.
 */
export function StickyCta({
  href,
  label,
  ctaTag = "sticky",
}: {
  href: string;
  label: string;
  ctaTag?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Show after the user has moved past the first viewport.
        const threshold = window.innerHeight * 0.6;
        setVisible((prev) => {
          const next = window.scrollY > threshold;
          return next === prev ? prev : next;
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`
        fixed bottom-0 inset-x-0 z-40 sm:hidden
        bg-charcoal/95 backdrop-blur border-t border-white/10
        transition-transform duration-200
        ${visible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div className="px-4 py-3">
        <a
          href={href}
          data-cta={ctaTag}
          className="block w-full text-center font-heading tracking-wider bg-coral hover:bg-coral-hover text-off-white px-6 py-3 rounded-md transition-colors cursor-pointer"
        >
          {label.toUpperCase()}
        </a>
      </div>
    </div>
  );
}
