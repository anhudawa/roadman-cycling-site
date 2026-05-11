import type { Phase } from "@/lib/method/phases";

interface PhaseBadgeProps {
  phase: Phase;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Small phase chip — shown on dashboard hero, module hero, and section
 * dividers. Pure visual badge, no interactivity.
 */
export function PhaseBadge({ phase, size = "md", className = "" }: PhaseBadgeProps) {
  const padding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const text = size === "sm" ? "text-[10px]" : "text-xs";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 ${padding} font-heading uppercase tracking-[0.25em] text-coral ${text} ${className}`}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-coral shadow-[0_0_8px_var(--color-coral)]"
      />
      Phase · {phase.label}
    </span>
  );
}
