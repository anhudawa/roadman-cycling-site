import { NextResponse } from "next/server";
import { getAllTopics } from "@/lib/topics";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl, summarise } from "@/lib/feeds";

/**
 * GET /feeds/topics.json
 *
 * Public JSON feed of every curated topic hub. Topics aggregate
 * articles, episodes, and tools — they're the canonical entry points
 * for an AI agent looking to answer a high-level question.
 */
export function GET() {
  const items = getAllTopics().map((t) => {
    const articleSlugs = t.posts.map((p) => p.slug);
    const episodeSlugs = t.episodes.map((e) => e.slug);
    const toolSlugs = t.tools.map((tool) => tool.slug);

    return {
      id: t.slug,
      type: "topic",
      title: t.title,
      summary: summarise(t.description),
      url: feedUrl(`/topics/${t.slug}`),
      datePublished: null,
      dateModified: null,
      author: "Anthony Walsh",
      primaryTopic: t.pillar,
      entities: t.keywords ?? [],
      relatedArticles: articleSlugs,
      relatedEpisodes: episodeSlugs,
      relatedTools: toolSlugs,
      relatedTopics: t.relatedTopics ?? [],
      commercialPath: t.commercialPath,
      evidenceLevel: "curated-hub",
      counts: {
        articles: articleSlugs.length,
        episodes: episodeSlugs.length,
        tools: toolSlugs.length,
      },
    };
  });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      schemaVersion: 1,
      count: items.length,
      items,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
