import { describe, expect, it } from "vitest";
import {
  ROADMAN_APP_USE_CASE_FEED_URL,
  ROADMAN_APP_USE_CASES,
} from "@/data/app-use-cases";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { GET } from "./route";

describe("GET /feeds/app-use-cases.json", () => {
  it("publishes six situations for one product and one waitlist", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body.schemaVersion).toBe(1);
    expect(body.canonicalProduct).toBe(ROADMAN_APP_PRODUCT.canonicalUrl);
    expect(body.feedUrl).toBe(ROADMAN_APP_USE_CASE_FEED_URL);
    expect(body.audienceModel).toEqual(
      expect.objectContaining({
        productCount: 1,
        waitlistCount: 1,
        earlyAccessUrl: ROADMAN_APP_PRODUCT.earlyAccessUrl,
      }),
    );
    expect(body.useCases).toHaveLength(6);
    expect(body.useCases).toEqual(ROADMAN_APP_USE_CASES);
  });

  it("keeps every use case distinct, discoverable and bounded", async () => {
    const body = await GET().json();
    const ids = body.useCases.map((useCase: { id: string }) => useCase.id);
    const intents = body.useCases.flatMap(
      (useCase: { searchIntents: string[] }) => useCase.searchIntents,
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(intents).size).toBe(intents.length);
    expect(ids).toEqual([
      "masters-cyclist",
      "existing-cycling-plan",
      "time-crunched-cyclist",
      "strength-beginner-or-returner",
      "limited-equipment",
      "recovery-and-readiness",
    ]);

    for (const useCase of body.useCases) {
      expect(useCase.entryUrl).toMatch(/^https:\/\/roadmancycling\.com\/app/);
      expect(useCase.supportingUrls.length).toBeGreaterThanOrEqual(3);
      expect(useCase.decisionInputs.length).toBeGreaterThanOrEqual(4);
      const limits = useCase.limits.join(" ");
      expect(limits).toMatch(/does not diagnose/i);
      expect(limits).toMatch(/does not silently rewrite/i);
      expect(limits).toMatch(/no .* guaranteed/i);
    }
  });

  it("links the product record and does not leak unannounced facts", async () => {
    const body = await GET().json();
    const json = JSON.stringify(body);

    expect(body.discovery.productFeedUrl).toBe(ROADMAN_APP_PRODUCT.feedUrl);
    expect(body.discovery.methodologyUrl).toBe(
      ROADMAN_APP_PRODUCT.methodologyUrl,
    );
    expect(body.discovery.testingStandardUrl).toBe(
      ROADMAN_APP_PRODUCT.testingStandardUrl,
    );
    expect(body.productBoundaries).toEqual(ROADMAN_APP_PRODUCT.limitations);
    expect(json).not.toMatch(/pocket coach/i);
    expect(json).not.toMatch(/guarantees? (ftp|performance|recovery)/i);
  });
});
