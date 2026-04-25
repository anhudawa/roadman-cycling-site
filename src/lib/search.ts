import { type ContentPillar } from "@/types";

/**
 * Unified search index entry $€” used for both blog posts and podcast episodes.
 * This powers the site-wide search functionality.
 */
export interface SearchableItem {
  type: "blog" | "podcast" | "tool" | "guest";
  slug: string;
  title: string;
  description: string;
  pillar: ContentPillar;
  publishDate?: string;
  keywords: string[];
  // Podcast-specific
  episodeNumber?: number;
  guest?: string;
  guestCredential?: string;
  duration?: string;
  episodeType?: string;
  // Blog-specific
  readTime?: string;
  excerpt?: string;
  /**
   * Deep-content snippet, scored against queries but not displayed.
   * For episodes: joined segmentTitles + answerCapsule. For blog
   * posts: answerCapsule. Gives the client-side search access to
   * substantive text without shipping full transcripts.
   */
  deepText?: string;
}

/**
 * Score-based search that ranks results by relevance.
 * Matches in title score 10x, keywords 5x, description 2x, guest 8x.
 */
export function searchItems(
  items: SearchableItem[],
  query: string
): SearchableItem[] {
  if (!query.trim()) return items;

  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) return items;

  const scored = items.map((item) => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const guestLower = (item.guest || "").toLowerCase();
    const keywordsLower = item.keywords.join(" ").toLowerCase();
    const deepLower = (item.deepText || "").toLowerCase();

    for (const term of terms) {
      // Title matches (highest weight)
      if (titleLower.includes(term)) score += 10;
      // Guest name matches
      if (guestLower.includes(term)) score += 8;
      // Keyword matches
      if (keywordsLower.includes(term)) score += 5;
      // Description matches
      if (descLower.includes(term)) score += 2;
      // Deep-content match $€” catches queries that only appear in the
      // answer capsule or segment titles (not the metadata above).
      if (deepLower.includes(term)) score += 1;
      // Exact word match bonus
      if (titleLower.split(/\s+/).includes(term)) score += 5;
    }

    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);
}

/**
 * Content pillar classification using keyword scoring.
 * Returns the best-matching pillar for a given text.
 */
export const PILLAR_KEYWORDS: Record<ContentPillar, string[]> = {
  coaching: [
    "training",
    "ftp",
    "watts",
    "power",
    "intervals",
    "threshold",
    "periodisation",
    "zone 2",
    "polarised",
    "sweet spot",
    "tempo",
    "vo2max",
    "lactate",
    "aerobic",
    "structured",
    "coach",
    "base training",
    "endurance",
    "intensity",
    "cadence",
    "pacing",
    "winter training",
    "indoor",
    "turbo",
    "race preparation",
    "self coached",
  ],
  nutrition: [
    "nutrition",
    "fuelling",
    "diet",
    "carbs",
    "carbohydrate",
    "protein",
    "hydration",
    "race weight",
    "body composition",
    "supplements",
    "glycogen",
    "energy availability",
    "red-s",
    "calorie",
    "eating",
    "weight loss",
    "fat loss",
    "body fat",
    "meal",
    "food",
    "fasted",
    "gel",
    "energy drink",
    "sodium",
    "electrolyte",
  ],
  strength: [
    "strength",
    "gym",
    "weights",
    "squat",
    "deadlift",
    "s&c",
    "injury prevention",
    "core",
    "mobility",
    "resistance",
    "muscle",
    "exercises",
    "workout",
    "plank",
    "stretching",
    "flexibility",
    "yoga",
  ],
  recovery: [
    "recovery",
    "sleep",
    "rest",
    "adaptation",
    "overtraining",
    "fatigue",
    "stress",
    "mental health",
    "burnout",
    "longevity",
    "wellness",
    "ageing",
    "injury",
    "comeback",
    "heart rate",
    "hrv",
    "ice bath",
    "massage",
    "compression",
  ],
  community: [
    "culture",
    "peloton",
    "pro cycling",
    "tour de france",
    "giro",
    "vuelta",
    "classics",
    "gravel",
    "adventure",
    "career",
    "equipment",
    "bike fit",
    "descending",
    "group ride",
    "etiquette",
    "team sky",
    "doping",
    "history",
    "bikepacking",
    "tyre",
    "tire",
    "wheels",
    "aero",
    "race",
    "racing",
    "story",
    "untold",
    "mechanic",
  ],
};

export function classifyPillar(text: string): ContentPillar {
  const lowerText = text.toLowerCase();

  const scores: Record<ContentPillar, number> = {
    coaching: 0,
    nutrition: 0,
    strength: 0,
    recovery: 0,
    community: 0,
  };

  for (const [pillar, keywords] of Object.entries(PILLAR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[pillar as ContentPillar]++;
      }
    }
  }

  let maxPillar: ContentPillar = "community";
  let maxScore = 0;

  for (const [pillar, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxPillar = pillar as ContentPillar;
    }
  }

  return maxPillar;
}
