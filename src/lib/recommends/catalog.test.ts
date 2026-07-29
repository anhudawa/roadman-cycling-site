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
});
