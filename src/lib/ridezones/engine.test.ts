/**
 * Integration tests over the demo history — the pipeline should be able to
 * diagnose the story the demo rider is written to tell: a strong best
 * block months ago, then volume decline and grey-zone creep.
 */

import { describe, it, expect } from "vitest";
import { DEMO_SETTINGS, generateDemoHistory } from "./demo";
import { buildAnalysis } from "./engine";
import type { RiderSettings } from "./types";

const AS_OF = "2026-07-19";
const SETTINGS: RiderSettings = { ...DEMO_SETTINGS };

const analysis = buildAnalysis(generateDemoHistory(AS_OF), SETTINGS, AS_OF);

describe("buildAnalysis on the demo rider", () => {
  it("is deterministic", () => {
    const again = buildAnalysis(generateDemoHistory(AS_OF), SETTINGS, AS_OF);
    expect(again).toEqual(analysis);
  });

  it("analyzes every ride with load and purpose", () => {
    expect(analysis.activities.length).toBeGreaterThan(60);
    for (const ride of analysis.activities) {
      expect(ride.tss).toBeGreaterThan(0);
      expect(ride.purpose).not.toBe("unknown");
    }
  });

  it("builds a plausible CTL for an 8h/week rider", () => {
    const last = analysis.load[analysis.load.length - 1];
    expect(last.ctl).toBeGreaterThan(20);
    expect(last.ctl).toBeLessThan(120);
  });

  it("scores all eight systems in range", () => {
    expect(analysis.profile.systems).toHaveLength(8);
    for (const system of analysis.profile.systems) {
      expect(system.score).toBeGreaterThanOrEqual(0);
      expect(system.score).toBeLessThanOrEqual(100);
      expect(system.note.length).toBeGreaterThan(10);
    }
  });

  it("catches the demo rider's grey-zone creep in the discipline score", () => {
    const discipline = analysis.profile.systems.find(
      (s) => s.key === "easy-discipline"
    )!;
    expect(discipline.score).toBeLessThan(75);
  });

  it("finds a best block that beats the current block on volume", () => {
    expect(analysis.recipe.best).not.toBeNull();
    expect(analysis.recipe.current).not.toBeNull();
    expect(analysis.recipe.best!.weeklyHours).toBeGreaterThan(
      analysis.recipe.current!.weeklyHours
    );
    expect(analysis.recipe.best!.avgLongRideHours).toBeGreaterThan(3);
  });

  it("names at least one major gap between best and current block", () => {
    const major = analysis.recipe.gaps.filter((g) => g.severity === "major");
    expect(major.length).toBeGreaterThan(0);
    expect(analysis.recipe.headline).toContain("missing");
  });

  it("generates a week plan that fits the rider's hours", () => {
    expect(analysis.plan.sessions.length).toBeGreaterThanOrEqual(3);
    expect(analysis.plan.totalHours).toBeLessThanOrEqual(SETTINGS.weeklyHours * 1.15);
    for (const session of analysis.plan.sessions) {
      expect(session.targets.length).toBeGreaterThan(0);
      expect(session.preRideAdvice.length).toBeGreaterThan(10);
    }
  });

  it("prescribes watt targets scaled to the rider's FTP", () => {
    const z2 = analysis.plan.sessions.find((s) => s.purpose === "endurance");
    if (z2) {
      const powerTarget = z2.targets.find((t) => t.kind === "power")!;
      expect(powerTarget.text).toContain(`${Math.round(0.56 * SETTINGS.ftp)}`);
    }
  });
});

describe("buildAnalysis edge cases", () => {
  it("copes with an empty history", () => {
    const empty = buildAnalysis([], SETTINGS, AS_OF);
    expect(empty.activities).toHaveLength(0);
    expect(empty.load).toHaveLength(0);
    expect(empty.recipe.best).toBeNull();
    expect(empty.plan.sessions.length).toBeGreaterThan(0);
  });

  it("asks for more data instead of diagnosing from a handful of rides", () => {
    const few = generateDemoHistory(AS_OF).slice(-4);
    const result = buildAnalysis(few, SETTINGS, AS_OF);
    expect(result.profile.focus.headline).toContain("MORE DATA");
  });
});
