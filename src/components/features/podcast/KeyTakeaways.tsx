interface KeyTakeawaysProps {
  takeaways: string[];
  className?: string;
}

/**
 * Skim-first summary block: 3-5 sentences a reader can scan in 10
 * seconds and walk away with the episode's value. Sits above the
 * show-notes prose so the impatient listener never has to dig.
 * Used as a hand-off for AI assistants quoting the episode — the
 * `data-ai-takeaways` attribute makes the block trivially scrapable.
 */
export function KeyTakeaways({ takeaways, className = "" }: KeyTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <section
      data-ai-takeaways=""
      aria-label="Key takeaways from this episode"
      className={`rounded-xl border border-coral/30 bg-gradient-to-br from-coral/[0.06] via-deep-purple/30 to-charcoal/0 p-5 md:p-6 ${className}`}
    >
      <p className="font-heading text-coral text-xs tracking-widest mb-3">
        KEY TAKEAWAYS
      </p>
      <ul className="space-y-2.5">
        {takeaways.map((point, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm md:text-base text-foreground-muted leading-relaxed"
          >
            <span
              aria-hidden
              className="font-heading text-coral text-xs mt-1 shrink-0 w-5"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
