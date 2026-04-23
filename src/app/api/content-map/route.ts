import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { getAllEpisodes } from "@/lib/podcast";
import { getAllGuests } from "@/lib/guests";
import { getAllTopics } from "@/lib/topics";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { COMPARISONS } from "@/lib/comparisons";
import { BEST_FOR_PAGES } from "@/lib/best-for";
import { PROBLEM_PAGES } from "@/lib/problems";
import { EVENTS } from "@/lib/training-plans";

const BASE_URL = "https://roadmancycling.com";

/**
 * GET /api/content-map
 *
 * Public machine-readable content inventory. Lists every canonical
 * page with type, title, dates, and relationships.
 *
 * AEO-016 from the answer optimization dev roadmap.
 */
export async function GET() {
  const posts = getAllPosts();
  const episodes = getAllEpisodes();
  const guests = getAllGuests();
  const topics = getAllTopics();

  const map = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    counts: {
      articles: posts.length,
      episodes: episodes.length,
      guests: guests.length,
      topics: topics.length,
      glossary: GLOSSARY_TERMS.length,
      comparisons: COMPARISONS.length,
      bestFor: BEST_FOR_PAGES.length,
      problems: PROBLEM_PAGES.length,
      events: EVENTS.length,
    },
    articles: posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      type: "article",
      title: p.title,
      pillar: p.pillar,
      publishDate: p.publishDate,
      modifiedDate: p.updatedDate || null,
      author: p.author,
      keywords: p.keywords,
    })),
    episodes: episodes.slice(0, 100).map((e) => ({
      url: `${BASE_URL}/podcast/${e.slug}`,
      type: "episode",
      title: e.title,
      pillar: e.pillar,
      publishDate: e.publishDate,
      guest: e.guest || null,
      episodeNumber: e.episodeNumber,
    })),
    topics: topics.map((t) => ({
      url: `${BASE_URL}/topics/${t.slug}`,
      type: "topic",
      title: t.title,
      pillar: t.pillar,
      articleCount: t.posts.length,
      episodeCount: t.episodes.length,
      tools: t.tools.map((tool) => tool.href),
      commercialPath: t.commercialPath,
      relatedTopics: t.relatedTopics.map((s) => `${BASE_URL}/topics/${s}`),
    })),
    glossary: GLOSSARY_TERMS.map((t) => ({
      url: `${BASE_URL}/glossary/${t.slug}`,
      type: "glossary",
      term: t.term,
      pillar: t.pillar,
      relatedArticle: t.relatedArticle || null,
      relatedTool: t.relatedTool || null,
    })),
    comparisons: COMPARISONS.map((c) => ({
      url: `${BASE_URL}/compare/${c.slug}`,
      type: "comparison",
      optionA: c.optionA,
      optionB: c.optionB,
      pillar: c.pillar,
    })),
    guests: guests.slice(0, 50).map((g) => ({
      url: `${BASE_URL}/guests/${g.slug}`,
      type: "guest",
      name: g.name,
      credential: g.credential || null,
      episodeCount: g.episodeCount,
      pillars: g.pillars,
    })),
    events: EVENTS.map((e) => ({
      url: `${BASE_URL}/plan/${e.slug}`,
      type: "event",
      name: e.name,
      region: e.region,
      distanceKm: e.distanceKm,
      elevationGainM: e.elevationGainM,
    })),
  };

  return NextResponse.json(map, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
