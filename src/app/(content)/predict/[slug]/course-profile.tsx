import type { Course } from "@/lib/race-predictor/types";

interface Props {
  course: Course;
  width?: number;
  height?: number;
}

/**
 * Server-rendered SVG elevation profile, gradient-coloured by steepness.
 *
 * Each segment is drawn as a coloured trapezoid:
 *   green  ≤2 %   → flat / rolling
 *   yellow 2–5 %  → moderate climb
 *   orange 5–8 %  → hard
 *   red    > 8 %  → brutal
 *
 * Colours are translucent overlays on the deep-purple base so the chart
 * stays Roadman-brand-correct without competing with coral.
 */
export function CourseProfile({ course, width = 720, height = 240 }: Props) {
  const segments = course.segments;
  if (segments.length === 0) return null;

  const totalDistance = course.totalDistance;
  const elevations: number[] = [segments[0].startElevation];
  const cumDistance: number[] = [0];
  let cum = 0;
  for (const s of segments) {
    cum += s.distance;
    cumDistance.push(cum);
    elevations.push(s.endElevation);
  }
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = Math.max(50, maxElev - minElev);
  const padding = { top: 16, right: 14, bottom: 32, left: 44 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const x = (d: number) => padding.left + (d / totalDistance) * innerW;
  const y = (e: number) =>
    padding.top + (1 - (e - minElev) / elevRange) * innerH;
  const baseY = padding.top + innerH;

  // Gradient-coloured trapezoids per segment.
  const trapezoids = segments.map((s, i) => {
    const x0 = x(cumDistance[i]);
    const x1 = x(cumDistance[i + 1]);
    const y0 = y(s.startElevation);
    const y1 = y(s.endElevation);
    const grade = Math.tan(s.gradient) * 100;
    const fill = colourForGrade(grade);
    return (
      <polygon
        key={i}
        points={`${x0.toFixed(1)},${baseY.toFixed(1)} ${x0.toFixed(1)},${y0.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${baseY.toFixed(1)}`}
        fill={fill}
      />
    );
  });

  // Outline polyline on top of the gradient trapezoids
  const points = elevations
    .map((e, i) => `${x(cumDistance[i]).toFixed(1)},${y(e).toFixed(1)}`)
    .join(" ");

  // Climb shading boxes above the elevation
  const climbBands = course.climbs.map((c, idx) => {
    const xStart = x(cumDistance[c.startSegmentIndex]);
    const xEnd = x(
      cumDistance[Math.min(c.endSegmentIndex + 1, cumDistance.length - 1)],
    );
    const label = climbLabel(c.category);
    return (
      <g key={idx}>
        <rect
          x={xStart}
          y={padding.top}
          width={Math.max(1, xEnd - xStart)}
          height={6}
          fill="#F16363"
          opacity={0.85}
          rx={1}
        />
        <text
          x={xStart + 4}
          y={padding.top + 18}
          fill="#F16363"
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight={600}
          opacity={0.95}
        >
          {label}
        </text>
      </g>
    );
  });

  // Y-axis tick labels (3 levels)
  const yTicks = [minElev, (minElev + maxElev) / 2, maxElev];

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Elevation profile: ${(totalDistance / 1000).toFixed(0)} km, ${Math.round(course.totalElevationGain)} m gain`}
      >
        {/* gradient-coloured area */}
        {trapezoids}
        {/* climb bands */}
        {climbBands}
        {/* outline */}
        <polyline
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={1}
          strokeLinejoin="round"
        />
        {/* Y-axis grid + ticks */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(t)}
              y2={y(t)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={padding.left - 6}
              y={y(t) + 4}
              fill="rgba(255,255,255,0.55)"
              fontSize="11"
              textAnchor="end"
              fontFamily="system-ui"
            >
              {Math.round(t)} m
            </text>
          </g>
        ))}
        {/* X-axis: distance ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
          <text
            key={i}
            x={x(totalDistance * f)}
            y={height - 10}
            fill="rgba(255,255,255,0.55)"
            fontSize="11"
            textAnchor="middle"
            fontFamily="system-ui"
          >
            {((totalDistance * f) / 1000).toFixed(0)} km
          </text>
        ))}
      </svg>
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-off-white/55">
          <Swatch color="#3FB67A" label="≤2%" />
          <Swatch color="#F2B742" label="2–5%" />
          <Swatch color="#F16363" label="5–8%" />
          <Swatch color="#B22A2A" label="≥8%" />
        </div>
        {course.climbs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-xs">
            {course.climbs.slice(0, 6).map((c, i) => (
              <span
                key={i}
                className="bg-coral/15 text-coral px-2 py-0.5 rounded font-medium"
              >
                {climbLabel(c.category)} · {(c.length / 1000).toFixed(1)} km @{" "}
                {(Math.tan(c.averageGradient) * 100).toFixed(1)}%
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-2.5 h-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}

/** Colour by gradient %. Ranges chosen for visual contrast on dark backgrounds. */
function colourForGrade(gradePct: number): string {
  // Negative grades → blue/teal (descents)
  if (gradePct < -3) return "rgba(45, 132, 220, 0.55)"; // strong descent
  if (gradePct < -1) return "rgba(83, 165, 220, 0.45)"; // mild descent
  if (gradePct <= 2) return "rgba(63, 182, 122, 0.55)"; // green flat/rolling
  if (gradePct <= 5) return "rgba(242, 183, 66, 0.65)"; // yellow moderate
  if (gradePct <= 8) return "rgba(241, 99, 99, 0.70)"; // coral hard
  return "rgba(178, 42, 42, 0.85)"; // red brutal
}

function climbLabel(cat: string): string {
  switch (cat) {
    case "cat4":
      return "Cat 4";
    case "cat3":
      return "Cat 3";
    case "cat2":
      return "Cat 2";
    case "cat1":
      return "Cat 1";
    case "hc":
      return "HC";
    default:
      return "Climb";
  }
}
