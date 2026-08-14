/**
 * Seed the curated race-event catalog.
 *
 * For Phase 3 we use synthetic GPX track points that match each event's
 * published distance + climb structure. They produce realistic predictions
 * without needing the real GPX (which we'll swap in via admin upload as soon
 * as we have permission). The point is that someone who selects "Marmotte"
 * gets a Marmotte-shape course immediately.
 *
 * Run with: `npx tsx scripts/seed-race-events.ts` (or `npm run seed:events`)
 *
 * Idempotent — re-running updates existing rows by slug.
 */

import { buildCourse } from "../src/lib/race-predictor/gpx";
import { decodeRouteProvenance } from "../src/lib/race-predictor/route-provenance";
import type { TrackPoint } from "../src/lib/race-predictor/types";
import {
  getCourseBySlug,
  upsertCourseBySlug,
} from "../src/lib/race-predictor/store";

interface ProfileSegment {
  km: number;
  gradePct: number;
}

interface EventSpec {
  slug: string;
  name: string;
  country: string;
  region?: string;
  startLat: number;
  startLon: number;
  startElevation: number;
  segments: ProfileSegment[];
  surfaceSummary: string;
  source: string;
  eventDates?: string[];
}

const EVENTS: EventSpec[] = [
  {
    slug: "etape-du-tour-2026",
    name: "L'Étape du Tour de France 2026",
    country: "France",
    region: "Alps",
    startLat: 45.07,
    startLon: 5.85,
    startElevation: 800,
    surfaceSummary: "tarmac_smooth",
    source: "etape_du_tour",
    eventDates: ["2026-07-12"],
    segments: [
      { km: 12, gradePct: 0.5 },
      { km: 18, gradePct: 6.0 }, // first cat-1 climb
      { km: 16, gradePct: -5.0 },
      { km: 22, gradePct: 1.5 }, // valley
      { km: 14, gradePct: 5.5 }, // cat-2
      { km: 12, gradePct: -4.0 },
      { km: 18, gradePct: 7.5 }, // HC summit finish
    ],
  },
  {
    slug: "marmotte-granfondo-alpes",
    name: "Marmotte Granfondo Alpes",
    country: "France",
    region: "Alps",
    startLat: 45.06,
    startLon: 6.03,
    startElevation: 720,
    surfaceSummary: "tarmac_smooth",
    source: "marmotte_alpes",
    eventDates: ["2026-07-04"],
    segments: [
      { km: 11, gradePct: 0.5 },
      { km: 21, gradePct: 5.7 }, // Glandon
      { km: 21, gradePct: -5.0 },
      { km: 35, gradePct: 0.0 },
      { km: 12, gradePct: 6.7 }, // Telegraphe
      { km: 5, gradePct: -2.5 },
      { km: 17, gradePct: 6.9 }, // Galibier
      { km: 47, gradePct: -3.5 },
      { km: 13.8, gradePct: 8.1 }, // Alpe d'Huez
    ],
  },
  {
    slug: "maratona-dles-dolomites",
    name: "Maratona dles Dolomites",
    country: "Italy",
    region: "Dolomites",
    startLat: 46.55,
    startLon: 11.87,
    startElevation: 1500,
    surfaceSummary: "tarmac_smooth",
    source: "maratona_dles_dolomites",
    eventDates: ["2026-07-05"],
    segments: [
      { km: 4, gradePct: 2.0 },
      { km: 5.8, gradePct: 7.0 },
      { km: 6, gradePct: -5.2 },
      { km: 9.2, gradePct: 7.5 },
      { km: 8, gradePct: -5.5 },
      { km: 5.5, gradePct: 8.5 },
      { km: 6, gradePct: -6.0 },
      { km: 6, gradePct: 6.5 },
      { km: 20, gradePct: -2.0 },
      { km: 9.8, gradePct: 10.0 },
      { km: 11, gradePct: -6.5 },
      { km: 13.8, gradePct: 6.5 },
      { km: 22.9, gradePct: -1.8 },
      { km: 10, gradePct: 2.0 },
    ],
  },
  {
    slug: "mallorca-312",
    name: "Mallorca 312",
    country: "Spain",
    region: "Balearic Islands",
    startLat: 39.85,
    startLon: 3.12,
    startElevation: 30,
    surfaceSummary: "tarmac_smooth",
    source: "mallorca_312",
    eventDates: ["2026-04-25"],
    segments: [
      { km: 50, gradePct: 0.2 },
      { km: 18, gradePct: 5.5 }, // Coll de Femenia
      { km: 12, gradePct: -4.5 },
      { km: 25, gradePct: 1.0 },
      { km: 14, gradePct: 6.0 }, // Sa Calobra approach climb
      { km: 9.4, gradePct: -7.0 }, // descent into Sa Calobra
      { km: 9.4, gradePct: 7.0 }, // Sa Calobra ascent
      { km: 35, gradePct: -1.5 },
      { km: 30, gradePct: 0.5 },
      { km: 12, gradePct: 4.0 },
      { km: 87, gradePct: -0.3 }, // run-in
    ],
  },
  {
    slug: "ridelondon-classique-100",
    name: "RideLondon-Essex 100",
    country: "United Kingdom",
    region: "Essex",
    startLat: 51.55,
    startLon: 0.0,
    startElevation: 30,
    surfaceSummary: "tarmac_mixed",
    source: "ridelondon",
    eventDates: ["2026-05-31"],
    segments: [
      { km: 30, gradePct: 0.3 },
      { km: 5, gradePct: 2.5 },
      { km: 4, gradePct: -2.0 },
      { km: 25, gradePct: 0.5 },
      { km: 6, gradePct: 3.0 },
      { km: 4, gradePct: -2.0 },
      { km: 30, gradePct: -0.2 },
      { km: 56, gradePct: 0.0 },
    ],
  },
  {
    slug: "gran-fondo-new-york",
    name: "Gran Fondo New York",
    country: "USA",
    region: "New York / New Jersey",
    startLat: 40.86,
    startLon: -73.96,
    startElevation: 20,
    surfaceSummary: "tarmac_mixed",
    source: "gran_fondo_new_york",
    eventDates: ["2026-05-17"],
    segments: [
      { km: 18, gradePct: 0.2 },
      { km: 12, gradePct: 3.0 },
      { km: 8, gradePct: -1.2 },
      { km: 22, gradePct: 1.2 },
      { km: 7.8, gradePct: 7.0 },
      { km: 9, gradePct: -4.5 },
      { km: 20, gradePct: 1.5 },
      { km: 9.1, gradePct: 3.0 },
      { km: 12, gradePct: -2.0 },
      { km: 24, gradePct: 1.2 },
      { km: 33.1, gradePct: 0.2 },
    ],
  },
  {
    slug: "dragon-ride-gran-fondo",
    name: "Dragon Ride Gran Fondo",
    country: "United Kingdom",
    region: "Wales",
    startLat: 51.78,
    startLon: -3.6,
    startElevation: 60,
    surfaceSummary: "tarmac_mixed",
    source: "dragon_ride",
    eventDates: ["2026-06-07"],
    segments: [
      { km: 20, gradePct: 1.0 },
      { km: 8, gradePct: 4.5 }, // Rhigos
      { km: 6, gradePct: -3.0 },
      { km: 18, gradePct: 2.0 },
      { km: 7, gradePct: 5.5 }, // Bwlch
      { km: 9, gradePct: -4.0 },
      { km: 25, gradePct: 0.5 },
      { km: 6, gradePct: 6.0 }, // Devil's Elbow
      { km: 5, gradePct: -3.5 },
      { km: 35, gradePct: -0.5 },
      { km: 15, gradePct: 0.0 },
    ],
  },
  {
    slug: "fred-whitton-challenge",
    name: "Fred Whitton Challenge",
    country: "England",
    region: "Lake District",
    startLat: 54.43,
    startLon: -3.03,
    startElevation: 80,
    surfaceSummary: "tarmac_rough",
    source: "fred_whitton",
    eventDates: ["2026-05-10"],
    segments: [
      { km: 18, gradePct: 0.8 },
      { km: 4.1, gradePct: 11.0 },
      { km: 8, gradePct: -5.0 },
      { km: 20, gradePct: 2.2 },
      { km: 3.2, gradePct: 13.0 },
      { km: 7, gradePct: -6.0 },
      { km: 16, gradePct: 3.0 },
      { km: 3, gradePct: 11.0 },
      { km: 12, gradePct: -3.5 },
      { km: 24, gradePct: 2.0 },
      { km: 2.4, gradePct: 20.0 },
      { km: 3, gradePct: -14.0 },
      { km: 4, gradePct: 12.0 },
      { km: 8, gradePct: -7.0 },
      { km: 28, gradePct: 2.0 },
      { km: 12.3, gradePct: -0.5 },
    ],
  },
  {
    slug: "tour-of-flanders-sportive",
    name: "Tour of Flanders Sportive (We Ride Flanders)",
    country: "Belgium",
    region: "East Flanders",
    startLat: 50.92,
    startLon: 3.85,
    startElevation: 30,
    surfaceSummary: "tarmac_rough",
    source: "ronde_van_vlaanderen",
    eventDates: ["2026-04-04"],
    segments: [
      { km: 35, gradePct: 0.3 },
      { km: 0.6, gradePct: 9.5 }, // Oude Kwaremont (cobbled)
      { km: 1.5, gradePct: -3.0 },
      { km: 0.5, gradePct: 11.0 }, // Paterberg
      { km: 8, gradePct: -1.5 },
      { km: 1.0, gradePct: 8.0 }, // Koppenberg
      { km: 25, gradePct: 0.2 },
      { km: 1.0, gradePct: 7.0 }, // Taaienberg
      { km: 18, gradePct: 0.5 },
      { km: 0.7, gradePct: 9.0 }, // Kruisberg
      { km: 5, gradePct: -1.0 },
      { km: 32, gradePct: 0.0 },
    ],
  },
  {
    slug: "amstel-gold-toerversie",
    name: "Amstel Gold Toerversie",
    country: "Netherlands",
    region: "Limburg",
    startLat: 50.85,
    startLon: 5.85,
    startElevation: 75,
    surfaceSummary: "tarmac_smooth",
    source: "amstel_gold",
    eventDates: ["2026-04-19"],
    segments: [
      { km: 25, gradePct: 0.5 },
      { km: 1.5, gradePct: 5.0 },
      { km: 1.5, gradePct: -3.5 },
      { km: 12, gradePct: 0.5 },
      { km: 1.0, gradePct: 7.0 },
      { km: 2.0, gradePct: -3.0 },
      { km: 18, gradePct: 1.0 },
      { km: 0.8, gradePct: 9.0 }, // Cauberg
      { km: 25, gradePct: -0.5 },
      { km: 13, gradePct: 0.0 },
    ],
  },
  {
    slug: "strade-bianche-gran-fondo",
    name: "Strade Bianche Gran Fondo",
    country: "Italy",
    region: "Tuscany",
    startLat: 43.32,
    startLon: 11.33,
    startElevation: 320,
    surfaceSummary: "gravel_mixed",
    source: "strade_bianche_gran_fondo",
    eventDates: ["2026-03-08"],
    segments: [
      { km: 18, gradePct: 1.5 },
      { km: 9, gradePct: 3.5 },
      { km: 8, gradePct: -1.8 },
      { km: 12, gradePct: 4.0 },
      { km: 10, gradePct: -2.0 },
      { km: 16, gradePct: 2.5 },
      { km: 2.4, gradePct: 6.8 },
      { km: 6, gradePct: -3.0 },
      { km: 1.1, gradePct: 10.0 },
      { km: 14, gradePct: 2.0 },
      { km: 0.5, gradePct: 12.0 },
      { km: 41, gradePct: -0.2 },
    ],
  },
  {
    slug: "paris-roubaix-challenge",
    name: "Paris-Roubaix Challenge",
    country: "France",
    region: "Hauts-de-France",
    startLat: 50.69,
    startLon: 3.17,
    startElevation: 35,
    surfaceSummary: "cobbles",
    source: "paris_roubaix_challenge",
    eventDates: ["2026-04-11"],
    segments: [
      { km: 25, gradePct: 0.1 },
      { km: 2.3, gradePct: 0.4 },
      { km: 18, gradePct: 0.2 },
      { km: 3.0, gradePct: 0.5 },
      { km: 22, gradePct: -0.1 },
      { km: 2.1, gradePct: 0.3 },
      { km: 28, gradePct: 0.0 },
      { km: 1.8, gradePct: 0.5 },
      { km: 34, gradePct: -0.1 },
      { km: 33.8, gradePct: 0.0 },
    ],
  },
  {
    slug: "belgian-waffle-ride-california",
    name: "Belgian Waffle Ride California",
    country: "USA",
    region: "California",
    startLat: 33.14,
    startLon: -117.16,
    startElevation: 180,
    surfaceSummary: "mixed_surface",
    source: "belgian_waffle_ride",
    eventDates: ["2026-04-26"],
    segments: [
      { km: 22, gradePct: 1.0 },
      { km: 5, gradePct: 7.0 },
      { km: 8, gradePct: -4.0 },
      { km: 18, gradePct: 2.5 },
      { km: 8, gradePct: 5.6 },
      { km: 12, gradePct: -3.0 },
      { km: 28, gradePct: 1.5 },
      { km: 16, gradePct: 3.5 },
      { km: 18, gradePct: -1.5 },
      { km: 20, gradePct: 2.8 },
      { km: 55, gradePct: -0.5 },
    ],
  },
  {
    slug: "unbound-gravel-200",
    name: "Unbound Gravel 200",
    country: "USA",
    region: "Kansas",
    startLat: 38.4,
    startLon: -96.18,
    startElevation: 350,
    surfaceSummary: "gravel_rough",
    source: "unbound_gravel",
    eventDates: ["2026-05-30"],
    segments: [
      { km: 35, gradePct: 0.8 },
      { km: 3, gradePct: 5.5 },
      { km: 22, gradePct: -0.8 },
      { km: 20, gradePct: 2.5 },
      { km: 30, gradePct: -1.0 },
      { km: 35, gradePct: 2.2 },
      { km: 40, gradePct: -0.4 },
      { km: 30, gradePct: 2.5 },
      { km: 52, gradePct: 0.5 },
      { km: 60, gradePct: 0.8 },
    ],
  },
  {
    slug: "leadville-trail-100-mtb",
    name: "Leadville Trail 100 MTB",
    country: "USA",
    region: "Colorado",
    startLat: 39.25,
    startLon: -106.29,
    startElevation: 3090,
    surfaceSummary: "mtb_gravel",
    source: "leadville_trail_100_mtb",
    eventDates: ["2026-08-08"],
    segments: [
      { km: 6, gradePct: 2.0 },
      { km: 4.5, gradePct: 7.5 },
      { km: 7, gradePct: -4.0 },
      { km: 18, gradePct: 2.5 },
      { km: 5.5, gradePct: 8.0 },
      { km: 10, gradePct: -5.0 },
      { km: 20, gradePct: 2.0 },
      { km: 15, gradePct: 6.0 },
      { km: 15, gradePct: -6.0 },
      { km: 23, gradePct: 2.0 },
      { km: 5.5, gradePct: 8.0 },
      { km: 37.5, gradePct: -0.5 },
    ],
  },
  {
    slug: "wicklow-200",
    name: "Wicklow 200",
    country: "Ireland",
    region: "Wicklow",
    startLat: 53.14,
    startLon: -6.06,
    startElevation: 50,
    surfaceSummary: "tarmac_mixed",
    source: "wicklow_200",
    eventDates: ["2026-06-21"],
    segments: [
      { km: 6, gradePct: 0.5 },     // Greystones flat run-out
      { km: 5, gradePct: 5.5 },     // Calary climb (cat-3)
      { km: 5, gradePct: -2.5 },
      { km: 8, gradePct: 1.5 },
      { km: 12, gradePct: 5.5 },    // Sally Gap (cat-2, ~500m)
      { km: 12, gradePct: -4.5 },
      { km: 10, gradePct: 1.0 },
      { km: 8, gradePct: 6.0 },     // Wicklow Gap (cat-2)
      { km: 9, gradePct: -4.5 },
      { km: 12, gradePct: 1.5 },
      { km: 6, gradePct: 6.5 },     // Slieve Maan (short cat-3)
      { km: 6, gradePct: -3.5 },
      { km: 15, gradePct: 1.0 },
      { km: 5, gradePct: 6.0 },     // Drumgoff
      { km: 5, gradePct: -3.5 },
      { km: 10, gradePct: 1.5 },
      { km: 6, gradePct: 5.5 },     // Glenmalure
      { km: 7, gradePct: -3.0 },
      { km: 18, gradePct: 0.5 },
      { km: 5, gradePct: 4.0 },     // Roundwood lump
      { km: 7, gradePct: -2.5 },
      { km: 23, gradePct: -0.5 },   // run-in to Greystones
    ],
  },
  {
    slug: "ring-of-beara",
    name: "Ring of Beara Cycle Kenmare",
    country: "Ireland",
    region: "County Kerry / Cork",
    startLat: 51.88,
    startLon: -9.58,
    startElevation: 10,
    surfaceSummary: "tarmac_mixed",
    source: "ring_of_beara",
    eventDates: ["2026-05-30"],
    segments: [
      // Section 1: Kenmare → Glengarriff via Caha Pass (~30 km)
      { km: 3, gradePct: 0.3 },     // Kenmare departure flat
      { km: 8, gradePct: 1.5 },     // Bonane Valley gentle rise on N71
      { km: 4, gradePct: 3.0 },     // Approach to Caha Pass
      { km: 7, gradePct: 4.7 },     // Caha Pass main climb (cat-3, ~330m)
      { km: 8, gradePct: -5.0 },    // Caha descent through tunnels to Glengarriff
      // Section 2: Glengarriff → Adrigole along Bantry Bay (~26 km)
      { km: 3, gradePct: 0.3 },     // Glengarriff coast flat
      { km: 3, gradePct: 3.5 },     // Coastal climb
      { km: 2, gradePct: -3.0 },
      { km: 4, gradePct: 2.5 },     // Coastal rolling up
      { km: 2, gradePct: -2.5 },
      { km: 3, gradePct: 4.0 },     // Atlantic coast climb
      { km: 3, gradePct: -3.5 },
      { km: 4, gradePct: 2.0 },     // Approach Adrigole
      { km: 2, gradePct: 0.5 },     // Adrigole flat
      // Section 3: Healy Pass crossing (~15 km)
      { km: 1, gradePct: 0.5 },     // Healy Pass base (Adrigole)
      { km: 9, gradePct: 3.6 },     // Healy Pass climb (cat-3, ~325m)
      { km: 5, gradePct: -5.0 },    // Healy descent to Lauragh
      // Section 4: Lauragh → Kenmare along the north coast (~66 km)
      { km: 3, gradePct: 0.5 },     // Lauragh flat
      { km: 4, gradePct: 5.0 },     // First north-coast climb
      { km: 3, gradePct: -3.0 },
      { km: 4, gradePct: 3.0 },     // Coastal roller up
      { km: 2, gradePct: -3.0 },
      { km: 3, gradePct: 3.5 },
      { km: 2, gradePct: -2.5 },
      { km: 4, gradePct: 3.0 },     // Ardgroom rollers
      { km: 3, gradePct: -2.5 },
      { km: 6, gradePct: 4.5 },     // Coastal pass (Ballaghbeama-style, ~270m)
      { km: 4, gradePct: -3.5 },
      { km: 4, gradePct: 1.5 },     // Coast roll
      { km: 3, gradePct: 3.0 },     // Tuosist roller
      { km: 3, gradePct: -3.0 },
      { km: 5, gradePct: 1.0 },
      { km: 3, gradePct: 2.5 },     // Final climb
      { km: 10, gradePct: -1.0 },   // Long descent into Kenmare
    ],
  },
  {
    slug: "haute-route-pyrenees-stage-1",
    name: "Haute Route Pyrenees · Stage 1",
    country: "France",
    region: "Pyrenees",
    startLat: 43.05,
    startLon: 0.5,
    startElevation: 600,
    surfaceSummary: "tarmac_smooth",
    source: "haute_route",
    eventDates: ["2026-08-23"],
    segments: [
      { km: 8, gradePct: 1.0 },
      { km: 17, gradePct: 7.4 }, // Tourmalet east
      { km: 19, gradePct: -7.0 },
      { km: 14, gradePct: 2.0 },
      { km: 12, gradePct: 7.6 }, // Hautacam summit finish
    ],
  },
];

const STEP_M = 50;

function generateGpxPoints(spec: EventSpec): TrackPoint[] {
  const lat = spec.startLat;
  const metresPerDegLon = 111_320 * Math.cos((lat * Math.PI) / 180);
  const points: TrackPoint[] = [];
  let lon = spec.startLon;
  let elevation = spec.startElevation;
  points.push({ lat, lon, elevation });
  for (const seg of spec.segments) {
    const metres = seg.km * 1000;
    const segs = Math.max(1, Math.ceil(metres / STEP_M));
    const dxPerStep = STEP_M / metresPerDegLon;
    const dzPerStep = STEP_M * (seg.gradePct / 100);
    for (let i = 0; i < segs; i++) {
      lon += dxPerStep;
      elevation += dzPerStep;
      points.push({ lat, lon, elevation });
    }
  }
  return points;
}

async function main() {
  for (const spec of EVENTS) {
    const existing = await getCourseBySlug(spec.slug);
    if (decodeRouteProvenance(existing?.source).quality === "verified_gpx") {
      console.log(`[seed] ${spec.slug.padEnd(36)}  skipped verified GPX`);
      continue;
    }

    const points = generateGpxPoints(spec);
    const course = buildCourse(points, { name: spec.name });
    const inserted = await upsertCourseBySlug(spec.slug, {
      slug: spec.slug,
      name: spec.name,
      country: spec.country,
      region: spec.region ?? null,
      discipline: "road",
      distanceM: Math.round(course.totalDistance),
      elevationGainM: Math.round(course.totalElevationGain),
      elevationLossM: Math.round(course.totalElevationLoss),
      surfaceSummary: spec.surfaceSummary,
      gpxData: points,
      courseData: course,
      eventDates: spec.eventDates ?? [],
      verified: true,
      source: `event_profile:${spec.source}`,
    });
    console.log(
      `[seed] ${spec.slug.padEnd(36)}  ${(inserted.distanceM / 1000).toFixed(1).padStart(6)} km  ${String(inserted.elevationGainM).padStart(5)} m  ${String(course.climbs.length).padStart(2)} climbs`,
    );
  }
  console.log(`\n${EVENTS.length} events seeded.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
