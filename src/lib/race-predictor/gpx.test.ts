import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  bearing,
  gaussianSmooth,
  parseGpx,
  buildCourse,
  detectClimbs,
  removeElevationSpikes,
  removeGpsSpikes,
  cleanTrackPointsWithQuality,
} from './gpx';
import type { Segment, TrackPoint } from './types';

describe('haversineDistance', () => {
  it('distance from a point to itself is 0', () => {
    expect(haversineDistance(51.5, -0.1, 51.5, -0.1)).toBeCloseTo(0, 5);
  });

  it("Land's End to John o' Groats ≈ 970 km", () => {
    const d = haversineDistance(50.0664, -5.7148, 58.6373, -3.0689);
    expect(d / 1000).toBeGreaterThan(960);
    expect(d / 1000).toBeLessThan(985);
  });

  it('1 degree of latitude is ~111 km', () => {
    const d = haversineDistance(0, 0, 1, 0);
    expect(d / 1000).toBeGreaterThan(110);
    expect(d / 1000).toBeLessThan(112);
  });
});

describe('bearing', () => {
  it('due north is 0 rad', () => {
    expect(bearing(0, 0, 1, 0)).toBeCloseTo(0, 4);
  });

  it('due east is π/2', () => {
    expect(bearing(0, 0, 0, 1)).toBeCloseTo(Math.PI / 2, 3);
  });

  it('London → Paris ≈ 149° (2.6 rad)', () => {
    const b = bearing(51.5074, -0.1278, 48.8566, 2.3522);
    const deg = (b * 180) / Math.PI;
    expect(deg).toBeGreaterThan(145);
    expect(deg).toBeLessThan(155);
  });
});

describe('gaussianSmooth', () => {
  it('passes constants through unchanged', () => {
    const input = [10, 10, 10, 10, 10];
    const out = gaussianSmooth(input, 2);
    out.forEach((v) => expect(v).toBeCloseTo(10, 5));
  });

  it('smooths a step function with no overshoot', () => {
    const input = [0, 0, 0, 10, 10, 10];
    const out = gaussianSmooth(input, 1);
    out.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(-1e-9);
      expect(v).toBeLessThanOrEqual(10 + 1e-9);
    });
  });

  it('smoothing reduces spike amplitude and spreads it to neighbours', () => {
    const input = [0, 0, 0, 100, 0, 0, 0];
    const out = gaussianSmooth(input, 2);
    expect(out[3]).toBeLessThan(50);
    // Energy spreads to neighbours (originally 0, now > 0)
    expect(out[2]).toBeGreaterThan(0);
    expect(out[4]).toBeGreaterThan(0);
    // Edge re-normalisation keeps total within ~30% of input mass
    const sum = out.reduce((s, v) => s + v, 0);
    expect(sum).toBeGreaterThan(70);
    expect(sum).toBeLessThan(130);
  });

  it('works on length 1', () => {
    expect(gaussianSmooth([42], 3)).toEqual([42]);
  });
});

const SAMPLE_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Test Loop</name>
    <trkseg>
      <trkpt lat="51.5000" lon="-0.1000"><ele>10.0</ele></trkpt>
      <trkpt lat="51.5010" lon="-0.1000"><ele>15.0</ele></trkpt>
      <trkpt lat="51.5020" lon="-0.1000"><ele>20.0</ele></trkpt>
      <trkpt lat="51.5030" lon="-0.1000"><ele>25.0</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;

const SAMPLE_GPX_MULTISEG = `<?xml version="1.0"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <trk><trkseg>
    <trkpt lat="50.0" lon="0.0"><ele>0</ele></trkpt>
    <trkpt lat="50.0" lon="0.001"><ele>0</ele></trkpt>
  </trkseg><trkseg>
    <trkpt lat="50.0" lon="0.002"><ele>1</ele></trkpt>
  </trkseg></trk>
</gpx>`;

describe('parseGpx', () => {
  it('parses a simple track with name and points', () => {
    const result = parseGpx(SAMPLE_GPX);
    expect(result.name).toBe('Test Loop');
    expect(result.points).toHaveLength(4);
    expect(result.points[0]).toMatchObject({ lat: 51.5, lon: -0.1, elevation: 10 });
    expect(result.points[3].elevation).toBe(25);
  });

  it('concatenates multiple track segments', () => {
    const result = parseGpx(SAMPLE_GPX_MULTISEG);
    expect(result.points).toHaveLength(3);
  });

  it('throws on empty / invalid GPX', () => {
    expect(() => parseGpx('<gpx></gpx>')).toThrow(/invalid gpx/i);
  });

  it('handles GPX 1.0 namespace', () => {
    const v10 = SAMPLE_GPX.replace('GPX/1/1', 'GPX/1/0').replace(
      'version="1.1"',
      'version="1.0"',
    );
    const result = parseGpx(v10);
    expect(result.points).toHaveLength(4);
  });

  it('skips malformed coordinates instead of poisoning the course', () => {
    const badCoords = `<?xml version="1.0"?>
<gpx version="1.1"><trk><trkseg>
  <trkpt lat="51.0" lon="-1.0"><ele>10</ele></trkpt>
  <trkpt lat="999" lon="-1.0"><ele>20</ele></trkpt>
  <trkpt lat="51.001" lon="-1.0"><ele>12</ele></trkpt>
</trkseg></trk></gpx>`;
    const result = parseGpx(badCoords);
    expect(result.points).toHaveLength(2);
    expect(result.quality.rawPointCount).toBe(3);
    expect(result.quality.invalidCoordinateCount).toBe(1);
    expect(result.quality.cleanedPointCount).toBe(2);
    expect(result.points.every((p) => p.lat <= 90 && p.lon >= -180)).toBe(true);
  });

  it('defaults missing or invalid elevation to zero', () => {
    const missingEle = `<?xml version="1.0"?>
<gpx version="1.1"><trk><trkseg>
  <trkpt lat="51.0" lon="-1.0"></trkpt>
  <trkpt lat="51.001" lon="-1.0"><ele>oops</ele></trkpt>
</trkseg></trk></gpx>`;
    const result = parseGpx(missingEle);
    expect(result.points.map((p) => p.elevation)).toEqual([0, 0]);
    expect(result.quality.missingElevationCount).toBe(1);
    expect(result.quality.invalidElevationCount).toBe(1);
  });

  it('returns cleaned points and quality counts for GPS and elevation spikes', () => {
    const spiky = `<?xml version="1.0"?>
<gpx version="1.1"><trk><trkseg>
  <trkpt lat="51.5000" lon="-0.1000"><ele>100</ele></trkpt>
  <trkpt lat="0.0000" lon="0.0000"><ele>100</ele></trkpt>
  <trkpt lat="51.5005" lon="-0.1000"><ele>500</ele></trkpt>
  <trkpt lat="51.5010" lon="-0.1000"><ele>102</ele></trkpt>
  <trkpt lat="51.5015" lon="-0.1000"><ele>103</ele></trkpt>
</trkseg></trk></gpx>`;
    const result = parseGpx(spiky);
    expect(result.quality.gpsSpikeCount).toBe(1);
    expect(result.quality.elevationSpikeCount).toBe(1);
    expect(result.points).toHaveLength(4);
    expect(result.points[1].elevation).toBeLessThan(103);
  });
});

describe('buildCourse', () => {
  it('derives correct distance and gradient on a simple north-bound climb', () => {
    const points: TrackPoint[] = [
      { lat: 51.5, lon: 0, elevation: 0 },
      { lat: 51.501, lon: 0, elevation: 5 },
      { lat: 51.502, lon: 0, elevation: 10 },
      { lat: 51.503, lon: 0, elevation: 15 },
    ];
    const course = buildCourse(points, { name: 'climb', smoothingSigma: 0 });
    expect(course.segments).toHaveLength(3);
    course.segments.forEach((s) => {
      expect(s.distance).toBeGreaterThan(100);
      expect(s.distance).toBeLessThan(120);
      expect(s.heading).toBeLessThan(0.05);
      const gradPct = Math.tan(s.gradient) * 100;
      expect(gradPct).toBeGreaterThan(4.0);
      expect(gradPct).toBeLessThan(5.0);
    });
    expect(course.totalElevationGain).toBeCloseTo(15, 0);
  });

  it('flat course has zero elevation gain', () => {
    const points: TrackPoint[] = [
      { lat: 0, lon: 0, elevation: 100 },
      { lat: 0, lon: 0.001, elevation: 100 },
      { lat: 0, lon: 0.002, elevation: 100 },
    ];
    const course = buildCourse(points);
    expect(course.totalElevationGain).toBeCloseTo(0, 1);
    expect(course.totalElevationLoss).toBeCloseTo(0, 1);
  });

  it('descent contributes only to elevationLoss', () => {
    const points: TrackPoint[] = [
      { lat: 0, lon: 0, elevation: 100 },
      { lat: 0, lon: 0.001, elevation: 50 },
      { lat: 0, lon: 0.002, elevation: 0 },
    ];
    const course = buildCourse(points, { smoothingSigma: 0 });
    expect(course.totalElevationGain).toBeCloseTo(0, 1);
    expect(course.totalElevationLoss).toBeCloseTo(100, 1);
  });

  it('smooths elevation noise before computing gradient', () => {
    const points: TrackPoint[] = [];
    for (let i = 0; i < 20; i++) {
      points.push({
        lat: 51.5 + i * 0.001,
        lon: 0,
        elevation: i * 5 + (i % 2 === 0 ? 1 : -1) * 2,
      });
    }
    const course = buildCourse(points);
    const grads = course.segments.map((s) => Math.tan(s.gradient));
    const max = Math.max(...grads);
    const min = Math.min(...grads);
    expect(max - min).toBeLessThan(0.1);
  });

  it('rejects fewer than 2 points', () => {
    expect(() => buildCourse([{ lat: 0, lon: 0, elevation: 0 }])).toThrow();
  });

  it('removes obvious one-point GPS detours before building distance', () => {
    const points: TrackPoint[] = [
      { lat: 51.5, lon: -0.1, elevation: 10 },
      { lat: 0, lon: 0, elevation: 10 },
      { lat: 51.5005, lon: -0.1, elevation: 11 },
      { lat: 51.501, lon: -0.1, elevation: 12 },
    ];
    const cleaned = removeGpsSpikes(points);
    expect(cleaned).toHaveLength(3);
    const course = buildCourse(points, { smoothingSigma: 0 });
    expect(course.totalDistance).toBeLessThan(150);
  });

  it('replaces isolated elevation spikes but preserves neighbouring trend', () => {
    const points: TrackPoint[] = [
      { lat: 51.5, lon: 0, elevation: 100 },
      { lat: 51.501, lon: 0, elevation: 500 },
      { lat: 51.502, lon: 0, elevation: 102 },
      { lat: 51.503, lon: 0, elevation: 103 },
    ];
    const cleaned = removeElevationSpikes(points);
    expect(cleaned[1].elevation).toBeGreaterThan(100);
    expect(cleaned[1].elevation).toBeLessThan(103);

    const course = buildCourse(points, { smoothingSigma: 0 });
    expect(course.totalElevationGain).toBeLessThan(10);
  });
});

function makeSegments(grades: number[], segmentLength = 50): Segment[] {
  return grades.map((g, i) => ({
    index: i,
    startLat: 0,
    startLon: 0,
    endLat: 0,
    endLon: 0,
    startElevation: i * Math.tan(g) * segmentLength,
    endElevation: (i + 1) * Math.tan(g) * segmentLength,
    distance: segmentLength,
    gradient: g,
    heading: 0,
  }));
}

describe('detectClimbs', () => {
  it('finds a single 1km climb at 5% average', () => {
    const grades = Array.from({ length: 20 }, () => Math.atan(0.05));
    const climbs = detectClimbs(makeSegments(grades));
    expect(climbs).toHaveLength(1);
    expect(climbs[0].length).toBeCloseTo(1000, 0);
    expect(Math.tan(climbs[0].averageGradient)).toBeCloseTo(0.05, 2);
  });

  it('rejects climbs shorter than 250m', () => {
    const grades = Array.from({ length: 2 }, () => Math.atan(0.05));
    expect(detectClimbs(makeSegments(grades))).toHaveLength(0);
  });

  it('rejects sub-3% bumps', () => {
    const grades = Array.from({ length: 20 }, () => Math.atan(0.02));
    expect(detectClimbs(makeSegments(grades))).toHaveLength(0);
  });

  it('separates two climbs joined by a long flat section', () => {
    // 12 × 50 m = 600 m of flat between the climbs — beyond the 500 m merge
    // window, so these stay two distinct climbs.
    const grades = [
      ...Array.from({ length: 8 }, () => Math.atan(0.05)),
      ...Array.from({ length: 12 }, () => 0),
      ...Array.from({ length: 8 }, () => Math.atan(0.05)),
    ];
    const climbs = detectClimbs(makeSegments(grades));
    expect(climbs).toHaveLength(2);
  });

  it('separates two climbs joined by a descent regardless of gap length', () => {
    // A genuine descent between the climbs is never merged, even when short.
    const grades = [
      ...Array.from({ length: 8 }, () => Math.atan(0.05)),
      ...Array.from({ length: 4 }, () => Math.atan(-0.05)), // 200 m descent
      ...Array.from({ length: 8 }, () => Math.atan(0.05)),
    ];
    const climbs = detectClimbs(makeSegments(grades));
    expect(climbs).toHaveLength(2);
  });

  it('categorises a 5km @ 6% climb as cat 1', () => {
    const grades = Array.from({ length: 100 }, () => Math.atan(0.06));
    const climbs = detectClimbs(makeSegments(grades));
    expect(climbs[0].category).toBe('cat1');
  });

  it('categorises a 12km @ 8% climb as HC', () => {
    const grades = Array.from({ length: 240 }, () => Math.atan(0.08));
    const climbs = detectClimbs(makeSegments(grades));
    expect(climbs[0].category).toBe('hc');
  });

  it('reports a climb with a short mid-saddle as ONE merged climb', () => {
    // Stelvio/Ventoux shape: 4 km @ 7 %, a 300 m false-flat plateau, then
    // another 4 km @ 7 %. The forward-window detector splits this into two
    // fragments; the merge step (gap 300 m < 500 m, gap grade ~0 % not a
    // descent) stitches it back into a single climb.
    const grades = [
      ...Array.from({ length: 80 }, () => Math.atan(0.07)), // 4 km
      ...Array.from({ length: 6 }, () => 0), // 300 m saddle
      ...Array.from({ length: 80 }, () => Math.atan(0.07)), // 4 km
    ];
    const climbs = detectClimbs(makeSegments(grades));
    expect(climbs).toHaveLength(1);
    // Length spans both pitches plus the saddle: 4000 + 300 + 4000 = 8300 m.
    expect(climbs[0].length).toBeCloseTo(8300, 0);
    expect(climbs[0].startSegmentIndex).toBe(0);
    expect(climbs[0].endSegmentIndex).toBe(165);
    // Gain is recomputed end-to-end across the merged span (581 m for this
    // synthetic elevation series) — the single mountain, not a fragment.
    expect(climbs[0].elevationGain).toBeCloseTo(581, 0);
    expect(Math.tan(climbs[0].averageGradient)).toBeCloseTo(0.07, 3);
    expect(climbs[0].category).toBe('cat1');
  });

  it('does not merge across a saddle longer than 500 m', () => {
    // Same two pitches but a 700 m plateau between them — too long to be a
    // false-flat on one mountain, so they remain two climbs.
    const grades = [
      ...Array.from({ length: 80 }, () => Math.atan(0.07)),
      ...Array.from({ length: 14 }, () => 0), // 700 m saddle
      ...Array.from({ length: 80 }, () => Math.atan(0.07)),
    ];
    const climbs = detectClimbs(makeSegments(grades));
    expect(climbs).toHaveLength(2);
  });
});

// Track point ~spacing helper: build a north-bound track with a fixed
// great-circle spacing between consecutive points.
function northTrack(count: number, spacingM: number, startLat = 45): TrackPoint[] {
  const dLat = spacingM / 111_320; // metres per degree of latitude
  return Array.from({ length: count }, (_, i) => ({
    lat: startLat + i * dLat,
    lon: 0,
    elevation: 100 + i, // gentle, real elevation so coverage stays 1
  }));
}

describe('track quality — sparse track detection', () => {
  it('flags a track whose median spacing exceeds 200 m', () => {
    const { quality } = cleanTrackPointsWithQuality(northTrack(10, 300));
    expect(quality.medianPointSpacingM).toBeGreaterThan(290);
    expect(quality.medianPointSpacingM).toBeLessThan(310);
    expect(quality.sparseTrack).toBe(true);
    expect(quality.warnings.some((w) => /apart on average/.test(w))).toBe(true);
  });

  it('does not flag a dense ~25 m track', () => {
    const { quality } = cleanTrackPointsWithQuality(northTrack(40, 25));
    expect(quality.sparseTrack).toBe(false);
    expect(quality.warnings.some((w) => /apart on average/.test(w))).toBe(false);
  });
});

describe('track quality — missing elevation safety', () => {
  it('warns loudly when fewer than half the points carry elevation', () => {
    // 5 points: 3 missing <ele>, 2 present → coverage 40 % < 50 %.
    const gpx = `<?xml version="1.0"?>
<gpx version="1.1"><trk><trkseg>
  <trkpt lat="45.000" lon="0.0"></trkpt>
  <trkpt lat="45.001" lon="0.0"></trkpt>
  <trkpt lat="45.002" lon="0.0"><ele>120</ele></trkpt>
  <trkpt lat="45.003" lon="0.0"></trkpt>
  <trkpt lat="45.004" lon="0.0"><ele>140</ele></trkpt>
</trkseg></trk></gpx>`;
    const { quality } = parseGpx(gpx);
    expect(quality.missingElevationCount).toBe(3);
    expect(quality.elevationCoverageRatio).toBeCloseTo(0.4, 5);
    expect(quality.missingElevationMajority).toBe(true);
    expect(quality.warnings.some((w) => /elevation data/.test(w))).toBe(true);
  });

  it('does not warn when every point carries elevation', () => {
    const gpx = `<?xml version="1.0"?>
<gpx version="1.1"><trk><trkseg>
  <trkpt lat="45.000" lon="0.0"><ele>100</ele></trkpt>
  <trkpt lat="45.001" lon="0.0"><ele>110</ele></trkpt>
  <trkpt lat="45.002" lon="0.0"><ele>120</ele></trkpt>
</trkseg></trk></gpx>`;
    const { quality } = parseGpx(gpx);
    expect(quality.elevationCoverageRatio).toBe(1);
    expect(quality.missingElevationMajority).toBe(false);
    expect(quality.warnings.some((w) => /elevation data/.test(w))).toBe(false);
  });
});

describe('track quality — non-monotonic timestamps', () => {
  it('counts timestamps that go backwards and warns', () => {
    const base = northTrack(4, 50);
    base[0].time = new Date('2026-05-29T10:00:00Z');
    base[1].time = new Date('2026-05-29T10:00:10Z');
    base[2].time = new Date('2026-05-29T10:00:05Z'); // clock jumps back
    base[3].time = new Date('2026-05-29T10:00:20Z');
    const { quality } = cleanTrackPointsWithQuality(base);
    expect(quality.nonMonotonicTimestampCount).toBe(1);
    expect(quality.warnings.some((w) => /backwards in time/.test(w))).toBe(true);
  });

  it('does not warn on monotonically increasing timestamps', () => {
    const base = northTrack(3, 50);
    base.forEach((p, i) => {
      p.time = new Date(Date.UTC(2026, 4, 29, 10, 0, i * 10));
    });
    const { quality } = cleanTrackPointsWithQuality(base);
    expect(quality.nonMonotonicTimestampCount).toBe(0);
    expect(quality.warnings.some((w) => /backwards in time/.test(w))).toBe(false);
  });
});

describe('track quality — backtracking / out-and-back overlap', () => {
  it('detects a route that doubles back on itself and warns', () => {
    // Out-and-back: ride north 4 points, then retrace south over the same
    // line. Each fold past the apex is a ~180° reversal with overlapping legs.
    const out = northTrack(4, 100);
    const back: TrackPoint[] = [];
    for (let i = out.length - 2; i >= 0; i--) {
      back.push({ ...out[i] });
    }
    const { quality } = cleanTrackPointsWithQuality([...out, ...back]);
    expect(quality.backtrackCount).toBeGreaterThanOrEqual(1);
    expect(quality.warnings.some((w) => /doubles back/.test(w))).toBe(true);
  });

  it('does not flag a normal forward-progressing track', () => {
    const { quality } = cleanTrackPointsWithQuality(northTrack(10, 100));
    expect(quality.backtrackCount).toBe(0);
    expect(quality.warnings.some((w) => /doubles back/.test(w))).toBe(false);
  });
});
