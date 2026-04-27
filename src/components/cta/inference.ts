import type { ContentPillar } from "@/types";
import type { IntentCTACategory } from "./registry";

/**
 * Keyword-driven inference for picking an IntentCTACategory from
 * article metadata. Lets templates use IntentCTA without requiring
 * authors to hand-tag every post — keywords / title / excerpt do the
 * work. Returns null when nothing scores; callers should fall back to
 * `pillar` then.
 *
 * Why this lives outside `registry.ts`: the registry exports the
 * typed call-site contract (`IntentCTACategory`, `IntentCTAVariant`,
 * `PILLAR_FALLBACK`) and is imported by every CTA component. Keeping
 * the inference scorer separate means non-template callers (admin
 * dashboards, sitemap generators) can pull the registry types without
 * dragging the keyword tables along.
 */

interface CategoryRule {
  category: IntentCTACategory;
  /** Lower-case substring matches against the combined haystack. */
  keywords: readonly string[];
  /** Pillars where this category is the natural pick — small tie-break. */
  pillars: readonly ContentPillar[];
  /** Higher = more specific. Multiplied with hit count when scoring. */
  priority: number;
}

const RULES: readonly CategoryRule[] = [
  {
    category: "plateau",
    keywords: [
      "plateau",
      "stuck",
      "no progress",
      "stalled",
      "ftp not improving",
      "ftp stuck",
    ],
    pillars: ["coaching"],
    priority: 5,
  },
  {
    category: "coaching-decision",
    // Comparison and "do I need a coach" intent — surfaces above the
    // generic "zones" and "training" matches because the call-to-
    // action divergence is so different.
    keywords: [
      "vs trainerroad",
      "trainerroad vs",
      "vs zwift",
      "zwift vs",
      "vs sufferfest",
      "coach or app",
      "coach vs app",
      "is coaching worth it",
      "do i need a coach",
      "trainerroad or coach",
    ],
    pillars: ["coaching"],
    priority: 5,
  },
  {
    category: "event",
    keywords: [
      "etape",
      "marmotte",
      "haute route",
      "sportive",
      "gran fondo",
      "granfondo",
      "fondo",
      "event prep",
      "race day",
      "race prep",
      "century ride",
      "ride london",
      "maratona",
      "stelvio",
    ],
    pillars: ["coaching", "nutrition"],
    priority: 4,
  },
  {
    category: "masters",
    keywords: [
      "masters",
      "over 40",
      "over 50",
      "older cyclist",
      "veteran",
      "after 40",
      "after 50",
      "ageing cyclist",
      "aging cyclist",
    ],
    pillars: ["coaching", "recovery"],
    priority: 4,
  },
  {
    category: "nutrition",
    keywords: [
      "fuel",
      "fuelling",
      "fueling",
      "carb",
      "carbohydrate",
      "nutrition",
      "race weight",
      "body composition",
      "gels",
      "in-ride",
      "in ride",
      "g/h",
      "grams per hour",
      "low carb",
      "ketogenic",
      "protein",
    ],
    pillars: ["nutrition"],
    priority: 4,
  },
  {
    category: "strength",
    keywords: [
      "strength",
      "gym",
      "lifting",
      "squat",
      "deadlift",
      "s&c",
      "s and c",
      "off the bike",
      "weight training",
      "resistance training",
      "core",
    ],
    pillars: ["strength"],
    priority: 4,
  },
  {
    category: "zones",
    keywords: [
      "zone 2",
      "zone-2",
      "zones",
      "training zone",
      "ftp zones",
      "heart rate zones",
      "coggan",
      "polarised",
      "polarized",
      "sweet spot",
      "tempo",
      "threshold",
    ],
    pillars: ["coaching"],
    priority: 4,
  },
  {
    category: "podcast",
    keywords: [
      "podcast",
      "episode",
      "playlist",
      "interview with",
      "listen",
    ],
    pillars: ["community"],
    priority: 2,
  },
];

export interface InferIntentCategoryInput {
  /** Frontmatter `keywords[]` from the article. */
  keywords?: readonly string[];
  /** Article title — folded in as a low-weight signal. */
  title?: string;
  /** Article excerpt — folded in as a low-weight signal. */
  excerpt?: string;
  /** Pillar — used as a tie-break only. */
  pillar?: ContentPillar;
  /** Free-form page-type hint (e.g. "comparison", "tool"). */
  pageType?: string;
}

export function inferIntentCategory(
  input: InferIntentCategoryInput,
): IntentCTACategory | null {
  const haystacks: string[] = [];
  if (input.keywords) haystacks.push(input.keywords.join(" "));
  if (input.title) haystacks.push(input.title);
  if (input.excerpt) haystacks.push(input.excerpt);
  if (input.pageType) haystacks.push(input.pageType);
  const haystack = haystacks.join(" ").toLowerCase();
  if (!haystack) return null;

  let best: IntentCTACategory | null = null;
  let bestScore = 0;

  for (const rule of RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (haystack.includes(kw)) hits += 1;
    }
    if (hits === 0) continue;
    const pillarBonus =
      input.pillar && rule.pillars.includes(input.pillar) ? 1 : 0;
    const score = hits * rule.priority + pillarBonus;
    if (score > bestScore) {
      bestScore = score;
      best = rule.category;
    }
  }

  return best;
}
