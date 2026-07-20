import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes, getTranscriptSlugs } from "@/lib/podcast";
import { EPISODES_PER_PAGE } from "@/components/features/podcast/PodcastPagination";
import { getAllGuests } from "@/lib/guests";
import { getAllTopicSlugs } from "@/lib/topics";
import { getAllClusterHubPaths } from "@/lib/cluster-hubs";
import { getAllTermSlugs } from "@/lib/glossary";
import { getAllComparisonSlugs } from "@/lib/comparisons";
import { getAllBestForSlugs } from "@/lib/best-for";
import { getAllProblemSlugs } from "@/lib/problems";
import { getAllQuestionSlugs } from "@/lib/questions";
import { getAllAnswers } from "@/lib/answers";
import { getAllPlanCombinations, getAllEventSlugs } from "@/lib/training-plans";
import { getAllEventGuideSlugs } from "@/lib/event-guides";
import { getAllEntities } from "@/lib/entities";
import { RACES } from "@/data/races";
import { TOUR_STAGES } from "@/data/tour-de-france-2026";
import { TOUR_HISTORY } from "@/data/tour-history";
import { SEGMENT_SLUGS } from "@/lib/coaching-segments";
import { getAllCaseStudySlugs } from "@/lib/case-studies";
import { CAMP_LIST } from "@/lib/camps/camps";
import { getAllGironaRouteSlugs } from "@/lib/girona/routes";
import {
  getIndexableExpertTopicPairs,
  getExpertsWithTopics,
} from "@/lib/experts";
import { getAllPillarSlugs } from "@/lib/pillars";

const BASE_URL = "https://roadmancycling.com";

/**
 * Split sitemaps by page type for GSC monitoring.
 *
 * Generates child sitemaps at /sitemap/0.xml through /sitemap/5.xml.
 * The canonical index lives at /sitemap-index.xml (a route handler), and
 * /sitemap.xml is rewritten to it via next.config.ts — Next.js 16 does
 * not auto-emit a /sitemap.xml when using generateSitemaps() and adding
 * a route handler at that path collides with the metadata-file
 * convention. Both URLs return the same sitemap index XML.
 *
 *   /sitemap/0.xml — static/core pages + coaching + tools + community
 *   /sitemap/1.xml — blog articles
 *   /sitemap/2.xml — podcast episodes
 *   /sitemap/3.xml — guest pages
 *   /sitemap/4.xml — plan pages (event hubs + phase pages)
 *   /sitemap/5.xml — topics + glossary + comparisons + best-for + problems + questions
 *   /sitemap/6.xml — expert × topic pages (/experts, /experts/[slug], /experts/[slug]/[topic])
 *
 * Per-issue newsletter URLs (/newsletter/{slug}) are intentionally NOT in
 * the sitemap. Each issue page sets robots:noindex (one-time email
 * broadcasts are too thin for web indexing), and a noindex page in the
 * sitemap is a Search Console contradiction. The /newsletter index page
 * stays in /sitemap/0.xml.
 */

const SITEMAP_IDS = [0, 1, 2, 3, 4, 5, 6] as const;

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

function changeFreqByAge(
  date: Date,
): "weekly" | "monthly" | "yearly" {
  const ageMs = Date.now() - date.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 30) return "weekly";
  if (ageDays < 180) return "monthly";
  return "yearly";
}

// A single bad `publishDate` in MDX frontmatter (missing, malformed, or
// the literal string "Invalid Date") used to crash the whole sitemap
// build with `RangeError: Invalid time value` when Next called
// `toISOString()` on the resulting Date. Coerce anything unparseable to
// "now" so one stray file can't take down /sitemap/*.xml.
function safeDate(value: string | Date | undefined | null): Date {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date() : value;
  }
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const numId = Number(await props.id);
  if (numId === 0) return buildStaticSitemap();
  if (numId === 1) return buildBlogSitemap();
  if (numId === 2) return buildPodcastSitemap();
  if (numId === 3) return buildGuestSitemap();
  if (numId === 4) return buildPlanSitemap();
  if (numId === 5) return buildTopicAndMoreSitemap();
  if (numId === 6) return buildExpertSitemap();
  return [];
}

function buildStaticSitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    // Podcast archive — page 1 is the canonical /podcast, subsequent
    // pages use ?page=N. Each paginated page gets its own sitemap entry
    // so crawlers can discover the full archive without client-side JS.
    ...(() => {
      const totalEpisodes = getAllEpisodes().length;
      const totalPages = Math.max(1, Math.ceil(totalEpisodes / EPISODES_PER_PAGE));
      return Array.from({ length: totalPages }, (_, i) => ({
        url: i === 0 ? `${BASE_URL}/podcast` : `${BASE_URL}/podcast?page=${i + 1}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: i === 0 ? 0.8 : 0.6,
      }));
    })(),
    { url: `${BASE_URL}/podcast/transcripts`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/guests`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/topics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    // Topic-cluster hub pages (/masters/vo2max, /training/zone-2, …).
    ...getAllClusterHubPaths().map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${BASE_URL}/about`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about/press`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/about/corrections`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/about/expert-reviewers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/about/how-we-coach`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/about/how-we-create-content`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/careers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/author/anthony-walsh`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/facts`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/entity/roadman-cycling`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/entity/anthony-walsh`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/entity/roadman-podcast`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/entity/not-done-yet`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/entity/ask-roadman`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/entity/roadman-method`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/entity/against-the-clock`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    // Expert-network entities (driven by content/entities/*.mdx via the
    // dynamic /entity/[slug] route). Sitemap entries here so GSC sees
    // them in the static sitemap alongside the brand-entity pages,
    // rather than scattered across the dynamic sitemaps.
    ...getAllEntities().map((e) => ({
      url: `${BASE_URL}/entity/${e.slug}`,
      lastModified: safeDate(e.lastReviewed),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/strength-training`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/plateau`, lastModified: new Date("2026-04-22"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/ask`, lastModified: new Date("2026-04-24"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/predict`, lastModified: new Date("2026-04-24"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/ridezones`, lastModified: new Date("2026-07-20"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/ridezones/app`, lastModified: new Date("2026-07-20"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/predict/courses`, lastModified: new Date("2026-04-24"), changeFrequency: "weekly", priority: 0.8 },
    ...Array.from(
      new Set(
        RACES.map((race) => race.predictor_slug).filter(
          (slug): slug is string => Boolean(slug),
        ),
      ),
    ).map((slug) => ({
      url: `${BASE_URL}/predict/${slug}`,
      lastModified: new Date("2026-05-05"),
      changeFrequency: "monthly" as const,
      priority: 0.78,
    })),
    // Tour de France 2026 overlay — hub + all 21 stage pages. Time-boxed
    // facade, but the stage pages are evergreen route references worth
    // indexing through the race window.
    { url: `${BASE_URL}/tour-de-france`, lastModified: new Date("2026-06-10"), changeFrequency: "daily", priority: 0.85 },
    ...TOUR_STAGES.map((s) => ({
      url: `${BASE_URL}/tour-de-france/stage/${s.number}`,
      lastModified: new Date("2026-06-10"),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: `${BASE_URL}/tour-de-france/history`, lastModified: new Date("2026-06-11"), changeFrequency: "monthly", priority: 0.7 },
    ...TOUR_HISTORY.map((a) => ({
      url: `${BASE_URL}/tour-de-france/history/${a.slug}`,
      lastModified: new Date(a.published),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    { url: `${BASE_URL}/apply`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/coaching`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/coaching/triathletes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/coaching/ireland`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/coaching/uk`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/coaching/usa`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/coaching/dublin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/coaching/cork`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/coaching/galway`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/coaching/london`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/coaching/manchester`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/coaching/belfast`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/coaching/edinburgh`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/coaching/leeds`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...SEGMENT_SLUGS.map((slug) => ({
      url: `${BASE_URL}/coaching/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/start-here`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/assessment`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/research`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/benchmarks`, lastModified: new Date("2026-04-28"), changeFrequency: "yearly", priority: 0.9 },
    { url: `${BASE_URL}/editorial-standards`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/glossary`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/you/plateau`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/you/event`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/you/comeback`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/you/listener`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/plan`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/community/clubhouse`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/community/not-done-yet`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/community/not-done-yet/fit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/community/club`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/ftp-zones`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/tyre-pressure`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/race-weight`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/fuelling`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/energy-availability`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/shock-pressure`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/hr-zones`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/wkg`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/masters-recovery-score`, lastModified: new Date("2026-04-28"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/tools/masters-ftp-benchmark`, lastModified: new Date("2026-04-28"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/newsletter`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/partners`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date("2026-03-01"), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/methodology`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/sponsor`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/races`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...RACES.map((race) => ({
      url: `${BASE_URL}/races/${race.slug}`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE_URL}/case-studies`, lastModified: new Date("2026-04-30"), changeFrequency: "monthly", priority: 0.85 },
    ...getAllCaseStudySlugs().map((slug) => ({
      url: `${BASE_URL}/case-studies/${slug}`,
      lastModified: new Date("2026-04-30"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Marketing pillars + funnel landing pages. Each has full meta and
    // robots:index — kept in /sitemap/0.xml because they're top-level
    // brand pages, not content-driven dynamic routes.
    { url: `${BASE_URL}/proof`, lastModified: new Date("2026-04-30"), changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/find-your-fit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/masters`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/apps-vs-coaching`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/event-prep`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/wrapped`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/inner-circle`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // Training-plans pillar — top-level cycling-training-plans hub,
    // indexable per its metadata. Lives here (not in buildPlanSitemap)
    // because buildPlanSitemap covers programmatic /plan/[event]/[weeks]
    // pages, while /training-plans is the marketing pillar above them.
    {
      url: `${BASE_URL}/training-plans`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    // Training-camps hub + per-camp landing pages. /booking-confirmed
    // is robots:noindex so it stays out. Camp roster comes from
    // CAMP_LIST so we can't drift from the canonical config.
    {
      url: `${BASE_URL}/training-camps`,
      lastModified: new Date("2026-05-08"),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...CAMP_LIST.map((camp) => ({
      url: `${BASE_URL}${camp.href}`,
      lastModified: new Date("2026-05-08"),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    // Cycling-in-Girona pillar guide + per-climb route guides — supports
    // the camps cluster, captures organic traffic for "cycling in Girona"
    // and the famous-climb long-tail (Rocacorba, Els Àngels, etc).
    {
      url: `${BASE_URL}/cycling-girona`,
      lastModified: new Date("2026-05-08"),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
    ...getAllGironaRouteSlugs().map((slug) => ({
      url: `${BASE_URL}/cycling-girona/${slug}`,
      lastModified: new Date("2026-05-08"),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    // Pillar pages — dynamic /pillars/[slug] routes surfacing the five
    // content pillars (coaching, nutrition, strength, recovery, community).
    ...getAllPillarSlugs().map((slug) => ({
      url: `${BASE_URL}/pillars/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    // Legal pages. Indexable per spec — keeps the corporate footprint
    // discoverable in GSC and reduces "missing legal page" trust flags.
    { url: `${BASE_URL}/privacy`, lastModified: new Date("2026-03-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date("2026-03-01"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: new Date("2026-03-01"), changeFrequency: "yearly", priority: 0.3 },
  ];
}

function buildBlogSitemap(): MetadataRoute.Sitemap {
  return getAllPosts().map((post) => {
    const lastMod = safeDate(post.updatedDate ?? post.publishDate);
    return {
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });
}

function buildPodcastSitemap(): MetadataRoute.Sitemap {
  const episodes = getAllEpisodes();
  const transcriptSlugs = new Set(getTranscriptSlugs());

  const episodeEntries: MetadataRoute.Sitemap = episodes.map((ep) => {
    const lastMod = safeDate(ep.publishDate);
    return {
      url: `${BASE_URL}/podcast/${ep.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });

  // Dedicated transcript pages get the same lastModified as the parent
  // episode and a slightly lower priority — they're a deeper view of
  // the same content, so they shouldn't outrank the episode itself.
  const transcriptEntries: MetadataRoute.Sitemap = episodes
    .filter((ep) => transcriptSlugs.has(ep.slug))
    .map((ep) => {
      const lastMod = safeDate(ep.publishDate);
      return {
        url: `${BASE_URL}/podcast/${ep.slug}/transcript`,
        lastModified: lastMod,
        changeFrequency: changeFreqByAge(lastMod),
        priority: 0.5,
      };
    });

  return [...episodeEntries, ...transcriptEntries];
}

function buildGuestSitemap(): MetadataRoute.Sitemap {
  return getAllGuests().map((guest) => {
    const lastMod = safeDate(guest.latestAppearance);
    return {
      url: `${BASE_URL}/guests/${guest.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });
}

function buildPlanSitemap(): MetadataRoute.Sitemap {
  const eventHubs = getAllEventSlugs().map((event) => ({
    url: `${BASE_URL}/plan/${event}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const phasePlanPages = getAllPlanCombinations().map(({ event, weeksOut }) => ({
    url: `${BASE_URL}/plan/${event}/${weeksOut}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const eventGuides = getAllEventGuideSlugs().map((slug) => ({
    url: `${BASE_URL}/event/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...eventHubs, ...phasePlanPages, ...eventGuides];
}

function buildTopicAndMoreSitemap(): MetadataRoute.Sitemap {
  const topicPages = getAllTopicSlugs().map((slug) => ({
    url: `${BASE_URL}/topics/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const glossaryPages = getAllTermSlugs().map((slug) => ({
    url: `${BASE_URL}/glossary/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const comparisonPages = getAllComparisonSlugs().map((slug) => ({
    url: `${BASE_URL}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const bestForPages = getAllBestForSlugs().map((slug) => ({
    url: `${BASE_URL}/best/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const problemPages = getAllProblemSlugs().map((slug) => ({
    url: `${BASE_URL}/problem/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const questionPages = getAllQuestionSlugs().map((slug) => ({
    url: `${BASE_URL}/question/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Question index also lives in this sitemap so the parent listing
  // page is discoverable alongside its children.
  const questionIndex = {
    url: `${BASE_URL}/question`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  };

  // Answer pages — citation-optimised /answers/[slug] routes. The index
  // (/answers) sits alongside its children, same as /question above.
  const answerIndex = {
    url: `${BASE_URL}/answers`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  };

  const answerPages = getAllAnswers().map((a) => ({
    url: `${BASE_URL}/answers/${a.slug}`,
    lastModified: safeDate(a.updatedDate ?? a.publishDate),
    changeFrequency: changeFreqByAge(safeDate(a.updatedDate ?? a.publishDate)),
    priority: 0.7,
  }));

  return [
    ...topicPages,
    ...glossaryPages,
    ...comparisonPages,
    ...bestForPages,
    ...problemPages,
    questionIndex,
    ...questionPages,
    answerIndex,
    ...answerPages,
  ];
}

// Expert × topic pages — the programmatic "What does {Expert} say about
// {Topic}?" AEO layer. Three tiers: the /experts index, one index per
// expert (/experts/[slug]), and the answer pages themselves
// (/experts/[slug]/[topic]).
//
// Only substantive topic pages are listed here — pairs without a curated
// editorial summary, an on-topic quote, or real topic-matched episode
// evidence render `<meta name="robots" content="noindex,follow">` and
// would create a Search Console contradiction if also sitemapped.
// `getIndexableExpertTopicPairs()` and the page's metadata both consult
// the same indexability rule (`isIndexableExpertTopicPair`), so the two
// stay in lockstep.
function buildExpertSitemap(): MetadataRoute.Sitemap {
  const indexEntry = {
    url: `${BASE_URL}/experts`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  };

  const expertIndexPages = getExpertsWithTopics().map((e) => ({
    url: `${BASE_URL}/experts/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const expertTopicPages = getIndexableExpertTopicPairs().map(
    ({ expertSlug, topicSlug }) => ({
      url: `${BASE_URL}/experts/${expertSlug}/${topicSlug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );

  return [indexEntry, ...expertIndexPages, ...expertTopicPages];
}
