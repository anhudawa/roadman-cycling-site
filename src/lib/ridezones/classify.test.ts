import { describe, it, expect } from "vitest";
import { classifyPurpose } from "./classify";
import type { Activity } from "./types";

function ride(overrides: Partial<Activity>): Activity {
  return {
    id: "r1",
    date: "2026-07-01",
    name: "Ride",
    durationSec: 3600,
    source: "manual",
    ...overrides,
  };
}

/** durationSec split by shares across the 7 zones. */
function zoneTimes(durationSec: number, shares: number[]): number[] {
  return shares.map((s) => Math.round(s * durationSec));
}

describe("classifyPurpose without zone data", () => {
  it("calls a short very easy ride recovery", () => {
    expect(classifyPurpose(ride({ durationSec: 2700 }), 0.5)).toBe("recovery");
  });

  it("calls a steady 0.68 IF ride endurance", () => {
    expect(classifyPurpose(ride({}), 0.68)).toBe("endurance");
  });

  it("promotes a 3.5-hour endurance ride to long ride", () => {
    expect(classifyPurpose(ride({ durationSec: 3.5 * 3600 }), 0.68)).toBe("long-ride");
  });

  it("names the 0.80 IF ninety-minute ride as the grey zone", () => {
    expect(classifyPurpose(ride({ durationSec: 5400 }), 0.8)).toBe("grey-zone");
  });

  it("calls a 0.86 IF ride sweet spot and a 0.93 threshold", () => {
    expect(classifyPurpose(ride({}), 0.86)).toBe("sweet-spot");
    expect(classifyPurpose(ride({}), 0.93)).toBe("threshold");
  });

  it("calls anything above 0.98 a VO2 day", () => {
    expect(classifyPurpose(ride({ durationSec: 2700 }), 1.02)).toBe("vo2");
  });

  it("returns unknown when there is no intensity signal on a longer ride", () => {
    expect(classifyPurpose(ride({ durationSec: 2 * 3600 }), null)).toBe("unknown");
  });
});

describe("classifyPurpose with zone data", () => {
  it("spots an interval session from time above threshold even at modest average IF", () => {
    const activity = ride({
      durationSec: 4500,
      zoneTimesSec: zoneTimes(4500, [0.3, 0.32, 0.08, 0.08, 0.16, 0.05, 0.01]),
    });
    expect(classifyPurpose(activity, 0.82)).toBe("vo2");
  });

  it("recognises a threshold session from accumulated Z4 time", () => {
    const activity = ride({
      durationSec: 5400,
      zoneTimesSec: zoneTimes(5400, [0.25, 0.3, 0.1, 0.28, 0.05, 0.02, 0]),
    });
    expect(classifyPurpose(activity, 0.88)).toBe("threshold");
  });

  it("flags the classic grey-zone ride: a third of it in Z3, no session in it", () => {
    const activity = ride({
      durationSec: 5400,
      zoneTimesSec: zoneTimes(5400, [0.08, 0.42, 0.38, 0.1, 0.02, 0, 0]),
    });
    expect(classifyPurpose(activity, 0.8)).toBe("grey-zone");
  });

  it("keeps a disciplined long ride classified as a long ride", () => {
    const activity = ride({
      durationSec: 3.5 * 3600,
      zoneTimesSec: zoneTimes(3.5 * 3600, [0.12, 0.74, 0.1, 0.03, 0.01, 0, 0]),
    });
    expect(classifyPurpose(activity, 0.66)).toBe("long-ride");
  });
});
