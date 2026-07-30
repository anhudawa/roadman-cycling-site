import { describe, expect, it } from "vitest";
import {
  FALLBACK_AFFILIATE_DESTINATIONS,
  FALLBACK_PUBLIC_PRODUCTS,
  HEXIS_AFFILIATE_URL,
} from "./catalog";

describe("affiliate catalogue entries", () => {
  it("keeps the approved Roadman tracking values", () => {
    const url = new URL(HEXIS_AFFILIATE_URL);
    expect(url.searchParams.get("creative_id")).toBe("1");
    expect(url.searchParams.get("source_id")).toBe("roadman-recommends");
    expect(url.searchParams.get("sub2")).toBe("hexis-product-page");
  });

  it("shows the approved funnel code", () => {
    expect(FALLBACK_PUBLIC_PRODUCTS[0].offers[0].promoCode).toBe("CARBS25");
  });

  it("includes every approved Impact brand with an image and tracked offer", () => {
    const retailers = new Set(
      FALLBACK_PUBLIC_PRODUCTS.flatMap((product) =>
        product.offers.map((item) => item.retailerName),
      ),
    );

    expect(retailers).toEqual(
      new Set([
        "Hexis",
        "MAAP",
        "Competitive Cyclist",
        "Zwift",
        "Zwift US",
        "Muc-Off",
      ]),
    );
    expect(
      FALLBACK_PUBLIC_PRODUCTS.every(
        (product) =>
          Boolean(product.imageUrl) &&
          product.offers.every((item) =>
            Boolean(FALLBACK_AFFILIATE_DESTINATIONS[item.id]),
          ),
      ),
    ).toBe(true);
  });

  it("adds Roadman sub IDs and deep product destinations to Impact links", () => {
    for (const product of FALLBACK_PUBLIC_PRODUCTS.slice(1)) {
      const destination = new URL(
        FALLBACK_AFFILIATE_DESTINATIONS[product.offers[0].id],
      );
      expect(destination.searchParams.get("subId1")).toBe(
        "roadman-recommends",
      );
      expect(destination.searchParams.get("subId2")).toBe(product.slug);
      expect(destination.searchParams.get("u")).toMatch(/^https:\/\//);
    }
  });

  it("provides a useful MAAP kit range rather than isolated products", () => {
    const maapProducts = FALLBACK_PUBLIC_PRODUCTS.filter(
      (product) => product.brandSlug === "maap",
    );

    expect(maapProducts).toHaveLength(16);
    expect(
      maapProducts.some((product) => product.slug.includes("womens")),
    ).toBe(true);
    expect(
      maapProducts.some((product) => product.tags.includes("cargo bib")),
    ).toBe(true);
    expect(
      maapProducts.some((product) => product.tags.includes("cycling jacket")),
    ).toBe(true);
    expect(
      maapProducts.every(
        (product) =>
          Boolean(product.imageUrl) &&
          product.offers.every((offer) =>
            Boolean(FALLBACK_AFFILIATE_DESTINATIONS[offer.id]),
          ),
      ),
    ).toBe(true);
  });

  it("keeps the expanded catalogue entirely on approved affiliate routes", () => {
    const approvedHosts = new Set([
      "www.gj4bt5vt.com",
      "maap.sjv.io",
      "competitivecyclist.g39l.net",
      "zwiftinc.sjv.io",
      "mucoff.sjv.io",
    ]);

    expect(FALLBACK_PUBLIC_PRODUCTS).toHaveLength(52);

    for (const product of FALLBACK_PUBLIC_PRODUCTS) {
      expect(product.imageUrl).toMatch(/^https:\/\//);
      expect(product.offers.length).toBeGreaterThan(0);

      for (const offer of product.offers) {
        const destination = FALLBACK_AFFILIATE_DESTINATIONS[offer.id];
        expect(destination).toBeTruthy();
        expect(approvedHosts.has(new URL(destination).hostname)).toBe(true);
      }
    }
  });

  it("fills the winter and new-rider training gaps", () => {
    const slugs = new Set(
      FALLBACK_PUBLIC_PRODUCTS.map((product) => product.slug),
    );

    expect(slugs.has("continental-grand-prix-5000-as-tr")).toBe(true);
    expect(slugs.has("pdw-poncho-recycled-fenders")).toBe(true);
    expect(slugs.has("maap-apex-deep-winter-glove")).toBe(true);
    expect(slugs.has("maap-apex-deep-winter-tight-2")).toBe(true);
    expect(slugs.has("wahoo-kickr-headwind")).toBe(true);
    expect(slugs.has("wahoo-trackr-heart-rate")).toBe(true);
    expect(slugs.has("garmin-edge-540")).toBe(true);
  });
});
