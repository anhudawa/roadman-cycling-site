import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import {
  fantasyProTeams,
  fantasyRiders,
  fantasyStageResults,
  fantasyStages,
} from "@/lib/db/schema";
import type { StageResultData } from "@/lib/fantasy/scoring";
import { PageHeader, Pill } from "@/components/admin/ui";
import { StageResultEditor, type EditorProTeam, type EditorRider } from "./StageResultEditor";

export const dynamic = "force-dynamic";

export default async function FantasyStageResultPage({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  await requireAdmin();

  const { stage } = await params;
  const stageNumber = parseInt(stage, 10);
  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 21) notFound();

  const [stageRow] = await db
    .select()
    .from(fantasyStages)
    .where(eq(fantasyStages.stageNumber, stageNumber));
  if (!stageRow) notFound();

  const riderRows = await db
    .select({
      id: fantasyRiders.id,
      name: fantasyRiders.name,
      status: fantasyRiders.status,
      abandonedAfterStage: fantasyRiders.abandonedAfterStage,
      proTeamCode: fantasyProTeams.code,
    })
    .from(fantasyRiders)
    .innerJoin(fantasyProTeams, eq(fantasyProTeams.id, fantasyRiders.proTeamId))
    .orderBy(asc(fantasyRiders.name));

  // Riders the pickers offer: in the race as of this stage. Riders who
  // abandoned ON this stage stay pickable (they may have scored first).
  const riders: EditorRider[] = riderRows.filter(
    (r) =>
      r.status !== "removed" &&
      r.status !== "dns" &&
      (r.abandonedAfterStage === null || r.abandonedAfterStage >= stageNumber),
  );

  const proTeams: EditorProTeam[] = await db
    .select({ id: fantasyProTeams.id, name: fantasyProTeams.name })
    .from(fantasyProTeams)
    .orderBy(asc(fantasyProTeams.name));

  const [resultRow] = await db
    .select()
    .from(fantasyStageResults)
    .where(eq(fantasyStageResults.stageNumber, stageNumber));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Stage ${stageNumber} results`}
        subtitle={
          <>
            {stageRow.startTown} → {stageRow.finishTown} ({stageRow.distanceKm} km,{" "}
            {stageRow.stageType.toUpperCase()}) —{" "}
            {new Date(stageRow.date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </>
        }
        actions={
          resultRow ? (
            <Pill tone={resultRow.status === "published" ? "good" : "warn"}>
              {resultRow.status} · v{resultRow.version}
            </Pill>
          ) : (
            <Pill tone="neutral">no result yet</Pill>
          )
        }
      />
      <StageResultEditor
        stageNumber={stageNumber}
        stageType={stageRow.stageType}
        riders={riders}
        proTeams={proTeams}
        initialPayload={(resultRow?.payload as unknown as StageResultData) ?? null}
        initialSourceUrl={resultRow?.sourceUrl ?? ""}
        initialStatus={resultRow?.status ?? null}
        initialVersion={resultRow?.version ?? null}
      />
    </div>
  );
}
