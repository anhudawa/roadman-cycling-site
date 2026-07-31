import { describe, expect, it } from "vitest";
import {
  APPLICATION_STAGES,
  STAGE_LABELS,
  normalizeApplicationStage,
} from "./pipeline";

describe("application pipeline", () => {
  it("uses the outreach workflow without an accepted stage", () => {
    expect(APPLICATION_STAGES).toEqual([
      "awaiting_response",
      "contacted_once",
      "contacted_twice",
      "final_outreach",
      "signed_up",
      "rejected",
    ]);
    expect(APPLICATION_STAGES).not.toContain("accepted");
    expect(STAGE_LABELS.contacted_once).toBe("Contacted Once");
    expect(STAGE_LABELS.contacted_twice).toBe("Contacted Twice");
    expect(STAGE_LABELS.final_outreach).toBe("Final Outreach");
  });

  it("normalizes legacy stages without losing successful signups", () => {
    expect(normalizeApplicationStage("contacted")).toBe("contacted_once");
    expect(normalizeApplicationStage("responded")).toBe("contacted_once");
    expect(normalizeApplicationStage("offered")).toBe("final_outreach");
    expect(normalizeApplicationStage("follow_up")).toBe("final_outreach");
    expect(normalizeApplicationStage("accepted")).toBe("signed_up");
    expect(normalizeApplicationStage("unknown")).toBe("awaiting_response");
  });
});
