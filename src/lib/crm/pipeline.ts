export const APPLICATION_STAGES = [
  "awaiting_response",
  "contacted_once",
  "contacted_twice",
  "final_outreach",
  "signed_up",
  "rejected",
] as const;

export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  awaiting_response: "New",
  contacted_once: "Contacted Once",
  contacted_twice: "Contacted Twice",
  final_outreach: "Final Outreach",
  signed_up: "Signed Up",
  rejected: "Rejected",
};

export interface StageColor {
  badge: string;
  ring: string;
  dot: string;
  cardAccent: string;
}

export const STAGE_COLORS: Record<ApplicationStage, StageColor> = {
  awaiting_response: {
    badge: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    ring: "ring-slate-400/40",
    dot: "bg-slate-300",
    cardAccent: "before:bg-slate-400",
  },
  contacted_once: {
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    ring: "ring-blue-500/40",
    dot: "bg-blue-400",
    cardAccent: "before:bg-blue-400",
  },
  contacted_twice: {
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    ring: "ring-cyan-500/40",
    dot: "bg-cyan-400",
    cardAccent: "before:bg-cyan-400",
  },
  final_outreach: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    ring: "ring-amber-500/40",
    dot: "bg-amber-400",
    cardAccent: "before:bg-amber-400",
  },
  signed_up: {
    badge: "bg-green-500/15 text-green-200 border-green-400/30",
    ring: "ring-green-400/50",
    dot: "bg-green-300",
    cardAccent: "before:bg-green-300",
  },
  rejected: {
    badge: "bg-red-500/10 text-red-300/80 border-red-500/20",
    ring: "ring-red-500/30",
    dot: "bg-red-400/70",
    cardAccent: "before:bg-red-400/70",
  },
};

const LEGACY_STAGE_MAP: Record<string, ApplicationStage> = {
  contacted: "contacted_once",
  responded: "contacted_once",
  offered: "final_outreach",
  follow_up: "final_outreach",
  accepted: "signed_up",
};

export function isApplicationStage(value: unknown): value is ApplicationStage {
  return (
    typeof value === "string" &&
    (APPLICATION_STAGES as readonly string[]).includes(value)
  );
}

export function normalizeApplicationStage(value: unknown): ApplicationStage {
  if (isApplicationStage(value)) return value;
  if (typeof value === "string" && LEGACY_STAGE_MAP[value]) {
    return LEGACY_STAGE_MAP[value];
  }
  return "awaiting_response";
}
