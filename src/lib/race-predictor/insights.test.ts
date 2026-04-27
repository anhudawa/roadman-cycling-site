import { describe, expect, it } from "vitest";
import { pickKeyInsight } from "./insights";
import type { Course, CourseResult, RiderProfile, Segment } from "./types";

function makeCourse(): Course {
  const segments: Segment[] = Array.from({ length: 10 }, (_, i) => ({
    index: i,
    startLat: 0,
    startLon: i * 0.001,
    endLat: 0,
    endLon: (i + 1) * 0.001,
    startElevation: i * 70,
    endElevation: (i + 1) * 70,
    distance: 1000,
    gradient: Math.atan(0.07),
    heading: 0,
  }));

  return {
    name: "Editorial test course",
    segments,
    totalDistance: 10000,
    totalElevationGain: 700,
    totalElevationLoss: 0,
    climbs: [
      {
        startSegmentIndex: 0,
        endSegmentIndex: 9,
        startDistance: 0,
        endDistance: 10000,
        length: 10000,
        averageGradient: Math.atan(0.07),
        elevationGain: 700,
        category: "cat1",
      },
    ],
  };
}

function makeResult(): CourseResult {
  const segmentResults = Array.from({ length: 10 }, (_, i) => ({
    segmentIndex: i,
    startSpeed: 3.2,
    endSpeed: 3.2,
    averageSpeed: 3.2,
    duration: 312.5,
    riderPower: 245,
    airDensity: 1.2,
    headwind: 0,
    yawAngle: 0,
  }));

  return {
    segmentResults,
    totalTime: 3125,
    totalDistance: 10000,
    averageSpeed: 3.2,
    averagePower: 245,
    normalizedPower: 245,
    variabilityIndex: 1,
  };
}

function makeRider(): RiderProfile {
  return {
    bodyMass: 75,
    bikeMass: 8,
    position: "endurance_hoods",
    cda: 0.32,
    crr: 0.0034,
    drivetrainEfficiency: 0.97,
    powerProfile: {
      p5s: 1000,
      p1min: 500,
      p5min: 330,
      p20min: 275,
      p60min: 245,
      durabilityFactor: 0.05,
    },
  };
}

describe("pickKeyInsight editorial copy", () => {
  it("uses correct cycling terms for climb insights", () => {
    const insight = pickKeyInsight({
      course: makeCourse(),
      result: makeResult(),
      rider: makeRider(),
    });

    expect(insight.headline).toContain("long Cat 1 climb");
    expect(insight.headline).toContain("10.0 km at 7.0%");
    expect(insight.body).toContain("km/h");
    expect(`${insight.headline} ${insight.body}`).not.toMatch(
      /climb pace|ramps|category-1|bad fuelling|spikier|50\/50/i,
    );
  });
});
