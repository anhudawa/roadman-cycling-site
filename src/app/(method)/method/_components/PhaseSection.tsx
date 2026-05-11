import type { ReactNode } from "react";
import type { Phase } from "@/lib/method/phases";

interface PhaseSectionProps {
  phase: Phase;
  children: ReactNode;
}

/**
 * Section divider that groups module cards under their phase. The
 * dashboard renders 4 of these so the 12 modules visually map onto the
 * Clarity → Confidence → Momentum → Ownership arc the syllabus is
 * built around.
 */
export function PhaseSection({ phase, children }: PhaseSectionProps) {
  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-baseline gap-4">
          <span className="font-heading uppercase tracking-[0.3em] text-coral text-xs">
            {phase.weeksLabel}
          </span>
          <h3 className="font-heading uppercase text-2xl md:text-3xl">
            {phase.label}
          </h3>
        </div>
        <p className="text-sm text-foreground-muted italic max-w-md md:text-right">
          {phase.cue}
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</ul>
    </section>
  );
}
