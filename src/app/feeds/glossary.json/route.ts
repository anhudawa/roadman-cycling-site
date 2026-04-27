import { NextResponse } from "next/server";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import {
  FEED_BASE_URL,
  FEED_CACHE_HEADERS,
  feedUrl,
  summarise,
  toolSlugFromPath,
} from "@/lib/feeds";

/**
 * GET /feeds/glossary.json
 *
 * Public JSON feed of every glossary term. AI agents can use this to
 * resolve abbreviations and jargon (FTP, RED-S, EPOC, …) without
 * scraping individual pages.
 */
export function GET() {
  const items = GLOSSARY_TERMS.map((term) => {
    const toolSlug = toolSlugFromPath(term.relatedTool);

    return {
      id: term.slug,
      type: "glossary",
      title: term.term,
      summary: summarise(term.definition),
      definition: term.definition,
      extendedDefinition: term.extendedDefinition,
      url: feedUrl(`/glossary/${term.slug}`),
      datePublished: null,
      dateModified: null,
      author: "Anthony Walsh",
      primaryTopic: term.pillar,
      entities: term.relatedTerms ?? [],
      relatedArticles: term.relatedArticle ? [term.relatedArticle.replace(/^.*\/blog\//, "")] : [],
      relatedEpisodes: [],
      relatedTools: toolSlug ? [toolSlug] : [],
      relatedTopics: term.relatedTopicHub ? [term.relatedTopicHub.replace(/^.*\/topics\//, "")] : [],
      evidenceLevel: "definition",
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
