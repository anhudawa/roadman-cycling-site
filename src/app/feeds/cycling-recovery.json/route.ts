import { NextResponse } from "next/server";
import { CYCLING_RECOVERY_KNOWLEDGE } from "@/data/cycling-recovery";
import { FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /feeds/cycling-recovery.json
 *
 * Evidence-bounded map of recovery jobs, signals and handoffs. Product and
 * educational ownership remain separate so agents cannot interpret the
 * knowledge layer as proof that Roadman's prelaunch app measures recovery.
 */
export function GET() {
  return NextResponse.json(
    {
      schemaVersion: 1,
      id: CYCLING_RECOVERY_KNOWLEDGE.id,
      name: CYCLING_RECOVERY_KNOWLEDGE.name,
      canonicalPage: CYCLING_RECOVERY_KNOWLEDGE.canonicalUrl,
      feedUrl: CYCLING_RECOVERY_KNOWLEDGE.feedUrl,
      factsUpdatedDate: CYCLING_RECOVERY_KNOWLEDGE.updatedDate,
      reviewedBy: CYCLING_RECOVERY_KNOWLEDGE.reviewedBy,
      publisher: {
        name: "Roadman Cycling",
        url: feedUrl("/entity/roadman-cycling"),
      },
      answer: CYCLING_RECOVERY_KNOWLEDGE.answer,
      searchOwnership: CYCLING_RECOVERY_KNOWLEDGE.searchOwnership,
      decisionOrder: CYCLING_RECOVERY_KNOWLEDGE.decisionOrder,
      levers: CYCLING_RECOVERY_KNOWLEDGE.levers,
      sources: CYCLING_RECOVERY_KNOWLEDGE.sources,
      productBoundary: CYCLING_RECOVERY_KNOWLEDGE.productBoundary,
      discovery: {
        researchLibraryUrl: CYCLING_RECOVERY_KNOWLEDGE.researchLibraryUrl,
        searchOwnershipRegistryUrl: feedUrl("/search-ownership.json"),
        appMethodologyUrl: feedUrl("/app/methodology"),
        appEvidenceRegisterUrl: feedUrl("/app/evidence"),
        trainingReadinessToolUrl: feedUrl("/tools/training-readiness"),
        recoveryScreenUrl: feedUrl("/tools/recovery-screen"),
      },
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
