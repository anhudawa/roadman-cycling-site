import { NextResponse } from "next/server";
import {
  ROADMAN_APP_USE_CASE_FEED_URL,
  ROADMAN_APP_USE_CASES,
} from "@/data/app-use-cases";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /feeds/app-use-cases.json
 *
 * Name-neutral product-fit records for search engines and agents. These are
 * use cases of one app and one early-access audience, not separate products,
 * plans or effectiveness claims.
 */
export function GET() {
  return NextResponse.json(
    {
      schemaVersion: 1,
      canonicalProduct: ROADMAN_APP_PRODUCT.canonicalUrl,
      feedUrl: ROADMAN_APP_USE_CASE_FEED_URL,
      factsUpdatedDate: ROADMAN_APP_PRODUCT.updatedDate,
      publisher: {
        name: "Roadman Cycling",
        url: feedUrl("/entity/roadman-cycling"),
      },
      audienceModel: {
        productCount: 1,
        waitlistCount: 1,
        earlyAccessUrl: ROADMAN_APP_PRODUCT.earlyAccessUrl,
        note: "Entry-page attribution is retained without creating separate products or subscriber lists.",
      },
      useCases: ROADMAN_APP_USE_CASES,
      productBoundaries: ROADMAN_APP_PRODUCT.limitations,
      discovery: {
        productFeedUrl: ROADMAN_APP_PRODUCT.feedUrl,
        methodologyUrl: ROADMAN_APP_PRODUCT.methodologyUrl,
        testingStandardUrl: ROADMAN_APP_PRODUCT.testingStandardUrl,
        evidenceRegisterUrl: ROADMAN_APP_PRODUCT.evidenceRegisterUrl,
        knowledgeGraphUrl: feedUrl("/knowledge-graph.json"),
        mcpManifestUrl: feedUrl("/.well-known/mcp.json"),
      },
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
