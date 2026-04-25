// GPX parsing, geometry, smoothing, segment derivation, and climb detection.

import { XMLParser } from 'fast-xml-parser';
import type {
  Climb,
  ClimbCategory,
  Course,
  Segment,
  SurfaceType,
  TrackPoint,
} from './types';
import {
  EARTH_RADIUS,
  CLIMB_DETECT,
  CLIMB_THRESHOLDS,
  DEFAULT_SMOOTHING_SIGMA,
} from './constants';

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Haversine great-circle distance, m. */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Initial bearing (forward azimuth) from point 1 to point 2, radians.
 * 0 = north, π/2 = east, π = south, 3π/2 = west.
 */
export function bearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (θ + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * 1-D Gaussian smoothing. Kernel half-width = ceil(3·sigma).
 * Edges use truncated kernels with re-normalised weights.
 */
export function gaussianSmooth(values: number[], sigma: number): number[] {
  if (values.length <= 1 || sigma <= 0) return [...values];
  const radius = Math.max(1, Math.ceil(3 * sigma));
  const kernel: number[] = [];
  for (let i = -radius; i <= radius; i++) {
    kernel.push(Math.exp(-(i * i) / (2 * sigma * sigma)));
  }
  const out = new Array<number>(values.length);
  for (let i = 0; i < values.length; i++) {
    let acc = 0;
    let wsum = 0;
    for (let k = -radius; k <= radius; k++) {
      const j = i + k;
      if (j < 0 || j >= values.length) continue;
      const w = kernel[k + radius];
      acc += values[j] * w;
      wsum += w;
    }
    out[i] = acc / wsum;
  }
  return out;
}

interface ParsedGpx {
  name?: string;
  points: TrackPoint[];
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  parseTagValue: true,
});

function ensureArray<T>(v: T | T[] | undefined | null): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

interface GpxTrackPoint {
  '@_lat'?: number | string;
  '@_lon'?: number | string;
  ele?: number | string;
  time?: string;
}

interface GpxTrkSeg {
  trkpt?: GpxTrackPoint | GpxTrackPoint[];
}

interface GpxTrk {
  name?: string;
  trkseg?: GpxTrkSeg | GpxTrkSeg[];
}

interface GpxRoot {
  gpx?: {
    trk?: GpxTrk | GpxTrk[];
  };
}

/**
 * Parse GPX 1.0 or 1.1. Concatenates all track segments in document order.
 * Throws on missing or empty track data.
 */
export function parseGpx(xml: string): ParsedGpx {
  const parsed = xmlParser.parse(xml) as GpxRoot;
  const gpx = parsed.gpx;
  if (!gpx) throw new Error('Invalid GPX: missing <gpx> root');

  const tracks = ensureArray(gpx.trk);
  if (tracks.length === 0) throw new Error('Invalid GPX: no <trk> elements');

  const points: TrackPoint[] = [];
  let name: string | undefined;

  for (const trk of tracks) {
    if (!name && typeof trk.name === 'string') name = trk.name;
    const segs = ensureArray(trk.trkseg);
    for (const seg of segs) {
      const trkpts = ensureArray(seg.trkpt);
      for (const p of trkpts) {
        const lat = Number(p['@_lat']);
        const lon = Number(p['@_lon']);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        const elevation = p.ele !== undefined ? Number(p.ele) : 0;
        const time = typeof p.time === 'string' ? new Date(p.time) : undefined;
        points.push({ lat, lon, elevation, time });
      }
    }
  }

  if (points.length === 0) throw new Error('Invalid GPX: no track points found');
  return { name, points };
}

interface BuildCourseOptions {
  name?: string;
  /** Default 4 — 3-5 is a sane range. */
  smoothingSigma?: number;
  /** Optional surface per derived segment. Length must equal points.length-1. */
  surfaces?: (SurfaceType | undefined)[];
}

/**
 * Build a Course from raw track points: smooth elevation, derive segments
 * with distance/gradient/heading, classify climbs.
 */
export function buildCourse(
  points: TrackPoint[],
  options: BuildCourseOptions = {},
): Course {
  if (points.length < 2) {
    throw new Error('buildCourse requires at least 2 track points');
  }
  const sigma = options.smoothingSigma ?? DEFAULT_SMOOTHING_SIGMA;
  const elevations = gaussianSmooth(
    points.map((p) => p.elevation),
    sigma,
  );

  const segments: Segment[] = [];
  let totalDistance = 0;
  let totalGain = 0;
  let totalLoss = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const distance = haversineDistance(a.lat, a.lon, b.lat, b.lon);
    if (distance < 1e-6) continue;
    const startElev = elevations[i];
    const endElev = elevations[i + 1];
    const dElev = endElev - startElev;
    const gradient = Math.atan2(dElev, distance);
    const heading = bearing(a.lat, a.lon, b.lat, b.lon);
    const surface = options.surfaces?.[i];

    segments.push({
      index: segments.length,
      startLat: a.lat,
      startLon: a.lon,
      endLat: b.lat,
      endLon: b.lon,
      startElevation: startElev,
      endElevation: endElev,
      distance,
      gradient,
      heading,
      surface,
    });

    totalDistance += distance;
    if (dElev > 0) totalGain += dElev;
    else totalLoss += -dElev;
  }

  const climbs = detectClimbs(segments);

  return {
    name: options.name,
    segments,
    totalDistance,
    totalElevationGain: totalGain,
    totalElevationLoss: totalLoss,
    climbs,
  };
}

/**
 * Identify climbs using a forward sliding window.
 * Climb starts when avg forward grade >3% over 100m.
 * Climb ends when avg forward grade <1% over 100m.
 * Reject climbs <250m. Categorise from cat4 → HC by length+grade thresholds.
 */
export function detectClimbs(segments: Segment[]): Climb[] {
  const climbs: Climb[] = [];
  const cumDist = new Array<number>(segments.length + 1);
  cumDist[0] = 0;
  for (let k = 0; k < segments.length; k++) {
    cumDist[k + 1] = cumDist[k] + segments[k].distance;
  }

  let i = 0;
  while (i < segments.length) {
    const startGrade = forwardWindowAvgGrade(segments, i, CLIMB_DETECT.windowMetres);
    if (startGrade > CLIMB_DETECT.startGradient) {
      const startIdx = i;
      let j = i;
      while (j < segments.length) {
        const fwd = forwardWindowAvgGrade(segments, j, CLIMB_DETECT.windowMetres);
        if (fwd < CLIMB_DETECT.endGradient) break;
        j++;
      }
      const endIdx = Math.max(j - 1, startIdx);
      const startDistance = cumDist[startIdx];
      const endDistance = cumDist[endIdx + 1];
      const length = endDistance - startDistance;
      if (length >= CLIMB_DETECT.minLength) {
        const elevationGain =
          segments[endIdx].endElevation - segments[startIdx].startElevation;
        const averageGradient = Math.atan2(elevationGain, length);
        const category = categoriseClimb(length, averageGradient);
        if (category) {
          climbs.push({
            startSegmentIndex: startIdx,
            endSegmentIndex: endIdx,
            startDistance,
            endDistance,
            length,
            averageGradient,
            elevationGain,
            category,
          });
        }
      }
      i = endIdx + 1;
    } else {
      i++;
    }
  }
  return climbs;
}

function forwardWindowAvgGrade(
  segments: Segment[],
  startIdx: number,
  windowM: number,
): number {
  let dist = 0;
  let elevDelta = 0;
  let i = startIdx;
  while (i < segments.length && dist < windowM) {
    dist += segments[i].distance;
    elevDelta += segments[i].endElevation - segments[i].startElevation;
    i++;
  }
  if (dist <= 0) return 0;
  return Math.atan2(elevDelta, dist);
}

function categoriseClimb(length: number, avgGradient: number): ClimbCategory | null {
  // Thresholds are stored as grade (rise/run). Compare against tan(angle) so a
  // 6% climb (rise/run = 0.06) cleanly matches the 0.06 cat1 threshold.
  const grade = Math.tan(avgGradient);
  const ladder: ClimbCategory[] = ['hc', 'cat1', 'cat2', 'cat3', 'cat4'];
  for (const cat of ladder) {
    const t = CLIMB_THRESHOLDS[cat];
    if (length >= t.minLength && grade >= t.minGradient) return cat;
  }
  return null;
}
