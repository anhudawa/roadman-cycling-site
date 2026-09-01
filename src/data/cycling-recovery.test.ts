import { describe, expect, it } from "vitest";
import { CYCLING_RECOVERY_KNOWLEDGE } from "./cycling-recovery";

describe("cycling recovery knowledge map", () => {
  it("separates educational and product search ownership", () => {
    expect(CYCLING_RECOVERY_KNOWLEDGE.searchOwnership).toMatchObject({
      primaryQuery: "cycling recovery",
      educationalOwnerUrl:
        "https://roadmancycling.com/blog/cycling-recovery-tips",
      researchLibraryUrl: "https://roadmancycling.com/topics/cycling-recovery",
      productOwnerUrl: "https://roadmancycling.com/app",
    });
  });

  it("publishes bounded recovery levers and a clinical handoff", () => {
    expect(CYCLING_RECOVERY_KNOWLEDGE.levers).toHaveLength(6);
    expect(
      CYCLING_RECOVERY_KNOWLEDGE.levers.every(
        (lever) =>
          lever.cannotEstablish.length > 0 && lever.ownerUrl.length > 0,
      ),
    ).toBe(true);
    expect(
      CYCLING_RECOVERY_KNOWLEDGE.levers.map((lever) => lever.id),
    ).toContain("clinical-handoff");
    expect(CYCLING_RECOVERY_KNOWLEDGE.productBoundary).toMatchObject({
      appEffectivenessEstablished: false,
      appMeasuresRecovery: false,
      appDiagnosesHealthConditions: false,
    });
  });
});
