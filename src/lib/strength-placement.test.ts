import { describe, expect, it } from "vitest";
import {
  buildStrengthPlacementPlan,
  DAY_NAMES,
  type RideContext,
  type StrengthWindow,
  type WeekDayInput,
} from "./strength-placement";

function week(rides: RideContext[], windows: StrengthWindow[]): WeekDayInput[] {
  return DAY_NAMES.map((day, index) => ({
    day,
    ride: rides[index],
    strengthWindow: windows[index],
  }));
}

describe("strength placement planner", () => {
  it("protects key and long rides in a normal two-session week", () => {
    const result = buildStrengthPlacementPlan(
      week(
        ["off-bike", "key", "easy", "endurance", "off-bike", "easy", "long"],
        [45, 0, 45, 0, 60, 0, 0],
      ),
      2,
    );

    expect(result.placements.map((placement) => placement.day)).toEqual([
      "Wednesday",
      "Friday",
    ]);
    expect(
      result.placements.every((placement) => placement.cautions.length === 0),
    ).toBe(true);
    expect(result.summary).toContain("without putting one directly before");
  });

  it("avoids the day before a priority ride when a safer window exists", () => {
    const result = buildStrengthPlacementPlan(
      week(
        ["off-bike", "key", "easy", "off-bike", "off-bike", "long", "easy"],
        [45, 0, 45, 0, 60, 0, 0],
      ),
      1,
    );

    expect(result.placements[0].day).toBe("Wednesday");
    expect(result.placements[0].cautions).toEqual([]);
  });

  it("labels an unavoidable day-before conflict as a compromise", () => {
    const result = buildStrengthPlacementPlan(
      week(
        ["off-bike", "key", "easy", "endurance", "off-bike", "long", "easy"],
        [45, 0, 0, 0, 0, 0, 0],
      ),
      1,
    );

    expect(result.placements[0].day).toBe("Monday");
    expect(result.placements[0].cautions.join(" ")).toContain("compromise");
    expect(result.summary).toContain("conflict to review");
  });

  it("does not stack a missing second session into the only available window", () => {
    const result = buildStrengthPlacementPlan(
      week(
        ["off-bike", "key", "easy", "endurance", "off-bike", "easy", "long"],
        [0, 0, 45, 0, 0, 0, 0],
      ),
      2,
    );

    expect(result.placements).toHaveLength(1);
    expect(result.unplacedSessions).toBe(1);
    expect(result.summary).toContain("rather than stacking missed work");
  });

  it("asks for an available window instead of fabricating a plan", () => {
    const result = buildStrengthPlacementPlan(
      week(
        ["off-bike", "key", "easy", "endurance", "off-bike", "easy", "long"],
        [0, 0, 0, 0, 0, 0, 0],
      ),
      2,
    );

    expect(result.placements).toEqual([]);
    expect(result.unplacedSessions).toBe(2);
    expect(result.summary).toContain("Add at least one");
  });
});
