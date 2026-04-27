"use client";

import { motion } from "framer-motion";
import type { MonthlyStat } from "@/lib/season-wrapped/types";
import { shortMonth } from "@/lib/season-wrapped/format";

interface Props {
  monthly: MonthlyStat[];
  highlightMonth?: number;
}

/**
 * Animated bar chart of monthly distance, with the biggest month
 * highlighted in coral. Bars rise sequentially on mount.
 */
export function MonthBars({ monthly, highlightMonth }: Props) {
  const max = Math.max(1, ...monthly.map((m) => m.distanceM));
  return (
    <div className="grid grid-cols-12 gap-1.5 items-end h-40 w-full">
      {monthly.map((m, i) => {
        const h = (m.distanceM / max) * 100;
        const isHighlight = highlightMonth === m.month;
        return (
          <div key={m.month} className="flex flex-col items-center gap-1.5">
            <div className="relative flex-1 w-full flex items-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(2, h)}%` }}
                transition={{
                  duration: 0.7,
                  delay: 0.05 * i,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`w-full rounded-t ${
                  isHighlight
                    ? "bg-coral shadow-[0_0_24px_rgba(241,99,99,0.55)]"
                    : "bg-white/15"
                }`}
              />
            </div>
            <span
              className={`font-display text-[10px] uppercase tracking-wider ${
                isHighlight ? "text-coral" : "text-off-white/45"
              }`}
            >
              {shortMonth(m.month)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
