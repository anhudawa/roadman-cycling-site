import { describe, expect, it } from "vitest";
import {
  CYCLING_STRENGTH_PROGRAMME,
  getCyclingStrengthProgrammeRecord,
} from "./cycling-strength-programme";

describe("cycling strength programme record", () => {
  it("publishes the complete 12-week, two-session structure", () => {
    const record = getCyclingStrengthProgrammeRecord();

    expect(record.durationWeeks).toBe(12);
    expect(record.sessionsPerWeek).toBe(2);
    expect(record.totalExampleSessions).toBe(24);
    expect(record.weeks).toHaveLength(12);
    expect(record.weeks.every((week) => week.days.length === 2)).toBe(true);
    expect(record.deloadWeeks).toEqual([5, 9]);
    expect(record.commonWarmup.length).toBeGreaterThan(0);
  });

  it("keeps the programme, app evidence and search-owner boundaries explicit", () => {
    const record = getCyclingStrengthProgrammeRecord();

    expect(record.individualisedPlan).toBe(false);
    expect(record.productEffectivenessEvidence).toBe(false);
    expect(
      CYCLING_STRENGTH_PROGRAMME.searchPolicy.editorialOwnerKeepsSearchIntent,
    ).toBe(true);
    expect(
      CYCLING_STRENGTH_PROGRAMME.searchPolicy.programmePageIndexPolicy,
    ).toBe("noindex-follow");
    expect(CYCLING_STRENGTH_PROGRAMME.editorialOwnerUrl).toContain(
      "/blog/cycling-strength-training-12-week-beginner-plan",
    );
  });
});
