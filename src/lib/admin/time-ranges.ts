import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";

export function parseTimeRange(range: string): { from: Date; to: Date } {
  const now = new Date();
  const to = now;

  switch (range) {
    case "today":
      return { from: startOfDay(now), to };
    case "7d":
      return { from: subDays(now, 7), to };
    case "30d":
      return { from: subDays(now, 30), to };
    case "90d":
      return { from: subDays(now, 90), to };
    case "ytd":
      return { from: startOfYear(now), to };
    case "12m":
      return { from: subMonths(now, 12), to };
    case "all":
      return { from: new Date(0), to };
    default:
      // Default to 30 days
      return { from: subDays(now, 30), to };
  }
}

/**
 * Given a range key, return { from, to } for the current range AND
 * { prevFrom, prevTo } for an equal-length comparison window immediately before it.
 */
export function parseTimeRangeWithComparison(range: string): {
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  label: string;
  compLabel: string;
} {
  const { from, to } = parseTimeRange(range);
  const durationMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime());
  const prevFrom = new Date(from.getTime() - durationMs);

  const labels: Record<string, { label: string; compLabel: string }> = {
    today: { label: "Today", compLabel: "vs yesterday" },
    "7d": { label: "7d", compLabel: "vs prev 7d" },
    "30d": { label: "30d", compLabel: "vs prev 30d" },
    "90d": { label: "90d", compLabel: "vs prev 90d" },
    ytd: { label: "YTD", compLabel: "vs prev period" },
    "12m": { label: "12m", compLabel: "vs prev 12m" },
    all: { label: "All", compLabel: "" },
  };

  const { label, compLabel } = labels[range] ?? { label: range, compLabel: `vs prev period` };

  return { from, to, prevFrom, prevTo, label, compLabel };
}

// Re-export date-fns helpers used by events-store
export { startOfDay, startOfWeek, startOfMonth, subDays };
