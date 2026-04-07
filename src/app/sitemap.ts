import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests } from "@/lib/guests";
import { getAllTopicSlugs } from "@/lib/topics";

const BASE_URL = "https://roadmancycling.com";

export default function sitemap(): MetadataRoute.Sitemap {
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
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
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
  // ---------------------------------------------------------------------------

  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedDate
      ? new Date(post.updatedDate)
      : new Date(post.publishDate),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // ---------------------------------------------------------------------------
  // Podcast episodes — priority 0.6, use publishDate for lastModified
  // ---------------------------------------------------------------------------

  const episodes = getAllEpisodes();
  const podcastPages: MetadataRoute.Sitemap = episodes.map((ep) => ({
    url: `${BASE_URL}/podcast/${ep.slug}`,
    lastModified: new Date(ep.publishDate),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // ---------------------------------------------------------------------------
  // Guest pages — priority 0.6, use latestAppearance date for lastModified
  // ---------------------------------------------------------------------------

  const guests = getAllGuests();
  const guestPages: MetadataRoute.Sitemap = guests.map((guest) => ({
    url: `${BASE_URL}/guests/${guest.slug}`,
    lastModified: new Date(guest.latestAppearance),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

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

  return [
    ...staticPages,
    ...blogPages,
    ...podcastPages,
    ...guestPages,
    ...topicPages,
  ];
}
