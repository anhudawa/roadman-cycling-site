/**
 * Compact, axis-less elevation profile thumbnail.
 *
 * Designed to be rendered inside a card (typical 320×80). Uses the same
 * gradient-coloured-trapezoid language as the full `<CourseProfile>`, but
 * stripped of axes, ticks, climb labels, and the polyline outline so it
 * reads instantly at thumbnail size.
 *
 * Takes a slim `ThumbProfile` payload (downsampled buckets) rather than the
 * full `Course` so server pages can ship only what the thumbnail needs to
 * the client island — keeps the bundle small even with 50+ courses.
 */

export interface ThumbBucket {
  /** Cumulative distance in metres at the END of this bucket. */
  d: number;
  /** Smoothed elevation at the END of this bucket, metres. */
  e: number;
  /** Average gradient across this bucket, in percent (signed). */
  g: number;
}

export interface ThumbProfile {
  /** Total distance in metres. */
  totalDistance: number;
  /** Min elevation across the course (metres). */
  minElev: number;
  /** Max elevation across the course (metres). */
  maxElev: number;
  /** Starting elevation (first track point), metres. */
  startElev: number;
  /** Downsampled buckets, ordered by distance ascending. */
  buckets: ThumbBucket[];
}

interface Props {
  profile: ThumbProfile;
  width?: number;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

export function MiniElevationThumb({
  profile,
  width = 320,
  height = 80,
  className = "",
  ariaLabel,
}: Props) {
  const { totalDistance, minElev, maxElev, startElev, buckets } = profile;

  if (buckets.length === 0 || totalDistance <= 0) {
    return (
      <div
        className={`bg-white/[0.04] ${className}`}
        style={{ aspectRatio: `${width} / ${height}` }}
      />
    );
  }

  const elevRange = Math.max(40, maxElev - minElev);
  // Tight padding — no axes to make room for.
  const pad = { top: 4, right: 2, bottom: 2, left: 2 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const x = (d: number) => pad.left + (d / totalDistance) * innerW;
  const y = (e: number) =>
    pad.top + (1 - (e - minElev) / elevRange) * innerH;
  const baseY = pad.top + innerH;

  // Build trapezoids. The first bucket starts at (d=0, e=startElev); each
  // subsequent bucket picks up at the previous bucket's right edge.
  const trapezoids = buckets.map((b, i) => {
    const prevD = i === 0 ? 0 : buckets[i - 1].d;
    const prevE = i === 0 ? startElev : buckets[i - 1].e;
    const x0 = x(prevD);
    const x1 = x(b.d);
    const y0 = y(prevE);
    const y1 = y(b.e);
    const fill = colourForGrade(b.g);
    return (
      <polygon
        key={i}
        points={`${x0.toFixed(1)},${baseY.toFixed(1)} ${x0.toFixed(1)},${y0.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${baseY.toFixed(1)}`}
        fill={fill}
      />
    );
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block w-full h-full ${className}`}
      role="img"
      aria-label={
        ariaLabel ??
        `Elevation profile thumbnail — ${(totalDistance / 1000).toFixed(0)} km`
      }
    >
      {trapezoids}
    </svg>
  );
}

/**
 * Build a slim `ThumbProfile` from a full `Course`. Run on the server when
 * loading the catalog so the client only receives ~40 numbers per course.
 *
 * Kept here (next to the renderer) so the bucket count and the colour
 * mapping stay in sync.
 */
export function buildThumbProfile(
  course: {
    segments: ReadonlyArray<{
      startElevation: number;
      endElevation: number;
      distance: number;
      gradient: number;
    }>;
    totalDistance: number;
  },
  bucketCount = 48,
): ThumbProfile {
  const segments = course.segments;
  if (segments.length === 0 || course.totalDistance <= 0) {
    return {
      totalDistance: 0,
      minElev: 0,
      maxElev: 0,
      startElev: 0,
      buckets: [],
    };
  }

  const startElev = segments[0].startElevation;
  let minElev = startElev;
  let maxElev = startElev;
  for (const s of segments) {
    if (s.endElevation < minElev) minElev = s.endElevation;
    if (s.endElevation > maxElev) maxElev = s.endElevation;
  }

  const bucketSize = course.totalDistance / bucketCount;
  const buckets: ThumbBucket[] = [];

  let segIdx = 0;
  let segDistConsumed = 0; // how much of segments[segIdx] we have already absorbed
  let cursorElev = startElev;
  let cursorDist = 0;

  for (let b = 0; b < bucketCount; b++) {
    const bucketEnd = Math.min((b + 1) * bucketSize, course.totalDistance);
    let weightedRise = 0;
    let weightedRun = 0;

    while (cursorDist < bucketEnd && segIdx < segments.length) {
      const seg = segments[segIdx];
      const remainingInSeg = seg.distance - segDistConsumed;
      const remainingInBucket = bucketEnd - cursorDist;
      const take = Math.min(remainingInSeg, remainingInBucket);
      if (take <= 0) {
        // Defensive — avoid infinite loop on zero-length segments.
        segIdx++;
        segDistConsumed = 0;
        continue;
      }
      // Linear interpolation along the segment for elevation.
      const segRise = seg.endElevation - seg.startElevation;
      const segLen = Math.max(seg.distance, 1e-6);
      const frac = take / segLen;
      const rise = segRise * frac;
      weightedRise += rise;
      weightedRun += take;
      cursorElev += rise;
      cursorDist += take;
      segDistConsumed += take;
      if (segDistConsumed >= seg.distance - 1e-6) {
        segIdx++;
        segDistConsumed = 0;
      }
    }

    const grade = weightedRun > 0 ? (weightedRise / weightedRun) * 100 : 0;
    buckets.push({ d: cursorDist, e: cursorElev, g: grade });
  }

  return { totalDistance: course.totalDistance, minElev, maxElev, startElev, buckets };
}

/**
 * Colour ramp matched to the full `<CourseProfile>` so the thumbnail and the
 * detail page read as the same chart. Negative grades are descents.
 */
function colourForGrade(gradePct: number): string {
  if (gradePct < -3) return "rgba(45, 132, 220, 0.65)";
  if (gradePct < -1) return "rgba(83, 165, 220, 0.55)";
  if (gradePct <= 2) return "rgba(63, 182, 122, 0.65)";
  if (gradePct <= 5) return "rgba(242, 183, 66, 0.75)";
  if (gradePct <= 8) return "rgba(241, 99, 99, 0.85)";
  return "rgba(178, 42, 42, 0.95)";
}
