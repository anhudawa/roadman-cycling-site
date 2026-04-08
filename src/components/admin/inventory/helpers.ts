import type { InventoryType } from "@/lib/inventory";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function inventoryTypeGroup(type: InventoryType): string {
  if (type.startsWith("podcast_")) return "Podcast";
  if (type.startsWith("newsletter_")) return "Newsletter";
  return "YouTube";
}

export const INVENTORY_TYPE_DISPLAY: Record<InventoryType, string> = {
  podcast_preroll: "Podcast Pre-roll",
  podcast_midroll: "Podcast Mid-roll",
  podcast_endroll: "Podcast End-roll",
  newsletter_dedicated: "Newsletter Dedicated",
  newsletter_banner: "Newsletter Banner",
  newsletter_classified: "Newsletter Classified",
  youtube_integration: "YouTube Integration",
};

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}
