interface ModeCardProps {
  mode: "plan_my_race" | "can_i_make_it";
  selected: boolean;
  onSelect: () => void;
}

const COPY = {
  plan_my_race: {
    eyebrow: "RACE WEEK",
    title: "Plan my race",
    body:
      "You're racing in the next few weeks. We'll plan your pacing for the day — power targets per climb, where to push, where to ease, fuelling tied to effort.",
    bullets: [
      "Per-climb power targets",
      "Climb-by-climb time budget",
      "Fuelling rate per hour",
    ],
  },
  can_i_make_it: {
    eyebrow: "MONTHS OUT",
    title: "Can I make it?",
    body:
      "You're still training. We'll show you what you'd realistically ride today, plus where the gap is between you and your finish-time goal.",
    bullets: [
      "Honest baseline finish time",
      "How close to the cutoff you are",
      "Where the training gap lives",
    ],
  },
} as const;

export function ModeCard({ mode, selected, onSelect }: ModeCardProps) {
  const copy = COPY[mode];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden ${
        selected
          ? "border-coral bg-gradient-to-br from-coral/12 via-deep-purple/40 to-charcoal shadow-[0_0_0_1px_rgba(241,99,99,0.5),0_24px_60px_-20px_rgba(241,99,99,0.4)]"
          : "border-white/8 bg-background-elevated hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
      }`}
      aria-pressed={selected}
    >
      {/* Animated accent rail */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
          selected ? "bg-coral" : "bg-white/0 group-hover:bg-white/20"
        }`}
      />

      <div className="p-6 md:p-7">
        <p
          className={`text-[0.65rem] tracking-[0.22em] uppercase mb-3 transition-colors ${
            selected ? "text-coral" : "text-foreground-subtle"
          }`}
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          {copy.eyebrow}
        </p>

        <h3
          className={`font-heading text-3xl md:text-4xl uppercase tracking-tight mb-3 transition-colors ${
            selected ? "text-off-white" : "text-off-white group-hover:text-coral"
          }`}
        >
          {copy.title}
        </h3>

        <p className="text-foreground-muted text-sm md:text-[0.95rem] leading-relaxed mb-4">
          {copy.body}
        </p>

        <ul className="space-y-1.5">
          {copy.bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 text-sm text-foreground-muted"
            >
              <span className={`mt-[6px] block w-1 h-1 rounded-full ${selected ? "bg-coral" : "bg-white/30"}`} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Selected indicator */}
      <div
        className={`absolute top-5 right-5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
          selected
            ? "border-coral bg-coral text-charcoal"
            : "border-white/20 bg-transparent"
        }`}
      >
        {selected && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>
    </button>
  );
}
