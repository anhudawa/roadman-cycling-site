/**
 * Shared helpers for the public /feeds/*.json endpoints. Designed to be
 * consumed by AI agents (ChatGPT, Perplexity, Claude, Gemini) — every
 * item carries enough context to follow the content graph without
 * scraping each page.
 */

export const FEED_BASE_URL = "https://roadmancycling.com";

/** Cache headers shared across every feed: 1h browser/CDN. */
export const FEED_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
  "Content-Type": "application/json; charset=utf-8",
};

/** Trim a string to ~150 chars on a word boundary, with a trailing ellipsis. */
export function summarise(input: string | null | undefined, maxChars = 150): string {
  if (!input) return "";
  const trimmed = input.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxChars) return trimmed;
  const slice = trimmed.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : maxChars)}…`;
}

/** Convert "/tools/ftp-zones" → "ftp-zones". Returns null if not a tool path. */
export function toolSlugFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const match = path.match(/^\/tools\/([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

export function feedUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${FEED_BASE_URL}${clean}`;
}
