export const APPLICATION_STAGES = [
  "awaiting_response",
  "contacted",
  "qualified",
  "offered",
  "accepted",
  "rejected",
] as const;

export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  awaiting_response: "Awaiting Response",
  contacted: "Contacted",
  qualified: "Qualified",
  offered: "Offered",
  accepted: "Accepted",
  rejected: "Rejected",
};

export interface StageColor {
  badge: string;
  ring: string;
  dot: string;
}

export const STAGE_COLORS: Record<ApplicationStage, StageColor> = {
  awaiting_response: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    ring: "ring-amber-500/40",
    dot: "bg-amber-400",
  },
  contacted: {
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    ring: "ring-blue-500/40",
    dot: "bg-blue-400",
  },
  qualified: {
    badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    ring: "ring-indigo-500/40",
    dot: "bg-indigo-400",
  },
  offered: {
    badge: "bg-coral/10 text-coral border-coral/30",
    ring: "ring-coral/50",
    dot: "bg-coral",
  },
  accepted: {
    badge: "bg-green-500/10 text-green-300 border-green-500/20",
    ring: "ring-green-500/40",
    dot: "bg-green-400",
  },
  rejected: {
    badge: "bg-red-500/10 text-red-300/80 border-red-500/20",
    ring: "ring-red-500/30",
    dot: "bg-red-400/70",
  },
};

export function isApplicationStage(value: unknown): value is ApplicationStage {
  return (
    typeof value === "string" &&
    (APPLICATION_STAGES as readonly string[]).includes(value)
  );
}
