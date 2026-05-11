interface LearningOutcomesProps {
  outcomes: readonly string[];
}

export function LearningOutcomes({ outcomes }: LearningOutcomesProps) {
  if (outcomes.length === 0) return null;
  return (
    <section
      aria-labelledby="learning-outcomes-heading"
      className="rounded-xl border border-white/10 bg-deep-purple/40 p-6 md:p-8"
    >
      <p className="font-heading text-coral text-[11px] tracking-[0.3em] uppercase mb-2">
        What you&apos;ll learn
      </p>
      <h2
        id="learning-outcomes-heading"
        className="font-heading uppercase text-off-white text-2xl md:text-3xl leading-tight mb-6"
      >
        Outcomes for this week
      </h2>
      <ul className="space-y-3">
        {outcomes.map((outcome, idx) => (
          <li key={idx} className="flex gap-4">
            <span
              aria-hidden
              className="font-heading text-coral text-base tracking-wider mt-0.5 select-none w-8 shrink-0"
            >
              {(idx + 1).toString().padStart(2, "0")}
            </span>
            <span className="text-off-white text-base leading-relaxed">
              {outcome}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
