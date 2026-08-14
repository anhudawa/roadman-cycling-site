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
    // can_i_make_it uses a lower finish-focused IF than plan_my_race.
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

  it("height nudges preset CdA but explicit CdA wins", () => {
    const shorter = buildRiderProfile({
      bodyMass: 65,
      heightCm: 160,
      bikeMass: 8,
      position: "aero_hoods",
    });
    const taller = buildRiderProfile({
      bodyMass: 85,
      heightCm: 195,
      bikeMass: 8,
      position: "aero_hoods",
    });
    const explicit = buildRiderProfile({
      bodyMass: 85,
      heightCm: 195,
      bikeMass: 8,
      position: "aero_hoods",
      cda: 0.3,
    });
    expect(shorter.cda).toBeLessThan(taller.cda);
    expect(explicit.cda).toBeCloseTo(0.3, 4);
  });

  it("drafting assumptions reduce effective CdA but widen confidence", () => {
    const course = flatCourse(50);
    const soloProfile = buildRiderProfile({
      bodyMass: 75,
      bikeMass: 8,
      position: "aero_hoods",
      drafting: "solo",
    });
    const groupProfile = buildRiderProfile({
      bodyMass: 75,
      bikeMass: 8,
      position: "aero_hoods",
      drafting: "large_group",
    });
    expect(groupProfile.cda).toBeLessThan(soloProfile.cda);

    const solo = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        cda: 0.31,
        crr: 0.0034,
        powerProfile: { p20min: 285, p60min: 260 },
        drafting: "solo",
      },
      mode: "plan_my_race",
    });
    const bunch = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        cda: 0.31,
        crr: 0.0034,
        powerProfile: { p20min: 285, p60min: 260 },
        drafting: "large_group",
      },
      mode: "plan_my_race",
    });
    expect(bunch.result.totalTime).toBeLessThan(solo.result.totalTime);
    expect(bunch.confidence.high - bunch.confidence.low).toBeGreaterThan(
      solo.confidence.high - solo.confidence.low,
    );
  });

  it("surface assumptions change rolling resistance and predicted time", () => {
    const course = flatCourse(50);
    const roadProfile = buildRiderProfile({
      bodyMass: 75,
      bikeMass: 8,
      position: "aero_hoods",
      surface: "tarmac_smooth",
      powerProfile: { ftp: 260 },
    });
    const gravelProfile = buildRiderProfile({
      bodyMass: 75,
      bikeMass: 8,
      position: "aero_hoods",
      surface: "gravel_rough",
      powerProfile: { ftp: 260 },
    });
    expect(gravelProfile.crr).toBeGreaterThan(roadProfile.crr);

    const road = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        surface: "tarmac_smooth",
        powerProfile: { ftp: 260 },
      },
      mode: "plan_my_race",
    });
    const gravel = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        surface: "gravel_rough",
        powerProfile: { ftp: 260 },
      },
      mode: "plan_my_race",
    });
    expect(gravel.result.totalTime).toBeGreaterThan(road.result.totalTime);
  });

  it("drivetrain efficiency affects predicted time", () => {
    const course = flatCourse(50);
    const clean = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        drivetrainEfficiency: 0.98,
        powerProfile: { ftp: 260 },
      },
      mode: "plan_my_race",
    });
    const dirty = runPrediction({
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods",
        drivetrainEfficiency: 0.94,
        powerProfile: { ftp: 260 },
      },
      mode: "plan_my_race",
    });
    expect(dirty.rider.drivetrainEfficiency).toBeLessThan(clean.rider.drivetrainEfficiency);
    expect(dirty.result.totalTime).toBeGreaterThan(clean.result.totalTime);
  });

  it("event type changes pacing assumptions conservatively", () => {
    const course = flatCourse(40);
    const common = {
      bodyMass: 75,
      bikeMass: 8,
      position: "aero_hoods" as const,
      surface: "tarmac_smooth" as const,
      powerProfile: { ftp: 260 },
    };
    const timeTrial = runPrediction({
      course,
      rider: { ...common, eventType: "time_trial" },
      mode: "plan_my_race",
    });
    const triathlon = runPrediction({
      course,
      rider: { ...common, eventType: "triathlon" },
      mode: "plan_my_race",
    });
    expect(triathlon.result.averagePower).toBeLessThan(timeTrial.result.averagePower);
    expect(triathlon.result.totalTime).toBeGreaterThan(timeTrial.result.totalTime);
  });

  it("chaotic event types widen the confidence band", () => {
    const course = flatCourse(40);
    const common = {
      bodyMass: 75,
      bikeMass: 8,
      position: "aero_hoods" as const,
      cda: 0.31,
      crr: 0.0032,
      powerProfile: { p20min: 285, p60min: 260 },
    };
    const timeTrial = runPrediction({
      course,
      rider: { ...common, eventType: "time_trial" },
      mode: "plan_my_race",
    });
    const roadRace = runPrediction({
      course,
      rider: { ...common, eventType: "road_race" },
      mode: "plan_my_race",
    });
    expect(roadRace.confidence.high - roadRace.confidence.low).toBeGreaterThan(
      timeTrial.confidence.high - timeTrial.confidence.low,
    );
  });

  it("widens confidence for an event-profile route", () => {
    const course = flatCourse(40);
    const common = {
      course,
      rider: {
        bodyMass: 75,
        bikeMass: 8,
        position: "aero_hoods" as const,
        cda: 0.31,
        crr: 0.0032,
        powerProfile: { p20min: 285, p60min: 260 },
      },
      mode: "plan_my_race" as const,
    };
    const verified = runPrediction({ ...common, routeQuality: "verified_gpx" });
    const profile = runPrediction({ ...common, routeQuality: "event_profile" });

    expect(profile.confidence.high - profile.confidence.low).toBeGreaterThan(
      verified.confidence.high - verified.confidence.low,
    );
  });

  it("buildEnvironment fills sane defaults", () => {
    const env = buildEnvironment();
    expect(env.airTemperature).toBe(15);
    expect(env.airPressure).toBe(101325);
    expect(env.windSpeed).toBe(0);
  });
});
