import { describe, it, expect } from "vitest";
import { scoreExecution } from "./execution";
import type { Activity } from "./types";

function ride(overrides: Partial<Activity>): Activity {
  return {
    id: "r1",
    date: "2026-07-01",
    name: "Ride",
    durationSec: 5400,
    source: "manual",
    ...overrides,
  };
}

function zoneTimes(durationSec: number, shares: number[]): number[] {
  return shares.map((s) => Math.round(s * durationSec));
}

describe("scoreExecution", () => {
  it("rewards a disciplined Zone 2 ride", () => {
    const activity = ride({
      zoneTimesSec: zoneTimes(5400, [0.15, 0.8, 0.04, 0.01, 0, 0, 0]),
    });
    const result = scoreExecution(activity, "endurance", 0.68);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(8.5);
    expect(result!.verdict).toBe("nailed");
  });

  it("punishes an endurance ride that drifted into Zone 3", () => {
    const drifted = ride({
      zoneTimesSec: zoneTimes(5400, [0.08, 0.5, 0.3, 0.1, 0.02, 0, 0]),
    });
    const clean = ride({
      zoneTimesSec: zoneTimes(5400, [0.15, 0.8, 0.04, 0.01, 0, 0, 0]),
    });
    const driftedScore = scoreExecution(drifted, "endurance", 0.78)!;
    const cleanScore = scoreExecution(clean, "endurance", 0.68)!;
    expect(driftedScore.score).toBeLessThan(cleanScore.score);
    expect(driftedScore.score).toBeLessThan(7);
    expect(driftedScore.note).toContain("above Zone 2");
  });

  it("always marks the grey zone as a drifted or missed session", () => {
    const result = scoreExecution(ride({}), "grey-zone", 0.8)!;
    expect(result.score).toBeLessThan(7);
    expect(["drifted", "missed"]).toContain(result.verdict);
  });

  it("scores a threshold session by minutes at threshold, not average power", () => {
    const bigSession = ride({
      durationSec: 5400,
      zoneTimesSec: zoneTimes(5400, [0.2, 0.3, 0.1, 0.35, 0.04, 0.01, 0]),
    });
    const thinSession = ride({
      durationSec: 5400,
      zoneTimesSec: zoneTimes(5400, [0.35, 0.4, 0.13, 0.1, 0.02, 0, 0]),
    });
    const big = scoreExecution(bigSession, "threshold", 0.9)!;
    const thin = scoreExecution(thinSession, "threshold", 0.9)!;
    expect(big.score).toBeGreaterThan(thin.score);
    expect(big.score).toBeGreaterThanOrEqual(8.5);
  });

  it("rewards accumulated VO2 minutes", () => {
    const solid = ride({
      durationSec: 4500,
      zoneTimesSec: zoneTimes(4500, [0.3, 0.3, 0.08, 0.08, 0.17, 0.06, 0.01]),
    });
    const result = scoreExecution(solid, "vo2", 0.92)!;
    expect(result.score).toBeGreaterThanOrEqual(8);
  });

  it("flags a recovery ride that crept too hard", () => {
    const result = scoreExecution(ride({ durationSec: 2700 }), "recovery", 0.68)!;
    expect(result.score).toBeLessThan(7);
  });

  it("returns null when the ride can't be judged", () => {
    expect(scoreExecution(ride({}), "unknown", null)).toBeNull();
  });
});
