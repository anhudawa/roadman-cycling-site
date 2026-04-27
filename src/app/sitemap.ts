import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests } from "@/lib/guests";
import { getAllTopicSlugs } from "@/lib/topics";
import { getAllTermSlugs } from "@/lib/glossary";
import { getAllComparisonSlugs } from "@/lib/comparisons";
import { getAllBestForSlugs } from "@/lib/best-for";
import { getAllProblemSlugs } from "@/lib/problems";
import { getAllPlanCombinations, getAllEventSlugs } from "@/lib/training-plans";

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
 *   /sitemap/5.xml — topics + glossary + comparisons + best-for + problems
 *
 * Per-issue newsletter URLs (/newsletter/{slug}) are intentionally NOT in
 * the sitemap. Each issue page sets robots:noindex (one-time email
 * broadcasts are too thin for web indexing), and a noindex page in the
 * sitemap is a Search Console contradiction. The /newsletter index page
 * stays in /sitemap/0.xml.
 */

const SITEMAP_IDS = [0, 1, 2, 3, 4, 5] as const;
type SitemapId = (typeof SITEMAP_IDS)[number];

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
  return [];
}

function buildStaticSitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/podcast`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/guests`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/topics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about/press`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/author/anthony-walsh`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/strength-training`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/plateau`, lastModified: new Date("2026-04-22"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/ask`, lastModified: new Date("2026-04-24"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/predict`, lastModified: new Date("2026-04-24"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/apply`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/coaching`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/coaching/triathlon`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
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
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/start-here`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/assessment`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/research`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
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
    { url: `${BASE_URL}/community/club`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/ftp-zones`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/tyre-pressure`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/race-weight`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/fuelling`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/energy-availability`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/shock-pressure`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/hr-zones`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/wkg`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/newsletter`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/partners`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date("2026-03-01"), changeFrequency: "yearly", priority: 0.4 },
  ];
}

function buildBlogSitemap(): MetadataRoute.Sitemap {
  return getAllPosts().map((post) => {
    const lastMod = post.updatedDate
      ? new Date(post.updatedDate)
      : new Date(post.publishDate);
    return {
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });
}

function buildPodcastSitemap(): MetadataRoute.Sitemap {
  return getAllEpisodes().map((ep) => {
    const lastMod = new Date(ep.publishDate);
    return {
      url: `${BASE_URL}/podcast/${ep.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });
}

function buildGuestSitemap(): MetadataRoute.Sitemap {
  return getAllGuests().map((guest) => {
    const lastMod = new Date(guest.latestAppearance);
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

  return [...eventHubs, ...phasePlanPages];
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

  return [...topicPages, ...glossaryPages, ...comparisonPages, ...bestForPages, ...problemPages];
}
