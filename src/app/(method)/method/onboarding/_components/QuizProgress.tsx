interface QuizProgressProps {
  /** 1-indexed step number currently active. */
  current: number;
  total: number;
}

/**
 * Slim progress bar above the quiz card. Coral fills the completed
 * portion; the active step gets a brighter coral pulse.
 */
export function QuizProgress({ current, total }: QuizProgressProps) {
  return (
    <div className="mb-8 md:mb-10" aria-hidden>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const done = stepNum < current;
          const active = stepNum === current;
          return (
            <span
              key={i}
              className={[
                "h-1 flex-1 rounded-full transition-colors",
                done || active ? "bg-coral" : "bg-white/10",
                active ? "shadow-[0_0_10px_rgba(241,99,99,0.6)]" : "",
              ].join(" ")}
            />
          );
        })}
      </div>
      <p className="mt-3 font-heading text-xs tracking-[0.3em] text-foreground-muted">
        STEP {String(current).padStart(2, "0")} OF {String(total).padStart(2, "0")}
      </p>
    </div>
  );
}
