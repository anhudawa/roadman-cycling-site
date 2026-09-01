import { NextResponse } from "next/server";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /feeds/app-product.json
 *
 * Stable, name-neutral public product record for the upcoming Roadman cycling
 * strength and recovery app. Null launch and price fields are intentional:
 * machines should not infer unannounced commercial facts from surrounding
 * prelaunch copy.
 */
export function GET() {
  return NextResponse.json(
    {
      schemaVersion: 1,
      canonicalPage: ROADMAN_APP_PRODUCT.canonicalUrl,
      feedUrl: ROADMAN_APP_PRODUCT.feedUrl,
      factsUpdatedDate: ROADMAN_APP_PRODUCT.updatedDate,
      publisher: {
        name: "Roadman Cycling",
        url: feedUrl("/entity/roadman-cycling"),
      },
      product: {
        id: ROADMAN_APP_PRODUCT.id,
        graphId: ROADMAN_APP_PRODUCT.graphId,
        type: "mobile-application",
        name: ROADMAN_APP_PRODUCT.name,
        finalNameAnnounced: false,
        description: ROADMAN_APP_PRODUCT.description,
        lifecycleStatus: ROADMAN_APP_PRODUCT.lifecycleStatus,
        launchDate: null,
        price: null,
        currency: null,
        applicationCategory: ROADMAN_APP_PRODUCT.applicationCategory,
        operatingSystems: ROADMAN_APP_PRODUCT.operatingSystems,
        audience: ROADMAN_APP_PRODUCT.audience,
        features: ROADMAN_APP_PRODUCT.features,
        limitations: ROADMAN_APP_PRODUCT.limitations,
        earlyAccess: {
          url: ROADMAN_APP_PRODUCT.earlyAccessUrl,
          audienceModel: "single-waitlist",
        },
      },
      discovery: {
        searchOwnerUrl: ROADMAN_APP_PRODUCT.canonicalUrl,
        methodologyUrl: ROADMAN_APP_PRODUCT.methodologyUrl,
        testingStandardUrl: ROADMAN_APP_PRODUCT.testingStandardUrl,
        evidenceRegisterUrl: ROADMAN_APP_PRODUCT.evidenceRegisterUrl,
        evidenceFeedUrl: ROADMAN_APP_PRODUCT.evidenceFeedUrl,
        exerciseLibraryUrl: ROADMAN_APP_PRODUCT.exerciseLibraryUrl,
        exerciseFeedUrl: ROADMAN_APP_PRODUCT.exerciseFeedUrl,
        relatedStrengthProgrammeUrl:
          ROADMAN_APP_PRODUCT.relatedStrengthProgrammeUrl,
        relatedStrengthProgrammeFeedUrl:
          ROADMAN_APP_PRODUCT.relatedStrengthProgrammeFeedUrl,
        recoveryKnowledgeUrl: ROADMAN_APP_PRODUCT.recoveryKnowledgeUrl,
        recoveryLibraryUrl: ROADMAN_APP_PRODUCT.recoveryLibraryUrl,
        recoveryFeedUrl: ROADMAN_APP_PRODUCT.recoveryFeedUrl,
        mastersSegmentUrl: ROADMAN_APP_PRODUCT.mastersSegmentUrl,
        knowledgeGraphUrl: feedUrl("/knowledge-graph.json"),
        mcpManifestUrl: feedUrl("/.well-known/mcp.json"),
        topicUrls: ROADMAN_APP_PRODUCT.topicSlugs.map((slug) =>
          feedUrl(`/topics/${slug}`),
        ),
        previewToolUrls: ROADMAN_APP_PRODUCT.previewToolSlugs.map((slug) =>
          feedUrl(`/tools/${slug}`),
        ),
        comparisonUrls: ROADMAN_APP_PRODUCT.comparisonSlugs.map((slug) =>
          feedUrl(`/best/${slug}`),
        ),
        evidenceUrls: ROADMAN_APP_PRODUCT.evidenceArticleSlugs.map((slug) =>
          feedUrl(`/blog/${slug}`),
        ),
      },
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
