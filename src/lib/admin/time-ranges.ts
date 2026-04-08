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

// Re-export date-fns helpers used by events-store
export { startOfDay, startOfWeek, startOfMonth, subDays };
