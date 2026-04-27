import rawRoutes from "./data/traka-2026-routes.json";
import type { TrackPoint } from "./types";

interface RawTrakaRoute {
  slug: string;
  name: string;
  country: string;
  region: string;
  discipline: string;
  surfaceSummary: string;
  source: string;
  officialUrl: string;
  sourceUrl: string;
  rwgpsRouteId: number;
  rwgpsName: string;
  distanceM: number;
  elevationGainM: number;
  eventDates: string[];
  cutoffHours: number | null;
  terrain: {
    unpavedPct: number;
    pavedPct: number;
  };
  points: number[][];
}

interface TrakaRoutesFile {
  generatedAt: string;
  source: string;
  routes: RawTrakaRoute[];
}

export interface Traka2026Route
  extends Omit<RawTrakaRoute, "points"> {
  trackPoints: TrackPoint[];
}

const trakaRoutesFile = rawRoutes as unknown as TrakaRoutesFile;

function toTrackPoint(point: number[]): TrackPoint {
  const lat = point[0];
  const lon = point[1];
  const elevation = point[2];

  if (
    typeof lat !== "number" ||
    typeof lon !== "number" ||
    typeof elevation !== "number"
  ) {
    throw new Error("Invalid Traka route point");
  }

  return { lat, lon, elevation };
}

export const TRAKA_2026_ROUTES: Traka2026Route[] =
  trakaRoutesFile.routes.map((route) => ({
    ...route,
    trackPoints: route.points.map(toTrackPoint),
  }));
