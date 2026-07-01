import { ProfileGlyph, STAGE_TYPE_LABEL, type StageGlyphType } from "./ProfileGlyph";

export interface StageStripStage {
  stageNumber: number;
  date: string;
  startTown: string;
  finishTown: string;
  distanceKm: number | string;
  stageType: StageGlyphType;
  summitFinish: boolean;
  restDayAfter: boolean;
  /** Player's points once the stage is scored (dashboard only). */
  points?: number | null;
}

function shortDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * The horizontal 21-stage timeline (Section 8.2). Server-renderable:
 * plain overflow-x scroll with snap points, no JS. Today's stage glows
 * coral; rest days sit between tiles as thin markers.
 */
export function StageStrip({
  stages,
  todayStageNumber,
  className,
}: {
  stages: StageStripStage[];
  todayStageNumber?: number | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <ol
        aria-label="The 21 stages"
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3 [scrollbar-width:thin]"
      >
        {stages.map((stage) => {
          const isToday = stage.stageNumber === todayStageNumber;
          return (
            <li key={stage.stageNumber} className="flex snap-start items-stretch gap-2">
              <div
                className={`flex w-32 shrink-0 flex-col justify-between rounded-lg border p-3 transition-colors ${
                  isToday
                    ? "border-coral bg-coral/10 shadow-[0_0_20px_rgba(241,99,99,0.3)]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span
                    className={`font-heading text-lg leading-none ${isToday ? "text-coral" : "text-off-white"}`}
                  >
                    S{stage.stageNumber}
                  </span>
                  <span className="text-[11px] text-mid-grey">{shortDate(stage.date)}</span>
                </div>
                <ProfileGlyph
                  type={stage.stageType}
                  className={`my-2 h-5 w-full ${isToday ? "text-coral" : "text-off-white/60"}`}
                />
                <p className="truncate text-[11px] leading-tight text-off-white/70" title={`${stage.startTown} → ${stage.finishTown}`}>
                  {stage.finishTown}
                </p>
                <p className="text-[10px] text-mid-grey">
                  {Number(stage.distanceKm).toLocaleString("en-IE", { maximumFractionDigits: 1 })} km ·{" "}
                  <span className="sr-only">{STAGE_TYPE_LABEL[stage.stageType]}</span>
                  {stage.summitFinish ? "summit" : STAGE_TYPE_LABEL[stage.stageType].split(" ")[0].toLowerCase()}
                </p>
                {stage.points != null && (
                  <p className="mt-1 font-heading text-base leading-none text-coral">{stage.points} pts</p>
                )}
              </div>
              {stage.restDayAfter && (
                <div
                  className="flex w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-white/15"
                  title="Rest day — bonus transfer unlocks"
                >
                  <span className="rotate-90 whitespace-nowrap text-[9px] uppercase tracking-[0.2em] text-mid-grey">
                    Rest day
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
