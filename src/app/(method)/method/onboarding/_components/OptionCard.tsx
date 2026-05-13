"use client";

import { type KeyboardEvent } from "react";

interface OptionCardProps {
  label: string;
  blurb?: string;
  selected: boolean;
  onSelect: () => void;
  /** Optional eyebrow above the label, e.g. "01". */
  index?: string;
}

/**
 * Selectable card for a single quiz option. Coral border + glow when
 * selected, neutral when not. Keyboard-accessible via Enter / Space.
 */
export function OptionCard({
  label,
  blurb,
  selected,
  onSelect,
  index,
}: OptionCardProps) {
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  }

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={onKey}
      className={[
        "group relative cursor-pointer rounded-xl border p-5 md:p-6 transition-all",
        "outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
        selected
          ? "border-coral bg-coral/10 shadow-[0_0_30px_rgba(241,99,99,0.18)]"
          : "border-white/10 bg-charcoal/60 hover:border-white/30 hover:bg-charcoal/80",
      ].join(" ")}
    >
      {index && (
        <span
          aria-hidden
          className={[
            "font-heading text-xs tracking-[0.3em] mb-2 block transition-colors",
            selected ? "text-coral" : "text-foreground-muted",
          ].join(" ")}
        >
          {index}
        </span>
      )}
      <p
        className={[
          "font-heading uppercase tracking-wider text-lg md:text-xl leading-tight transition-colors",
          selected ? "text-off-white" : "text-off-white/95",
        ].join(" ")}
      >
        {label}
      </p>
      {blurb && (
        <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
          {blurb}
        </p>
      )}
      <div
        aria-hidden
        className={[
          "absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-coral bg-coral"
            : "border-white/20 group-hover:border-white/40",
        ].join(" ")}
      >
        {selected && (
          <svg
            viewBox="0 0 12 12"
            className="h-3 w-3 text-charcoal"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 6.5 5 9l4.5-5.5" />
          </svg>
        )}
      </div>
    </div>
  );
}
