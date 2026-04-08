import type { InventoryStatus, ReadStatus, InventoryType } from "@/lib/inventory";

const STATUS_COLORS: Record<InventoryStatus, string> = {
  available: "bg-green-500/15 text-green-400 border-green-500/20",
  held: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  sold: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  live: "bg-purple-500/15 text-purple-300 border-purple-500/20",
};

const READ_STATUS_LABELS: Record<ReadStatus, string> = {
  pending: "Pending",
  script_written: "Script Written",
  read_recorded: "Recorded",
  approved: "Approved",
  live: "Live",
};

const READ_STATUS_COLORS: Record<ReadStatus, string> = {
  pending: "bg-white/5 text-foreground-subtle",
  script_written: "bg-yellow-500/15 text-yellow-400",
  read_recorded: "bg-blue-500/15 text-blue-400",
  approved: "bg-green-500/15 text-green-400",
  live: "bg-purple-500/15 text-purple-300",
};

const TYPE_LABELS: Record<InventoryType, string> = {
  podcast_preroll: "Pre-roll",
  podcast_midroll: "Mid-roll",
  podcast_endroll: "End-roll",
  newsletter_dedicated: "Dedicated",
  newsletter_banner: "Banner",
  newsletter_classified: "Classified",
  youtube_integration: "YouTube",
};

const TYPE_SHORT_LABELS: Record<InventoryType, string> = {
  podcast_preroll: "PRE",
  podcast_midroll: "MID",
  podcast_endroll: "END",
  newsletter_dedicated: "DED",
  newsletter_banner: "BAN",
  newsletter_classified: "CLS",
  youtube_integration: "YT",
};

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider border ${STATUS_COLORS[status]}`}
    >
      {status}
    </span>
  );
}

export function ReadStatusBadge({ status }: { status: ReadStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wider ${READ_STATUS_COLORS[status]}`}
    >
      {READ_STATUS_LABELS[status]}
    </span>
  );
}

export function InventoryTypeBadge({
  type,
  short = false,
}: {
  type: InventoryType;
  short?: boolean;
}) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 text-foreground-muted border border-white/10 uppercase tracking-wider">
      {short ? TYPE_SHORT_LABELS[type] : TYPE_LABELS[type]}
    </span>
  );
}

export function PositionBadge({ type }: { type: InventoryType }) {
  const colors: Record<string, string> = {
    podcast_preroll: "bg-coral/15 text-coral border-coral/20",
    podcast_midroll: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    podcast_endroll: "bg-green-500/15 text-green-400 border-green-500/20",
    newsletter_dedicated: "bg-purple-500/15 text-purple-300 border-purple-500/20",
    newsletter_banner: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    newsletter_classified: "bg-white/5 text-foreground-muted border-white/10",
    youtube_integration: "bg-red-500/15 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${colors[type]}`}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

export { TYPE_LABELS, TYPE_SHORT_LABELS };
