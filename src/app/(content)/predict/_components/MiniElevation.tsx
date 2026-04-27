import type { Course } from "@/lib/race-predictor/types";

interface Props {
  course: Course;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Compact server-renderable SVG elevation. No axes/labels — pure shape
 * for use inside cards and pickers. Climb regions tinted coral.
 */
export function MiniElevation({
  course,
  width = 320,
  height = 64,
  className,
}: Props) {
  const segments = course.segments;
  if (segments.length === 0) return null;

  const totalDistance = course.totalDistance;
  const elevations: number[] = [];
  const cumDistance: number[] = [];
  let cum = 0;
  elevations.push(segments[0].startElevation);
  cumDistance.push(0);
  for (const s of segments) {
    cum += s.distance;
    cumDistance.push(cum);
    elevations.push(s.endElevation);
  }
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = Math.max(50, maxElev - minElev);

  const x = (d: number) => (d / totalDistance) * width;
  const y = (e: number) => (1 - (e - minElev) / elevRange) * height;

  const points = elevations
    .map((e, i) => `${x(cumDistance[i]).toFixed(1)},${y(e).toFixed(1)}`)
    .join(" ");
  const areaPath = `M 0,${height} L ${points} L ${width},${height} Z`;
  const gradId = `mini-grad-${Math.round(totalDistance)}-${Math.round(maxElev)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className ?? "w-full h-full"}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(241, 99, 99, 0.5)" />
          <stop offset="100%" stopColor="rgba(76, 18, 115, 0)" />
        </linearGradient>
      </defs>
      {course.climbs.map((c, idx) => {
        const xs = x(cumDistance[c.startSegmentIndex]);
        const xe = x(
          cumDistance[Math.min(c.endSegmentIndex + 1, cumDistance.length - 1)],
        );
        return (
          <rect
            key={idx}
            x={xs}
            y={0}
            width={Math.max(1, xe - xs)}
            height={height}
            fill="rgba(241, 99, 99, 0.15)"
          />
        );
      })}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline
        points={points}
        fill="none"
        stroke="#F16363"
        strokeWidth={1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
