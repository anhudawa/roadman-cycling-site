import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests } from "@/lib/guests";
import { getAllTopicSlugs } from "@/lib/topics";
import { getAllTermSlugs } from "@/lib/glossary";
import { getAllComparisonSlugs } from "@/lib/comparisons";
import { getAllBestForSlugs } from "@/lib/best-for";
import { getAllProblemSlugs } from "@/lib/problems";
import { fetchNewsletterIssues } from "@/lib/integrations/beehiiv";
import { getAllPlanCombinations, getAllEventSlugs } from "@/lib/training-plans";

const BASE_URL = "https://roadmancycling.com";

function changeFreqByAge(
  date: Date,
): "weekly" | "monthly" | "yearly" {
  const ageMs = Date.now() - date.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 30) return "weekly";
  if (ageDays < 180) return "monthly";
  return "yearly";
}

/**
 * Single flat sitemap at /sitemap.xml.
 *
 * Previously split via generateSitemaps() into 6 child sitemaps,
 * but Next.js 16 doesn't auto-generate the sitemap index at
 * /sitemap.xml, causing a 404 that breaks crawl discovery.
 *
 * All URLs grouped logically by type with inline comments.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ── Static / core pages ──────────────────────────────────
  entries.push(
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/podcast`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/guests`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/topics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/about/press`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/strength-training`, lastModified: new Date("2026-03-01"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/plateau`, lastModified: new Date("2026-04-22"), changeFrequency: "monthly", priority: 0.9 },
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
  );

  // ── Blog articles ────────────────────────────────────────
  for (const post of getAllPosts()) {
    const lastMod = post.updatedDate
      ? new Date(post.updatedDate)
      : new Date(post.publishDate);
    entries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    });
  }

  // ── Podcast episodes ─────────────────────────────────────
  for (const ep of getAllEpisodes()) {
    const lastMod = new Date(ep.publishDate);
    entries.push({
      url: `${BASE_URL}/podcast/${ep.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    });
  }

  // ── Guest pages ──────────────────────────────────────────
  for (const guest of getAllGuests()) {
    entries.push({
      url: `${BASE_URL}/guests/${guest.slug}`,
      lastModified: new Date(guest.latestAppearance),
      changeFrequency: changeFreqByAge(new Date(guest.latestAppearance)),
      priority: 0.6,
    });
  }

  // ── Topic hubs ───────────────────────────────────────────
  for (const slug of getAllTopicSlugs()) {
    entries.push({ url: `${BASE_URL}/topics/${slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
  }

  // ── Glossary terms ───────────────────────────────────────
  for (const slug of getAllTermSlugs()) {
    entries.push({ url: `${BASE_URL}/glossary/${slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 });
  }

  // ── Comparison pages ─────────────────────────────────────
  for (const slug of getAllComparisonSlugs()) {
    entries.push({ url: `${BASE_URL}/compare/${slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 });
  }

  // ── Best-for pages ───────────────────────────────────────
  for (const slug of getAllBestForSlugs()) {
    entries.push({ url: `${BASE_URL}/best/${slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 });
  }

  // ── Problem pages ────────────────────────────────────────
  for (const slug of getAllProblemSlugs()) {
    entries.push({ url: `${BASE_URL}/problem/${slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 });
  }

  // ── Plan event hubs ──────────────────────────────────────
  for (const event of getAllEventSlugs()) {
    entries.push({ url: `${BASE_URL}/plan/${event}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 });
  }

  // ── Plan phase pages ─────────────────────────────────────
  for (const { event, weeksOut } of getAllPlanCombinations()) {
    entries.push({ url: `${BASE_URL}/plan/${event}/${weeksOut}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 });
  }

  // ── Newsletter issues ────────────────────────────────────
  try {
    const issues = await fetchNewsletterIssues(100);
    for (const issue of issues) {
      if (issue.publishDate) {
        entries.push({
          url: `${BASE_URL}/newsletter/${issue.slug}`,
          lastModified: new Date(issue.publishDate),
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  } catch {
    // Beehiiv API unavailable
  }

  return entries;
}
