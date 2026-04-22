"use client";

import { useEffect, useState } from "react";

/**
 * Mobile-first sticky bottom CTA. Slides in once the user has
 * scrolled past the hero so it doesn't double up on the hero CTA,
 * and only on screens where the inline CTA falls below the fold
 * (sm and down).
 *
 * Two modes:
 *  - On the results page, the CTA lives at the bottom of a long
 *    read. This sticky keeps it persistent so an impatient reader
 *    can convert without scrolling to the footer.
 *  - On the landing page, it's the "jump back to Q1" shortcut.
 *    Pass `hideWhenInView` with a selector for the diagnostic
 *    section itself — the sticky hides while the user is looking
 *    at the form so it doesn't compete with the live question.
 */
export function StickyCta({
  href,
  label,
  ctaTag = "sticky",
  hideWhenInView,
}: {
  href: string;
  label: string;
  ctaTag?: string;
  hideWhenInView?: string;
}) {
  const [pastHero, setPastHero] = useState(false);
  const [targetInView, setTargetInView] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const threshold = window.innerHeight * 0.6;
        setPastHero((prev) => {
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

  useEffect(() => {
    if (!hideWhenInView) return;
    const target = document.querySelector(hideWhenInView);
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setTargetInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [hideWhenInView]);

  const visible = pastHero && !targetInView;

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
