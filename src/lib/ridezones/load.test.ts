import { describe, it, expect } from "vitest";
import { buildLoadSeries, computeRideLoad, rampRate, shiftDate } from "./load";
import type { Activity } from "./types";

const SETTINGS = { ftp: 250, lthr: 165 };

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

describe("computeRideLoad", () => {
  it("gives a one-hour ride at FTP a TSS of 100", () => {
    const load = computeRideLoad(ride({ normalizedPower: 250 }), SETTINGS);
    expect(load.tss).toBeCloseTo(100, 0);
    expect(load.intensityFactor).toBeCloseTo(1.0, 2);
    expect(load.loadSource).toBe("power");
  });

  it("scores harder rides higher than easier rides of the same length", () => {
    const easy = computeRideLoad(ride({ normalizedPower: 165 }), SETTINGS);
    const hard = computeRideLoad(ride({ normalizedPower: 235 }), SETTINGS);
    expect(hard.tss).toBeGreaterThan(easy.tss);
  });

  it("estimates NP from average power when NP is missing", () => {
    const fromAvg = computeRideLoad(ride({ avgPower: 200 }), SETTINGS);
    const fromNp = computeRideLoad(ride({ normalizedPower: 210 }), SETTINGS);
    expect(fromAvg.tss).toBeCloseTo(fromNp.tss, 0);
  });

  it("falls back to heart rate when there is no power", () => {
    const load = computeRideLoad(ride({ avgHr: 132 }), SETTINGS);
    expect(load.loadSource).toBe("hr");
    expect(load.intensityFactor).toBeCloseTo(0.8, 2);
    expect(load.tss).toBeGreaterThan(50);
    expect(load.tss).toBeLessThan(75);
  });

  it("clamps implausible heart-rate ratios instead of exploding", () => {
    const load = computeRideLoad(ride({ avgHr: 250 }), SETTINGS);
    expect(load.intensityFactor).toBeLessThanOrEqual(1.15);
  });

  it("gives duration-only rides a conservative estimate rather than zero", () => {
    const load = computeRideLoad(ride({ durationSec: 2 * 3600 }), SETTINGS);
    expect(load.loadSource).toBe("duration");
    expect(load.tss).toBeGreaterThan(60);
    expect(load.tss).toBeLessThan(120);
  });
});

describe("buildLoadSeries", () => {
  it("produces one point per day from first ride to asOf", () => {
    const series = buildLoadSeries(
      [
        { date: "2026-07-01", tss: 80 },
        { date: "2026-07-03", tss: 60 },
      ],
      "2026-07-05"
    );
    expect(series).toHaveLength(5);
    expect(series[0].date).toBe("2026-07-01");
    expect(series[4].date).toBe("2026-07-05");
  });

  it("builds fitness slowly and fatigue quickly", () => {
    const dailyRides = Array.from({ length: 30 }, (_, i) => ({
      date: shiftDate("2026-06-01", i),
      tss: 70,
    }));
    const series = buildLoadSeries(dailyRides, "2026-06-30");
    const last = series[series.length - 1];
    // After 30 days at 70 TSS/day, ATL (7-day) is nearly saturated at 70
    // while CTL (42-day) is still climbing.
    expect(last.atl).toBeGreaterThan(60);
    expect(last.ctl).toBeGreaterThan(25);
    expect(last.ctl).toBeLessThan(last.atl);
    expect(last.tsb).toBeLessThan(0);
  });

  it("lets form recover on rest days", () => {
    const rides = Array.from({ length: 14 }, (_, i) => ({
      date: shiftDate("2026-06-01", i),
      tss: 90,
    }));
    const trained = buildLoadSeries(rides, "2026-06-14");
    const rested = buildLoadSeries(rides, "2026-06-21");
    expect(rested[rested.length - 1].tsb).toBeGreaterThan(
      trained[trained.length - 1].tsb
    );
  });

  it("sums multiple rides on the same day", () => {
    const series = buildLoadSeries(
      [
        { date: "2026-07-01", tss: 40 },
        { date: "2026-07-01", tss: 35 },
      ],
      "2026-07-01"
    );
    expect(series[0].tss).toBeCloseTo(75, 1);
  });
});

describe("rampRate", () => {
  it("is positive when load is building", () => {
    const rides = Array.from({ length: 21 }, (_, i) => ({
      date: shiftDate("2026-06-01", i),
      tss: 40 + i * 4,
    }));
    const series = buildLoadSeries(rides, "2026-06-21");
    expect(rampRate(series)).toBeGreaterThan(0);
  });
});
