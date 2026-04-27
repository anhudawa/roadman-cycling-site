import { db } from "@/lib/db";
import {
  tedDrafts,
  tedEdits,
  tedWelcomeQueue,
  tedSurfaced,
  tedKillSwitch,
  tedActivityLog,
} from "@/lib/db/schema";
import { and, desc, eq, gte, sql as drizzleSql } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";
import { safeQuery, anyNeedsMigration } from "@/lib/ted/safe-db";
import { TedBioCopy } from "../_components/TedBioCopy";
import { ScheduleCard } from "../_components/ScheduleCard";
import { CostTrendChart, type CostPoint } from "../_components/CostTrendChart";
import { WorkflowRuns } from "../_components/WorkflowRuns";
import { MigrationBanner } from "../_components/MigrationBanner";

export const dynamic = "force-dynamic";

function weekAgoTimestamp(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

interface Check {
  label: string;
  status: "ok" | "warn" | "missing";
  note: string;
}

function envCheck(name: string, required: boolean): Check {
  const val = process.env[name];
  const present = typeof val === "string" && val.length > 0;
  if (present) return { label: name, status: "ok", note: "present" };
  return {
    label: name,
    status: required ? "missing" : "warn",
    note: required ? "not set (required)" : "not set (optional)",
  };
}

async function dbCheck(): Promise<Check> {
  try {
    await db.execute(drizzleSql`SELECT 1`);
    return { label: "Database reachable", status: "ok", note: "SELECT 1 succeeded" };
  } catch (err) {
    return {
      label: "Database reachable",
      status: "missing",
      note: err instanceof Error ? err.message : String(err),
    };
  }
}

export default async function TedHealthPage() {
  await requireAuth();
  const weekAgo = weekAgoTimestamp();

  const [
    pendingDraftsR,
    recentEditsR,
    pendingWelcomesR,
    recentSurfacesR,
    ksR,
    recentErrorsR,
    draftsThisWeekR,
    costRowsR,
  ] = await Promise.all([
    safeQuery(
      () =>
        db
          .select()
          .from(tedDrafts)
          .where(eq(tedDrafts.status, "draft"))
          .orderBy(desc(tedDrafts.createdAt))
          .limit(5),
      [] as Array<typeof tedDrafts.$inferSelect>
    ),
    safeQuery(
      () => db.select().from(tedEdits).where(gte(tedEdits.createdAt, weekAgo)),
      [] as Array<typeof tedEdits.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedWelcomeQueue)
          .where(eq(tedWelcomeQueue.status, "drafted"))
          .orderBy(desc(tedWelcomeQueue.createdAt))
          .limit(5),
      [] as Array<typeof tedWelcomeQueue.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedSurfaced)
          .where(gte(tedSurfaced.surfacedAt, weekAgo))
          .orderBy(desc(tedSurfaced.surfacedAt))
          .limit(10),
      [] as Array<typeof tedSurfaced.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedKillSwitch)
          .where(eq(tedKillSwitch.id, 1))
          .limit(1),
      [] as Array<typeof tedKillSwitch.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select()
          .from(tedActivityLog)
          .where(
            and(
              eq(tedActivityLog.level, "error"),
              gte(tedActivityLog.timestamp, weekAgo)
            )
          )
          .orderBy(desc(tedActivityLog.timestamp))
          .limit(5),
      [] as Array<typeof tedActivityLog.$inferSelect>
    ),
    safeQuery(
      () =>
        db
          .select({ id: tedDrafts.id })
          .from(tedDrafts)
          .where(gte(tedDrafts.createdAt, weekAgo)),
      [] as Array<{ id: number }>
    ),
    safeQuery(
      () =>
        db
          .select({
            timestamp: tedActivityLog.timestamp,
            payload: tedActivityLog.payload,
          })
          .from(tedActivityLog)
          .where(gte(tedActivityLog.timestamp, weekAgo)),
      [] as Array<{ timestamp: Date; payload: Record<string, unknown> | null }>
    ),
  ]);

  const migrationsNeeded = anyNeedsMigration([
    pendingDraftsR,
    recentEditsR,
    pendingWelcomesR,
    recentSurfacesR,
    ksR,
    recentErrorsR,
    draftsThisWeekR,
    costRowsR,
  ]);

  const pendingDrafts = pendingDraftsR.data;
  const recentEdits = recentEditsR.data;
  const pendingWelcomes = pendingWelcomesR.data;
  const recentSurfaces = recentSurfacesR.data;
  const recentErrors = recentErrorsR.data;
  const draftsThisWeek = draftsThisWeekR.data;
  const costRows = costRowsR.data;
  const kill = ksR.data[0];

  const editRate =
    draftsThisWeek.length > 0
      ? new Set(recentEdits.map((e) => e.draftId)).size / draftsThisWeek.length
      : 0;

  const costByDay = new Map<string, number>();
  // eslint-disable-next-line react-hooks/purity -- async server component; Date.now() is server-side render time, not React render
  const nowMs = Date.now();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowMs - i * 24 * 60 * 60 * 1000);
    costByDay.set(d.toISOString().slice(0, 10), 0);
  }
  let weeklyCost = 0;
  let voicePass = 0;
  let voiceTotal = 0;
  for (const row of costRows) {
    const p = row.payload as Record<string, unknown> | null;
    if (!p) continue;
    const cost = typeof p.cost === "number" ? p.cost : 0;
    if (cost > 0) {
      weeklyCost += cost;
      const day = row.timestamp.toISOString().slice(0, 10);
      costByDay.set(day, (costByDay.get(day) ?? 0) + cost);
    }
    if (typeof p.voiceCheckPass === "boolean") {
      voiceTotal += 1;
      if (p.voiceCheckPass) voicePass += 1;
    }
  }
  const voicePassRate = voiceTotal > 0 ? voicePass / voiceTotal : null;
  const costChartData: CostPoint[] = Array.from(costByDay.entries()).map(
    ([date, cost]) => ({ date, cost })
  );

  const dbResult = await dbCheck();
  const checks: Check[] = [
    dbResult,
    envCheck("ANTHROPIC_API_KEY", true),
    envCheck("POSTGRES_URL", true),
    envCheck("RESEND_API_KEY", false),
    envCheck("TED_ADMIN_ALERT_EMAIL", false),
    {
      label: "Ted tables",
      status: migrationsNeeded ? "missing" : "ok",
      note: migrationsNeeded ? "run npm run db:migrate" : "present",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ted — health &amp; schedule</h1>
        <p className="text-sm text-foreground-subtle">
          Operator detail: stats, gates, environment, cron schedule, recent workflow runs, Ted&apos;s Skool bio.
        </p>
      </div>

      {migrationsNeeded ? <MigrationBanner /> : null}

      <section className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard label="Drafts pending review" value={pendingDrafts.length} />
        <StatCard
          label="Edit rate (7d)"
          value={`${Math.round(editRate * 100)}%`}
        />
        <StatCard
          label="Voice-pass rate (7d)"
          value={
            voicePassRate === null ? "—" : `${Math.round(voicePassRate * 100)}%`
          }
        />
        <StatCard
          label="Welcomes ready to post"
          value={pendingWelcomes.length}
        />
        <StatCard label="Threads surfaced (7d)" value={recentSurfaces.length} />
        <StatCard label="Cost (7d)" value={`$${weeklyCost.toFixed(2)}`} />
      </section>

      <CostTrendChart data={costChartData} />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GateCard label="Prompts" enabled={kill?.postPromptEnabled ?? false} />
        <GateCard label="Welcomes" enabled={kill?.postWelcomeEnabled ?? false} />
        <GateCard
          label="Surfacing"
          enabled={kill?.surfaceThreadsEnabled ?? false}
        />
      </section>

      {recentErrors.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Recent errors</h2>
          <div className="space-y-2">
            {recentErrors.map((e) => (
              <div
                key={e.id}
                className="text-xs rounded-md bg-[var(--color-bad-tint)] border border-[var(--color-border-strong)] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[var(--color-bad)]">
                    {e.job} :: {e.action}
                  </span>
                  <span className="text-foreground-subtle">
                    {e.timestamp.toISOString()}
                  </span>
                </div>
                <div className="mt-1 text-foreground-subtle">{e.error}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Preflight</h2>
        <div className="rounded-md bg-white/5 border border-white/10 overflow-hidden">
          <table className="w-full text-xs">
            <tbody>
              {checks.map((c) => (
                <tr
                  key={c.label}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="p-2 text-white w-1/3">{c.label}</td>
                  <td className="p-2 w-24">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        c.status === "ok"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : c.status === "warn"
                            ? "bg-yellow-500/10 text-yellow-300"
                            : "bg-[var(--color-bad-tint)] text-[var(--color-bad)]"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-2 text-foreground-subtle">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ScheduleCard />

      <WorkflowRuns />

      <TedBioCopy />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-4">
      <div className="text-xs text-foreground-subtle uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function GateCard({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-foreground-subtle uppercase tracking-wide">
          Posting gate
        </div>
        <div className="mt-1 text-lg font-semibold text-white">{label}</div>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          enabled
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-white/10 text-foreground-subtle"
        }`}
      >
        {enabled ? "enabled" : "shadow"}
      </span>
    </div>
  );
}
