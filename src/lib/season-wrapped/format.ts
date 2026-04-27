/**
 * Display formatters used by both the in-page cards and the
 * exportable share poster. Pure, locale-agnostic.
 */

export function formatKm(meters: number): string {
  return Math.round(meters / 1000).toLocaleString("en-GB");
}

export function formatM(meters: number): string {
  return Math.round(meters).toLocaleString("en-GB");
}

export function formatHours(seconds: number): string {
  return Math.round(seconds / 3600).toLocaleString("en-GB");
}

export function formatPercentile(p: number): string {
  // Display as "Top X%" — i.e. you're in the top (100 - p)%.
  const top = Math.max(1, 100 - Math.round(p));
  return `Top ${top}%`;
}

export function shortMonth(idx: number): string {
  return [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec",
  ][Math.max(0, Math.min(11, idx - 1))];
}
