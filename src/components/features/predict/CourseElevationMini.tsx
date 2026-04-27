import type { Course } from "@/lib/race-predictor/types";

interface CourseElevationMiniProps {
  /** Either pass a full Course, or a compact `[[distM, elevM], ...]` profile. */
  course?: Course;
  profile?: number[][];
  width?: number;
  height?: number;
  /** Sample density — number of polyline points along the x-axis. */
  samples?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Compact SVG elevation thumbnail for course cards. Renders distance-vs-elevation
 * with a coral fill that fades out — designed to read at <240px wide.
 */
export function CourseElevationMini({
  course,
  profile,
  width = 240,
  height = 64,
  samples = 80,
  className = "",
  ariaLabel,
}: CourseElevationMiniProps) {
  // Resolve to a list of (distance, elevation) sample points.
  const samplePts: { dist: number; elev: number }[] = [];
  if (profile && profile.length > 0) {
    for (const [d, e] of profile) samplePts.push({ dist: d, elev: e });
  } else if (course && course.segments.length > 0) {
    let acc = 0;
    samplePts.push({ dist: 0, elev: course.segments[0].startElevation });
    for (const s of course.segments) {
      acc += s.distance;
      samplePts.push({ dist: acc, elev: s.endElevation });
    }
  }
  if (samplePts.length === 0) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true" />
    );
  }

  const total = samplePts[samplePts.length - 1].dist || 1;
  let minElev = Infinity;
  let maxElev = -Infinity;
  for (const p of samplePts) {
    if (p.elev < minElev) minElev = p.elev;
    if (p.elev > maxElev) maxElev = p.elev;
  }
  const span = Math.max(maxElev - minElev, 1);

  // Sample uniformly along distance from samplePts.
  const points: { x: number; y: number }[] = [];
  let cursor = 0;
  for (let i = 0; i <= samples; i++) {
    const target = (i / samples) * total;
    while (cursor < samplePts.length - 1 && samplePts[cursor + 1].dist < target) {
      cursor++;
    }
    const a = samplePts[cursor];
    const b = samplePts[Math.min(cursor + 1, samplePts.length - 1)];
    const range = Math.max(b.dist - a.dist, 1);
    const t = (target - a.dist) / range;
    const elev = a.elev + (b.elev - a.elev) * t;
    const x = (i / samples) * width;
    const y = height - ((elev - minElev) / span) * (height - 4) - 2;
    points.push({ x, y });
  }

  const pad = 1;
  const linePath =
    "M " +
    points
      .map((p, i) =>
        i === 0 ? `${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
      )
      .join(" ");
  const fillPath =
    `M ${points[0].x} ${height - pad} ` +
    "L " +
    points.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ") +
    ` L ${points[points.length - 1].x} ${height - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`mini-fill-${samples}-${width}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F16363" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F16363" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#mini-fill-${samples}-${width})`} />
      <path
        d={linePath}
        fill="none"
        stroke="#F16363"
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
