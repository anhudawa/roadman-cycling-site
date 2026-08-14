import { NextResponse } from "next/server";
import { getAllEpisodes, getTranscriptSlugs } from "@/lib/podcast";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl, summarise } from "@/lib/feeds";
import { evaluatePodcastKnowledge } from "@/lib/podcast/knowledge";

const PILLAR_TOOL: Record<string, string> = {
  coaching: "ftp-zones",
  nutrition: "fuelling",
  strength: "wkg",
  recovery: "energy-availability",
  community: "race-weight",
};

/**
 * GET /feeds/episodes.json
 *
 * Public JSON feed of every podcast episode. Body is omitted; agents
 * pull the full transcript via /api/v1/fetch?id=…
 */
export function GET() {
  // Hash the transcript slug list once per request so each item lookup
  // is O(1) instead of re-reading the transcripts directory per episode.
  const transcriptSlugs = new Set(getTranscriptSlugs());

  const items = getAllEpisodes().map((ep) => {
    const author = ep.guest || "Anthony Walsh";
    const summary = summarise(ep.answerCapsule || ep.seoDescription || ep.description);
    const entities = Array.from(
      new Set([...(ep.keywords ?? []), ...(ep.topicTags ?? [])]),
    );
    const hasTranscript = transcriptSlugs.has(ep.slug);
    const knowledge = evaluatePodcastKnowledge(ep, hasTranscript);

    return {
      id: ep.slug,
      type: "episode",
      title: ep.title,
      summary,
      url: feedUrl(`/podcast/${ep.slug}`),
      datePublished: ep.publishDate,
      dateModified: ep.publishDate,
      author,
      authorCredential: ep.guestCredential ?? null,
      primaryTopic: ep.pillar,
      entities,
      relatedEpisodes: [],
      relatedTools: PILLAR_TOOL[ep.pillar] ? [PILLAR_TOOL[ep.pillar]] : [],
      relatedArticles: ep.relatedPosts ?? [],
      evidenceLevel: ep.guest ? "expert-interview" : "host-led",
      episodeNumber: ep.episodeNumber,
      duration: ep.duration,
      hasTranscript,
      transcriptUrl: hasTranscript
        ? feedUrl(`/podcast/${ep.slug}/transcript`)
        : null,
      canonicalSearchOwner: feedUrl("/podcast"),
      knowledgeStatus: knowledge.status,
      knowledgeCoveragePercent: knowledge.coveragePercent,
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
