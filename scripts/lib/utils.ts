/**
 * Convert seconds to readable duration format (1:12:34)
 */
export function secondsToReadable(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Generate a URL-safe slug from a title
 */
export function generateSlug(episodeNumber: number, title: string): string {
  // Remove episode number prefix from title if present
  const cleanTitle = title
    .replace(/^(?:EP?|Episode|#)\s*\d+\s*[:\-–—|]\s*/i, "")
    .trim();

  const slug = cleanTitle
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");

  return `ep-${episodeNumber}-${slug}`;
}

/**
 * Extract keywords from title and tags
 */
export function extractKeywords(
  title: string,
  tags: string[],
  guest?: string
): string[] {
  const keywords = new Set<string>();

  // Add relevant tags (filter out generic ones)
  const genericTags = new Set([
    "cycling",
    "podcast",
    "roadman",
    "bike",
    "cyclist",
    "roadman cycling",
    "roadman podcast",
  ]);

  for (const tag of tags) {
    const lower = tag.toLowerCase();
    if (!genericTags.has(lower) && lower.length > 2 && lower.length < 40) {
      keywords.add(lower);
    }
  }

  // Add guest name as keyword
  if (guest) {
    keywords.add(guest.toLowerCase());
  }

  // Extract notable words from title
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const stopWords = new Set([
    "this",
    "that",
    "with",
    "from",
    "about",
    "what",
    "when",
    "where",
    "which",
    "your",
    "they",
    "them",
    "will",
    "have",
    "been",
    "were",
    "does",
    "done",
    "doing",
    "the",
    "and",
    "for",
    "are",
    "but",
    "not",
    "you",
    "all",
    "can",
    "had",
    "her",
    "was",
    "one",
    "our",
    "out",
    "how",
    "why",
    "most",
    "just",
    "very",
    "really",
    "actually",
    "episode",
    "podcast",
    "roadman",
  ]);

  for (const word of titleWords) {
    if (!stopWords.has(word)) {
      keywords.add(word);
    }
  }

  return Array.from(keywords).slice(0, 8);
}

/**
 * Format a date string to YYYY-MM-DD
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toISOString().split("T")[0];
}

/**
 * Truncate text to a max length, breaking at word boundary
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLength * 0.7 ? truncated.slice(0, lastSpace) : truncated) + "...";
}
