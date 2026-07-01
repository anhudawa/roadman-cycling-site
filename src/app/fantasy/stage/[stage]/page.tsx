import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { fantasyRiders, fantasyScoringEvents, fantasyStageResults, fantasyStages } from "@/lib/db/schema";
import { deadlineForStage, loadGameConfig } from "@/lib/fantasy/queries";
import { dreamTeam } from "@/lib/fantasy/scoring";
import { STAGE_ANGLE } from "@/lib/fantasy/emails";
import { ProfileGlyph, STAGE_TYPE_LABEL, type StageGlyphType } from "@/components/features/fantasy/ProfileGlyph";
import stagesData from "@/data/fantasy/stages-2026.json";

export const revalidate = 60;

interface StageInfo {
  stageNumber: number;
  date: string;
  startTown: string;
  finishTown: string;
  distanceKm: string | number;
  stageType: StageGlyphType;
  summitFinish: boolean;
  restDayAfter: boolean;
  startTimeCest: Date | null;
  roadmanTake: string | null;
}

/**
 * Stage detail (Section 8.2 — the stage strip taps through to here):
 * the route facts, the Roadman take once approved, who the stage
 * suits, the transfer deadline, and the published top 10 after
 * scoring. Resilient like the landing page: route facts come from the
 * verified data file when the DB is unreachable.
 */
async function getStage(stageNumber: number): Promise<{
  stage: StageInfo;
  top10: { position: number; name: string }[];
  teamOfTheStage: { name: string; points: number }[];
}> {
  const fallback = stagesData.stages.find((s) => s.stageNumber === stageNumber);
  let stage: StageInfo | null = fallback
    ? { ...fallback, stageType: fallback.stageType as StageGlyphType, startTimeCest: null, roadmanTake: null }
    : null;
  let top10: { position: number; name: string }[] = [];
  let teamOfTheStage: { name: string; points: number }[] = [];

  try {
    const [row] = await db.select().from(fantasyStages).where(eq(fantasyStages.stageNumber, stageNumber));
    if (row) stage = row;

    const [result] = await db
      .select()
      .from(fantasyStageResults)
      .where(eq(fantasyStageResults.stageNumber, stageNumber));
    if (result?.status === "published") {
      const finishers = ((result.payload as { finishers?: { position: number; riderId: number }[] }).finishers ?? [])
        .filter((f) => f.position <= 10)
        .sort((a, b) => a.position - b.position);
      if (finishers.length > 0) {
        const riders = await db
          .select({ id: fantasyRiders.id, name: fantasyRiders.name })
          .from(fantasyRiders)
          .where(inArray(fantasyRiders.id, finishers.map((f) => f.riderId)));
        const nameById = new Map(riders.map((r) => [r.id, r.name]));
        top10 = finishers.map((f) => ({ position: f.position, name: nameById.get(f.riderId) ?? "—" }));
      }

      // Team of the Stage (FPL Dream Team, per stage): the eight riders
      // every manager wishes they'd picked.
      const events = await db
        .select({
          stageNumber: fantasyScoringEvents.stageNumber,
          riderId: fantasyScoringEvents.riderId,
          rule: fantasyScoringEvents.rule,
          points: fantasyScoringEvents.points,
        })
        .from(fantasyScoringEvents)
        .where(eq(fantasyScoringEvents.stageNumber, stageNumber));
      const best = dreamTeam(events, 8);
      if (best.length > 0) {
        const dreamRiders = await db
          .select({ id: fantasyRiders.id, name: fantasyRiders.name })
          .from(fantasyRiders)
          .where(inArray(fantasyRiders.id, best.map((b) => b.riderId)));
        const dreamNameById = new Map(dreamRiders.map((r) => [r.id, r.name]));
        teamOfTheStage = best.map((b) => ({
          name: dreamNameById.get(b.riderId) ?? "—",
          points: b.points,
        }));
      }
    }
  } catch {
    // DB unreachable — the data-file fallback carries the page.
  }

  if (!stage) notFound();
  return { stage, top10, teamOfTheStage };
}

export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }): Promise<Metadata> {
  const { stage } = await params;
  const info = stagesData.stages.find((s) => s.stageNumber === Number(stage));
  if (!info) return { title: "Stage" };
  return {
    title: `Stage ${info.stageNumber}: ${info.startTown} → ${info.finishTown}`,
    description: `${info.distanceKm} km, ${info.stageType}${info.summitFinish ? ", summit finish" : ""}. The fantasy angle, deadline, and result.`,
  };
}

export default async function StageDetailPage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage: stageParam } = await params;
  const stageNumber = Number(stageParam);
  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 21) notFound();

  const { stage, top10, teamOfTheStage } = await getStage(stageNumber);
  const config = await loadGameConfig();
  const deadline = deadlineForStage(
    {
      stageNumber,
      date: typeof stage.date === "string" ? stage.date : String(stage.date),
      startTimeCest: stage.startTimeCest,
    },
    config.pickingDeadlineIso,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-3 text-sm text-mid-grey">
        {stageNumber > 1 ? (
          <Link href={`/fantasy/stage/${stageNumber - 1}`} className="hover:text-off-white">
            ← Stage {stageNumber - 1}
          </Link>
        ) : (
          <span />
        )}
        <span className="flex-1" />
        {stageNumber < 21 && (
          <Link href={`/fantasy/stage/${stageNumber + 1}`} className="hover:text-off-white">
            Stage {stageNumber + 1} →
          </Link>
        )}
      </div>

      <p className="mt-4 font-heading text-sm tracking-[0.3em] text-jersey-yellow">
        {new Date(`${stage.date}T12:00:00Z`)
          .toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
          .toUpperCase()}
        {stage.summitFinish ? " · SUMMIT FINISH" : ""}
      </p>
      <h1 className="mt-2 font-heading text-5xl leading-[0.95] tracking-wide sm:text-6xl">
        STAGE {stageNumber}: {stage.startTown.toUpperCase()} → {stage.finishTown.toUpperCase()}
      </h1>
      <div className="mt-4 flex items-center gap-4 text-off-white/80">
        <ProfileGlyph type={stage.stageType} className="h-8 w-20 text-jersey-yellow" />
        <span>
          {Number(stage.distanceKm).toLocaleString("en-IE", { maximumFractionDigits: 1 })} km ·{" "}
          {STAGE_TYPE_LABEL[stage.stageType]}
        </span>
      </div>

      {stage.roadmanTake && (
        <section className="mt-8 rounded-xl border border-white/10 bg-deep-purple/40 p-5">
          <h2 className="font-heading text-sm tracking-[0.3em] text-jersey-yellow">THE ROADMAN TAKE</h2>
          <p className="mt-2 leading-relaxed text-off-white/85">{stage.roadmanTake}</p>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-heading text-2xl tracking-wide">THE FANTASY ANGLE</h2>
        <p className="mt-2 leading-relaxed text-off-white/75">{STAGE_ANGLE[stage.stageType]}</p>
        <p className="mt-3 text-sm text-mid-grey">
          Transfers and captain lock at{" "}
          <strong className="text-jersey-yellow">
            {deadline.toLocaleString("en-IE", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/Dublin",
            })}{" "}
            Irish time
          </strong>
          {!stage.startTimeCest && " (provisional until the official start time publishes)"}
          .
        </p>
        {stage.restDayAfter && (
          <p className="mt-2 text-sm text-jersey-yellow/90">
            Rest day follows this stage — your bonus transfer unlocks the morning after.
          </p>
        )}
      </section>

      {top10.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-2xl tracking-wide">THE RESULT</h2>
          <ol className="mt-3 divide-y divide-white/5">
            {top10.map((row) => (
              <li key={row.position} className="flex items-center gap-4 py-2">
                <span
                  className={`w-8 shrink-0 text-right font-heading text-lg tabular-nums ${
                    row.position <= 3 ? "text-jersey-yellow" : "text-off-white/50"
                  }`}
                >
                  {row.position}
                </span>
                <span className="truncate">{row.name}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {teamOfTheStage.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-2xl tracking-wide">TEAM OF THE STAGE</h2>
          <p className="mt-1 text-sm text-mid-grey">
            The highest-scoring eight — the squad everyone wishes they&apos;d picked.
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {teamOfTheStage.map((rider) => (
              <li
                key={rider.name}
                className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm"
              >
                <span className="truncate">{rider.name}</span>
                <span className="font-heading text-base tabular-nums text-jersey-yellow">{rider.points}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6">
        <Link
          href="/fantasy/team"
          className="rounded-md bg-jersey-yellow px-6 py-3 font-heading tracking-[0.15em] text-charcoal transition-colors hover:bg-jersey-yellow-deep"
        >
          MAKE YOUR CHANGES →
        </Link>
        <Link
          href="/fantasy/leaderboard"
          className="rounded-md bg-white/10 px-6 py-3 font-heading tracking-widest text-off-white hover:bg-white/20"
        >
          STANDINGS
        </Link>
      </div>
    </div>
  );
}
