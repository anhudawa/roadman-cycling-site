import type { Climb, Course } from "@/lib/race-predictor/types";

interface SegmentTableProps {
  course: Course;
  /** Optional per-segment power targets aligned to course.segments. */
  pacingPlan?: number[] | null;
  /** Average rider speed (m/s) from the prediction — used to estimate climb durations. */
  averageSpeed: number;
}

const CAT_COLORS: Record<string, string> = {
  cat4: "#FBBF24",
  cat3: "#F97316",
  cat2: "#EF4444",
  cat1: "#DC2626",
  hc: "#7F1D1D",
};

const CAT_LABELS: Record<string, string> = {
  cat4: "Cat 4",
  cat3: "Cat 3",
  cat2: "Cat 2",
  cat1: "Cat 1",
  hc: "HC",
};

function formatDuration(s: number): string {
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  if (m < 60) return `${m}:${sec.toString().padStart(2, "0")}`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm.toString().padStart(2, "0")}m`;
}

/**
 * Per-climb breakdown table. Estimates duration on each climb from the
 * average ride speed; if a pacing plan is supplied we average it across the
 * climb's segment range to surface the target wattage.
 */
export function SegmentTable({ course, pacingPlan, averageSpeed }: SegmentTableProps) {
  if (course.climbs.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6 text-center">
        <p
          className="text-[0.65rem] tracking-[0.22em] uppercase text-foreground-subtle"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          NO CATEGORISED CLIMBS
        </p>
        <p className="text-foreground-muted text-sm mt-1">
          Mostly rolling — pacing depends on wind and fatigue.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <h3
          className="text-[0.7rem] tracking-[0.22em] uppercase text-coral"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          CLIMB BREAKDOWN
        </h3>
        <span className="text-xs text-foreground-subtle">
          {course.climbs.length} climb{course.climbs.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {/* Header row (desktop only) */}
        <div
          className="hidden md:grid grid-cols-[60px_1fr_90px_90px_90px_110px] gap-4 px-5 py-2 text-[0.6rem] tracking-[0.18em] uppercase text-foreground-subtle"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          <span>CAT</span>
          <span>POSITION</span>
          <span className="text-right">LENGTH</span>
          <span className="text-right">AVG GRAD</span>
          <span className="text-right">EST TIME</span>
          <span className="text-right">{pacingPlan ? "TARGET POWER" : ""}</span>
        </div>

        {course.climbs.map((c, i) => (
          <ClimbRow
            key={i}
            climb={c}
            index={i}
            course={course}
            pacingPlan={pacingPlan}
            averageSpeed={averageSpeed}
          />
        ))}
      </div>
    </div>
  );
}

function ClimbRow({
  climb,
  index,
  course,
  pacingPlan,
  averageSpeed,
}: {
  climb: Climb;
  index: number;
  course: Course;
  pacingPlan?: number[] | null;
  averageSpeed: number;
}) {
  const startKm = climb.startDistance / 1000;
  const lengthKm = climb.length / 1000;
  const grad = climb.averageGradient * 100;

  // Climb duration estimate: scale base speed by gradient penalty.
  const climbSpeedFactor = Math.max(0.25, 1 - grad * 0.085);
  const estTime = climb.length / Math.max(2, averageSpeed * climbSpeedFactor);

  // Target power averaged across segment range if pacing plan available.
  let targetPower: number | null = null;
  if (pacingPlan && pacingPlan.length > 0) {
    const start = climb.startSegmentIndex;
    const end = Math.min(climb.endSegmentIndex, pacingPlan.length - 1);
    let sum = 0;
    let count = 0;
    for (let i = start; i <= end; i++) {
      if (Number.isFinite(pacingPlan[i])) {
        sum += pacingPlan[i];
        count++;
      }
    }
    if (count > 0) targetPower = Math.round(sum / count);
  }

  const color = CAT_COLORS[climb.category];
  const label = CAT_LABELS[climb.category];
  const courseTotalKm = course.totalDistance / 1000;
  const startPct = (startKm / courseTotalKm) * 100;
  const lenPct = Math.max(2, (lengthKm / courseTotalKm) * 100);

  return (
    <div className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
      {/* Mobile: stacked. Desktop: grid. */}
      <div className="md:grid md:grid-cols-[60px_1fr_90px_90px_90px_110px] md:gap-4 md:items-center">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: color }}
          />
          <span
            className="font-heading text-sm uppercase tracking-wider text-off-white"
            style={{ color }}
          >
            {label}
          </span>
        </div>

        <div className="md:flex md:items-center md:gap-3">
          <span className="md:hidden text-[0.62rem] tracking-[0.18em] uppercase text-foreground-subtle">
            POSITION
          </span>
          <div className="relative h-1.5 rounded-full bg-white/8 overflow-hidden flex-1 mt-1 md:mt-0">
            <div
              className="absolute top-0 bottom-0 rounded-full"
              style={{
                left: `${startPct}%`,
                width: `${lenPct}%`,
                background: color,
                boxShadow: `0 0 8px ${color}aa`,
              }}
            />
          </div>
          <span
            className="hidden md:block text-[0.65rem] text-foreground-subtle ml-2 whitespace-nowrap"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            KM {startKm.toFixed(0)}
          </span>
        </div>

        <RowStat label="LENGTH" value={`${lengthKm.toFixed(1)} km`} mobile />
        <RowStat label="AVG GRAD" value={`${grad.toFixed(1)}%`} mobile color={color} />
        <RowStat label="EST TIME" value={formatDuration(estTime)} mobile />
        <RowStat
          label={pacingPlan ? "TARGET" : ""}
          value={targetPower != null ? `${targetPower} W` : "—"}
          mobile
        />
      </div>
    </div>
  );
}

function RowStat({
  label,
  value,
  mobile,
  color,
}: {
  label: string;
  value: string;
  mobile?: boolean;
  color?: string;
}) {
  if (mobile) {
    return (
      <>
        <div className="hidden md:block text-right">
          <span
            className="text-sm text-off-white tabular-nums"
            style={color ? { color } : undefined}
          >
            {value}
          </span>
        </div>
        <div className="md:hidden flex items-baseline justify-between mt-1.5 first:mt-2">
          {label && (
            <span
              className="text-[0.6rem] tracking-[0.18em] uppercase text-foreground-subtle"
              style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            >
              {label}
            </span>
          )}
          <span
            className="text-sm text-off-white tabular-nums"
            style={color ? { color } : undefined}
          >
            {value}
          </span>
        </div>
      </>
    );
  }
  return (
    <div className="text-right">
      <span className="text-sm text-off-white tabular-nums">{value}</span>
    </div>
  );
}
