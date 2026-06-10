import Link from "next/link";
import type { Stage } from "@/data/tour-de-france-2026";
import { STAGE_TYPE_COLOR, STAGE_TYPE_TAG } from "./stageMeta";
import { StageTypeIcon } from "./StageTypeIcon";
import { formatStageDate } from "@/lib/tour";

/**
 * A single stage in the timeline. `state` drives a subtle status treatment
 * in live mode: the day's stage gets a yellow ring, finished stages dim.
 */
export function StageCard({
  stage,
  state = "default",
  className = "",
}: {
  stage: Stage;
  state?: "default" | "today" | "done";
  className?: string;
}) {
  const color = STAGE_TYPE_COLOR[stage.type];
  const dateLabel = formatStageDate(stage.date).replace(/^\w+ /, ""); // drop weekday

  return (
    <Link
      href={`/tour-de-france/stage/${stage.number}`}
      aria-label={`Stage ${stage.number}: ${stage.start} to ${stage.finish}`}
      className={`group relative flex flex-col rounded-xl border bg-background-elevated overflow-hidden transition-all ${
        state === "today"
          ? "border-jersey-yellow/70 shadow-[0_0_24px_rgba(255,215,0,0.18)]"
          : "border-white/8 hover:border-white/25"
      } ${state === "done" ? "opacity-60 hover:opacity-100" : ""} ${className}`}
    >
      {/* Type accent spine */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: color }}
      />

      <div className="p-4 pl-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading text-jersey-yellow text-sm tracking-widest">
            STAGE {stage.number}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-heading tracking-wider"
            style={{ color, backgroundColor: `${color}22` }}
          >
            <StageTypeIcon type={stage.type} className="w-3.5 h-3.5" />
            {STAGE_TYPE_TAG[stage.type].toUpperCase()}
          </span>
        </div>

        <p className="text-[11px] text-foreground-subtle font-heading tracking-wider mb-2">
          {stage.dayOfWeek.slice(0, 3).toUpperCase()} · {dateLabel.toUpperCase()}
        </p>

        <p className="font-heading text-off-white text-lg leading-tight group-hover:text-jersey-yellow transition-colors">
          {stage.start}
          <span className="text-foreground-subtle px-1">→</span>
          {stage.finish}
        </p>

        <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-foreground-muted">
          <span className="tabular-nums">{stage.distanceKm} km</span>
          {stage.summitFinish && (
            <span className="text-jersey-yellow/90 font-heading tracking-wider">
              SUMMIT
            </span>
          )}
          {state === "today" && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-jersey-yellow font-heading tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-jersey-yellow opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-jersey-yellow" />
              </span>
              TODAY
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
