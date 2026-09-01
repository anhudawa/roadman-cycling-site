import { ENTITY_IDS, SITE_ORIGIN } from "@/lib/brand-facts";
import {
  SEARCH_OWNER_BY_ID,
  type SearchOwnerId,
} from "@/lib/seo/search-ownership";

export const SEARCH_OWNER_LAST_REVIEWED = "2026-08-25";

/**
 * Shared WebPage trust properties for Roadman's priority search owners.
 * Keeping these relationships in one builder prevents author, reviewer,
 * entity and supporting-link signals from drifting between pillar pages.
 */
export function buildSearchOwnerTrustProperties(
  ownerId: SearchOwnerId,
  dateModified = SEARCH_OWNER_LAST_REVIEWED,
) {
  const owner = SEARCH_OWNER_BY_ID.get(ownerId);

  if (!owner) {
    throw new Error(`Unknown search owner: ${ownerId}`);
  }

  return {
    dateModified,
    inLanguage: "en",
    isPartOf: { "@id": ENTITY_IDS.website },
    publisher: { "@id": ENTITY_IDS.organization },
    author: { "@id": ENTITY_IDS.person },
    reviewedBy: { "@id": ENTITY_IDS.organization },
    about: {
      "@type": "Thing",
      name: owner.primaryQuery,
      description: owner.description,
    },
    relatedLink: owner.supportingDestinations.map(
      (destination) => `${SITE_ORIGIN}${destination.path}`,
    ),
  } as const;
}
