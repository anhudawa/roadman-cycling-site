import fs from "node:fs";
import path from "node:path";
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
  /**
   * Short noun phrase used in the commercial CTA headline
   * ("GET COACHED ON {ctaHeadline}"). Hand-written per topic because
   * slicing the topic headline programmatically produces broken
   * phrases like "GET COACHED ON FUEL SMARTER, RIDE".
   */
  ctaHeadline: string;
  posts: BlogPostMeta[];
  episodes: EpisodeMeta[];
  tools: TopicTool[];
  commercialPath: string;
  relatedTopics: string[];
  featuredPostSlugs: string[];
  /**
   * Long-form pillar content (MDX). Rendered between the hero and the
   * article grid on /topics/[slug] when present. Source files live at
   * `content/topics/<slug>.mdx`. Lets thin hub pages (previously just a
   * one-paragraph description + link list) carry the 2,000-3,000 words
   * of pillar prose that Google and AI search models reward with
   * ranking/citation for "cycling X" head-term queries.
   */
  pillarContent: string | null;
}

export interface TopicTool {
  slug: string;
  title: string;
  href: string;
}

/**
 * Topic hubs — curated landing pages that group related content.
 * Each one targets a high-value keyword cluster.
 */
const TOPIC_DEFINITIONS: Omit<TopicHub, "posts" | "episodes" | "tools" | "commercialPath" | "relatedTopics" | "featuredPostSlugs" | "pillarContent">[] = [
  {
    slug: "ftp-training",
    title: "FTP Training for Cyclists — The Complete Evidence-Based Guide",
    headline: "FTP TRAINING — THE COMPLETE GUIDE",
    ctaHeadline: "FTP TRAINING BUILT AROUND YOUR NUMBERS.",
    description:
      "The complete guide to FTP training. How to test, train, and improve your Functional Threshold Power — grounded in conversations with Professor Seiler, Dan Lorang, and 1,400+ podcast episodes.",
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
    title: "Cycling Nutrition — The Complete Evidence-Based Guide",
    headline: "FUEL SMARTER, RIDE FASTER",
    ctaHeadline: "FUELLING BUILT INTO YOUR TRAINING WEEK.",
    description:
      "The complete guide to fuelling for cycling performance. In-ride nutrition, race weight, body composition, protein, hydration, and the science of eating to ride faster — from the Roadman Cycling Podcast.",
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
    title: "Cycling Training Plans — How to Structure Your Training Year",
    headline: "TRAIN WITH PURPOSE",
    ctaHeadline: "A PLAN BUILT AROUND YOUR LIFE.",
    description:
      "How to build a cycling training plan that actually works. Periodisation, weekly structure, time-crunched plans, event preparation, and the framework used by World Tour coaches — adapted for amateurs.",
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
    title: "Cycling Recovery — The Complete Evidence-Based Guide",
    headline: "RECOVER HARDER",
    ctaHeadline: "RECOVERY, PLANNED — NOT ASSUMED.",
    description:
      "Recovery is where adaptation happens — not on the bike. Sleep, nutrition, active recovery, and stress management for cyclists who want to get faster without breaking down.",
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
    title: "Strength Training for Cyclists — The Complete Guide",
    headline: "STRONGER OFF THE BIKE, FASTER ON IT",
    ctaHeadline: "STRENGTH WORK, PERIODISED WITH YOUR RIDING.",
    description:
      "Cycling-specific strength training: what exercises to do, how heavy, how often, and how to periodise gym work alongside your bike training. Evidence-based, coach-approved.",
    pillar: "strength",
    keywords: [
      "strength training for cyclists",
      "strength training for cyclists over 40",
      "heavy lifting cyclists",
      "cycling gym exercises",
      "cycling gym exercises best",
      "best exercises for cyclists",
      "core workout for cyclists",
      "masters cyclist strength training",
      "s&c for cyclists",
      "gym programme for cyclists",
      "cycling stretching routine",
      "in-season strength cycling",
      "heavy strength cycling",
      "strength training cycling performance",
    ],
  },
  {
    slug: "cycling-weight-loss",
    title: "Cycling & Weight Loss",
    headline: "LOSE WEIGHT WITHOUT LOSING POWER",
    ctaHeadline: "LOSE WEIGHT WITHOUT LOSING WATTS.",
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
    ctaHeadline: "A COACHED START — WHEN YOU'RE READY.",
    description:
      "Everything a new cyclist needs to know. Group ride etiquette, bike fit, gravel cycling, tyre pressure, and the culture of the sport.",
    pillar: "community",
    keywords: [
      "beginner cycling",
      "start cycling",
      "cycling tips beginners",
      "group ride etiquette",
      "cycling basics",
    ],
  },
  {
    slug: "triathlon-cycling",
    title: "Cycling for Triathletes — The Bike Leg Specialist",
    headline: "OWN THE BIKE LEG",
    ctaHeadline: "BIKE COACHING THAT PROTECTS YOUR RUN.",
    description:
      "Everything a triathlete needs to get faster on the bike. FTP pacing, bike nutrition, aero position, power-to-weight, and off-season bike training — from the podcast trusted by Alistair Brownlee and Olav Bu.",
    pillar: "coaching",
    keywords: [
      "triathlon cycling",
      "triathlon bike training",
      "ironman bike pacing",
      "triathlon cycling plan",
      "cycling for triathletes",
      "triathlon bike nutrition",
      "triathlon ftp",
    ],
  },
  {
    slug: "mountain-biking",
    title: "Mountain Biking — Setup, Skills & Routes",
    headline: "DIAL IN YOUR MTB",
    ctaHeadline: "GET FITTER ON THE BIKE — ROAD OR DIRT.",
    description:
      "Everything you need to set up, ride, and maintain your mountain bike. Suspension setup, tyre pressure, fork tuning, trail guides, and the best MTB routes in Ireland.",
    pillar: "community",
    keywords: [
      "mountain bike setup",
      "mtb tyre pressure",
      "fork setup mtb",
      "mountain bike suspension",
      "mtb routes ireland",
      "mountain biking tips",
      "mtb trail guide",
      "mountain bike beginners",
    ],
  },
  {
    slug: "cycling-coaching",
    title: "Cycling Coaching — Online & In-Person",
    headline: "THE COMPLETE GUIDE TO CYCLING COACHING",
    ctaHeadline: "STOP GUESSING. START PROGRESSING.",
    description:
      "The complete guide to cycling coaching. When to get a coach, what to look for, how online coaching works, and why most cyclists plateau without structured guidance. Built from 1,400+ podcast conversations with the coaches behind World Tour teams.",
    pillar: "coaching",
    keywords: [
      "cycling coach",
      "cycling coaching",
      "online cycling coach",
      "cycling coaching program",
      "is a cycling coach worth it",
      "personalised cycling training plan",
      "cycling coach ireland",
      "cycling coach uk",
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
    "zone-2-vs-endurance-training",
    "steady-state-vs-interval-training-cycling",
    "power-meter-vs-smart-trainer",
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
    "fasted-vs-fueled-cycling",
    "cycling-body-recomposition",
    "cycling-protein-timing-guide",
  ],
  "cycling-training-plans": [
    "cycling-periodisation-plan-guide",
    "polarised-training-cycling-guide",
    "stephen-seiler-research-polarised-training-lessons",
    "cycling-base-training-guide",
    "reverse-periodisation-cycling",
    "winter-training-cycling-guide",
    "cycling-training-full-time-job",
    "cycling-tapering-guide",
    "etape-du-tour-training-plan",
    "wicklow-200-training-plan",
    "ring-of-beara-training-plan",
    "ride-london-training-plan",
    "fred-whitton-challenge-training-plan",
    "cycling-indoor-training-tips",
    "zone-2-training-complete-guide",
    "trainerroad-vs-online-cycling-coach",
    "self-coached-cyclist-mistakes",
    "how-pro-cyclist-trains-60-days",
    "zwift-vs-trainerroad",
    "indoor-trainer-vs-rollers",
  ],
  "cycling-recovery": [
    "cycling-recovery-tips",
    "cycling-sleep-performance-guide",
    "cycling-sleep-optimisation",
    "cycling-active-recovery-explained",
    "cycling-knee-pain-causes-fixes",
    "cycling-returning-after-break",
    "cycling-stretching-routine",
    "cycling-overtraining-signs-guide",
    "cycling-active-recovery-rides-guide",
    "cycling-hrv-training-guide",
    "cycling-rest-week-guide",
  ],
  "cycling-strength-conditioning": [
    "cycling-strength-training-guide",
    "cycling-stretching-routine",
    "cycling-knee-pain-causes-fixes",
    "cycling-gym-exercises-best",
    "cycling-core-workout-routine",
    "cycling-leg-day-should-cyclists",
    "yoga-for-cyclists-guide",
    "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    "cycling-deadlift-guide",
    "cycling-mobility-routine",
  ],
  "cycling-weight-loss": [
    "cycling-weight-loss-fuel-for-the-work-required",
    "cycling-weight-loss-mistakes",
    "cycling-body-composition-guide",
    "cycling-fasted-riding-myth",
    "cycling-power-to-weight-ratio-guide",
    "eating-like-pidcock-60-days",
    "fasted-vs-fueled-cycling",
    "cycling-body-recomposition",
    "cycling-protein-timing-guide",
  ],
  "cycling-beginners": [
    "cycling-group-ride-etiquette-guide",
    "bike-fit-one-change-amateurs-should-make",
    "gravel-cycling-beginners-guide",
    "cycling-tyre-pressure-guide",
    "cycling-base-training-guide",
    "cycling-indoor-training-tips",
    "best-cycling-podcasts-2026",
    "wahoo-vs-garmin-cycling-computers",
    "tubeless-vs-clincher-tyres",
    "aero-vs-weight-cyclist",
    "rouvy-vs-zwift",
  ],
  "triathlon-cycling": [
    "triathlon-cycling-training-plan",
    "triathlon-ftp-pacing-strategy",
    "triathlon-bike-nutrition-strategy",
    "triathlon-cycling-power-to-weight",
    "triathlon-aero-position-guide",
    "triathlon-off-season-cycling",
    "ftp-training-zones-cycling-complete-guide",
    "zone-2-training-complete-guide",
    "cycling-nutrition-race-day-guide",
    "polarised-training-cycling-guide",
  ],
  "cycling-coaching": [
    "trainerroad-vs-online-cycling-coach",
    "self-coached-cyclist-mistakes",
    "cycling-periodisation-plan-guide",
    "cycling-training-full-time-job",
    "cycling-over-40-getting-faster",
    "cycling-over-50-training",
    "ftp-plateau-breakthrough",
    "how-to-get-faster-cycling",
    "cycling-base-training-guide",
    "zone-2-training-complete-guide",
    "polarised-training-cycling-guide",
    "stephen-seiler-research-polarised-training-lessons",
    "cycling-sportive-preparation",
    "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    "is-a-cycling-coach-worth-it",
    "best-online-cycling-coach-how-to-choose",
    "personalised-cycling-training-plan-why-generic-plans-fail",
    "cycling-coach-near-me-why-location-doesnt-matter-2026",
    "cycling-coaching-for-beginners-when-ready",
    "what-does-a-cycling-coach-do",
    "how-much-does-online-cycling-coach-cost-2026",
    "zwift-vs-cycling-coach",
    "best-cycling-coach-guide",
    "best-cycling-coach-ireland",
    "best-cycling-coach-uk",
    "best-cycling-coach-usa",
    "zwift-vs-trainerroad",
    "power-meter-vs-smart-trainer",
    "trainerroad-vs-online-cycling-coach",
  ],
  "mountain-biking": [
    "mtb-fork-setup-guide",
    "mtb-tyre-pressure-guide",
    "mtb-suspension-setup-complete-guide",
    "mtb-dropper-post-setup-guide",
    "best-mtb-trails-ireland",
    "best-mtb-trails-wicklow",
    "best-mtb-trails-belfast",
    "mtb-winter-riding-guide",
    "mtb-tubeless-conversion-guide",
    "mtb-bike-fit-basics",
    "mtb-skills-beginners-guide",
    "best-gravel-trails-ireland",
    "mtb-maintenance-guide",
    "mtb-vs-road-cycling-fitness",
    "mtb-heart-rate-zones-guide",
    "mtb-nutrition-trail-fuelling",
  ],
};

/** Cluster enrichment: tools, commercial path, related topics, featured posts */
const TOPIC_ENRICHMENT: Record<string, {
  tools: TopicTool[];
  commercialPath: string;
  relatedTopics: string[];
  featuredPostSlugs: string[];
}> = {
  "ftp-training": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "wkg", title: "W/kg Calculator", href: "/tools/wkg" },
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-training-plans", "cycling-coaching"],
    featuredPostSlugs: [
      "ftp-training-zones-cycling-complete-guide",
      "how-to-improve-ftp-cycling",
      "ftp-plateau-breakthrough",
    ],
  },
  "cycling-nutrition": {
    tools: [
      { slug: "fuelling", title: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
      { slug: "energy-availability", title: "Energy Availability Calculator", href: "/tools/energy-availability" },
      { slug: "race-weight", title: "Race Weight Calculator", href: "/tools/race-weight" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-weight-loss", "ftp-training"],
    featuredPostSlugs: [
      "cycling-weight-loss-fuel-for-the-work-required",
      "cycling-in-ride-nutrition-guide",
      "fasted-vs-fueled-cycling",
    ],
  },
  "cycling-training-plans": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
    commercialPath: "/plan",
    relatedTopics: ["ftp-training", "cycling-coaching"],
    featuredPostSlugs: [
      "polarised-training-cycling-guide",
      "how-to-structure-cycling-training-plan",
      "zone-2-training-complete-guide",
    ],
  },
  "cycling-recovery": {
    tools: [],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-strength-conditioning", "cycling-training-plans"],
    featuredPostSlugs: [
      "cycling-recovery-tips",
      "cycling-sleep-performance-guide",
      "cycling-overtraining-signs-guide",
    ],
  },
  "cycling-strength-conditioning": {
    tools: [],
    commercialPath: "/strength-training",
    relatedTopics: ["cycling-recovery", "ftp-training"],
    featuredPostSlugs: [
      "cycling-strength-training-guide",
      "derek-teel-best-exercises-cyclists",
      "new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
    ],
  },
  "cycling-weight-loss": {
    tools: [
      { slug: "race-weight", title: "Race Weight Calculator", href: "/tools/race-weight" },
      { slug: "energy-availability", title: "Energy Availability Calculator", href: "/tools/energy-availability" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-nutrition", "ftp-training"],
    featuredPostSlugs: [
      "cycling-weight-loss-fuel-for-the-work-required",
      "alex-larson-body-composition-cyclists",
      "cycling-power-to-weight-ratio-guide",
    ],
  },
  "cycling-beginners": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "hr-zones", title: "HR Zone Calculator", href: "/tools/hr-zones" },
      { slug: "tyre-pressure", title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
    ],
    commercialPath: "/start-here",
    relatedTopics: ["ftp-training", "cycling-training-plans"],
    featuredPostSlugs: [
      "how-to-get-faster-cycling",
      "cycling-indoor-training-tips",
      "wahoo-vs-garmin-cycling-computers",
    ],
  },
  "triathlon-cycling": {
    tools: [
      { slug: "ftp-zones", title: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { slug: "fuelling", title: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
    ],
    commercialPath: "/coaching/triathlon",
    relatedTopics: ["cycling-nutrition", "cycling-training-plans"],
    featuredPostSlugs: [
      "bike-leg-of-triathlon-why-age-groupers-get-it-wrong",
      "ironman-bike-training-plan-16-weeks",
      "ftp-training-for-triathletes",
    ],
  },
  "mountain-biking": {
    tools: [
      { slug: "shock-pressure", title: "MTB Setup Calculator", href: "/tools/shock-pressure" },
      { slug: "tyre-pressure", title: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
    ],
    commercialPath: "/coaching",
    relatedTopics: ["cycling-beginners", "cycling-strength-conditioning"],
    featuredPostSlugs: [
      "mtb-suspension-setup-complete-guide",
      "mtb-fork-setup-guide",
      "best-mtb-trails-ireland",
    ],
  },
  "cycling-coaching": {
    tools: [],
    commercialPath: "/apply",
    relatedTopics: ["ftp-training", "cycling-training-plans"],
    featuredPostSlugs: [
      "is-a-cycling-coach-worth-it",
      "cycling-coaching-results-before-and-after",
      "not-done-yet-coaching-review",
    ],
  },
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
  "triathlon-cycling": /triath|ironman|70\.3|half iron|brick|swim.bike|bike.run|t1|t2|aero position|tri bike|tt bike/i,
  "cycling-coaching": /coach|coaching|personalise|structured|methodology|plan.?review|self.?coach|mentor|guided|accountability/i,
  "mountain-biking": /mountain.?bik|mtb|enduro|downhill|trail.?rid|suspension|fork.?setup|sag|shock.?pressur|dropper|trail.?centre/i,
};

/**
 * Reads the long-form pillar MDX for a topic, if one exists.
 * Returns null if no file — so topic hubs without pillar content fall
 * back to the original hero-only layout (no change in behaviour).
 */
const PILLAR_DIR = path.join(process.cwd(), "content/topics");

function loadPillarContent(slug: string): string | null {
  const mdxPath = path.join(PILLAR_DIR, `${slug}.mdx`);
  if (!fs.existsSync(mdxPath)) return null;
  return fs.readFileSync(mdxPath, "utf-8");
}

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

    const enrichment = TOPIC_ENRICHMENT[topic.slug] || {
      tools: [],
      commercialPath: "/coaching",
      relatedTopics: [],
      featuredPostSlugs: [],
    };

    return {
      ...topic,
      posts,
      episodes,
      tools: enrichment.tools,
      commercialPath: enrichment.commercialPath,
      relatedTopics: enrichment.relatedTopics,
      featuredPostSlugs: enrichment.featuredPostSlugs,
      pillarContent: loadPillarContent(topic.slug),
    };
  });
}

export function getTopicBySlug(slug: string): TopicHub | null {
  return getAllTopics().find((t) => t.slug === slug) || null;
}

export function getAllTopicSlugs(): string[] {
  return TOPIC_DEFINITIONS.map((t) => t.slug);
}

export function getTopicTitleBySlug(slug: string): string | null {
  return TOPIC_DEFINITIONS.find((t) => t.slug === slug)?.title ?? null;
}

/**
 * Reverse index: post slug → list of topic hubs that include it.
 *
 * Used on individual blog posts to link back to their parent topic
 * hub(s). Gives Google the bidirectional signal it needs for topic
 * clustering (post → hub, hub → post) and gives readers a natural
 * "explore this topic further" path.
 */
const POST_TO_TOPICS: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const [topicSlug, postSlugs] of Object.entries(TOPIC_POST_MAP)) {
    for (const postSlug of postSlugs) {
      const existing = map.get(postSlug) ?? [];
      existing.push(topicSlug);
      map.set(postSlug, existing);
    }
  }
  return map;
})();

export function getTopicsForPost(postSlug: string): Array<{
  slug: string;
  title: string;
}> {
  const topicSlugs = POST_TO_TOPICS.get(postSlug) ?? [];
  return topicSlugs
    .map((slug) => {
      const def = TOPIC_DEFINITIONS.find((t) => t.slug === slug);
      return def ? { slug: def.slug, title: def.title } : null;
    })
    .filter((x): x is { slug: string; title: string } => x !== null);
}
