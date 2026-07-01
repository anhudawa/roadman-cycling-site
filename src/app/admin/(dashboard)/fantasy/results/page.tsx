import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { fantasyStageResults } from "@/lib/db/schema";
import { listStages } from "@/lib/fantasy/queries";
import { Button, Card, Num, PageHeader, Pill, type PillTone } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

type ResultStatus = "none" | "draft" | "previewed" | "published";

const STATUS_TONES: Record<ResultStatus, PillTone> = {
  none: "neutral",
  draft: "warn",
  previewed: "info",
  published: "good",
};

export default async function FantasyResultsIndexPage() {
  await requireAdmin();

  const stages = await listStages();
  const results = await db.select().from(fantasyStageResults);
  const resultByStage = new Map(results.map((r) => [r.stageNumber, r]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage results"
        subtitle="The daily job: enter the raw result, preview the computed scores against the official sheet, then publish"
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Stage
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Date
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Route
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Type
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Result
                </th>
                <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Version
                </th>
                <th className="text-left px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Published
                </th>
                <th className="text-right px-4 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage) => {
                const result = resultByStage.get(stage.stageNumber);
                const status: ResultStatus = result ? result.status : "none";
                return (
                  <tr
                    key={stage.stageNumber}
                    className="border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <td className="px-4 py-2.5 text-sm text-off-white font-mono tabular-nums">
                      {stage.stageNumber}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-foreground-muted whitespace-nowrap">
                      {new Date(stage.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-foreground-muted max-w-xs truncate">
                      {stage.startTown} → {stage.finishTown}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-foreground-muted uppercase">
                      {stage.stageType}
                    </td>
                    <td className="px-4 py-2.5">
                      <Pill tone={STATUS_TONES[status]}>{status}</Pill>
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-foreground-muted">
                      {result ? <Num>v{result.version}</Num> : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-foreground-muted whitespace-nowrap">
                      {result?.publishedAt
                        ? result.publishedAt.toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        href={`/admin/fantasy/results/${stage.stageNumber}`}
                      >
                        {result ? "Edit" : "Enter"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
