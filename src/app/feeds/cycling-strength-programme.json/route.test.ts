import { describe, expect, it } from "vitest";
import { CYCLING_STRENGTH_PROGRAMME } from "@/lib/cycling-strength-programme";
import { GET } from "./route";

describe("GET /feeds/cycling-strength-programme.json", () => {
  it("publishes every week and session in the public example", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.headers.get("cache-control")).toContain("s-maxage=3600");
    expect(body.schemaVersion).toBe(1);
    expect(body.canonicalPage).toBe(CYCLING_STRENGTH_PROGRAMME.canonicalUrl);
    expect(body.programme).toMatchObject({
      durationWeeks: 12,
      sessionsPerWeek: 2,
      totalExampleSessions: 24,
      individualisedPlan: false,
      productEffectivenessEvidence: false,
      deloadWeeks: [5, 9],
    });
    expect(body.programme.weeks).toHaveLength(12);
    expect(body.programme.weeks[0].days).toHaveLength(2);
  });

  it("preserves the editorial owner and app-evidence boundary", async () => {
    const body = await GET().json();

    expect(body.searchOwnership).toMatchObject({
      editorialOwnerKeepsSearchIntent: true,
      programmePageIndexPolicy: "noindex-follow",
    });
    expect(body.searchOwnership.editorialOwnerUrl).toBe(
      CYCLING_STRENGTH_PROGRAMME.editorialOwnerUrl,
    );
    expect(body.evidenceBoundaries.productEffectivenessEvidence).toBe(false);
    expect(body.discovery.appEvidenceRegisterUrl).toBe(
      "https://roadmancycling.com/app/evidence",
    );
  });
});
