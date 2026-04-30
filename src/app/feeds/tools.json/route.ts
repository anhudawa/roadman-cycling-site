import { NextResponse } from "next/server";
import { FEED_BASE_URL, FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";
import { getAllTools } from "@/lib/tools-registry";

/**
 * GET /feeds/tools.json
 *
 * Public JSON feed of every free tool on the site. Tools with an
 * `apiEndpoint` can be called directly via JSON; the rest are
 * UI-only calculators.
 */
export function GET() {
  const items = getAllTools().map((tool) => ({
    id: tool.slug,
    type: "tool",
    title: tool.title,
    summary: tool.description,
    url: feedUrl(`/tools/${tool.slug}`),
    apiUrl: tool.apiEndpoint ? feedUrl(tool.apiEndpoint) : null,
    inputs: tool.inputs ?? null,
    datePublished: null,
    dateModified: null,
    author: "Anthony Walsh",
    primaryTopic: tool.pillar,
    entities: [],
    relatedEpisodes: [],
    relatedTools: [],
    evidenceLevel: "calculator",
  }));

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
