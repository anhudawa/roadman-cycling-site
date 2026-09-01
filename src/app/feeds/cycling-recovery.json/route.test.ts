import { describe, expect, it } from "vitest";
import { CYCLING_RECOVERY_KNOWLEDGE } from "@/data/cycling-recovery";
import { GET } from "./route";

describe("GET /feeds/cycling-recovery.json", () => {
  it("publishes the reviewed decision and evidence map", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body.schemaVersion).toBe(1);
    expect(body.canonicalPage).toBe(CYCLING_RECOVERY_KNOWLEDGE.canonicalUrl);
    expect(body.decisionOrder).toHaveLength(5);
    expect(body.levers).toHaveLength(6);
    expect(body.sources).toHaveLength(6);
  });

  it("keeps diagnosis and prelaunch-product claims out of the feed", async () => {
    const body = await GET().json();

    expect(body.productBoundary).toMatchObject({
      appEffectivenessEstablished: false,
      appMeasuresRecovery: false,
      appDiagnosesHealthConditions: false,
    });
    expect(body.searchOwnership.educationalOwnerUrl).toBe(
      "https://roadmancycling.com/blog/cycling-recovery-tips",
    );
    expect(body.searchOwnership.productOwnerUrl).toBe(
      "https://roadmancycling.com/app",
    );
  });
});
