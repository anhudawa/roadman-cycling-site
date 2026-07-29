import { describe, expect, it } from "vitest";
import { parseRecommendationCatalogCsv } from "./catalog-csv";

describe("recommendation catalogue CSV", () => {
  it("parses editorial content and a regional offer", () => {
    const rows = parseRecommendationCatalogCsv(
      [
        "name,slug,category_slug,verdict,short_description,why_recommend,who_for,tags,regions,retailer,destination_url",
        'Test Tyre,test-tyre,tyres-tubes,Fast and dependable,A useful tyre,It balances speed and durability,Road riders,"fast|tubeless","IE|GB","Bike Shop",https://example.com/product',
      ].join("\n"),
    );
    expect(rows[0]).toMatchObject({
      slug: "test-tyre",
      tags: ["fast", "tubeless"],
      regions: ["IE", "GB"],
      status: "draft",
      evidenceStatus: "editorial",
    });
  });

  it("rejects an offer without a retailer", () => {
    expect(() =>
      parseRecommendationCatalogCsv(
        [
          "name,slug,category_slug,verdict,short_description,why_recommend,who_for,destination_url",
          "Test,test,tools-accessories,Verdict,Description,Reason,Riders,https://example.com",
        ].join("\n"),
      ),
    ).toThrow(/needs retailer/);
  });
});
