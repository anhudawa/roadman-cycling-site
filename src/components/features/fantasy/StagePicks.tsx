import { STAGE_PREVIEWS } from "@/data/fantasy/stage-previews";
import { STAGE_TYPE_LABEL, type StageGlyphType } from "./ProfileGlyph";

export interface StagePicksStage {
  stageNumber: number;
  startTown: string;
  finishTown: string;
  distanceKm: number | string;
  stageType: StageGlyphType;
  summitFinish: boolean;
}

/**
 * Stage-by-stage team-selection guide for the landing page. Pairs each
 * stage's route/profile (from stages-2026.json) with a short note on the
 * rider TYPE that suits it (from stage-previews.ts). Pure server-rendered
 * content — it exists to help a player spend their 100 credits well.
 */
export function StagePicks({ stages }: { stages: StagePicksStage[] }) {
  const previews = new Map(STAGE_PREVIEWS.map((p) => [p.stageNumber, p]));
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stages.map((stage) => {
        const preview = previews.get(stage.stageNumber);
        if (!preview) return null;
        const profile = stage.summitFinish
          ? "Summit finish"
          : STAGE_TYPE_LABEL[stage.stageType];
        return (
          <li
            key={stage.stageNumber}
            className="flex flex-col rounded-xl border border-white/10 bg-deep-purple/40 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-heading text-xl tracking-wide text-off-white">
                STAGE {stage.stageNumber}
              </span>
              <span className="rounded-full border border-jersey-yellow/40 bg-jersey-yellow/10 px-3 py-1 font-heading text-xs tracking-[0.15em] text-jersey-yellow">
                {preview.pick}
              </span>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-mid-grey">
              {stage.startTown} → {stage.finishTown} · {profile}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-off-white/75">{preview.note}</p>
          </li>
        );
      })}
    </ol>
  );
}
