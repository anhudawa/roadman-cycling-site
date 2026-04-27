import type { ReactNode } from "react";

export type EvidenceLevelType =
  | "strong"
  | "moderate"
  | "emerging"
  | "anecdotal";

/**
 * Roadman's evidence-grading scale. Mirrored in the article + topic hub
 * templates so claims carry a visible confidence signal for readers (and
 * a structured trust signal for AI crawlers reading the page).
 */
export const EVIDENCE_LEVELS: Record<
  EvidenceLevelType,
  { label: string; color: string; description: string }
> = {
  strong: {
    label: "Strong",
    color: "#4CAF50",
    description:
      "Supported by published research AND multiple expert interviews.",
  },
  moderate: {
    label: "Moderate",
    color: "#2196F3",
    description: "Supported by coaching practice and athlete outcomes.",
  },
  emerging: {
    label: "Emerging",
    color: "#FF9800",
    description: "Promising but not yet settled.",
  },
  anecdotal: {
    label: "Anecdotal",
    color: "#9CA3AF",
    description: "Based on case experience.",
  },
};

interface EvidenceLevelProps {
  level: EvidenceLevelType;
  /** "inline" pill (default) or "block" callout with description. */
  variant?: "inline" | "block";
  /** Override the default description text in block variant. */
  note?: ReactNode;
}

export function EvidenceLevel({
  level,
  variant = "inline",
  note,
}: EvidenceLevelProps) {
  const meta = EVIDENCE_LEVELS[level];
  if (!meta) return null;
  const { label, color, description } = meta;

  if (variant === "block") {
    return (
      <aside
        className="my-6 rounded-lg p-4 not-prose"
        role="note"
        aria-label={`Evidence level: ${label}`}
        style={{
          borderLeft: `3px solid ${color}`,
          backgroundColor: `color-mix(in srgb, ${color} 5%, var(--color-charcoal))`,
        }}
      >
        <p
          className="font-heading text-xs tracking-widest mb-1"
          style={{ color }}
        >
          {label.toUpperCase()} EVIDENCE
        </p>
        <p className="text-sm text-foreground-muted leading-relaxed font-body m-0">
          {note ?? description}
        </p>
      </aside>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 font-body font-medium rounded-full text-xs px-2.5 py-0.5 align-middle whitespace-nowrap"
      title={description}
      aria-label={`${label} evidence — ${description}`}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      <span
        aria-hidden="true"
        className="inline-block rounded-full"
        style={{ width: "0.4rem", height: "0.4rem", backgroundColor: color }}
      />
      {label}
    </span>
  );
}
