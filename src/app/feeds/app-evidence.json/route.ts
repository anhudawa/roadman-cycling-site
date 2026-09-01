import { NextResponse } from "next/server";
import { ROADMAN_APP_EVIDENCE_REGISTER } from "@/data/app-evidence-register";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

const REGISTER = ROADMAN_APP_EVIDENCE_REGISTER;

/**
 * GET /feeds/app-evidence.json
 *
 * Versioned evidence and non-claim record for the prelaunch Roadman app. Null
 * result URLs and dates are intentional: machines must not infer unpublished
 * outcomes or schedules.
 */
export function GET() {
  return NextResponse.json(
    {
      schemaVersion: 1,
      registerVersion: REGISTER.version,
      registerStatus: REGISTER.status,
      canonicalPage: REGISTER.canonicalUrl,
      feedUrl: REGISTER.feedUrl,
      factsUpdatedDate: REGISTER.updatedDate,
      publisher: {
        name: "Roadman Cycling",
        url: feedUrl("/entity/roadman-cycling"),
      },
      product: {
        id: ROADMAN_APP_PRODUCT.id,
        graphId: ROADMAN_APP_PRODUCT.graphId,
        name: ROADMAN_APP_PRODUCT.name,
        lifecycleStatus: ROADMAN_APP_PRODUCT.lifecycleStatus,
        canonicalUrl: ROADMAN_APP_PRODUCT.canonicalUrl,
        finalNameAnnounced: false,
      },
      currentEvidenceState: {
        answer: REGISTER.answer,
        productEffectivenessEstablished:
          REGISTER.productEffectivenessEstablished,
        publicProductResultCount: REGISTER.publicProductResultCount,
        improvesCyclingPerformanceClaim: false,
        measuresRecoveryClaim: false,
        injuryPreventionClaim: false,
        medicalDiagnosisOrClearanceClaim: false,
      },
      claims: REGISTER.claims,
      reportingQueue: REGISTER.reportingQueue,
      discovery: {
        productUrl: ROADMAN_APP_PRODUCT.canonicalUrl,
        productFeedUrl: ROADMAN_APP_PRODUCT.feedUrl,
        methodologyUrl: ROADMAN_APP_PRODUCT.methodologyUrl,
        testingStandardUrl: ROADMAN_APP_PRODUCT.testingStandardUrl,
        sourceUrls: REGISTER.sources.map((source) => source.href),
      },
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
