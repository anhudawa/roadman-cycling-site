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
import type { TrackPoint } from "../src/lib/race-predictor/types";
import { upsertCourseBySlug } from "../src/lib/race-predictor/store";

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
      source: spec.source,
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
