// Dev-only fallback course fixtures.
//
// Used by the store layer when no POSTGRES_URL is configured (typically a
// fresh local dev environment). Lets the preview render real-looking course
// data without requiring a seeded database. In production with a configured
// DB, the store goes straight to Postgres and these fixtures are never read.
//
// ============================================================================
// PROVENANCE — SYNTHETIC APPROXIMATIONS, NOT REAL GPX
// ============================================================================
// Every course built from an `EventSpec` below (ids -1, -2, …) is SYNTHETIC.
// Its elevation profile is hand-authored from a piecewise constant-gradient
// sketch (`segments`), NOT decoded from a recorded GPX track. These are
// deliberate, documented approximations whose job is to make the dev preview
// render a plausible course — they are NOT survey-accurate.
//
// This is fundamentally different from the real-GPX courses imported via
// `TRAKA_2026_ROUTES` (ids -100, -101, …), which come from actual recorded
// route data (see traka-2026.ts / data/traka-2026-routes.json).
//
// Two properties are tuned to be defensible:
//   1. Total elevation gain is calibrated to within ~5% of each event's real
//      published climbing figure (sources cited inline per spec). A senior
//      review previously found these were systematically too low (e.g.
//      Mallorca 312 was ~3,470 m vs the real ~5,000 m), which made the
//      predictor produce comically fast times on the landing-page courses.
//   2. The route gently CURVES (see `headingSweepDeg` / `generatePoints`) so
//      the road heading is not a single constant. The earlier fixtures laid
//      every course on one constant latitude heading due east, which made
//      wind modelling degenerate (a given wind hit the whole course
//      identically). The curve makes heading-dependent aero/wind terms vary
//      along the route. The elevation profile SHAPE is what matters most; the
//      curve is intentionally simple.
// ============================================================================

import { buildCourse } from "./gpx";
import { TRAKA_2026_ROUTES } from "./traka-2026";
import type { TrackPoint, Course, SurfaceType } from "./types";

export interface FixtureCourse {
  id: number;
  slug: string;
  name: string;
  country: string;
  region: string | null;
  discipline: string;
  distanceM: number;
  elevationGainM: number;
  elevationLossM: number;
  surfaceSummary: string | null;
  gpxData: TrackPoint[];
  courseData: Course;
  eventDates: string[];
  verified: true;
  source: string;
  uploaderEmail: null;
}

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
  /**
   * Total heading sweep (degrees) the synthetic route turns through from start
   * to finish. The heading rotates linearly around a 45° (NE) base across the
   * whole course, so the road faces a RANGE of compass directions instead of a
   * single constant easterly. This keeps wind/aero modelling non-degenerate.
   * Per-step distance and the elevation profile are unaffected by the curve.
   * Default 100° if omitted; keep it under ~140° to avoid wrapping past north.
   */
  headingSweepDeg?: number;
}

function buildMixedSurfacePlan(route: { terrain?: { unpavedPct: number } }, points: TrackPoint[]): SurfaceType[] {
  const segments = Math.max(0, points.length - 1);
  const unpavedSegments = Math.round(segments * ((route.terrain?.unpavedPct ?? 0) / 100));
  return Array.from({ length: segments }, (_, index) =>
    index < unpavedSegments ? "gravel_smooth" : "tarmac_mixed",
  );
}

const EVENTS: EventSpec[] = [
  {
    // SYNTHETIC. ~112 km / ~3,550 m climbing — sized to a mid-mountain Étape
    // edition (e.g. 2022 Briançon→Alpe d'Huez was 150 km/4,650 m; recent
    // editions range 3,000–5,000 m). Distance/gain are a defensible
    // representative figure, not a specific 2026 route (unannounced at authoring).
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
    headingSweepDeg: 110,
    segments: [
      { km: 12, gradePct: 0.5 },
      { km: 18, gradePct: 6.0 },
      { km: 16, gradePct: -5.0 },
      { km: 22, gradePct: 1.5 },
      { km: 14, gradePct: 5.5 },
      { km: 12, gradePct: -4.0 },
      { km: 18, gradePct: 7.5 },
    ],
  },
  {
    // SYNTHETIC. ~182 km / ~5,030 m climbing — calibrated to the published
    // Marmotte figure of ~5,000 m (Glandon + Télégraphe + Galibier + Alpe
    // d'Huez). Previous fixture was ~4,300 m (-13%), too fast. Source: ASO /
    // Sportcommunication event guide (~5,000 m d+).
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
    headingSweepDeg: 120,
    segments: [
      { km: 11, gradePct: 0.5 }, // valley run-out
      { km: 22, gradePct: 7.0 }, // Col du Glandon
      { km: 21, gradePct: -5.5 }, // descent to Maurienne valley
      { km: 32, gradePct: 0.3 }, // valley false-flat to St-Michel
      { km: 12, gradePct: 7.5 }, // Col du Télégraphe
      { km: 5, gradePct: -2.0 }, // dip to Valloire
      { km: 18, gradePct: 7.3 }, // Col du Galibier
      { km: 47, gradePct: -3.5 }, // long descent via Lautaret to Bourg
      { km: 13.8, gradePct: 8.5 }, // Alpe d'Huez (21 hairpins)
    ],
  },
  {
    // SYNTHETIC. ~138 km / ~4,250 m climbing — calibrated to the published
    // Maratona route figure of ~4,230 m over the seven Sella-Ronda passes.
    // Previous fixture was ~4,000 m (-5%). Source: Maratona dles Dolomites
    // official route page (138 km, 4,230 m d+).
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
    headingSweepDeg: 130,
    segments: [
      { km: 4, gradePct: 2.5 },
      { km: 5.8, gradePct: 7.5 }, // Passo Campolongo
      { km: 6, gradePct: -5.2 },
      { km: 9.2, gradePct: 7.8 }, // Passo Pordoi
      { km: 8, gradePct: -5.5 },
      { km: 5.5, gradePct: 9.0 }, // Passo Sella
      { km: 6, gradePct: -6.0 },
      { km: 6, gradePct: 7.0 }, // Passo Gardena
      { km: 20, gradePct: -2.0 },
      { km: 9.8, gradePct: 10.0 }, // Passo Giau (the hard one)
      { km: 11, gradePct: -6.5 },
      { km: 13.8, gradePct: 7.0 }, // Passo Falzarego/Valparola
      { km: 22.9, gradePct: -1.8 },
      { km: 10, gradePct: 2.5 }, // final drag to finish
    ],
  },
  {
    // SYNTHETIC. ~312 km / ~5,030 m climbing — calibrated to the published
    // Mallorca 312 figure of ~5,000 m (the Serra de Tramuntana loop: Coll de
    // sa Batalla, Puig Major, Sa Calobra, Coll de Femenia) followed by the long
    // flat eastern/southern plain. Previous fixture was ~3,470 m (-31%), which
    // made the predictor far too fast. Source: Mallorca 312 official route
    // (312 km, ~5,000 m d+).
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
    headingSweepDeg: 130,
    segments: [
      { km: 40, gradePct: 0.3 }, // coast run to the foot of the Tramuntana
      { km: 14, gradePct: 6.0 }, // Coll de sa Batalla
      { km: 8, gradePct: -5.0 },
      { km: 13, gradePct: 6.5 }, // toward Puig Major
      { km: 10, gradePct: -6.0 },
      { km: 9.5, gradePct: 7.0 }, // Sa Calobra return climb
      { km: 9.5, gradePct: -7.0 }, // Sa Calobra descent
      { km: 15, gradePct: 6.0 }, // Coll de Femenia / Puig Major flanks
      { km: 7, gradePct: -6.0 },
      { km: 9, gradePct: 6.5 }, // last Tramuntana ramp
      { km: 12, gradePct: -5.0 }, // descent off the range
      { km: 8, gradePct: 5.5 }, // short inland riser
      { km: 18, gradePct: -3.5 }, // down to the plain
      { km: 30, gradePct: 0.9 }, // rolling plain
      { km: 12, gradePct: 4.0 }, // sole inland bump
      { km: 10, gradePct: -3.0 },
      { km: 88, gradePct: -0.2 }, // long flat eastern/southern run-in
    ],
  },
  {
    // SYNTHETIC. ~155 km / ~900 m climbing — RideLondon-Essex 100 is famously
    // flat; published climbing is ~800–900 m. Previous fixture was ~510 m, a
    // little low for the gentle Essex rollers. Source: RideLondon-Essex 100
    // route guide (~100 mi, ~850 m d+).
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
    headingSweepDeg: 90,
    segments: [
      { km: 30, gradePct: 0.3 },
      { km: 5, gradePct: 2.5 },
      { km: 4, gradePct: -2.0 },
      { km: 25, gradePct: 0.5 },
      { km: 6, gradePct: 2.8 },
      { km: 4, gradePct: -2.0 },
      { km: 18, gradePct: 0.6 },
      { km: 5, gradePct: 2.5 },
      { km: 5, gradePct: -1.8 },
      { km: 20, gradePct: 0.4 },
      { km: 4, gradePct: 2.2 },
      { km: 29, gradePct: -0.2 },
    ],
  },
  {
    // SYNTHETIC. ~175 km / ~2,590 m climbing — calibrated to the published GFNY
    // figure of ~2,500 m (Palisades, Bear Mountain, Cheesecote rollers).
    // Previous fixture was ~2,110 m (-16%). Source: GFNY NYC route page
    // (~100 mi, ~8,500 ft / ~2,500 m d+).
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
    headingSweepDeg: 110,
    segments: [
      { km: 18, gradePct: 0.3 },
      { km: 12, gradePct: 3.5 }, // Palisades climb out of the Hudson
      { km: 8, gradePct: -1.5 },
      { km: 22, gradePct: 1.5 },
      { km: 7.8, gradePct: 8.0 }, // Bear Mountain
      { km: 9, gradePct: -5.0 },
      { km: 20, gradePct: 2.0 }, // Cheesecote rollers
      { km: 9.1, gradePct: 4.0 },
      { km: 12, gradePct: -2.5 },
      { km: 24, gradePct: 1.5 },
      { km: 33.1, gradePct: 0.2 }, // run-in
    ],
  },
  {
    // SYNTHETIC. ~153 km / ~2,800 m climbing — calibrated to the Dragon Ride
    // Medio/Gran Fondo figure of ~2,800 m over the South Wales valleys (Bwlch,
    // Rhigos). Previous fixture was ~1,760 m (-37%). Source: Dragon Ride event
    // route data (Medio ~153 km, ~2,800 m d+).
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
    headingSweepDeg: 120,
    segments: [
      { km: 20, gradePct: 1.0 },
      { km: 8, gradePct: 5.5 }, // first valley climb
      { km: 6, gradePct: -3.5 },
      { km: 18, gradePct: 2.2 },
      { km: 7, gradePct: 6.5 }, // Bwlch
      { km: 9, gradePct: -4.5 },
      { km: 25, gradePct: 0.8 },
      { km: 6, gradePct: 7.0 }, // Rhigos
      { km: 5, gradePct: -4.0 },
      { km: 15, gradePct: 2.2 },
      { km: 8, gradePct: 5.0 }, // late roller
      { km: 7, gradePct: -3.0 },
      { km: 19, gradePct: -0.3 }, // run-in
    ],
  },
  {
    // SYNTHETIC. ~173 km / ~4,020 m climbing — calibrated to the published Fred
    // Whitton figure of ~3,950 m (Kirkstone, Honister, Newlands, Hardknott &
    // Wrynose). Previous fixture was ~4,140 m (+5%); trimmed slightly to land
    // on target. Source: Fred Whitton Challenge route (~112 mi, ~3,950 m d+).
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
    headingSweepDeg: 130,
    segments: [
      { km: 18, gradePct: 0.8 },
      { km: 4.1, gradePct: 10.5 }, // Kirkstone
      { km: 8, gradePct: -5.0 },
      { km: 20, gradePct: 2.2 },
      { km: 3.2, gradePct: 12.5 }, // Honister
      { km: 7, gradePct: -6.0 },
      { km: 16, gradePct: 3.0 },
      { km: 3, gradePct: 11.0 }, // Newlands / Whinlatter
      { km: 12, gradePct: -3.5 },
      { km: 24, gradePct: 2.0 },
      { km: 2.4, gradePct: 18.0 }, // Hardknott (the wall)
      { km: 3, gradePct: -13.0 },
      { km: 4, gradePct: 11.5 }, // Wrynose
      { km: 8, gradePct: -7.0 },
      { km: 28, gradePct: 1.9 },
      { km: 12.3, gradePct: -0.5 },
    ],
  },
  {
    // SYNTHETIC. ~130 km / ~2,210 m climbing — calibrated to the published
    // Ronde van Vlaanderen Cyclo figure of ~2,200 m. The Flandrien profile is
    // ~18 short, brutally steep bergs (Koppenberg, Paterberg, Oude Kwaremont,
    // Muur) separated by short dips, not long alpine climbs — modelled here as
    // many 0.5–1.5 km ramps at 8–14%. Previous fixture had only a handful of
    // bergs and came out at ~950 m (-57%), absurdly too flat. Source: Ronde
    // sportive route (~140 km variant, ~2,200 m d+).
    slug: "tour-of-flanders-sportive",
    name: "Tour of Flanders Sportive",
    country: "Belgium",
    region: "East Flanders",
    startLat: 50.92,
    startLon: 3.85,
    startElevation: 30,
    surfaceSummary: "tarmac_rough",
    source: "ronde_van_vlaanderen",
    eventDates: ["2026-04-04"],
    headingSweepDeg: 120,
    segments: [
      { km: 40, gradePct: 0.5 }, // flat run from the start into the Ardennes
      { km: 0.7, gradePct: 12.0 }, // berg
      { km: 1.2, gradePct: -4.0 },
      { km: 0.5, gradePct: 13.0 }, // Koppenberg-style wall
      { km: 1.5, gradePct: -2.0 },
      { km: 1.0, gradePct: 10.0 },
      { km: 1.5, gradePct: -3.0 },
      { km: 1.2, gradePct: 9.0 },
      { km: 2, gradePct: -1.5 },
      { km: 1.0, gradePct: 11.0 },
      { km: 1.5, gradePct: -2.5 },
      { km: 0.7, gradePct: 12.0 }, // Paterberg-style wall
      { km: 2, gradePct: -1.0 },
      { km: 1.5, gradePct: 9.0 }, // Oude Kwaremont (long cobbled berg)
      { km: 2, gradePct: -2.0 },
      { km: 1.0, gradePct: 10.0 },
      { km: 1.5, gradePct: -2.0 },
      { km: 1.2, gradePct: 9.0 },
      { km: 2, gradePct: -1.5 },
      { km: 0.8, gradePct: 11.0 },
      { km: 1.5, gradePct: -2.0 },
      { km: 1.0, gradePct: 9.0 },
      { km: 1.5, gradePct: -2.0 },
      { km: 0.6, gradePct: 13.0 }, // another wall
      { km: 1.5, gradePct: -1.0 },
      { km: 1.0, gradePct: 9.0 },
      { km: 2, gradePct: -2.0 },
      { km: 1.1, gradePct: 10.0 },
      { km: 1.5, gradePct: -1.5 },
      { km: 0.7, gradePct: 12.0 },
      { km: 1.5, gradePct: -2.0 },
      { km: 1.0, gradePct: 9.0 },
      { km: 2, gradePct: -1.5 },
      { km: 0.6, gradePct: 11.0 },
      { km: 2, gradePct: -1.0 },
      { km: 1.0, gradePct: 9.0 }, // Muur van Geraardsbergen-style finale
      { km: 2, gradePct: -2.0 },
      { km: 1.0, gradePct: 10.0 },
      { km: 1.5, gradePct: -2.0 },
      { km: 0.7, gradePct: 12.0 }, // late berg
      { km: 1.5, gradePct: -1.5 },
      { km: 1.0, gradePct: 9.0 },
      { km: 2, gradePct: -2.0 },
      { km: 0.8, gradePct: 11.0 },
      { km: 2, gradePct: -1.0 },
      { km: 1.0, gradePct: 8.0 },
      { km: 2, gradePct: -1.5 },
      { km: 1.0, gradePct: 9.0 },
      { km: 28, gradePct: 0.2 }, // flat run to the line
    ],
  },
  {
    // SYNTHETIC. ~138 km / ~2,930 m climbing — calibrated to the published
    // Strade Bianche Gran Fondo figure of ~3,000 m over the relentless Tuscan
    // sterrato rollers (and the brutal Via Santa Caterina finale in Siena).
    // Previous fixture was ~2,050 m (-32%), far too tame for this course.
    // Source: Strade Bianche Gran Fondo (medio/lungo ~3,000 m d+).
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
    headingSweepDeg: 120,
    segments: [
      { km: 18, gradePct: 1.8 }, // rolling sterrato out of Siena
      { km: 9, gradePct: 4.0 },
      { km: 8, gradePct: -2.5 },
      { km: 12, gradePct: 4.5 },
      { km: 10, gradePct: -2.5 },
      { km: 16, gradePct: 3.0 },
      { km: 2.4, gradePct: 8.0 }, // steep gravel ramp
      { km: 6, gradePct: -3.5 },
      { km: 1.1, gradePct: 12.0 }, // Monte Sante Marie-style wall
      { km: 14, gradePct: 2.8 },
      { km: 0.5, gradePct: 14.0 }, // Via Santa Caterina finale
      { km: 8, gradePct: 3.5 },
      { km: 6, gradePct: -3.0 },
      { km: 7, gradePct: 3.0 },
      { km: 20, gradePct: -1.0 },
    ],
  },
  {
    // SYNTHETIC. ~170 km / ~360 m climbing — Paris-Roubaix is essentially flat
    // (~300 m d+); the difficulty is the cobble sectors, not climbing, hence
    // the high cobble Crr (surfaceSummary: cobbles). Gain nudged up slightly
    // from ~100 m to a more realistic ~300–400 m of pavé undulation. Source:
    // Paris-Roubaix Challenge route (~170 km, near-flat, ~300 m d+).
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
    headingSweepDeg: 90,
    segments: [
      { km: 25, gradePct: 0.3 },
      { km: 2.3, gradePct: 1.2 }, // pavé sector undulation
      { km: 18, gradePct: 0.4 },
      { km: 3.0, gradePct: 1.5 },
      { km: 22, gradePct: -0.2 },
      { km: 2.1, gradePct: 1.3 },
      { km: 28, gradePct: 0.2 },
      { km: 1.8, gradePct: 1.5 },
      { km: 34, gradePct: -0.2 },
      { km: 33.8, gradePct: 0.1 },
    ],
  },
  {
    // SYNTHETIC. ~210 km / ~3,530 m climbing — calibrated to the published BWR
    // California "Waffle" route figure of ~3,400 m of mixed dirt-and-tarmac
    // climbing (Double Peak, Lake Wohlford, Mesa Grande). Previous fixture was
    // ~2,980 m (-12%). Source: BWR California route data (~135 mi, ~11,000 ft /
    // ~3,400 m d+).
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
    headingSweepDeg: 120,
    segments: [
      { km: 22, gradePct: 1.2 },
      { km: 5, gradePct: 8.0 }, // first dirt climb
      { km: 8, gradePct: -4.0 },
      { km: 18, gradePct: 3.0 },
      { km: 8, gradePct: 6.5 },
      { km: 12, gradePct: -3.5 },
      { km: 28, gradePct: 2.0 },
      { km: 16, gradePct: 4.0 },
      { km: 18, gradePct: -1.8 },
      { km: 20, gradePct: 3.2 }, // Double Peak run-in
      { km: 55, gradePct: -0.6 },
    ],
  },
  {
    // SYNTHETIC. ~327 km / ~2,750 m climbing — calibrated to the published
    // Unbound Gravel 200 figure of ~2,800 m of incessant Flint Hills rollers
    // (no real climbs, just relentless punchy gravel undulation). Previous
    // fixture was ~3,190 m (+14%); trimmed to target. Source: Unbound Gravel
    // 200 route data (~200 mi, ~9,000 ft / ~2,800 m d+).
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
    headingSweepDeg: 130,
    segments: [
      { km: 35, gradePct: 0.8 },
      { km: 3, gradePct: 5.0 },
      { km: 22, gradePct: -0.8 },
      { km: 20, gradePct: 2.2 },
      { km: 30, gradePct: -1.0 },
      { km: 35, gradePct: 1.9 },
      { km: 40, gradePct: -0.4 },
      { km: 30, gradePct: 2.2 },
      { km: 52, gradePct: 0.4 },
      { km: 60, gradePct: 0.6 },
    ],
  },
  {
    // SYNTHETIC. ~167 km / ~3,810 m climbing at altitude — calibrated to the
    // published Leadville Trail 100 MTB figure of ~3,700 m (Columbine Mine,
    // Powerline, Carter Summit), all above 2,800 m. Previous fixture was
    // ~3,500 m (-5%). Source: Leadville 100 MTB route (~104 mi, ~12,000 ft /
    // ~3,700 m d+).
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
    headingSweepDeg: 120,
    segments: [
      { km: 6, gradePct: 2.0 },
      { km: 4.5, gradePct: 8.0 }, // St Kevin's
      { km: 7, gradePct: -4.0 },
      { km: 18, gradePct: 2.8 },
      { km: 5.5, gradePct: 8.5 }, // toward Columbine
      { km: 10, gradePct: -5.0 },
      { km: 20, gradePct: 2.3 },
      { km: 15, gradePct: 6.5 }, // Columbine Mine (turnaround, ~3,840 m)
      { km: 15, gradePct: -6.0 },
      { km: 23, gradePct: 2.2 },
      { km: 5.5, gradePct: 8.5 }, // Powerline
      { km: 37.5, gradePct: -0.5 },
    ],
  },
  {
    // SYNTHETIC. ~200 km / ~3,390 m climbing — calibrated to the published
    // Wicklow 200 figure of ~3,400 m (Wicklow Gap, Slieve Mann, Sally Gap and
    // the many smaller Wicklow climbs). Previous fixture was ~2,400 m (-29%).
    // The profile is many medium climbs rather than a few big ones, hence the
    // long segment list. Source: Wicklow 200 sportive route (~200 km, ~3,400 m d+).
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
    headingSweepDeg: 130,
    segments: [
      { km: 6, gradePct: 0.5 },
      { km: 5, gradePct: 5.5 },
      { km: 5, gradePct: -2.5 },
      { km: 8, gradePct: 1.5 },
      { km: 12, gradePct: 5.5 },
      { km: 12, gradePct: -4.5 },
      { km: 10, gradePct: 1.0 },
      { km: 8, gradePct: 6.0 },
      { km: 9, gradePct: -4.5 },
      { km: 12, gradePct: 1.5 },
      { km: 6, gradePct: 6.5 },
      { km: 6, gradePct: -3.5 },
      { km: 15, gradePct: 1.0 },
      { km: 5, gradePct: 6.0 },
      { km: 5, gradePct: -3.5 },
      { km: 10, gradePct: 1.5 },
      { km: 6, gradePct: 5.5 },
      { km: 7, gradePct: -3.0 },
      { km: 18, gradePct: 0.5 },
      { km: 5, gradePct: 4.0 },
      { km: 7, gradePct: -2.5 },
      { km: 23, gradePct: -0.5 },
    ],
  },
  {
    // SYNTHETIC. ~137 km / ~2,330 m climbing — sized to the Ring of Beara
    // 140 km route (~2,200–2,400 m: Caha Pass, Healy Pass, coastal rollers).
    // Already within tolerance; left as-is. Source: Ring of Beara Cycle route.
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
    headingSweepDeg: 130,
    segments: [
      // Section 1: Kenmare → Glengarriff via Caha Pass (~30 km)
      { km: 3, gradePct: 0.3 },    // Kenmare departure flat
      { km: 8, gradePct: 1.5 },    // Bonane Valley gentle rise on N71
      { km: 4, gradePct: 3.0 },    // Approach to Caha Pass
      { km: 7, gradePct: 4.7 },    // Caha Pass main climb (cat-3, ~330m)
      { km: 8, gradePct: -5.0 },   // Caha descent through tunnels to Glengarriff
      // Section 2: Glengarriff → Adrigole along Bantry Bay (~26 km)
      { km: 3, gradePct: 0.3 },    // Glengarriff coast flat
      { km: 3, gradePct: 3.5 },    // Coastal climb
      { km: 2, gradePct: -3.0 },   // Descent
      { km: 4, gradePct: 2.5 },    // Coastal rolling up
      { km: 2, gradePct: -2.5 },   // Down
      { km: 3, gradePct: 4.0 },    // Atlantic coast climb
      { km: 3, gradePct: -3.5 },   // Descent
      { km: 4, gradePct: 2.0 },    // Approach Adrigole
      { km: 2, gradePct: 0.5 },    // Adrigole flat
      // Section 3: Healy Pass crossing (~15 km)
      { km: 1, gradePct: 0.5 },    // Healy Pass base (Adrigole)
      { km: 9, gradePct: 3.6 },    // Healy Pass climb (cat-3, ~325m)
      { km: 5, gradePct: -5.0 },   // Healy descent to Lauragh
      // Section 4: Lauragh → Kenmare along the north coast (~66 km)
      { km: 3, gradePct: 0.5 },    // Lauragh flat
      { km: 4, gradePct: 5.0 },    // First north-coast climb
      { km: 3, gradePct: -3.0 },   // Down
      { km: 4, gradePct: 3.0 },    // Coastal roller up
      { km: 2, gradePct: -3.0 },   // Down
      { km: 3, gradePct: 3.5 },    // Climb
      { km: 2, gradePct: -2.5 },   // Down
      { km: 4, gradePct: 3.0 },    // Ardgroom rollers
      { km: 3, gradePct: -2.5 },   // Down
      { km: 6, gradePct: 4.5 },    // Coastal pass (Ballaghbeama-style, ~270m)
      { km: 4, gradePct: -3.5 },   // Down
      { km: 4, gradePct: 1.5 },    // Coast roll
      { km: 3, gradePct: 3.0 },    // Tuosist roller
      { km: 3, gradePct: -3.0 },   // Down
      { km: 5, gradePct: 1.0 },    // Coast
      { km: 3, gradePct: 2.5 },    // Final climb
      { km: 10, gradePct: -1.0 },  // Long descent into Kenmare
    ],
  },
  {
    // SYNTHETIC. ~70 km / ~2,500 m climbing — a representative HC mountain
    // stage (two big Pyrenean cols, e.g. Tourmalet-class). Haute Route stage
    // distances/gain vary by year; this is a defensible queen-stage shape, not
    // a specific 2026 route. Source: Haute Route Pyrenees stage profiles.
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
    headingSweepDeg: 110,
    segments: [
      { km: 8, gradePct: 1.0 },
      { km: 17, gradePct: 7.4 },
      { km: 19, gradePct: -7.0 },
      { km: 14, gradePct: 2.0 },
      { km: 12, gradePct: 7.6 },
    ],
  },
];

const STEP_M = 50;
// Metres per degree of latitude (near-constant on the WGS-84 ellipsoid).
const M_PER_DEG_LAT = 110_574;
// Compass base the synthetic route curves around (45° = north-east).
const BASE_HEADING_DEG = 45;
const DEFAULT_HEADING_SWEEP_DEG = 100;

/**
 * Generate a synthetic track from a constant-gradient segment sketch.
 *
 * Each 50 m step advances along the CURRENT heading, which rotates linearly
 * from `BASE_HEADING_DEG − sweep/2` to `BASE_HEADING_DEG + sweep/2` across the
 * whole route. Because every step is still exactly STEP_M long, the curve
 * leaves per-segment distance — and therefore total distance, gradients and
 * elevation gain — unchanged; it only spreads the heading across a range of
 * compass directions so wind/aero terms vary along the course (the old
 * single-latitude routes pointed due east everywhere, making wind degenerate).
 */
function generatePoints(spec: EventSpec): TrackPoint[] {
  const sweepRad =
    ((spec.headingSweepDeg ?? DEFAULT_HEADING_SWEEP_DEG) * Math.PI) / 180;
  const baseRad = (BASE_HEADING_DEG * Math.PI) / 180;
  const points: TrackPoint[] = [];
  let lat = spec.startLat;
  let lon = spec.startLon;
  let elevation = spec.startElevation;
  points.push({ lat, lon, elevation });

  const totalSteps = spec.segments.reduce(
    (acc, seg) => acc + Math.max(1, Math.ceil((seg.km * 1000) / STEP_M)),
    0,
  );
  let step = 0;
  for (const seg of spec.segments) {
    const segs = Math.max(1, Math.ceil((seg.km * 1000) / STEP_M));
    const dzPerStep = STEP_M * (seg.gradePct / 100);
    for (let i = 0; i < segs; i++) {
      const frac = totalSteps > 1 ? step / (totalSteps - 1) : 0;
      const heading = baseRad + sweepRad * (frac - 0.5);
      const metresPerDegLon = 111_320 * Math.cos((lat * Math.PI) / 180);
      lat += (STEP_M * Math.cos(heading)) / M_PER_DEG_LAT;
      lon += (STEP_M * Math.sin(heading)) / metresPerDegLon;
      elevation += dzPerStep;
      points.push({ lat, lon, elevation });
      step += 1;
    }
  }
  return points;
}

let cached: FixtureCourse[] | null = null;

export function getFixtureCourses(): FixtureCourse[] {
  if (cached) return cached;
  const profileCourses = EVENTS.map((spec, i): FixtureCourse => {
    const points = generatePoints(spec);
    const course = buildCourse(points, { name: spec.name });
    return {
      id: -1 - i,
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
      uploaderEmail: null,
    };
  });
  const trakaCourses = TRAKA_2026_ROUTES.map((route, i): FixtureCourse => {
    const course = buildCourse(route.trackPoints, {
      name: route.name,
      surfaces: buildMixedSurfacePlan(route, route.trackPoints),
    });
    return {
      id: -100 - i,
      slug: route.slug,
      name: route.name,
      country: route.country,
      region: route.region,
      discipline: route.discipline,
      distanceM: Math.round(course.totalDistance),
      elevationGainM: Math.round(course.totalElevationGain),
      elevationLossM: Math.round(course.totalElevationLoss),
      surfaceSummary: route.surfaceSummary,
      gpxData: route.trackPoints,
      courseData: course,
      eventDates: route.eventDates,
      verified: true,
      source: route.source,
      uploaderEmail: null,
    };
  });
  cached = [...trakaCourses, ...profileCourses];
  return cached;
}

export function getFixtureCourseBySlug(slug: string): FixtureCourse | null {
  return getFixtureCourses().find((c) => c.slug === slug) ?? null;
}

/** True when the DB connection string is missing — fall back to fixtures. */
export function shouldUseFixtures(): boolean {
  return !process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING;
}
