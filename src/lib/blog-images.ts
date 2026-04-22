import type { ContentPillar } from "@/types";

/**
 * Featured images that were reused across many posts before we had
 * a proper image library. On the /blog index these read as visual
 * duplicates — scrolling 24 cards surfaces the same gravel-canyon
 * shot 3-5 times.
 *
 * Any post whose featuredImage is in this set renders the
 * typography-first card variant instead of showing the image.
 * The image still loads on the post's own page (hero + OG share)
 * so SEO and social previews aren't affected.
 *
 * Audit (2026-04): these 6 images accounted for 133 of 170 posts.
 * Replace each one with a curated per-post image when we have
 * the editorial time, then remove from this set.
 */
export const GENERIC_BLOG_IMAGES: ReadonlySet<string> = new Set([
  "/images/cycling/gravel-canyon-rest.jpg",
  "/images/cycling/gravel-road-climb.jpg",
  "/images/cycling/gravel-rest-stop.jpg",
  "/images/cycling/gravel-road-climb-2.jpg",
  "/images/cycling/gravel-canyon-wide.jpg",
  "/images/cycling/gravel-riding-canyon.jpg",
  "/images/cycling/gravel-desert-road-epic.jpg",
  "/images/cycling/gravel-roadside-break.jpg",
  "/images/cycling/post-ride-cokes.jpg",
  "/images/cycling/post-ride-rest-wall.jpg",
  "/images/cycling/gravel-road-climb-backup.jpg",
]);

export function isGenericImage(src?: string | null): boolean {
  if (!src) return true; // no image at all → use typography card
  return GENERIC_BLOG_IMAGES.has(src);
}

/**
 * CSS colour for a pillar's typography-card background. Matches the
 * pillar token palette in src/app/globals.css.
 */
export function pillarColor(pillar: ContentPillar | undefined): string {
  switch (pillar) {
    case "coaching":
      return "#F16363";
    case "nutrition":
      return "#4CAF50";
    case "strength":
      return "#FF9800";
    case "recovery":
      return "#2196F3";
    case "community":
      return "#9C27B0";
    default:
      return "#F16363"; // coral fallback
  }
}
