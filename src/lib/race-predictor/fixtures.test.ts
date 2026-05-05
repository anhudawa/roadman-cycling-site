import { describe, expect, it } from "vitest";
import { RACES } from "@/data/races";
import { getFixtureCourseBySlug } from "./fixtures";

describe("race predictor fixtures", () => {
  it("covers the brief's priority SEO events with race guides and predictor slugs", () => {
    const priorityRaceSlugs = [
      "mallorca-312",
      "maratona-dles-dolomites",
      "etape-du-tour",
      "la-marmotte",
      "strade-bianche-gran-fondo",
      "gran-fondo-new-york",
      "dragon-ride",
      "fred-whitton",
      "wicklow-200",
      "tour-of-flanders-cyclo",
      "paris-roubaix-challenge",
      "unbound-gravel",
      "leadville-trail-100-mtb",
      "belgian-waffle-ride",
      "haute-route-alps",
    ];

    for (const slug of priorityRaceSlugs) {
      const race = RACES.find((item) => item.slug === slug);
      expect(race, slug).toBeDefined();
      expect(race?.predictor_slug, slug).toBeTruthy();
      expect(getFixtureCourseBySlug(race!.predictor_slug!), race!.predictor_slug).not.toBeNull();
    }
  });

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
      { slug: "strade-bianche-gran-fondo", minKm: 130, maxKm: 145, minGain: 1800, minClimbs: 3 },
      { slug: "paris-roubaix-challenge", minKm: 160, maxKm: 180, minGain: 100, minClimbs: 0 },
      { slug: "belgian-waffle-ride-california", minKm: 200, maxKm: 220, minGain: 2800, minClimbs: 3 },
      { slug: "unbound-gravel-200", minKm: 315, maxKm: 335, minGain: 3000, minClimbs: 1 },
      { slug: "leadville-trail-100-mtb", minKm: 155, maxKm: 175, minGain: 3500, minClimbs: 4 },
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
