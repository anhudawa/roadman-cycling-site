import { NextResponse } from "next/server";
import {
  CYCLING_STRENGTH_PROGRAMME,
  getCyclingStrengthProgrammeRecord,
} from "@/lib/cycling-strength-programme";
import { FEED_CACHE_HEADERS, feedUrl } from "@/lib/feeds";

/**
 * GET /feeds/cycling-strength-programme.json
 *
 * Complete machine-readable representation of Roadman's existing public
 * 12-week example. Search ownership and product-evidence boundaries are part
 * of the payload so an agent cannot safely conflate it with the upcoming app.
 */
export function GET() {
  return NextResponse.json(
    {
      schemaVersion: 1,
      id: CYCLING_STRENGTH_PROGRAMME.id,
      name: CYCLING_STRENGTH_PROGRAMME.name,
      canonicalPage: CYCLING_STRENGTH_PROGRAMME.canonicalUrl,
      feedUrl: CYCLING_STRENGTH_PROGRAMME.feedUrl,
      factsUpdatedDate: CYCLING_STRENGTH_PROGRAMME.updatedDate,
      reviewedBy: CYCLING_STRENGTH_PROGRAMME.reviewedBy,
      publisher: {
        name: "Roadman Cycling",
        url: feedUrl("/entity/roadman-cycling"),
      },
      answer: CYCLING_STRENGTH_PROGRAMME.answer,
      searchOwnership: {
        editorialOwnerUrl: CYCLING_STRENGTH_PROGRAMME.editorialOwnerUrl,
        supportingProgrammeUrl: CYCLING_STRENGTH_PROGRAMME.canonicalUrl,
        ...CYCLING_STRENGTH_PROGRAMME.searchPolicy,
      },
      evidenceBoundaries: {
        limitations: CYCLING_STRENGTH_PROGRAMME.limitations,
        individualisedPlan: false,
        productEffectivenessEvidence: false,
      },
      programme: getCyclingStrengthProgrammeRecord(),
      discovery: {
        evidenceGuideUrl: CYCLING_STRENGTH_PROGRAMME.evidenceGuideUrl,
        offSeasonOwnerUrl: CYCLING_STRENGTH_PROGRAMME.offSeasonOwnerUrl,
        exerciseLibraryUrl: CYCLING_STRENGTH_PROGRAMME.exerciseLibraryUrl,
        exerciseFeedUrl: feedUrl("/feeds/cycling-exercises.json"),
        appUrl: CYCLING_STRENGTH_PROGRAMME.appUrl,
        appEvidenceRegisterUrl: feedUrl("/app/evidence"),
      },
    },
    { headers: FEED_CACHE_HEADERS },
  );
}
