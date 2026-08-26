import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ENTITY_IDS } from "@/lib/brand-facts";
import { SEARCH_OWNERS } from "./search-ownership";
import {
  buildSearchOwnerTrustProperties,
  SEARCH_OWNER_LAST_REVIEWED,
} from "./search-owner-schema";

describe("priority search-owner schema", () => {
  it("uses the verified owner-page release date", () => {
    expect(SEARCH_OWNER_LAST_REVIEWED).toBe("2026-08-25");
  });

  it("gives every owner the same entity, author and review contract", () => {
    for (const owner of SEARCH_OWNERS) {
      const schema = buildSearchOwnerTrustProperties(owner.id);

      expect(schema.dateModified).toBe(SEARCH_OWNER_LAST_REVIEWED);
      expect(schema.isPartOf).toEqual({ "@id": ENTITY_IDS.website });
      expect(schema.publisher).toEqual({ "@id": ENTITY_IDS.organization });
      expect(schema.author).toEqual({ "@id": ENTITY_IDS.person });
      expect(schema.reviewedBy).toEqual({
        "@id": ENTITY_IDS.organization,
      });
      expect(schema.about.name).toBe(owner.primaryQuery);
      expect(schema.relatedLink).toHaveLength(
        owner.supportingDestinations.length,
      );
    }
  });

  it("turns every supporting route into an absolute related link", () => {
    const schema = buildSearchOwnerTrustProperties("cycling-training-camps");

    expect(schema.relatedLink).toEqual([
      "https://roadmancycling.com/blog/what-to-expect-cycling-training-camp",
      "https://roadmancycling.com/blog/cycling-training-camp-preparation-guide",
    ]);
  });

  it("keeps the shared schema and visible trust block on every owner page", () => {
    const ownerPages = {
      "cycling-podcast": {
        path: "src/app/(content)/podcast/page.tsx",
        reviewed: "25 August 2026",
      },
      "cycling-coaching": {
        path: "src/app/(marketing)/coaching/page.tsx",
        reviewed: "26 August 2026",
      },
      "masters-cycling": {
        path: "src/app/(marketing)/masters/page.tsx",
        reviewed: "25 August 2026",
      },
      "cycling-training-plans": {
        path: "src/app/(marketing)/training-plans/page.tsx",
        reviewed: "25 August 2026",
      },
      "cycling-training-camps": {
        path: "src/app/(marketing)/training-camps/page.tsx",
        reviewed: "25 August 2026",
      },
    } as const;

    for (const [ownerId, ownerPage] of Object.entries(ownerPages)) {
      const source = readFileSync(
        resolve(process.cwd(), ownerPage.path),
        "utf8",
      );

      expect(source).toContain(
        `buildSearchOwnerTrustProperties("${ownerId}")`,
      );
      expect(source).toContain("<EvidenceBlock");
      expect(source).toContain(`lastReviewed="${ownerPage.reviewed}"`);
      expect(source).toContain('"@type": "BreadcrumbList"');
    }
  });

  it("keeps visible and structured owner backlinks on both content templates", () => {
    const templates = [
      "src/app/(content)/blog/[slug]/page.tsx",
      "src/app/(content)/podcast/[slug]/page.tsx",
    ];

    for (const pagePath of templates) {
      const source = readFileSync(resolve(process.cwd(), pagePath), "utf8");

      expect(source).toContain("<SearchOwnerLink owner={searchOwner} />");
      expect(source).toContain("getSearchOwnerWebPageId(searchOwner)");
    }
  });

  it("uses explicit editorial topic hubs to backfill blog ownership", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/app/(content)/blog/[slug]/page.tsx"),
      "utf8",
    );

    expect(source).toContain(
      "fallbackId: getSearchOwnerFallbackForTopicHub(primaryHubSlug)",
    );
  });

  it("tracks supporting-content clicks into every canonical owner", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/seo/SearchOwnerLink.tsx"),
      "utf8",
    );

    expect(source).toContain('data-track={`search_owner_${owner.id}`}');
  });
});
