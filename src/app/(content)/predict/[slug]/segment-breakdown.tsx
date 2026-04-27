import type { Course, CourseResult } from "@/lib/race-predictor/types";

interface Props {
  course: Course;
  result: CourseResult;
}

type SectionType = "climb" | "descent" | "flat" | "rolling";

interface Section {
  type: SectionType;
  label: string;
  /** m */
  distance: number;
  /** m, can be negative on descents */
  elevDelta: number;
  /** % */
  avgGradient: number;
  /** km/h */
  avgSpeed: number;
  /** s */
  durationS: number;
  /** s, cumulative at end of this section */
  cumDurationS: number;
}

/**
 * Server-rendered colour-coded segment breakdown.
 *
 * Marmotte-class courses have 3500+ raw segments. We collapse them into
 * 10–20 "sections" using `course.climbs` as canonical climbs and treating
 * the gaps between climbs as connectors (descent / flat / rolling) based
 * on net gradient.
 */
export function SegmentBreakdown({ course, result }: Props) {
  const sections = groupSegments(course, result);
  if (sections.length === 0) return null;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-5 mb-8">
      <p className="text-coral text-xs uppercase tracking-wide mb-1">
        Section-by-section
      </p>
      <p className="text-off-white/60 text-sm mb-4">
        What speed will you do on each part of the course? Climbs in coral,
        descents in blue, flats neutral.
      </p>

      {/* Desktop / tablet: real table with sticky header */}
      <div className="hidden md:block max-h-[28rem] overflow-y-auto rounded border border-white/5">
        <table className="w-full text-sm text-off-white/90 border-collapse">
          <thead className="sticky top-0 z-10 bg-deep-purple text-off-white/70 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-3 py-2">Section</th>
              <th className="text-right font-medium px-3 py-2">Distance</th>
              <th className="text-right font-medium px-3 py-2">Elev Δ</th>
              <th className="text-right font-medium px-3 py-2">Gradient</th>
              <th className="text-right font-medium px-3 py-2">Avg speed</th>
              <th className="text-right font-medium px-3 py-2">Time</th>
              <th className="text-right font-medium px-3 py-2">Elapsed</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s, i) => (
              <tr
                key={i}
                className="border-t border-white/5 hover:bg-coral/10 transition-colors"
              >
                <td className="px-3 py-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${chipClassFor(s.type)}`}
                  >
                    {s.label}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {(s.distance / 1000).toFixed(1)} km
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {s.elevDelta >= 0 ? "+" : ""}
                  {Math.round(s.elevDelta)} m
                </td>
                <td
                  className="px-3 py-2 text-right tabular-nums font-medium"
                  style={{ color: textColourForGrade(s.avgGradient) }}
                >
                  {s.avgGradient >= 0 ? "+" : ""}
                  {s.avgGradient.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {s.avgSpeed.toFixed(1)} km/h
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-off-white/80">
                  {formatDuration(s.durationS)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-off-white/60">
                  {formatDuration(s.cumDurationS)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="md:hidden space-y-2">
        {sections.map((s, i) => (
          <li
            key={i}
            className={`rounded border ${cardBorderFor(s.type)} p-3 hover:bg-coral/10 transition-colors`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${chipClassFor(s.type)}`}
              >
                {s.label}
              </span>
              <span className="text-off-white/60 text-xs tabular-nums">
                Elapsed {formatDuration(s.cumDurationS)}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <Cell label="Distance" value={`${(s.distance / 1000).toFixed(1)} km`} />
              <Cell
                label="Elev Δ"
                value={`${s.elevDelta >= 0 ? "+" : ""}${Math.round(s.elevDelta)} m`}
              />
              <Cell
                label="Gradient"
                value={`${s.avgGradient >= 0 ? "+" : ""}${s.avgGradient.toFixed(1)}%`}
                color={textColourForGrade(s.avgGradient)}
              />
              <Cell label="Avg speed" value={`${s.avgSpeed.toFixed(1)} km/h`} />
              <Cell label="Time" value={formatDuration(s.durationS)} />
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-3 text-xs text-off-white/55 flex-wrap">
        <LegendChip type="climb" label="Climb" />
        <LegendChip type="descent" label="Descent" />
        <LegendChip type="rolling" label="Rolling" />
        <LegendChip type="flat" label="Flat" />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <>
      <dt className="text-off-white/55 text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd
        className="text-right tabular-nums font-medium"
        style={color ? { color } : undefined}
      >
        {value}
      </dd>
    </>
  );
}

function LegendChip({ type, label }: { type: SectionType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-sm ${swatchClassFor(type)}`}
      />
      <span>{label}</span>
    </span>
  );
}

function chipClassFor(type: SectionType): string {
  switch (type) {
    case "climb":
      return "bg-coral/20 text-coral";
    case "descent":
      return "bg-sky-500/20 text-sky-300";
    case "rolling":
      return "bg-emerald-500/15 text-emerald-300";
    case "flat":
    default:
      return "bg-white/10 text-off-white/80";
  }
}

function swatchClassFor(type: SectionType): string {
  switch (type) {
    case "climb":
      return "bg-coral/70";
    case "descent":
      return "bg-sky-400/70";
    case "rolling":
      return "bg-emerald-400/70";
    case "flat":
    default:
      return "bg-white/30";
  }
}

function cardBorderFor(type: SectionType): string {
  switch (type) {
    case "climb":
      return "border-coral/30 bg-coral/[0.04]";
    case "descent":
      return "border-sky-400/25 bg-sky-400/[0.04]";
    case "rolling":
      return "border-emerald-400/20 bg-emerald-400/[0.03]";
    case "flat":
    default:
      return "border-white/10";
  }
}

/**
 * Same palette as `course-profile.tsx#colourForGrade`, but returning solid
 * (non-translucent) hex strings so the gradient cell stays legible against
 * the dark table row background.
 */
function textColourForGrade(gradePct: number): string {
  if (gradePct < -3) return "#2D84DC"; // strong descent
  if (gradePct < -1) return "#53A5DC"; // mild descent
  if (gradePct <= 2) return "#3FB67A"; // green flat / rolling
  if (gradePct <= 5) return "#F2B742"; // yellow moderate
  if (gradePct <= 8) return "#F16363"; // coral hard
  return "#B22A2A"; // red brutal
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Group raw segments into ~10–20 digestible sections.
 *
 * Strategy: use detected `course.climbs` as canonical "climb" sections.
 * The gaps between climbs (and the head/tail of the course) become
 * "connector" sections, which we further classify by net gradient:
 *   net > +2 %  → rolling-up (rare, but shown as "rolling")
 *   net < -2 %  → descent
 *   |net| ≤ 2 % → flat / rolling
 *
 * If a connector spans a wide range of terrain (e.g. valley + descent),
 * we split it at sign-changes of a 200-m smoothed gradient so a 20 km
 * descent doesn't get averaged with a 5 km flat into "rolling".
 */
export function groupSegments(
  course: Course,
  result: CourseResult,
): Section[] {
  const segs = course.segments;
  if (segs.length === 0) return [];
  const climbs = [...course.climbs].sort(
    (a, b) => a.startSegmentIndex - b.startSegmentIndex,
  );

  // Build [start, end, isClimb, climbIdx] ranges over the segment array.
  type Range = { start: number; end: number; climbIdx: number | null };
  const ranges: Range[] = [];
  let cursor = 0;
  climbs.forEach((c, idx) => {
    if (c.startSegmentIndex > cursor) {
      ranges.push({
        start: cursor,
        end: c.startSegmentIndex - 1,
        climbIdx: null,
      });
    }
    ranges.push({
      start: c.startSegmentIndex,
      end: c.endSegmentIndex,
      climbIdx: idx,
    });
    cursor = c.endSegmentIndex + 1;
  });
  if (cursor <= segs.length - 1) {
    ranges.push({ start: cursor, end: segs.length - 1, climbIdx: null });
  }

  const sections: Section[] = [];
  let cumDuration = 0;
  const totalClimbs = climbs.length;

  for (const r of ranges) {
    if (r.climbIdx !== null) {
      // Canonical climb section.
      const s = summariseRange(segs, result, r.start, r.end);
      const label =
        totalClimbs === 1
          ? "Climb"
          : `Climb ${r.climbIdx + 1} of ${totalClimbs}`;
      cumDuration += s.durationS;
      sections.push({
        type: "climb",
        label,
        ...s,
        cumDurationS: cumDuration,
      });
    } else {
      // Connector: split at gradient sign-changes if it's long enough.
      const subRanges = splitConnector(segs, r.start, r.end);
      for (const sub of subRanges) {
        const s = summariseRange(segs, result, sub.start, sub.end);
        const type = classifyConnector(s.avgGradient);
        const label = labelForConnector(type);
        cumDuration += s.durationS;
        sections.push({
          type,
          label,
          ...s,
          cumDurationS: cumDuration,
        });
      }
    }
  }

  return sections;
}

interface RangeSummary {
  distance: number;
  elevDelta: number;
  avgGradient: number;
  avgSpeed: number;
  durationS: number;
}

function summariseRange(
  segs: Course["segments"],
  result: CourseResult,
  startIdx: number,
  endIdx: number,
): RangeSummary {
  let distance = 0;
  let durationS = 0;
  for (let i = startIdx; i <= endIdx; i++) {
    distance += segs[i].distance;
    durationS += result.segmentResults[i]?.duration ?? 0;
  }
  const elevDelta = segs[endIdx].endElevation - segs[startIdx].startElevation;
  const avgGradient = distance > 0 ? (elevDelta / distance) * 100 : 0;
  const avgSpeedMs = durationS > 0 ? distance / durationS : 0;
  return {
    distance,
    elevDelta,
    avgGradient,
    avgSpeed: avgSpeedMs * 3.6,
    durationS,
  };
}

function classifyConnector(gradePct: number): SectionType {
  if (gradePct > 2) return "rolling";
  if (gradePct < -2) return "descent";
  if (Math.abs(gradePct) <= 0.5) return "flat";
  return "rolling";
}

function labelForConnector(type: SectionType): string {
  switch (type) {
    case "descent":
      return "Descent";
    case "rolling":
      return "Rolling";
    case "flat":
      return "Flat";
    default:
      return "Section";
  }
}

/**
 * Split a long connector at gradient sign-changes so a single section
 * doesn't muddle a long descent with a long flat. Uses a coarse window
 * (~500 m) so we don't over-fragment on rolling terrain.
 *
 * Returns inclusive [start, end] ranges covering exactly [r.start, r.end].
 */
function splitConnector(
  segs: Course["segments"],
  start: number,
  end: number,
): Array<{ start: number; end: number }> {
  // Total length of the connector
  let totalLen = 0;
  for (let i = start; i <= end; i++) totalLen += segs[i].distance;

  // Short connectors stay as one section; otherwise split at sign changes.
  if (totalLen < 2000 || end - start < 4) {
    return [{ start, end }];
  }

  const WINDOW_M = 500;
  // Build coarse blocks of ~500 m and label each by net gradient sign.
  const blocks: Array<{ start: number; end: number; sign: -1 | 0 | 1 }> = [];
  let bStart = start;
  let bDist = 0;
  let bElev = 0;
  for (let i = start; i <= end; i++) {
    bDist += segs[i].distance;
    bElev += segs[i].endElevation - segs[i].startElevation;
    if (bDist >= WINDOW_M || i === end) {
      const grade = bDist > 0 ? (bElev / bDist) * 100 : 0;
      const sign: -1 | 0 | 1 = grade > 1 ? 1 : grade < -1 ? -1 : 0;
      blocks.push({ start: bStart, end: i, sign });
      bStart = i + 1;
      bDist = 0;
      bElev = 0;
    }
  }

  // Merge consecutive blocks with the same sign.
  const merged: Array<{ start: number; end: number; sign: -1 | 0 | 1 }> = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (prev !== undefined && prev.sign === b.sign) {
      prev.end = b.end;
    } else {
      merged.push({ start: b.start, end: b.end, sign: b.sign });
    }
  }

  // Drop tiny fragments by merging them into a neighbour.
  const MIN_FRAGMENT_M = 1500;
  const result: Array<{ start: number; end: number }> = [];
  for (const m of merged) {
    let len = 0;
    for (let i = m.start; i <= m.end; i++) len += segs[i].distance;
    if (len < MIN_FRAGMENT_M && result.length > 0) {
      result[result.length - 1].end = m.end;
    } else {
      result.push({ start: m.start, end: m.end });
    }
  }

  return result.length > 0 ? result : [{ start, end }];
}
