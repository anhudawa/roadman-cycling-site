import type { Pillar } from "./data";

/**
 * Per-pillar styling tokens. Pulls from globals.css custom properties so the
 * brand pillar colours stay in sync with the rest of the site.
 */
interface PillarStyle {
  text: string;
  bg: string;
  border: string;
  ring: string;
  cssVar: string;
}

export const PILLAR_STYLES: Record<Pillar, PillarStyle> = {
  coaching: {
    text: "text-coral",
    bg: "bg-coral/10",
    border: "border-coral/30",
    ring: "ring-coral/30",
    cssVar: "--color-pillar-coaching",
  },
  nutrition: {
    text: "text-[color:var(--color-pillar-nutrition)]",
    bg: "bg-[color:var(--color-pillar-nutrition)]/10",
    border: "border-[color:var(--color-pillar-nutrition)]/30",
    ring: "ring-[color:var(--color-pillar-nutrition)]/30",
    cssVar: "--color-pillar-nutrition",
  },
  strength: {
    text: "text-[color:var(--color-pillar-strength)]",
    bg: "bg-[color:var(--color-pillar-strength)]/10",
    border: "border-[color:var(--color-pillar-strength)]/30",
    ring: "ring-[color:var(--color-pillar-strength)]/30",
    cssVar: "--color-pillar-strength",
  },
  recovery: {
    text: "text-[color:var(--color-pillar-recovery)]",
    bg: "bg-[color:var(--color-pillar-recovery)]/10",
    border: "border-[color:var(--color-pillar-recovery)]/30",
    ring: "ring-[color:var(--color-pillar-recovery)]/30",
    cssVar: "--color-pillar-recovery",
  },
  community: {
    text: "text-[color:var(--color-pillar-community)]",
    bg: "bg-[color:var(--color-pillar-community)]/10",
    border: "border-[color:var(--color-pillar-community)]/30",
    ring: "ring-[color:var(--color-pillar-community)]/30",
    cssVar: "--color-pillar-community",
  },
};

export const PILLAR_LABEL: Record<Pillar, string> = {
  coaching: "Coaching",
  nutrition: "Nutrition",
  strength: "Strength & Conditioning",
  recovery: "Recovery",
  community: "Le Métier",
};
