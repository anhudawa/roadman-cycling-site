import { SITE_ORIGIN } from "@/lib/brand-facts";

/**
 * The single source of truth for generated sitemap partitions.
 *
 * Keep the metadata sitemap, sitemap index, and crawler discovery in sync by
 * importing this list instead of repeating child IDs in each route.
 */
export const SITEMAP_IDS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export const SITEMAP_INDEX_URL = `${SITE_ORIGIN}/sitemap.xml`;
export const VIDEO_SITEMAP_URL = `${SITE_ORIGIN}/video-sitemap.xml`;

export function getChildSitemapUrl(id: (typeof SITEMAP_IDS)[number]): string {
  return `${SITE_ORIGIN}/sitemap/${id}.xml`;
}
