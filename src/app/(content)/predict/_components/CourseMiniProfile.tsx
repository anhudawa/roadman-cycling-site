import type { Course } from "@/lib/race-predictor/types";

interface Props {
  course: Course;
  height?: number;
  /**
   * If true, downsample to keep the SVG path light. Useful for grid layouts
   * where dozens of these render at once.
   */
  downsample?: boolean;
}

/**
 * Compact server-rendered SVG of a course's elevation profile.
 *
 * - Pure SVG, no client JS
 * - Coral wash on climb regions, gradient fill underneath the line
 * - Renders nicely at any width (preserveAspectRatio="none" so the parent
 *   container controls aspect ratio)
 */
export function CourseMiniProfile({
  course,
  height = 72,
  downsample = true,
}: Props) {
  const segments = course.segments;
  if (segments.length < 2) {
    return (
      <svg
        viewBox={`0 0 200 ${height}`}
        className="block w-full h-auto"
        aria-hidden="true"
      >
        <line
          x1={0}
          x2={200}
          y1={height - 4}
          y2={height - 4}
          stroke="rgba(241,99,99,0.4)"
        />
      </svg>
    );
  }

  // Build cumulative-distance polyline. Optionally downsample on a stride.
  const stride = downsample ? Math.max(1, Math.ceil(segments.length / 240)) : 1;
  const cumDist: number[] = [0];
  const elevations: number[] = [segments[0].startElevation];
  let cum = 0;
  for (let i = 0; i < segments.length; i++) {
    cum += segments[i].distance;
    if (i % stride === 0 || i === segments.length - 1) {
      cumDist.push(cum);
      elevations.push(segments[i].endElevation);
    }
  }

  const totalDistance = course.totalDistance;
  const minE = Math.min(...elevations);
  const maxE = Math.max(...elevations);
  const range = Math.max(40, maxE - minE);

  const W = 1000;
  const H = height;
  const padTop = 6;
  const padBottom = 4;
  const innerH = H - padTop - padBottom;

  const x = (d: number) => (d / totalDistance) * W;
  const y = (e: number) => padTop + (1 - (e - minE) / range) * innerH;

  const polyline = elevations
    .map((e, i) => `${x(cumDist[i]).toFixed(1)},${y(e).toFixed(1)}`)
    .join(" ");

  const areaPath =
    `M 0,${(H - padBottom).toFixed(1)} ` +
    `L ${polyline} ` +
    `L ${W},${(H - padBottom).toFixed(1)} Z`;

  // Stable gradient id keyed by an inexpensive hash of the data.
  const gradId = `cm-${segments.length}-${Math.round(totalDistance)}-${Math.round(maxE)}`;

  // Climb wash bands (cumulative-distance ranges).
  const bands = course.climbs.map((c, i) => ({
    key: i,
    x: x(c.startDistance),
    width: Math.max(2, x(c.endDistance) - x(c.startDistance)),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block w-full h-auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(241,99,99,0.45)" />
          <stop offset="55%" stopColor="rgba(76,18,115,0.55)" />
          <stop offset="100%" stopColor="rgba(33,1,64,0.0)" />
        </linearGradient>
      </defs>
      {bands.map((b) => (
        <rect
          key={b.key}
          x={b.x}
          y={padTop}
          width={b.width}
          height={innerH}
          fill="rgba(241,99,99,0.10)"
        />
      ))}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke="#F16363"
        strokeWidth={1.4}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
