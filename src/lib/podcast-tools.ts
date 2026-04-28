/**
 * Match a podcast episode to the most relevant on-site calculators / tools.
 *
 * Used by the episode page to render an "Use these tools" section and to
 * emit `mentions` entries in the PodcastEpisode JSON-LD so search engines
 * connect the episode to its supporting tool surface.
 *
 * Scoring is intentionally simple and mirrors the mentionedEvents pattern
 * already on the episode page: pillar match (strong signal) plus
 * keyword/title/description hits (granular signal). Returns up to N tools.
 */

import type { ContentPillar } from "@/types";
import type { EpisodeMeta } from "./podcast";

export interface PodcastToolMatch {
  slug: string;
  title: string;
  href: string;
  blurb: string;
  /** Schema.org @type — used when emitting `mentions` JSON-LD entries. */
  schemaType: "WebApplication" | "Service";
}

interface ToolEntry {
  slug: string;
  title: string;
  href: string;
  blurb: string;
  pillars: ContentPillar[];
  /** Lowercase keyword fragments. Substring match against the haystack. */
  keywords: string[];
  schemaType: "WebApplication" | "Service";
}

const PODCAST_TOOLS: ToolEntry[] = [
  {
    slug: "ftp-zones",
    title: "FTP Zone Calculator",
    href: "/tools/ftp-zones",
    blurb: "Convert your FTP into 7 power training zones in watts.",
    pillars: ["coaching"],
    keywords: ["ftp", "power zones", "training zones", "threshold", "polarised", "polarized", "zone 2", "watts"],
    schemaType: "WebApplication",
  },
  {
    slug: "wkg",
    title: "W/kg Calculator",
    href: "/tools/wkg",
    blurb: "Power-to-weight ratio with amateur and pro benchmarks.",
    pillars: ["coaching", "nutrition"],
    keywords: ["w/kg", "watts per kg", "power to weight", "climber", "climbing"],
    schemaType: "WebApplication",
  },
  {
    slug: "hr-zones",
    title: "Heart-Rate Zone Calculator",
    href: "/tools/hr-zones",
    blurb: "Five HR zones from your max HR or LTHR.",
    pillars: ["coaching"],
    keywords: ["heart rate", "hr zone", "lthr", "max hr", "rpe"],
    schemaType: "WebApplication",
  },
  {
    slug: "fuelling",
    title: "In-Ride Fuelling Calculator",
    href: "/tools/fuelling",
    blurb: "Carbs, fluid and sodium per hour for your ride.",
    pillars: ["nutrition"],
    keywords: ["fuelling", "fueling", "carbs", "carbohydrate", "gel", "bonk", "glycogen", "hydration", "sodium", "gut training"],
    schemaType: "WebApplication",
  },
  {
    slug: "race-weight",
    title: "Race Weight Calculator",
    href: "/tools/race-weight",
    blurb: "Target weight range from your event and body composition.",
    pillars: ["nutrition"],
    keywords: ["race weight", "body composition", "body fat", "lean mass", "weight loss", "leaner", "climber"],
    schemaType: "WebApplication",
  },
  {
    slug: "energy-availability",
    title: "Energy Availability Calculator",
    href: "/tools/energy-availability",
    blurb: "Screen for RED-S risk from intake and training load.",
    pillars: ["nutrition", "recovery"],
    keywords: ["red-s", "reds", "energy availability", "under-fuelling", "underfuelling", "low ea", "amenorrhea", "stress fracture"],
    schemaType: "WebApplication",
  },
  {
    slug: "tyre-pressure",
    title: "Tyre Pressure Calculator",
    href: "/tools/tyre-pressure",
    blurb: "Front and rear PSI tuned for your weight, tyre, and surface.",
    pillars: ["community"],
    keywords: ["tyre pressure", "tire pressure", "rolling resistance", "silca", "tubeless", "psi", "tyre width", "rim width"],
    schemaType: "WebApplication",
  },
  {
    slug: "shock-pressure",
    title: "MTB Suspension Setup Calculator",
    href: "/tools/shock-pressure",
    blurb: "Fork and shock pressure, sag targets, and tuning steps.",
    pillars: ["community"],
    keywords: ["mtb", "mountain bike", "suspension", "shock", "fork", "sag", "rebound", "compression"],
    schemaType: "WebApplication",
  },
  {
    slug: "predict",
    title: "Race Predictor",
    href: "/predict",
    blurb: "Simulate your finish time on real elevation data.",
    pillars: ["coaching", "community"],
    keywords: ["race predictor", "finish time", "pacing", "power balance", "gpx", "etape", "marmotte", "fred whitton", "gran fondo", "sportive"],
    schemaType: "WebApplication",
  },
  {
    slug: "plateau",
    title: "Plateau Diagnostic",
    href: "/plateau",
    blurb: "Twelve questions, one specific answer for your limiter.",
    pillars: ["coaching"],
    keywords: ["plateau", "stuck", "no progress", "ftp stuck", "stalled", "limiter"],
    schemaType: "Service",
  },
  {
    slug: "ask",
    title: "Ask Roadman",
    href: "/ask",
    blurb: "Anthony's coaching brain on tap, grounded in 1,400+ episodes.",
    pillars: ["coaching", "nutrition", "strength", "recovery", "community"],
    keywords: [],
    schemaType: "Service",
  },
];

/**
 * Pick the most relevant tools for an episode. Pillar match is the strongest
 * signal (+10), keyword hits in title/description/keywords/transcript add
 * granular score (+3 per match, capped to avoid runaway scores on long
 * transcripts). Ties broken by alphabetical slug for stable output.
 */
export function getRelevantTools(
  episode: Pick<EpisodeMeta, "title" | "description" | "keywords" | "pillar"> & { transcript?: string },
  limit: number = 3,
): PodcastToolMatch[] {
  const haystack = [
    episode.title,
    episode.description,
    (episode.keywords ?? []).join(" "),
    episode.transcript ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const scored = PODCAST_TOOLS.map((tool) => {
    let score = 0;
    if (tool.pillars.includes(episode.pillar)) score += 10;
    let keywordHits = 0;
    for (const kw of tool.keywords) {
      if (haystack.includes(kw)) keywordHits++;
    }
    score += Math.min(keywordHits, 5) * 3;
    return { tool, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.slug.localeCompare(b.tool.slug))
    .slice(0, limit);

  // If nothing matched (e.g. a pillar like "community" with no tool fit),
  // surface Ask Roadman as a sensible default. It applies to every pillar.
  if (scored.length === 0) {
    const askRoadman = PODCAST_TOOLS.find((t) => t.slug === "ask");
    if (askRoadman) {
      return [
        {
          slug: askRoadman.slug,
          title: askRoadman.title,
          href: askRoadman.href,
          blurb: askRoadman.blurb,
          schemaType: askRoadman.schemaType,
        },
      ];
    }
  }

  return scored.map(({ tool }) => ({
    slug: tool.slug,
    title: tool.title,
    href: tool.href,
    blurb: tool.blurb,
    schemaType: tool.schemaType,
  }));
}
