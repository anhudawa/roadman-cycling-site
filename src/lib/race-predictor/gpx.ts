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

const MAX_REASONABLE_POINT_GAP_M = 5_000;
const MAX_REASONABLE_GRADE = 0.35;
const SPIKE_DETOUR_RATIO = 8;

function validLatLon(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

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
  quality: TrackPointQuality;
}

export interface TrackPointQuality {
  rawPointCount: number;
  validPointCount: number;
  invalidCoordinateCount: number;
  missingElevationCount: number;
  invalidElevationCount: number;
  gpsSpikeCount: number;
  elevationSpikeCount: number;
  cleanedPointCount: number;
}

export interface CleanTrackResult {
  points: TrackPoint[];
  quality: TrackPointQuality;
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
  let rawPointCount = 0;
  let invalidCoordinateCount = 0;
  let missingElevationCount = 0;
  let invalidElevationCount = 0;
  let name: string | undefined;

  for (const trk of tracks) {
    if (!name && typeof trk.name === 'string') name = trk.name;
    const segs = ensureArray(trk.trkseg);
    for (const seg of segs) {
      const trkpts = ensureArray(seg.trkpt);
      for (const p of trkpts) {
        rawPointCount += 1;
        const lat = Number(p['@_lat']);
        const lon = Number(p['@_lon']);
        if (!validLatLon(lat, lon)) {
          invalidCoordinateCount += 1;
          continue;
        }
        const elevation = p.ele !== undefined ? Number(p.ele) : 0;
        if (p.ele === undefined) missingElevationCount += 1;
        if (p.ele !== undefined && !Number.isFinite(elevation)) {
          invalidElevationCount += 1;
        }
        const time = typeof p.time === 'string' ? new Date(p.time) : undefined;
        points.push({
          lat,
          lon,
          elevation: Number.isFinite(elevation) ? elevation : 0,
          time,
        });
      }
    }
  }

  if (points.length === 0) throw new Error('Invalid GPX: no track points found');
  const cleaned = cleanTrackPointsWithQuality(points, {
    rawPointCount,
    invalidCoordinateCount,
    missingElevationCount,
    invalidElevationCount,
  });
  return { name, points: cleaned.points, quality: cleaned.quality };
}

/**
 * Remove impossible GPS jumps before distance/elevation derivation.
 *
 * Consumer GPS exports sometimes contain one wild point hundreds of km away
 * from the route. Keeping it would create fake distance, fake gradients, and
 * absurd predicted times. This filter removes only obvious single-point
 * detours: both neighbouring legs must be very long and the route via the
 * point must be many times longer than the direct neighbour-to-neighbour leg.
 */
export function removeGpsSpikes(points: TrackPoint[]): TrackPoint[] {
  const valid = points.filter((p) => validLatLon(p.lat, p.lon));
  if (valid.length < 3) return valid;

  const cleaned: TrackPoint[] = [valid[0]];
  for (let i = 1; i < valid.length - 1; i++) {
    const prev = valid[i - 1];
    const curr = valid[i];
    const next = valid[i + 1];
    const inLeg = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    const outLeg = haversineDistance(curr.lat, curr.lon, next.lat, next.lon);
    const direct = haversineDistance(prev.lat, prev.lon, next.lat, next.lon);
    const via = inLeg + outLeg;
    const isSinglePointDetour =
      inLeg > MAX_REASONABLE_POINT_GAP_M &&
      outLeg > MAX_REASONABLE_POINT_GAP_M &&
      direct > 0 &&
      via / direct > SPIKE_DETOUR_RATIO;

    if (!isSinglePointDetour) cleaned.push(curr);
  }
  cleaned.push(valid[valid.length - 1]);
  return cleaned;
}

function removeGpsSpikesWithCount(points: TrackPoint[]): {
  points: TrackPoint[];
  removed: number;
} {
  const valid = points.filter((p) => validLatLon(p.lat, p.lon));
  if (valid.length < 3) return { points: valid, removed: points.length - valid.length };

  const cleaned: TrackPoint[] = [valid[0]];
  let removed = points.length - valid.length;
  for (let i = 1; i < valid.length - 1; i++) {
    const prev = valid[i - 1];
    const curr = valid[i];
    const next = valid[i + 1];
    const inLeg = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    const outLeg = haversineDistance(curr.lat, curr.lon, next.lat, next.lon);
    const direct = haversineDistance(prev.lat, prev.lon, next.lat, next.lon);
    const via = inLeg + outLeg;
    const isSinglePointDetour =
      inLeg > MAX_REASONABLE_POINT_GAP_M &&
      outLeg > MAX_REASONABLE_POINT_GAP_M &&
      direct > 0 &&
      via / direct > SPIKE_DETOUR_RATIO;

    if (isSinglePointDetour) removed += 1;
    else cleaned.push(curr);
  }
  cleaned.push(valid[valid.length - 1]);
  return { points: cleaned, removed };
}

/**
 * Replace isolated elevation spikes with local interpolation.
 *
 * We intentionally do not flatten steep roads. A point is treated as a spike
 * only when the incoming and outgoing grades are both implausibly steep and
 * point in opposite directions, which is the classic barometric/GPS altitude
 * glitch shape.
 */
export function removeElevationSpikes(points: TrackPoint[]): TrackPoint[] {
  if (points.length < 3) return [...points];
  const out = points.map((p) => ({ ...p }));

  for (let i = 1; i < out.length - 1; i++) {
    const prev = out[i - 1];
    const curr = out[i];
    const next = out[i + 1];
    const d1 = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    const d2 = haversineDistance(curr.lat, curr.lon, next.lat, next.lon);
    if (d1 <= 0 || d2 <= 0) continue;

    const g1 = (curr.elevation - prev.elevation) / d1;
    const g2 = (next.elevation - curr.elevation) / d2;
    const reversesHard = Math.sign(g1) !== Math.sign(g2);
    const bothImplausible =
      Math.abs(g1) > MAX_REASONABLE_GRADE && Math.abs(g2) > MAX_REASONABLE_GRADE;

    if (reversesHard && bothImplausible) {
      const t = d1 / (d1 + d2);
      curr.elevation = prev.elevation + (next.elevation - prev.elevation) * t;
    }
  }

  return out;
}

function removeElevationSpikesWithCount(points: TrackPoint[]): {
  points: TrackPoint[];
  corrected: number;
} {
  if (points.length < 3) return { points: [...points], corrected: 0 };
  const out = points.map((p) => ({ ...p }));
  let corrected = 0;

  for (let i = 1; i < out.length - 1; i++) {
    const prev = out[i - 1];
    const curr = out[i];
    const next = out[i + 1];
    const d1 = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    const d2 = haversineDistance(curr.lat, curr.lon, next.lat, next.lon);
    if (d1 <= 0 || d2 <= 0) continue;

    const g1 = (curr.elevation - prev.elevation) / d1;
    const g2 = (next.elevation - curr.elevation) / d2;
    const reversesHard = Math.sign(g1) !== Math.sign(g2);
    const bothImplausible =
      Math.abs(g1) > MAX_REASONABLE_GRADE && Math.abs(g2) > MAX_REASONABLE_GRADE;

    if (reversesHard && bothImplausible) {
      const t = d1 / (d1 + d2);
      curr.elevation = prev.elevation + (next.elevation - prev.elevation) * t;
      corrected += 1;
    }
  }

  return { points: out, corrected };
}

export function cleanTrackPoints(points: TrackPoint[]): TrackPoint[] {
  return cleanTrackPointsWithQuality(points).points;
}

export function cleanTrackPointsWithQuality(
  points: TrackPoint[],
  parseCounts?: {
    rawPointCount?: number;
    invalidCoordinateCount?: number;
    missingElevationCount?: number;
    invalidElevationCount?: number;
  },
): CleanTrackResult {
  const gps = removeGpsSpikesWithCount(points);
  const elevation = removeElevationSpikesWithCount(gps.points);
  const rawPointCount = parseCounts?.rawPointCount ?? points.length;
  const invalidCoordinateCount = parseCounts?.invalidCoordinateCount ?? 0;
  const missingElevationCount = parseCounts?.missingElevationCount ?? 0;
  const invalidElevationCount = parseCounts?.invalidElevationCount ?? 0;

  return {
    points: elevation.points,
    quality: {
      rawPointCount,
      validPointCount: points.length,
      invalidCoordinateCount,
      missingElevationCount,
      invalidElevationCount,
      gpsSpikeCount: gps.removed,
      elevationSpikeCount: elevation.corrected,
      cleanedPointCount: elevation.points.length,
    },
  };
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
  const cleanPoints = cleanTrackPoints(points);
  if (cleanPoints.length < 2) {
    throw new Error('buildCourse requires at least 2 track points');
  }
  const sigma = options.smoothingSigma ?? DEFAULT_SMOOTHING_SIGMA;
  const elevations = gaussianSmooth(
    cleanPoints.map((p) => p.elevation),
    sigma,
  );

  const segments: Segment[] = [];
  let totalDistance = 0;
  let totalGain = 0;
  let totalLoss = 0;

  for (let i = 0; i < cleanPoints.length - 1; i++) {
    const a = cleanPoints[i];
    const b = cleanPoints[i + 1];
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
