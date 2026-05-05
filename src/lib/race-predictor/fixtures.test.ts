import { describe, expect, it } from "vitest";
import { RACES } from "@/data/races";
import { getFixtureCourseBySlug } from "./fixtures";

describe("race predictor fixtures", () => {
  it("has fallback course data for every SEO race predictor slug", () => {
    const predictorSlugs = RACES.flatMap((race) => (race.predictor_slug ? [race.predictor_slug] : []));

    expect(predictorSlugs.length).toBeGreaterThan(0);
    for (const slug of predictorSlugs) {
      expect(getFixtureCourseBySlug(slug), slug).not.toBeNull();
    }
  });

  it("keeps priority event fixtures in a plausible range", () => {
    const expectations = [
      { slug: "maratona-dles-dolomites", minKm: 130, maxKm: 145, minGain: 3800, minClimbs: 5 },
      { slug: "fred-whitton-challenge", minKm: 165, maxKm: 180, minGain: 3800, minClimbs: 4 },
      { slug: "gran-fondo-new-york", minKm: 160, maxKm: 185, minGain: 1800, minClimbs: 1 },
    ];

    for (const event of expectations) {
      const course = getFixtureCourseBySlug(event.slug);
      expect(course).not.toBeNull();
      expect(course!.distanceM / 1000).toBeGreaterThanOrEqual(event.minKm);
      expect(course!.distanceM / 1000).toBeLessThanOrEqual(event.maxKm);
      expect(course!.elevationGainM).toBeGreaterThanOrEqual(event.minGain);
      expect(course!.courseData.climbs.length).toBeGreaterThanOrEqual(event.minClimbs);
    }
  });
});
