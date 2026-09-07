import { describe, expect, it } from "vitest";
import { calculatePMC } from "./pmc";

describe("training load from explicit starting values", () => {
  it("does not mistake the first ride for an established training history", () => {
    const result = calculatePMC([100], { ctl: 0, atl: 0 });
    expect(result.ctl).toBeCloseTo(100 / 42, 10);
    expect(result.atl).toBeCloseTo(100 / 7, 10);
    expect(result.tsb).toBe(0);
    expect(result.nextDayTsb).toBeCloseTo(-11.9047619048, 8);
  });
  it("applies rest days to existing load, with TSB before the day's training", () => {
    const result = calculatePMC([0], { ctl: 60, atl: 90 });
    expect(result.ctl).toBeCloseTo(58.5714285714, 8);
    expect(result.atl).toBeCloseTo(77.1428571429, 8);
    expect(result.tsb).toBe(-30);
    expect(result.nextDayTsb).toBeCloseTo(-18.5714285714, 8);
  });
  it("holds a constant established daily load at equilibrium", () => {
    expect(calculatePMC(Array(84).fill(60), { ctl: 60, atl: 60 }))
      .toEqual({ ctl: 60, atl: 60, tsb: 0, nextDayTsb: 0 });
  });
  it("carries the history correctly when the same diary is entered in two parts", () => {
    const first = calculatePMC([0, 120, 40], { ctl: 45, atl: 55 });
    const continued = calculatePMC([80, 0, 60], first);
    const together = calculatePMC([0, 120, 40, 80, 0, 60], { ctl: 45, atl: 55 });
    expect(continued).toEqual(together);
  });
  it("preserves the supplied starting values when no days are entered", () => {
    expect(calculatePMC([], { ctl: 45, atl: 55 }))
      .toEqual({ ctl: 45, atl: 55, tsb: -10, nextDayTsb: -10 });
  });
  it("rejects invalid inputs instead of emitting a plausible-looking result", () => {
    for (const invalid of [-1, NaN, Infinity]) {
      expect(() => calculatePMC([invalid], { ctl: 0, atl: 0 })).toThrow(RangeError);
      expect(() => calculatePMC([0], { ctl: invalid, atl: 0 })).toThrow(RangeError);
      expect(() => calculatePMC([0], { ctl: 0, atl: invalid })).toThrow(RangeError);
    }
  });
});
