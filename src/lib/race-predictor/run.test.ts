import { describe, it, expect } from "vitest";
import { runPrediction, buildRiderProfile, buildEnvironment } from "./run";
import { buildCourse } from "./gpx";
import type { TrackPoint } from "./types";

function flatCourse(km: number) {
  const lat = 51.5;
  const metresPerDegLon = 111_320 * Math.cos((lat * Math.PI) / 180);
  const points: TrackPoint[] = [];
  const stepM = 100;
  let lon = 0;
  const elevation = 100;
  points.push({ lat, lon, elevation });
  const segs = Math.ceil((km * 1000) / stepM);
  for (let i = 0; i < segs; i++) {
    lon += stepM / metresPerDegLon;
    points.push({ lat, lon, elevation });
  }
  return buildCourse(points);
}

describe("runPrediction", () => {
  it("plan_my_race produces a usable result on a 50km flat course", () => {
    const course = flatCourse(50);
    const result = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        powerProfile: { ftp: 260 },
      },
      mode: "plan_my_race",
    });
    expect(result.result.totalTime).toBeGreaterThan(60 * 60); // > 1 h
    expect(result.result.totalTime).toBeLessThan(2.5 * 3600); // < 2.5 h
    expect(result.pacing.length).toBe(course.segments.length);
    expect(result.confidence.low).toBeLessThan(result.confidence.high);
    expect(result.insight.headline.length).toBeGreaterThan(10);
  });

  it("can_i_make_it produces a slower, conservative prediction", () => {
    const course = flatCourse(40);
    const planned = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        powerProfile: { ftp: 260 },
      },
      mode: "plan_my_race",
    });
    const honest = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        powerProfile: { ftp: 260 },
      },
      mode: "can_i_make_it",
    });
    // can_i_make_it caps at 0.80 IF; plan_my_race targets 0.85 IF.
    // Honest mode should be at least a bit slower.
    expect(honest.result.totalTime).toBeGreaterThan(planned.result.totalTime);
  });

  it("buildRiderProfile fills CdA from position when not specified", () => {
    const profile = buildRiderProfile({
      bodyMass: 75,
      bikeMass: 8,
      position: "aero_hoods",
    });
    expect(profile.cda).toBeCloseTo(0.31, 2);
    expect(profile.crr).toBeGreaterThan(0);
    expect(profile.powerProfile.p60min).toBeGreaterThan(100);
  });

  it("buildEnvironment fills sane defaults", () => {
    const env = buildEnvironment();
    expect(env.airTemperature).toBe(15);
    expect(env.airPressure).toBe(101325);
    expect(env.windSpeed).toBe(0);
  });
});
