import type { StageType } from "@/data/tour-de-france-2026";

/**
 * Per-stage-type accent colours, drawn from the existing brand/semantic
 * palette so the Tour overlay never introduces off-brand hues. Used for
 * badges, card spines, and timeline markers.
 */
export const STAGE_TYPE_COLOR: Record<StageType, string> = {
  flat: "#6A9AD9", // info blue — calm, fast, controllable
  hilly: "#FF9800", // strength orange — punchy, breakaway
  mountain: "#F16363", // brand coral — the hardest days
  "individual-tt": "#9C27B0", // community purple — against the clock
  "team-tt": "#9C27B0",
};

/** A one-word tag used in compact UI. */
export const STAGE_TYPE_TAG: Record<StageType, string> = {
  flat: "Sprint",
  hilly: "Breakaway",
  mountain: "Mountain",
  "individual-tt": "Time Trial",
  "team-tt": "Team TT",
};
