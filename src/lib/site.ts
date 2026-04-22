/**
 * Canonical production origin for the site, for use anywhere we
 * need to build an absolute URL outside a Request context
 * (transactional emails, OG images, cron-generated links).
 *
 * Reads NEXT_PUBLIC_SITE_URL; falls back to the production domain so
 * staging / local dev don't accidentally send emails pointing at
 * localhost.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (raw || "https://roadmancycling.com").replace(/\/$/, "");
}

/**
 * Join a path onto the canonical site URL, collapsing duplicate
 * slashes. Leading slash is optional on `path`.
 */
export function absoluteUrl(path: string): string {
  const origin = getSiteUrl();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${clean}`;
}
