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
    // Elevation bands are tight (±~8%) around each event's real published
    // climbing figure. The synthetic fixtures were previously calibrated far
    // too low (Mallorca 312 ~3,470 m vs real ~5,000 m, Tour of Flanders
    // ~950 m vs ~2,200 m, etc.), making the predictor far too fast. minGain
    // and maxGain bracket the corrected, source-backed figures. See the
    // per-spec provenance comments in fixtures.ts for the cited sources.
    const expectations = [
      // slug, distance band (km), elevation band (m), min detected climbs
      { slug: "mallorca-312", minKm: 305, maxKm: 320, minGain: 4750, maxGain: 5350, minClimbs: 4 },
      { slug: "marmotte-granfondo-alpes", minKm: 175, maxKm: 188, minGain: 4750, maxGain: 5300, minClimbs: 4 },
      { slug: "maratona-dles-dolomites", minKm: 132, maxKm: 145, minGain: 4000, maxGain: 4500, minClimbs: 5 },
      { slug: "tour-of-flanders-sportive", minKm: 122, maxKm: 138, minGain: 2050, maxGain: 2400, minClimbs: 10 },
      { slug: "wicklow-200", minKm: 195, maxKm: 208, minGain: 3200, maxGain: 3650, minClimbs: 5 },
      { slug: "fred-whitton-challenge", minKm: 165, maxKm: 180, minGain: 3750, maxGain: 4250, minClimbs: 4 },
      { slug: "gran-fondo-new-york", minKm: 160, maxKm: 185, minGain: 2350, maxGain: 2750, minClimbs: 1 },
      { slug: "dragon-ride-gran-fondo", minKm: 145, maxKm: 162, minGain: 2600, maxGain: 3000, minClimbs: 3 },
      { slug: "strade-bianche-gran-fondo", minKm: 130, maxKm: 145, minGain: 2750, maxGain: 3200, minClimbs: 3 },
      { slug: "paris-roubaix-challenge", minKm: 160, maxKm: 180, minGain: 250, maxGain: 500, minClimbs: 0 },
      { slug: "belgian-waffle-ride-california", minKm: 200, maxKm: 220, minGain: 3200, maxGain: 3700, minClimbs: 3 },
      { slug: "unbound-gravel-200", minKm: 315, maxKm: 335, minGain: 2600, maxGain: 3000, minClimbs: 1 },
      { slug: "leadville-trail-100-mtb", minKm: 155, maxKm: 175, minGain: 3550, maxGain: 4000, minClimbs: 4 },
    ];

    for (const event of expectations) {
      const course = getFixtureCourseBySlug(event.slug);
      expect(course, event.slug).not.toBeNull();
      expect(course!.distanceM / 1000, event.slug).toBeGreaterThanOrEqual(event.minKm);
      expect(course!.distanceM / 1000, event.slug).toBeLessThanOrEqual(event.maxKm);
      expect(course!.elevationGainM, event.slug).toBeGreaterThanOrEqual(event.minGain);
      expect(course!.elevationGainM, event.slug).toBeLessThanOrEqual(event.maxGain);
      expect(course!.courseData.climbs.length, event.slug).toBeGreaterThanOrEqual(event.minClimbs);
    }
  });

  it("varies heading along each synthetic course so wind modelling is non-degenerate", () => {
    // The old synthetic fixtures laid every course on a single constant
    // latitude heading due east, so a given wind hit the whole route
    // identically. Each course now gently curves: latitude must vary and the
    // segment headings must span a meaningful arc (> ~30°).
    const slugs = [
      "mallorca-312",
      "marmotte-granfondo-alpes",
      "tour-of-flanders-sportive",
      "wicklow-200",
    ];
    for (const slug of slugs) {
      const course = getFixtureCourseBySlug(slug);
      expect(course, slug).not.toBeNull();
      const lats = course!.gpxData.map((p) => p.lat);
      const latSpan = Math.max(...lats) - Math.min(...lats);
      expect(latSpan, slug).toBeGreaterThan(0.05); // > ~5 km of N-S spread

      // Heading spread, computed on the unit circle to ignore the 0/360 wrap.
      const headings = course!.courseData.segments.map((s) => s.heading);
      const meanX = headings.reduce((a, h) => a + Math.cos(h), 0) / headings.length;
      const meanY = headings.reduce((a, h) => a + Math.sin(h), 0) / headings.length;
      const resultantLength = Math.hypot(meanX, meanY); // 1 = all identical
      expect(resultantLength, slug).toBeLessThan(0.97); // headings genuinely spread
    }
  });
});
