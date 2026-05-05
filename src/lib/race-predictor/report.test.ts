import { describe, expect, it } from "vitest";
import { getFixtureCourseBySlug } from "./fixtures";
import { renderRaceReportHtml } from "./report";
import type { Environment, RiderProfile } from "./types";

const rider: RiderProfile = {
  bodyMass: 75,
  bikeMass: 8,
  position: "aero_hoods",
  cda: 0.31,
  crr: 0.004,
  drivetrainEfficiency: 0.97,
  powerProfile: {
    p5s: 900,
    p1min: 480,
    p5min: 310,
    p20min: 285,
    p60min: 260,
    durabilityFactor: 0.05,
  },
};

const environment: Environment = {
  airTemperature: 15,
  relativeHumidity: 0.6,
  airPressure: 101325,
  windSpeed: 3,
  windDirection: 0,
};

describe("renderRaceReportHtml", () => {
  it("includes premium tyre pressure and gearing guidance", () => {
    const fixture = getFixtureCourseBySlug("fred-whitton-challenge");
    expect(fixture).not.toBeNull();

    const html = renderRaceReportHtml({
      id: 1,
      slug: "fred-report",
      riderProfileId: null,
      courseId: fixture!.id,
      rider,
      environment,
      predictedTimeS: 8 * 3600,
      confidenceLowS: 7.5 * 3600,
      confidenceHighS: 8.5 * 3600,
      averagePower: 205,
      normalizedPower: 235,
      variabilityIndex: 1.14,
      pacingPlan: fixture!.courseData.segments.map(() => 205),
      resultSummary: {
        assumptions: {
          eventType: "sportive",
          drafting: "small_group",
          surface: "tarmac_rough",
          heightCm: 178,
          drivetrainEfficiency: 0.97,
          cdaSource: "preset",
          crrSource: "surface",
        },
      },
      course: fixture!.courseData,
    });

    expect(html).toContain("<h3>Tyre pressure</h3>");
    expect(html).toContain("<h3>Gearing</h3>");
    expect(html).toContain("bailout gearing");
    expect(html).toContain("83 kg rider+bike system");
    expect(html).toContain("<h2>Model assumptions</h2>");
    expect(html).toContain("small group");
    expect(html).toContain("178 cm");
  });
});
