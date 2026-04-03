import { getAllPosts, type BlogPostMeta } from "./blog";
import { getAllEpisodes, type EpisodeMeta } from "./podcast";
import { type ContentPillar } from "@/types";

export interface TopicHub {
  slug: string;
  title: string;
  headline: string;
  description: string;
  pillar: ContentPillar;
  keywords: string[];
  posts: BlogPostMeta[];
  episodes: EpisodeMeta[];
}

/**
 * Topic hubs — curated landing pages that group related content.
 * Each one targets a high-value keyword cluster.
 */
const TOPIC_DEFINITIONS: Omit<TopicHub, "posts" | "episodes">[] = [
  {
    slug: "ftp-training",
    title: "FTP Training for Cyclists",
    headline: "EVERYTHING YOU NEED TO KNOW ABOUT FTP",
    description:
      "The complete guide to FTP training for cyclists. How to test, train, and improve your Functional Threshold Power with evidence-based methods.",
    pillar: "coaching",
    keywords: [
      "ftp training",
      "ftp cycling",
      "ftp zones",
      "improve ftp",
      "ftp test",
      "functional threshold power",
      "ftp plateau",
    ],
  },
  {
    slug: "cycling-nutrition",
    title: "Cycling Nutrition Guide",
    headline: "FUEL SMARTER, RIDE FASTER",
    description:
      "Evidence-based cycling nutrition. What to eat before, during, and after rides. Weight management, race-day fuelling, and the science of performance nutrition.",
    pillar: "nutrition",
    keywords: [
      "cycling nutrition",
      "cycling diet",
      "what to eat cycling",
      "cycling fuelling",
      "endurance nutrition",
      "cycling weight loss",
    ],
  },
  {
    slug: "cycling-training-plans",
    title: "Cycling Training Plans & Methodology",
    headline: "TRAIN WITH PURPOSE",
    description:
      "Structured cycling training plans and methodology. Periodisation, polarised training, sweet spot, base building, and how to get faster with limited time.",
    pillar: "coaching",
    keywords: [
      "cycling training plan",
      "cycling periodisation",
      "polarised training cycling",
      "cycling training structure",
      "base training cycling",
    ],
  },
  {
    slug: "cycling-recovery",
    title: "Cycling Recovery & Injury Prevention",
    headline: "RECOVER HARDER",
    description:
      "Recovery strategies that actually work for cyclists. Sleep, injury prevention, comeback protocols, and the science of adaptation.",
    pillar: "recovery",
    keywords: [
      "cycling recovery",
      "cycling injury prevention",
      "cycling knee pain",
      "sleep cycling performance",
      "cycling comeback",
    ],
  },
  {
    slug: "cycling-strength-conditioning",
    title: "Strength & Conditioning for Cyclists",
    headline: "STRONGER OFF THE BIKE, FASTER ON IT",
    description:
      "The complete guide to S&C for cyclists. Exercises, programming, in-season maintenance, and why most gym programs get it wrong for endurance athletes.",
    pillar: "strength",
    keywords: [
      "strength training cycling",
      "s&c cycling",
      "gym for cyclists",
      "cycling stretching",
      "cycling exercises",
    ],
  },
  {
    slug: "cycling-weight-loss",
    title: "Cycling & Weight Loss",
    headline: "LOSE WEIGHT WITHOUT LOSING POWER",
    description:
      "How to lose weight while cycling without sacrificing performance. Body composition, fuel for the work required, and the mistakes that keep cyclists heavy.",
    pillar: "nutrition",
    keywords: [
      "cycling weight loss",
      "lose weight cycling",
      "cycling body composition",
      "power to weight ratio",
      "cycling diet plan",
    ],
  },
  {
    slug: "cycling-beginners",
    title: "Getting Into Cycling",
    headline: "START HERE",
    description:
      "Everything a new cyclist needs to know. Group ride etiquette, bike fit, gravel cycling, tyre pressure, and the culture of the sport.",
    pillar: "le-metier",
    keywords: [
      "beginner cycling",
      "start cycling",
      "cycling tips beginners",
      "group ride etiquette",
      "cycling basics",
    ],
  },
];

/** Map of topic slugs to relevant blog post slugs */
const TOPIC_POST_MAP: Record<string, string[]> = {
  "ftp-training": [
    "ftp-training-zones-cycling-complete-guide",
    "how-to-improve-ftp-cycling",
    "ftp-plateau-breakthrough",
    "sweet-spot-training-cycling",
    "cycling-vo2max-intervals",
    "vo2max-cycling-fixable-reasons-low",
    "cycling-power-to-weight-ratio-guide",
    "cycling-cadence-optimal-guide",
    "low-cadence-training-cycling-torque-intervals",
    "heart-rate-high-cycling-fixable-reasons",
  ],
  "cycling-nutrition": [
    "cycling-in-ride-nutrition-guide",
    "cycling-nutrition-race-day-guide",
    "cycling-energy-gels-guide",
    "cycling-hydration-guide",
    "cycling-fasted-riding-myth",
    "cycling-body-composition-guide",
    "cycling-weight-loss-fuel-for-the-work-required",
    "eating-like-pidcock-60-days",
  ],
  "cycling-training-plans": [
    "cycling-periodisation-plan-guide",
    "polarised-training-cycling-guide",
    "cycling-base-training-guide",
    "reverse-periodisation-cycling",
    "winter-training-cycling-guide",
    "cycling-training-full-time-job",
    "cycling-tapering-guide",
    "etape-du-tour-training-plan",
    "cycling-indoor-training-tips",
    "zone-2-training-complete-guide",
    "trainerroad-vs-coaching",
    "self-coached-cyclist-mistakes",
    "how-pro-cyclist-trains-60-days",
  ],
  "cycling-recovery": [
    "cycling-recovery-tips",
    "cycling-sleep-performance-guide",
    "cycling-knee-pain-causes-fixes",
    "cycling-returning-after-break",
    "cycling-stretching-routine",
  ],
  "cycling-strength-conditioning": [
    "cycling-strength-training-guide",
    "cycling-stretching-routine",
    "cycling-knee-pain-causes-fixes",
  ],
  "cycling-weight-loss": [
    "cycling-weight-loss-fuel-for-the-work-required",
    "cycling-weight-loss-mistakes",
    "cycling-body-composition-guide",
    "cycling-fasted-riding-myth",
    "cycling-power-to-weight-ratio-guide",
    "eating-like-pidcock-60-days",
  ],
  "cycling-beginners": [
    "cycling-group-ride-etiquette-guide",
    "bike-fit-one-change-amateurs-should-make",
    "gravel-cycling-beginners-guide",
    "cycling-tyre-pressure-guide",
    "cycling-base-training-guide",
    "cycling-indoor-training-tips",
    "best-cycling-podcasts-2026",
  ],
};

/** Keyword patterns for matching episodes to topics */
const TOPIC_EPISODE_KEYWORDS: Record<string, RegExp> = {
  "ftp-training": /ftp|threshold|power|zones?|watts|watt\/kg/i,
  "cycling-nutrition": /nutri|fuel|diet|eat|food|carb|protein|hydrat|gel|calor/i,
  "cycling-training-plans":
    /train|periodis|plan|base|build|structure|interval|session|polarised|sweet spot|zone 2/i,
  "cycling-recovery": /recov|sleep|injur|pain|rest|adaptation|comeback|break/i,
  "cycling-strength-conditioning": /strength|gym|s&c|stretch|core|muscle|lift/i,
  "cycling-weight-loss": /weight|fat|lean|body comp|diet|kilo|kg|w\/kg/i,
  "cycling-beginners": /beginn|start|new to|etiquette|gravel|tyre|tire|bike fit/i,
};

export function getAllTopics(): TopicHub[] {
  const allPosts = getAllPosts();
  const allEpisodes = getAllEpisodes();

  return TOPIC_DEFINITIONS.map((topic) => {
    // Get mapped blog posts
    const postSlugs = new Set(TOPIC_POST_MAP[topic.slug] || []);
    const posts = allPosts.filter((p) => postSlugs.has(p.slug));

    // Get relevant episodes by keyword matching (limit to 12 most relevant)
    const keywordPattern = TOPIC_EPISODE_KEYWORDS[topic.slug];
    const episodes = keywordPattern
      ? allEpisodes
          .filter(
            (ep) =>
              keywordPattern.test(ep.title) ||
              keywordPattern.test(ep.description)
          )
          .slice(0, 12)
      : [];

    return { ...topic, posts, episodes };
  });
}

export function getTopicBySlug(slug: string): TopicHub | null {
  return getAllTopics().find((t) => t.slug === slug) || null;
}

export function getAllTopicSlugs(): string[] {
  return TOPIC_DEFINITIONS.map((t) => t.slug);
}
