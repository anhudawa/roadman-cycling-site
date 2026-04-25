"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StickyCoachingBarProps {
  source: string;
}

export function StickyCoachingBar({ source }: StickyCoachingBarProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const scrollPercent =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.4);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-charcoal/95 backdrop-blur-sm border-t border-coral/20 px-4 py-3 md:py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-off-white text-sm font-heading tracking-wider hidden sm:block">
          WANT A COACH TO BUILD YOUR PLAN?
        </p>
        <p className="text-off-white text-xs font-heading tracking-wider sm:hidden">
          READY FOR COACHING?
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/apply"
            className="inline-flex items-center gap-1 font-heading text-xs tracking-wider uppercase bg-coral text-off-white hover:bg-coral/90 rounded-md px-4 py-2 transition-all"
            data-track={`sticky_bar_${source}`}
          >
            Apply $†’
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-foreground-subtle hover:text-off-white text-xs transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            $œ•
          </button>
        </div>
      </div>
    </div>
  );
}
