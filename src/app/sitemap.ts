import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests } from "@/lib/guests";
import { getAllTopicSlugs } from "@/lib/topics";

const BASE_URL = "https://roadmancycling.com";

/**
 * How recently was content updated? Returns an appropriate changeFrequency.
 * - Under 30 days  → "weekly"
 * - Under 180 days → "monthly"
 * - Older          → "yearly"
 */
function changeFreqByAge(
  date: Date,
): "weekly" | "monthly" | "yearly" {
  const ageMs = Date.now() - date.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 30) return "weekly";
  if (ageDays < 180) return "monthly";
  return "yearly";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ---------------------------------------------------------------------------
  // Static pages — grouped by priority tier
  // ---------------------------------------------------------------------------

  const staticPages: MetadataRoute.Sitemap = [
    // Homepage — priority 1.0
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },

    // Main section indexes — priority 0.8
    {
      url: `${BASE_URL}/podcast`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guests`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/topics`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about/press`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/strength-training`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/coaching`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/coaching/triathlon`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/coaching/ireland`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/uk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/usa`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/dublin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/cork`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/galway`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/london`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/coaching/manchester`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/belfast`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/edinburgh`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/coaching/leeds`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },

    // Community sub-pages — priority 0.7
    {
      url: `${BASE_URL}/community/clubhouse`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/community/not-done-yet`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/community/club`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Tools — priority 0.7
    {
      url: `${BASE_URL}/tools/ftp-zones`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/tyre-pressure`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/race-weight`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/fuelling`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/energy-availability`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/shock-pressure`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Lower priority static pages
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/partners`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date("2026-03-01"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // ---------------------------------------------------------------------------
  // Blog posts — priority 0.6, use frontmatter dates for lastModified
  // changeFrequency adapts based on age: recent posts update more often
  // ---------------------------------------------------------------------------

  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => {
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

  // ---------------------------------------------------------------------------
  // Podcast episodes — priority 0.6, use publishDate for lastModified
  // changeFrequency adapts based on age: recent episodes may get show-notes edits
  // ---------------------------------------------------------------------------

  const episodes = getAllEpisodes();
  const podcastPages: MetadataRoute.Sitemap = episodes.map((ep) => {
    const lastMod = new Date(ep.publishDate);
    return {
      url: `${BASE_URL}/podcast/${ep.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });

  // ---------------------------------------------------------------------------
  // Guest pages — priority 0.6, use latestAppearance date for lastModified
  // ---------------------------------------------------------------------------

  const guests = getAllGuests();
  const guestPages: MetadataRoute.Sitemap = guests.map((guest) => {
    const lastMod = new Date(guest.latestAppearance);
    return {
      url: `${BASE_URL}/guests/${guest.slug}`,
      lastModified: lastMod,
      changeFrequency: changeFreqByAge(lastMod),
      priority: 0.6,
    };
  });

  // ---------------------------------------------------------------------------
  // Topic hub pages — priority 0.7 (high-value SEO landing pages)
  // ---------------------------------------------------------------------------

  const topicSlugs = getAllTopicSlugs();
  const topicPages: MetadataRoute.Sitemap = topicSlugs.map((slug) => ({
    url: `${BASE_URL}/topics/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Note: individual newsletter issue pages (/newsletter/[slug]) are intentionally
  // excluded from the sitemap and marked `robots: { index: false }` — each issue
  // is a one-time email broadcast with thin, time-bound content, and indexing
  // them risks diluting site-wide quality signals. The /newsletter hub page
  // itself remains indexed via staticPages above.

  return [
    ...staticPages,
    ...blogPages,
    ...podcastPages,
    ...guestPages,
    ...topicPages,
  ];
}
