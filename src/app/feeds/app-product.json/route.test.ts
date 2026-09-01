import { describe, expect, it } from "vitest";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { GET } from "./route";

describe("GET /feeds/app-product.json", () => {
  it("publishes one bounded prelaunch app identity from shared facts", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body.schemaVersion).toBe(1);
    expect(body.canonicalPage).toBe(ROADMAN_APP_PRODUCT.canonicalUrl);
    expect(body.feedUrl).toBe(ROADMAN_APP_PRODUCT.feedUrl);
    expect(body.discovery.useCaseFeedUrl).toBe(
      ROADMAN_APP_PRODUCT.useCaseFeedUrl,
    );
    expect(body.discovery.methodologyUrl).toBe(
      ROADMAN_APP_PRODUCT.methodologyUrl,
    );
    expect(body.discovery.testingStandardUrl).toBe(
      ROADMAN_APP_PRODUCT.testingStandardUrl,
    );
    expect(body.discovery.evidenceRegisterUrl).toBe(
      ROADMAN_APP_PRODUCT.evidenceRegisterUrl,
    );
    expect(body.discovery.evidenceFeedUrl).toBe(
      ROADMAN_APP_PRODUCT.evidenceFeedUrl,
    );
    expect(body.discovery.exerciseLibraryUrl).toBe(
      ROADMAN_APP_PRODUCT.exerciseLibraryUrl,
    );
    expect(body.discovery.exerciseFeedUrl).toBe(
      ROADMAN_APP_PRODUCT.exerciseFeedUrl,
    );
    expect(body.discovery.relatedStrengthProgrammeUrl).toBe(
      ROADMAN_APP_PRODUCT.relatedStrengthProgrammeUrl,
    );
    expect(body.discovery.relatedStrengthProgrammeFeedUrl).toBe(
      ROADMAN_APP_PRODUCT.relatedStrengthProgrammeFeedUrl,
    );
    expect(body.discovery.recoveryKnowledgeUrl).toBe(
      ROADMAN_APP_PRODUCT.recoveryKnowledgeUrl,
    );
    expect(body.discovery.recoveryLibraryUrl).toBe(
      ROADMAN_APP_PRODUCT.recoveryLibraryUrl,
    );
    expect(body.discovery.recoveryFeedUrl).toBe(
      ROADMAN_APP_PRODUCT.recoveryFeedUrl,
    );
    expect(body.discovery.mastersSegmentUrl).toBe(
      ROADMAN_APP_PRODUCT.mastersSegmentUrl,
    );
    expect(body.product).toMatchObject({
      id: ROADMAN_APP_PRODUCT.id,
      graphId: ROADMAN_APP_PRODUCT.graphId,
      name: ROADMAN_APP_PRODUCT.name,
      finalNameAnnounced: false,
      lifecycleStatus: "prelaunch",
      launchDate: null,
      price: null,
      currency: null,
      features: ROADMAN_APP_PRODUCT.features,
      limitations: ROADMAN_APP_PRODUCT.limitations,
      earlyAccess: {
        url: ROADMAN_APP_PRODUCT.earlyAccessUrl,
        audienceModel: "single-waitlist",
      },
    });
  });

  it("links every supporting surface without leaking the internal project name", async () => {
    const body = await GET().json();
    const json = JSON.stringify(body);

    expect(body.discovery.topicUrls).toHaveLength(
      ROADMAN_APP_PRODUCT.topicSlugs.length,
    );
    expect(body.discovery.previewToolUrls).toHaveLength(
      ROADMAN_APP_PRODUCT.previewToolSlugs.length,
    );
    expect(body.discovery.comparisonUrls).toHaveLength(
      ROADMAN_APP_PRODUCT.comparisonSlugs.length,
    );
    expect(body.discovery.evidenceUrls).toHaveLength(
      ROADMAN_APP_PRODUCT.evidenceArticleSlugs.length,
    );
    expect(json).not.toMatch(/pocket coach/i);
  });
});
