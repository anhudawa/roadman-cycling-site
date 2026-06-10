import { desc, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import {
  fantasyAuditLog,
  fantasyPlayers,
  fantasyRiders,
  fantasyStageResults,
  fantasyStages,
  fantasyTeams,
} from "@/lib/db/schema";
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  StatTile,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function formatWhen(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FantasyOverviewPage() {
  await requireAdmin();

  const [players] = await db
    .select({
      total: sql<number>`count(*)::int`,
      verified: sql<number>`count(*) filter (where ${fantasyPlayers.verifiedAt} is not null)::int`,
      beehiivBacklog: sql<number>`count(*) filter (where ${fantasyPlayers.verifiedAt} is not null and ${fantasyPlayers.beehiivSyncedAt} is null)::int`,
    })
    .from(fantasyPlayers);

  const [teams] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(fantasyTeams);

  const riderRows = await db
    .select({ status: fantasyRiders.status, count: sql<number>`count(*)::int` })
    .from(fantasyRiders)
    .groupBy(fantasyRiders.status);
  const ridersByStatus = new Map(riderRows.map((r) => [r.status, Number(r.count)]));

  const [stages] = await db
    .select({
      total: sql<number>`count(*)::int`,
      withStartTime: sql<number>`count(*) filter (where ${fantasyStages.startTimeCest} is not null)::int`,
      withTake: sql<number>`count(*) filter (where ${fantasyStages.roadmanTake} is not null)::int`,
    })
    .from(fantasyStages);

  const [results] = await db
    .select({
      entered: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${fantasyStageResults.status} = 'published')::int`,
    })
    .from(fantasyStageResults);

  const auditRows = await db
    .select()
    .from(fantasyAuditLog)
    .orderBy(desc(fantasyAuditLog.createdAt))
    .limit(20);

  const beehiivBacklog = Number(players?.beehiivBacklog ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fantasy Tour"
        subtitle="Roadman Fantasy Tour de France 2026 — game operations"
        actions={
          <>
            <Button variant="secondary" size="sm" href="/admin/fantasy/stages">
              Stages
            </Button>
            <Button variant="secondary" size="sm" href="/admin/fantasy/riders">
              Riders
            </Button>
            <Button variant="secondary" size="sm" href="/admin/fantasy/results">
              Results
            </Button>
            <Button variant="secondary" size="sm" href="/admin/fantasy/config">
              Config
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Players"
          value={Number(players?.total ?? 0)}
          sub={`${Number(players?.verified ?? 0)} verified`}
        />
        <StatTile
          label="Beehiiv sync backlog"
          value={beehiivBacklog}
          sub="Verified players not yet synced"
          tone={beehiivBacklog > 0 ? "warn" : "good"}
        />
        <StatTile label="Teams created" value={Number(teams?.total ?? 0)} />
        <StatTile
          label="Results published"
          value={`${Number(results?.published ?? 0)}/21`}
          sub={`${Number(results?.entered ?? 0)} stages have results entered`}
          href="/admin/fantasy/results"
        />
        <StatTile
          label="Riders provisional"
          value={ridersByStatus.get("provisional") ?? 0}
          tone={(ridersByStatus.get("provisional") ?? 0) > 0 ? "warn" : "neutral"}
          href="/admin/fantasy/riders"
        />
        <StatTile
          label="Riders confirmed"
          value={ridersByStatus.get("confirmed") ?? 0}
          tone="good"
          href="/admin/fantasy/riders"
        />
        <StatTile
          label="Riders abandoned"
          value={ridersByStatus.get("abandoned") ?? 0}
          tone={(ridersByStatus.get("abandoned") ?? 0) > 0 ? "bad" : "neutral"}
          href="/admin/fantasy/riders"
        />
        <StatTile
          label="Stage start times"
          value={`${Number(stages?.withStartTime ?? 0)}/${Number(stages?.total ?? 0)}`}
          sub={`${Number(stages?.withTake ?? 0)} Roadman takes written`}
          href="/admin/fantasy/stages"
        />
      </div>

      <Card>
        <CardHeader
          title="Recent activity"
          subtitle="Last 20 fantasy audit-log entries — confirmations, corrections, config edits"
        />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  When
                </th>
                <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Actor
                </th>
                <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Action
                </th>
                <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Entity
                </th>
                <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {auditRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-foreground-subtle text-sm"
                  >
                    No audit entries yet.
                  </td>
                </tr>
              ) : (
                auditRows.map((row) => {
                  const detail = row.detail ? JSON.stringify(row.detail) : "";
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--color-border)] last:border-b-0"
                    >
                      <td className="px-6 py-2.5 text-sm text-foreground-muted whitespace-nowrap font-mono tabular-nums">
                        {formatWhen(row.createdAt)}
                      </td>
                      <td className="px-6 py-2.5 text-sm text-off-white whitespace-nowrap">
                        {row.actor}
                      </td>
                      <td className="px-6 py-2.5 text-sm text-foreground-muted whitespace-nowrap">
                        {row.action}
                      </td>
                      <td className="px-6 py-2.5 text-sm text-foreground-muted whitespace-nowrap">
                        {row.entity}
                        {row.entityId ? ` #${row.entityId}` : ""}
                      </td>
                      <td className="px-6 py-2.5 text-xs text-foreground-subtle max-w-md truncate font-mono">
                        {detail.length > 120 ? `${detail.slice(0, 120)}…` : detail}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
