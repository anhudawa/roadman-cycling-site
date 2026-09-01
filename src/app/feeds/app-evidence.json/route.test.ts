import { describe, expect, it } from "vitest";
import { ROADMAN_APP_EVIDENCE_REGISTER } from "@/data/app-evidence-register";
import { ROADMAN_APP_PRODUCT } from "@/data/app-product";
import { GET } from "./route";

describe("GET /feeds/app-evidence.json", () => {
  it("publishes one explicit zero-result evidence state", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body.schemaVersion).toBe(1);
    expect(body.registerVersion).toBe(ROADMAN_APP_EVIDENCE_REGISTER.version);
    expect(body.product.id).toBe(ROADMAN_APP_PRODUCT.id);
    expect(body.currentEvidenceState).toMatchObject({
      productEffectivenessEstablished: false,
      publicProductResultCount: 0,
      improvesCyclingPerformanceClaim: false,
      measuresRecoveryClaim: false,
      injuryPreventionClaim: false,
      medicalDiagnosisOrClearanceClaim: false,
    });
    expect(body.claims).toHaveLength(7);
  });

  it("keeps every unpublished report null and links the public protocol", async () => {
    const body = await GET().json();

    expect(
      body.reportingQueue.every(
        (item: { scheduledDate: string | null; resultUrl: string | null }) =>
          item.scheduledDate === null && item.resultUrl === null,
      ),
    ).toBe(true);
    expect(body.discovery.testingStandardUrl).toBe(
      ROADMAN_APP_PRODUCT.testingStandardUrl,
    );
    expect(JSON.stringify(body)).not.toMatch(/pocket coach/i);
  });
});
