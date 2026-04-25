import type { Course, ClimbCategory } from "@/lib/race-predictor/types";

interface SegmentResult {
  duration: number;
  averageSpeed: number;
  riderPower: number;
}

interface Props {
  course: Course;
  segmentResults?: SegmentResult[];
}

/**
 * Per-climb breakdown cards. Shows length, average gradient, predicted
 * time and average power for each catalogued climb.
 */
export function ClimbBreakdown({ course, segmentResults }: Props) {
  if (course.climbs.length === 0) {
    return null;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {course.climbs.map((c, idx) => {
        const slice = segmentResults?.slice(
          c.startSegmentIndex,
          c.endSegmentIndex + 1,
        );
        const time =
          slice?.reduce((s, r) => s + r.duration, 0) ?? null;
        const avgPower =
          slice && slice.length > 0
            ? slice.reduce((s, r) => s + r.riderPower, 0) / slice.length
            : null;
        const avgSpeed =
          slice && slice.length > 0
            ? slice.reduce((s, r) => s + r.averageSpeed, 0) / slice.length
            : null;
        const grade = Math.tan(c.averageGradient) * 100;
        return (
          <div
            key={idx}
            className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 hover:border-coral/40 transition"
          >
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <p className="font-display text-base text-off-white uppercase tracking-wide">
                Climb {idx + 1}
              </p>
              <span className="bg-coral/15 text-coral text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                {labelClimb(c.category)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm">
              <span className="text-off-white/55">length</span>
              <span className="text-right font-display text-off-white">
                {(c.length / 1000).toFixed(1)} km
              </span>
              <span className="text-off-white/55">avg gradient</span>
              <span
                className="text-right font-display"
                style={{ color: gradeColor(grade) }}
              >
                {grade.toFixed(1)}%
              </span>
              <span className="text-off-white/55">elev gain</span>
              <span className="text-right font-display text-off-white">
                {Math.round(c.elevationGain)} m
              </span>
              {time !== null && (
                <>
                  <span className="text-off-white/55">predicted</span>
                  <span className="text-right font-display text-coral">
                    {formatTime(time)}
                  </span>
                </>
              )}
              {avgPower !== null && (
                <>
                  <span className="text-off-white/55">avg power</span>
                  <span className="text-right text-off-white/85">
                    {Math.round(avgPower)} W
                  </span>
                </>
              )}
              {avgSpeed !== null && (
                <>
                  <span className="text-off-white/55">avg speed</span>
                  <span className="text-right text-off-white/85">
                    {(avgSpeed * 3.6).toFixed(1)} km/h
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function labelClimb(cat: ClimbCategory): string {
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
  }
}

function gradeColor(grade: number): string {
  if (grade <= 2) return "#3FB67A";
  if (grade <= 5) return "#F2B742";
  if (grade <= 8) return "#F16363";
  return "#FF8585";
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}`;
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
