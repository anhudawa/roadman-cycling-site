"use client";

import { useEffect, useState } from "react";

/**
 * Top-of-page reading progress bar — fills as the user scrolls. The
 * spec calls this out for the results page (§11): "signals there's a
 * lot here, worth reading."
 *
 * Scroll listener is throttled via requestAnimationFrame so it stays
 * cheap on long pages. Bar is `position: fixed` and z-indexed above
 * the header.
 */
export function ReadingProgress() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const next =
        scrollable > 0 ? Math.min(100, (doc.scrollTop / scrollable) * 100) : 0;
      // Avoid no-op state updates on every animation frame — only
      // notify React when the rounded value actually changed.
      setPercent((prev) => {
        const rounded = Math.round(next);
        return rounded === prev ? prev : rounded;
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none"
    >
      <div
        className="h-full bg-coral transition-[width] duration-150"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
