import { describe, it, expect } from "vitest";
import { LAUNCH_DEFAULTS } from "../config";
import { deadlineForStage } from "../queries";

const NOON = LAUNCH_DEFAULTS.pickingDeadlineIso!;

describe("pickingDeadlineIso default", () => {
  it("is noon on race day (4 July) in CEST = 10:00 UTC", () => {
    const d = new Date(NOON);
    expect(d.toISOString()).toBe("2026-07-04T10:00:00.000Z");
  });
});

describe("deadlineForStage with a picking deadline", () => {
  const stage1 = { stageNumber: 1, date: "2026-07-04", startTimeCest: null };

  it("uses the configured picking deadline for Stage 1", () => {
    expect(deadlineForStage(stage1, NOON).toISOString()).toBe("2026-07-04T10:00:00.000Z");
  });

  it("pins Stage 1 even after a real TTT start time is entered later", () => {
    const withStart = {
      stageNumber: 1,
      date: "2026-07-04",
      startTimeCest: new Date("2026-07-04T16:30:00+02:00"),
    };
    // The afternoon TTT start must NOT move the picking lock off noon.
    expect(deadlineForStage(withStart, NOON).toISOString()).toBe("2026-07-04T10:00:00.000Z");
  });

  it("does not apply the picking deadline to other stages", () => {
    const stage2 = {
      stageNumber: 2,
      date: "2026-07-05",
      startTimeCest: new Date("2026-07-05T13:10:00+02:00"),
    };
    expect(deadlineForStage(stage2, NOON).toISOString()).toBe("2026-07-05T11:10:00.000Z");
  });

  it("falls back to the noon-CEST stage default when no picking deadline and no start time", () => {
    expect(deadlineForStage(stage1).toISOString()).toBe("2026-07-04T10:00:00.000Z");
    const stage7 = { stageNumber: 7, date: "2026-07-10", startTimeCest: null };
    expect(deadlineForStage(stage7).toISOString()).toBe("2026-07-10T10:00:00.000Z");
  });

  it("with no picking deadline, Stage 1 honours an entered start time (legacy behaviour)", () => {
    const withStart = {
      stageNumber: 1,
      date: "2026-07-04",
      startTimeCest: new Date("2026-07-04T16:30:00+02:00"),
    };
    expect(deadlineForStage(withStart, null).toISOString()).toBe("2026-07-04T14:30:00.000Z");
  });
});
