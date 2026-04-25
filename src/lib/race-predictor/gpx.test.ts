import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  bearing,
  gaussianSmooth,
  parseGpx,
  buildCourse,
  detectClimbs,
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

  it('separates two climbs joined by a flat section', () => {
    const grades = [
      ...Array.from({ length: 8 }, () => Math.atan(0.05)),
      ...Array.from({ length: 5 }, () => 0),
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
});
