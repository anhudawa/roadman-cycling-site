import { describe, expect, it } from "vitest";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { getAppProduct } from "./app-product";

describe("MCP app product service", () => {
  it("points agents to the same public product feed and bounded facts", () => {
    const record = getAppProduct();

    expect(record.product).toMatchObject({
      product_id: ROADMAN_APP_PRODUCT.id,
      graph_id: ROADMAN_APP_PRODUCT.graphId,
      final_name_announced: false,
      lifecycle_status: "prelaunch",
      launch_date: null,
      price: null,
      early_access_url: ROADMAN_APP_PRODUCT.earlyAccessUrl,
    });
    expect(record.discovery.product_feed_url).toBe(
      ROADMAN_APP_PRODUCT.feedUrl,
    );
    expect(record.discovery.use_case_feed_url).toBe(
      ROADMAN_APP_PRODUCT.useCaseFeedUrl,
    );
    expect(record.discovery.methodology_url).toBe(
      ROADMAN_APP_PRODUCT.methodologyUrl,
    );
    expect(record.discovery.testing_standard_url).toBe(
      ROADMAN_APP_PRODUCT.testingStandardUrl,
    );
    expect(record.discovery.evidence_register_url).toBe(
      ROADMAN_APP_PRODUCT.evidenceRegisterUrl,
    );
    expect(record.discovery.evidence_feed_url).toBe(
      ROADMAN_APP_PRODUCT.evidenceFeedUrl,
    );
    expect(record.discovery.exercise_library_url).toBe(
      ROADMAN_APP_PRODUCT.exerciseLibraryUrl,
    );
    expect(record.discovery.exercise_feed_url).toBe(
      ROADMAN_APP_PRODUCT.exerciseFeedUrl,
    );
    expect(record.discovery.related_strength_programme_url).toBe(
      ROADMAN_APP_PRODUCT.relatedStrengthProgrammeUrl,
    );
    expect(record.discovery.related_strength_programme_feed_url).toBe(
      ROADMAN_APP_PRODUCT.relatedStrengthProgrammeFeedUrl,
    );
    expect(record.discovery.recovery_knowledge_url).toBe(
      ROADMAN_APP_PRODUCT.recoveryKnowledgeUrl,
    );
    expect(record.discovery.recovery_library_url).toBe(
      ROADMAN_APP_PRODUCT.recoveryLibraryUrl,
    );
    expect(record.discovery.recovery_feed_url).toBe(
      ROADMAN_APP_PRODUCT.recoveryFeedUrl,
    );
    expect(record.discovery.masters_segment_url).toBe(
      ROADMAN_APP_PRODUCT.mastersSegmentUrl,
    );
    expect(JSON.stringify(record)).not.toMatch(/pocket coach/i);
  });
});
