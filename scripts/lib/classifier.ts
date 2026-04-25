type ContentPillar = "coaching" | "nutrition" | "strength" | "recovery" | "community";
type EpisodeType = "interview" | "solo" | "panel" | "sarah-anthony";

const PILLAR_KEYWORDS: Record<ContentPillar, string[]> = {
  coaching: [
    "training", "ftp", "watts", "power", "intervals", "threshold",
    "periodisation", "periodization", "zone 2", "zone2", "polarised",
    "polarized", "sweet spot", "tempo", "vo2max", "vo2", "lactate",
    "aerobic", "structured", "coach", "coaching", "base training",
    "endurance", "intensity", "cadence", "low cadence", "torque",
    "winter training", "race preparation", "pacing",
  ],
  nutrition: [
    "nutrition", "fuelling", "fueling", "diet", "carbs", "carbohydrate",
    "protein", "hydration", "race weight", "body composition", "supplements",
    "glycogen", "energy availability", "red-s", "calorie", "eating",
    "weight loss", "fat loss", "body fat", "meal", "food", "fasted",
    "bonk", "bonking", "cookbook",
  ],
  strength: [
    "strength", "gym", "weights", "squat", "deadlift", "s&c",
    "injury prevention", "core", "mobility", "resistance", "muscle",
    "exercises", "workout", "plank", "stretching", "flexibility",
    "pogacar exercises",
  ],
  recovery: [
    "recovery", "sleep", "rest", "adaptation", "overtraining",
    "fatigue", "stress", "mental health", "burnout", "longevity",
    "wellness", "ageing", "aging", "injury", "comeback", "return",
    "heart rate", "hrv", "cardiac",
  ],
  community: [
    "culture", "peloton", "pro cycling", "tour de france", "giro",
    "vuelta", "classics", "gravel", "adventure", "career", "cycling culture",
    "equipment", "bike fit", "descending", "group ride", "etiquette",
    "team sky", "ineos", "pogacar", "vingegaard", "froome", "lemond",
    "lachlan morton", "bikepacking", "aero", "race", "racing",
    "world tour", "story", "behind", "truth", "dark truth",
    "doping", "history",
  ],
};

const HOST_NAMES = [
  "anthony", "anthony walsh", "walsh",
  "sarah", "sarah egan", "sarahannegan",
];

/**
 * Extract guest name from video title
 */
export function extractGuest(title: string, description: string): string | undefined {
  // Common patterns in podcast titles
  const patterns = [
    // "EP 247: Guest Name on Topic"
    /^(?:EP?|Episode|#)\s*\d+\s*[:\-$–$—|]\s*(.+?)\s+(?:on|about|explains|reveals|talks|discusses|shares)\s/i,
    // "Topic | Guest Name"
    /\|\s*(.+?)$/,
    // "Guest Name $— Topic"
    /^(.+?)\s*[$—$–\-]\s*.+$/,
    // "Guest Name: Topic"
    /^([A-Z][a-z]+(?: [A-Z][a-z]+)+)\s*:/,
    // "Interview with Guest Name"
    /(?:interview|chat|conversation)\s+with\s+(.+?)(?:\s*[|\-$–$—]|$)/i,
    // "with Guest Name" at end
    /with\s+([A-Z][a-z]+(?: (?:[A-Z][a-z]+|[A-Z]\.?))+)$/,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const name = match[1].trim();
      // Filter out host names
      if (!HOST_NAMES.some((h) => name.toLowerCase().includes(h))) {
        // Basic validation: should look like a person's name (2-5 words, starts with capital)
        if (/^[A-Z]/.test(name) && name.split(/\s+/).length <= 5 && name.length < 50) {
          return name;
        }
      }
    }
  }

  // Check description for "with [Name]" pattern in first line
  const firstLine = description.split("\n")[0];
  const descMatch = firstLine.match(
    /with\s+([A-Z][a-z]+(?: (?:[A-Z][a-z]+|[A-Z]\.?))+)/
  );
  if (descMatch) {
    const name = descMatch[1].trim();
    if (!HOST_NAMES.some((h) => name.toLowerCase().includes(h))) {
      return name;
    }
  }

  return undefined;
}

/**
 * Classify episode into a content pillar based on keyword scoring
 */
export function classifyPillar(
  title: string,
  description: string,
  tags: string[]
): ContentPillar {
  const text = `${title} ${description} ${tags.join(" ")}`.toLowerCase();

  const scores: Record<ContentPillar, number> = {
    coaching: 0,
    nutrition: 0,
    strength: 0,
    recovery: 0,
    community: 0,
  };

  for (const [pillar, keywords] of Object.entries(PILLAR_KEYWORDS)) {
    for (const keyword of keywords) {
      // Count occurrences, weight title matches 3x
      const titleLower = title.toLowerCase();
      if (titleLower.includes(keyword)) {
        scores[pillar as ContentPillar] += 3;
      }
      // Count in full text (description + tags)
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = text.match(regex);
      if (matches) {
        scores[pillar as ContentPillar] += matches.length;
      }
    }
  }

  // Find highest scoring pillar
  let maxPillar: ContentPillar = "community"; // default fallback
  let maxScore = 0;

  for (const [pillar, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxPillar = pillar as ContentPillar;
    }
  }

  return maxPillar;
}

/**
 * Classify episode type
 */
export function classifyType(title: string, description: string): EpisodeType {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("sarah") && (text.includes("anthony") || text.includes("walsh"))) {
    return "sarah-anthony";
  }

  if (/\b(panel|roundtable|q&a|mailbag|listener questions|ask roadman)\b/i.test(text)) {
    return "panel";
  }

  if (/\b(solo|just me|my thoughts|no guest|i tried|i tested|i lost|i went)\b/i.test(text)) {
    return "solo";
  }

  return "interview";
}

/**
 * Extract episode number from title, or return undefined
 */
export function extractEpisodeNumber(title: string): number | undefined {
  const match = title.match(/(?:EP?|Episode|#)\s*(\d+)/i);
  if (match) {
    return parseInt(match[1]);
  }
  return undefined;
}
