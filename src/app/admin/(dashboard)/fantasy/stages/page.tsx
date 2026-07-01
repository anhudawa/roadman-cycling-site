import { requireAdmin } from "@/lib/admin/auth";
import { listStages } from "@/lib/fantasy/queries";
import { formatCestForInput } from "@/lib/fantasy/admin";
import { PageHeader } from "@/components/admin/ui";
import { StagesTable, type StageRow } from "./StagesTable";

export const dynamic = "force-dynamic";

export default async function FantasyStagesPage() {
  await requireAdmin();

  const stages = await listStages();
  const rows: StageRow[] = stages.map((s) => ({
    stageNumber: s.stageNumber,
    date: s.date,
    startTown: s.startTown,
    finishTown: s.finishTown,
    distanceKm: s.distanceKm,
    stageType: s.stageType,
    summitFinish: s.summitFinish,
    restDayAfter: s.restDayAfter,
    verifiedAt: s.verifiedAt.toISOString(),
    startTimeInput: formatCestForInput(s.startTimeCest),
    roadmanTake: s.roadmanTake ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stages"
        subtitle="Official start times (entered as CEST — they double as transfer deadlines) and the Roadman take for each daily email"
      />
      <StagesTable stages={rows} />
    </div>
  );
}
