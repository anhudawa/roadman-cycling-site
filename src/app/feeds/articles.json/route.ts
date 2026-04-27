import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl, summarise } from "@/lib/feeds";

const PILLAR_TOOL: Record<string, string> = {
  coaching: "ftp-zones",
  nutrition: "fuelling",
  strength: "wkg",
  recovery: "energy-availability",
  community: "race-weight",
};

/**
 * GET /feeds/articles.json
 *
 * Public JSON feed of every blog article. Each item carries the
 * minimum metadata an AI agent needs to decide whether to fetch the
 * full piece (via /api/v1/fetch?id=…).
 */
export function GET() {
  const items = getAllPosts().map((meta) => {
    const full = getPostBySlug(meta.slug);
    const expert = full?.experts?.[0];
    const author = expert?.name || meta.author || "Anthony Walsh";
    const summary = summarise(full?.answerCapsule || meta.seoDescription || meta.excerpt);

    return {
      id: meta.slug,
      type: "article",
      title: meta.title,
      summary,
      url: feedUrl(`/blog/${meta.slug}`),
      datePublished: meta.publishDate,
      dateModified: meta.updatedDate || meta.publishDate,
      author,
      primaryTopic: meta.pillar,
      entities: meta.keywords ?? [],
      relatedEpisodes: meta.relatedEpisodes ?? [],
      relatedTools: PILLAR_TOOL[meta.pillar] ? [PILLAR_TOOL[meta.pillar]] : [],
      evidenceLevel: meta.reviewedBy
        ? "expert-reviewed"
        : (full?.experts && full.experts.length > 0)
          ? "expert-cited"
          : "editorial",
      reviewedBy: meta.reviewedBy ?? null,
      lastReviewed: meta.lastReviewed ?? null,
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
