export const APPLICATION_STAGES = [
  "awaiting_response",
  "contacted",
  "offered",
  "accepted",
  "signed_up",
  "rejected",
] as const;

export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  awaiting_response: "Awaiting Response",
  contacted: "Contacted",
  offered: "Offered",
  accepted: "Accepted",
  signed_up: "Signed Up",
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
  offered: {
    badge: "bg-coral/10 text-coral border-coral/30",
    ring: "ring-coral/50",
    dot: "bg-coral",
  },
  accepted: {
    badge: "bg-lime-500/10 text-lime-300 border-lime-500/20",
    ring: "ring-lime-500/40",
    dot: "bg-lime-400",
  },
  signed_up: {
    badge: "bg-green-500/15 text-green-200 border-green-400/30",
    ring: "ring-green-400/50",
    dot: "bg-green-300",
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
