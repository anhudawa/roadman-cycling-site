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
      "questions_requested",
      "contacted_once",
      "contacted_twice",
      "final_outreach",
      "approved",
      "signed_up",
      "rejected",
    ]);
    expect(APPLICATION_STAGES).not.toContain("accepted");
    expect(STAGE_LABELS.questions_requested).toBe("Sarah Review");
    expect(STAGE_LABELS.contacted_once).toBe("Contacted Once");
    expect(STAGE_LABELS.contacted_twice).toBe("Contacted Twice");
    expect(STAGE_LABELS.final_outreach).toBe("Final Outreach");
    expect(STAGE_LABELS.approved).toBe("Approved");
  });

  it("only reaches the approved stage by an explicit move", () => {
    // /apply/next reads this stage to decide whether to show the offer, so no
    // unrecognised or legacy status may ever normalize into it.
    for (const legacy of ["accepted", "offered", "follow_up", "responded", "contacted", "unknown", "approve", "Approved", ""]) {
      expect(normalizeApplicationStage(legacy)).not.toBe("approved");
    }
    expect(normalizeApplicationStage(undefined)).toBe("awaiting_response");
    expect(normalizeApplicationStage("approved")).toBe("approved");
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
