import type { StageType } from "@/data/tour-de-france-2026";

/**
 * Minimal terrain glyph per stage type — a flat line, rolling hills, a
 * mountain peak, or a stopwatch for the time trials. Inherits `currentColor`
 * so callers control the colour via text class or inline style.
 */
export function StageTypeIcon({
  type,
  className = "w-5 h-5",
}: {
  type: StageType;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (type) {
    case "flat":
      return (
        <svg {...common}>
          <path d="M3 16h18" />
          <path d="M3 16c4 0 4-2 8-2s4 2 10 2" opacity={0.4} />
        </svg>
      );
    case "hilly":
      return (
        <svg {...common}>
          <path d="M3 17l4-6 4 5 4-7 6 8" />
        </svg>
      );
    case "mountain":
      return (
        <svg {...common}>
          <path d="M3 19l6-12 4 7 2-3 6 8z" />
          <path d="M9 7l1.5 2.5" opacity={0.5} />
        </svg>
      );
    case "individual-tt":
    case "team-tt":
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="7" />
          <path d="M12 13V9" />
          <path d="M10 2h4" />
        </svg>
      );
  }
}
