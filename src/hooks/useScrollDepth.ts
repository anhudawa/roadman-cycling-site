/**
 * Fires a `scroll_depth` event the first time the viewport reaches each
 * threshold on the current path. Resets on pathname change.
 *
 * The companion delivery layer is `Tracker.tsx`'s consent-aware
 * `sendEvent` — this hook accepts an `enabled` flag so the caller controls
 * gating. Default thresholds match the cross-funnel reporting bands the
 * dashboard already aggregates against (25/50/75/100).
 */

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export interface UseScrollDepthOptions {
  /** Whether tracking should fire. Pass `false` while consent is unknown. */
  enabled?: boolean;
  /** Depth thresholds in percent of scrollable height. Default [25,50,75,100]. */
  thresholds?: readonly number[];
  /**
   * Sink invoked once per threshold per pathname. Receives the depth that
   * was crossed and the path it fired on. Implementations should be
   * fire-and-forget (the hook never awaits).
   */
  onThreshold: (depth: number, page: string) => void;
}

const DEFAULT_THRESHOLDS = [25, 50, 75, 100] as const;

export function useScrollDepth({
  enabled = true,
  thresholds = DEFAULT_THRESHOLDS,
  onThreshold,
}: UseScrollDepthOptions): void {
  const firedRef = useRef<Set<number>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    firedRef.current = new Set();

    function handleScroll() {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const pct = Math.round((window.scrollY / scrollHeight) * 100);

      for (const t of thresholds) {
        if (pct >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t);
          onThreshold(t, pathname);
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, enabled, thresholds, onThreshold]);
}
