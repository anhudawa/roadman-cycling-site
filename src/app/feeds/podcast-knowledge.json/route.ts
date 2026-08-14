import { NextResponse } from "next/server";
import { getAllEpisodes, getTranscriptSlugs } from "@/lib/podcast";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl, summarise } from "@/lib/feeds";
import { evaluatePodcastKnowledge } from "@/lib/podcast/knowledge";

/**
 * Evidence-aware podcast catalogue for search engines and AI retrievers.
 * Unlike the lightweight episode feed, this endpoint says what supporting
 * material exists and only exposes claims/citations that passed the existing
 * editorial review gate in getAllEpisodes().
 */
export function GET() {
  const transcriptSlugs = new Set(getTranscriptSlugs());
  const items = getAllEpisodes().map((episode) => {
    const hasDedicatedTranscript = transcriptSlugs.has(episode.slug);
    const hasInlineTranscript = Boolean(
      episode.transcript && episode.transcript.length > 200,
    );
    const knowledge = evaluatePodcastKnowledge(
      episode,
      hasDedicatedTranscript || hasInlineTranscript,
    );

    return {
      id: episode.slug,
      title: episode.title,
      url: feedUrl(`/podcast/${episode.slug}`),
      canonicalSearchOwner: feedUrl("/podcast"),
      summary: summarise(
        episode.answerCapsule || episode.seoDescription || episode.description,
        320,
      ),
      datePublished: episode.publishDate,
      guest: episode.guest ?? null,
      guestCredential: episode.guestCredential ?? null,
      pillar: episode.pillar,
      topics: episode.topicTags ?? [],
      transcriptUrl: hasDedicatedTranscript
        ? feedUrl(`/podcast/${episode.slug}/transcript`)
        : hasInlineTranscript
          ? feedUrl(`/podcast/${episode.slug}`)
          : null,
      transcriptSource: hasDedicatedTranscript
        ? "dedicated-page"
        : hasInlineTranscript
          ? "episode-page"
          : "none",
      keyTakeaways: episode.keyTakeaways ?? [],
      chapters: episode.chapters ?? [],
      claims: episode.claims ?? [],
      citations: episode.citations ?? [],
      relatedArticles: episode.relatedPosts ?? [],
      knowledge,
    };
  });

  const statusCounts = items.reduce<Record<string, number>>((counts, item) => {
    counts[item.knowledge.status] = (counts[item.knowledge.status] ?? 0) + 1;
    return counts;
  }, {});

  return NextResponse.json(
    {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      baseUrl: FEED_BASE_URL,
      canonicalSearchOwner: feedUrl("/podcast"),
      editorialPolicy: feedUrl("/editorial-standards"),
      count: items.length,
      statusCounts,
      items,
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
