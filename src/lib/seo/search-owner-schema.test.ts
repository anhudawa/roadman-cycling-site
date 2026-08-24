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
      "cycling-podcast": "src/app/(content)/podcast/page.tsx",
      "cycling-coaching": "src/app/(marketing)/coaching/page.tsx",
      "masters-cycling": "src/app/(marketing)/masters/page.tsx",
      "cycling-training-plans":
        "src/app/(marketing)/training-plans/page.tsx",
      "cycling-training-camps":
        "src/app/(marketing)/training-camps/page.tsx",
    } as const;

    for (const [ownerId, pagePath] of Object.entries(ownerPages)) {
      const source = readFileSync(resolve(process.cwd(), pagePath), "utf8");

      expect(source).toContain(
        `buildSearchOwnerTrustProperties("${ownerId}")`,
      );
      expect(source).toContain("<EvidenceBlock");
    }
  });
});
