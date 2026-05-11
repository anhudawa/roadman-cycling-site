"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { METHOD_MODULE_BY_SLUG } from "@/lib/method/modules";
import type { ProgressCompletion } from "@/lib/method/progress";

interface RecentActivityProps {
  completions: readonly ProgressCompletion[];
  initialLimit?: number;
}

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeFromNow(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));
    if (Math.abs(diffHours) < 1) return "just now";
    return RTF.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 14) return RTF.format(diffDays, "day");
  return RTF.format(Math.round(diffDays / 7), "week");
}

export function RecentActivity({
  completions,
  initialLimit = 4,
}: RecentActivityProps) {
  const [expanded, setExpanded] = useState(false);

  if (completions.length === 0) {
    return (
      <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6">
        <header className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="font-heading uppercase tracking-wider text-sm text-coral">
            Recent work
          </h2>
          <span className="text-[11px] text-foreground-muted">0 logged</span>
        </header>
        <p className="text-sm text-foreground-muted">
          The log&apos;s empty for now — tick a module complete and it shows up
          here.
        </p>
        <p className="mt-1.5 text-[11px] text-foreground-muted/80">
          Small, in-order check-ins. That&apos;s the whole game.
        </p>
      </section>
    );
  }

  const hasMore = completions.length > initialLimit;
  const visible = expanded ? completions : completions.slice(0, initialLimit);
  const hiddenCount = completions.length - initialLimit;

  return (
    <section className="rounded-xl border border-white/10 bg-charcoal/60 p-6">
      <header className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="font-heading uppercase tracking-wider text-sm text-coral">
          Recent work
        </h2>
        <span className="text-[11px] text-foreground-muted">
          {completions.length} logged
        </span>
      </header>

      <ol className="space-y-3">
        <AnimatePresence initial={false}>
          {visible.map((row, idx) => {
            const module = METHOD_MODULE_BY_SLUG.get(row.slug);
            if (!module) return null;
            const isNewlyRevealed = expanded && idx >= initialLimit;
            return (
              <motion.li
                key={row.slug}
                layout
                initial={
                  isNewlyRevealed ? { opacity: 0, y: -4 } : { opacity: 1 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, delay: isNewlyRevealed ? idx * 0.02 : 0 }}
              >
                <Link
                  href={`/method/modules/${module.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 rounded-md py-1 px-1 -mx-1 hover:bg-white/5"
                >
                  <span
                    aria-hidden
                    className="font-heading text-xs tracking-wider text-coral w-8"
                  >
                    {module.weekIndex.toString().padStart(2, "0")}
                  </span>
                  <span className="font-heading uppercase tracking-wide text-off-white truncate group-hover:text-coral transition-colors">
                    {module.title}
                  </span>
                  <span className="text-[11px] text-foreground-muted whitespace-nowrap">
                    {relativeFromNow(row.completedAt)}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-1.5 font-heading text-[11px] tracking-[0.25em] text-coral hover:text-coral-hover transition-colors cursor-pointer"
        >
          {expanded ? (
            <>SHOW LESS <span aria-hidden>↑</span></>
          ) : (
            <>SHOW {hiddenCount} MORE <span aria-hidden>↓</span></>
          )}
        </button>
      )}
    </section>
  );
}
