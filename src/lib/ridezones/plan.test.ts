import { describe, it, expect } from "vitest";
import { buildWeekPlan } from "./plan";
import type { RiderSettings } from "./types";

const BASE: RiderSettings = {
  ftp: 250,
  lthr: 165,
  weeklyHours: 8,
  goal: "gran-fondo",
};

describe("buildWeekPlan", () => {
  it("anchors a gran fondo week on the long ride", () => {
    const plan = buildWeekPlan(BASE, "durability", 0);
    expect(plan.sessions.some((s) => s.purpose === "long-ride")).toBe(true);
  });

  it("gives an FTP-breakthrough week a threshold anchor", () => {
    const plan = buildWeekPlan({ ...BASE, goal: "ftp-breakthrough" }, "threshold-power", 0);
    expect(plan.sessions.some((s) => s.purpose === "threshold")).toBe(true);
  });

  it("promotes the focus system's session into the week", () => {
    const plan = buildWeekPlan(BASE, "vo2-engine", 0);
    expect(plan.sessions.some((s) => s.purpose === "vo2")).toBe(true);
  });

  it("shrinks the week for a time-crunched rider instead of overfilling it", () => {
    const small = buildWeekPlan({ ...BASE, weeklyHours: 4 }, "aerobic-base", 0);
    const big = buildWeekPlan({ ...BASE, weeklyHours: 12 }, "aerobic-base", 0);
    expect(small.totalHours).toBeLessThan(big.totalHours);
    expect(small.totalHours).toBeLessThanOrEqual(4 * 1.2);
    expect(small.sessions.length).toBeGreaterThanOrEqual(3);
  });

  it("trades intensity for recovery when the rider is deeply fatigued", () => {
    const fresh = buildWeekPlan({ ...BASE, goal: "road-race" }, "vo2-engine", 0);
    const cooked = buildWeekPlan({ ...BASE, goal: "road-race" }, "vo2-engine", -30);
    const countIntensity = (sessions: typeof fresh.sessions) =>
      sessions.filter(
        (s) => s.purpose !== "endurance" && s.purpose !== "long-ride" && s.purpose !== "recovery"
      ).length;
    expect(countIntensity(cooked.sessions)).toBeLessThan(countIntensity(fresh.sessions));
    expect(cooked.weekNote).toContain("fatigue");
  });

  it("orders sessions Monday to Sunday", () => {
    const plan = buildWeekPlan(BASE, "durability", 0);
    const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const indices = plan.sessions.map((s) => order.indexOf(s.day));
    expect([...indices].sort((a, b) => a - b)).toEqual(indices);
  });

  it("scales watt targets with FTP", () => {
    const p250 = buildWeekPlan(BASE, "threshold-power", 0);
    const p300 = buildWeekPlan({ ...BASE, ftp: 300 }, "threshold-power", 0);
    const t250 = p250.sessions.flatMap((s) => s.targets).find((t) => t.kind === "power")!;
    const t300 = p300.sessions.flatMap((s) => s.targets).find((t) => t.kind === "power")!;
    expect(t250.text).not.toEqual(t300.text);
  });

  it("omits heart-rate targets when the rider has no LTHR", () => {
    const plan = buildWeekPlan({ ...BASE, lthr: undefined }, "zone2-engine", 0);
    const hrTargets = plan.sessions.flatMap((s) => s.targets).filter((t) => t.kind === "hr");
    expect(hrTargets).toHaveLength(0);
  });
});
