import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuestSlugs } from "@/lib/guests";
import { getAllTopicSlugs } from "@/lib/topics";

const BASE_URL = "https://roadmancycling.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/podcast`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/guests`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/topics`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/community`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/community/clubhouse`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/community/not-done-yet`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/community/club`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/strength-training`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/partners`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Tools
    {
      url: `${BASE_URL}/tools/ftp-zones`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/tyre-pressure`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/race-weight`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/fuelling`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/energy-availability`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/shock-pressure`,
      lastModified: new Date("2026-04-07"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  // Blog posts
  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedDate
      ? new Date(post.updatedDate)
      : new Date(post.publishDate),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Podcast episodes
  const episodes = getAllEpisodes();
  const podcastPages: MetadataRoute.Sitemap = episodes.map((ep) => ({
    url: `${BASE_URL}/podcast/${ep.slug}`,
    lastModified: new Date(ep.publishDate),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Guest pages
  const guestSlugs = getAllGuestSlugs();
  const guestPages: MetadataRoute.Sitemap = guestSlugs.map((slug) => ({
    url: `${BASE_URL}/guests/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Topic hub pages
  const topicSlugs = getAllTopicSlugs();
  const topicPages: MetadataRoute.Sitemap = topicSlugs.map((slug) => ({
    url: `${BASE_URL}/topics/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...podcastPages,
    ...guestPages,
    ...topicPages,
  ];
}
