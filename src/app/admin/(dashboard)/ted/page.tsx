import Link from "next/link";
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
import { TedBioCopy } from "./_components/TedBioCopy";
import { ScheduleCard } from "./_components/ScheduleCard";
import { CostTrendChart, type CostPoint } from "./_components/CostTrendChart";
import { WorkflowRuns } from "./_components/WorkflowRuns";

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

async function freshnessCheck(): Promise<Check[]> {
  const now = Date.now();
  const results: Check[] = [];
  try {
    const latestDraft = await db
      .select({ createdAt: tedDrafts.createdAt })
      .from(tedDrafts)
      .orderBy(desc(tedDrafts.createdAt))
      .limit(1);
    if (latestDraft[0]) {
      const ageHours = (now - latestDraft[0].createdAt.getTime()) / (60 * 60 * 1000);
      results.push({
        label: "Latest draft",
        status: ageHours < 36 ? "ok" : ageHours < 72 ? "warn" : "missing",
        note: `${Math.round(ageHours)}h ago`,
      });
    } else {
      results.push({
        label: "Latest draft",
        status: "warn",
        note: "no drafts yet — first cron run or shadow-mode catching up",
      });
    }

    const latestLog = await db
      .select({ timestamp: tedActivityLog.timestamp })
      .from(tedActivityLog)
      .orderBy(desc(tedActivityLog.timestamp))
      .limit(1);
    if (latestLog[0]) {
      const ageHours = (now - latestLog[0].timestamp.getTime()) / (60 * 60 * 1000);
      results.push({
        label: "Latest activity",
        status: ageHours < 12 ? "ok" : ageHours < 36 ? "warn" : "missing",
        note: `${Math.round(ageHours)}h ago`,
      });
    } else {
      results.push({
        label: "Latest activity",
        status: "warn",
        note: "no activity logged yet",
      });
    }
  } catch (err) {
    results.push({
      label: "Freshness check",
      status: "missing",
      note: err instanceof Error ? err.message : String(err),
    });
  }
  return results;
}

export default async function TedDashboardPage() {
  await requireAuth();

  const weekAgo = weekAgoTimestamp();

  const [pendingDrafts, recentEdits, pendingWelcomes, recentSurfaces, ks, recentErrors] =
    await Promise.all([
      db
        .select()
        .from(tedDrafts)
        .where(eq(tedDrafts.status, "draft"))
        .orderBy(desc(tedDrafts.createdAt))
        .limit(5),
      db
        .select()
        .from(tedEdits)
        .where(gte(tedEdits.createdAt, weekAgo)),
      db
        .select()
        .from(tedWelcomeQueue)
        .where(eq(tedWelcomeQueue.status, "drafted"))
        .orderBy(desc(tedWelcomeQueue.createdAt))
        .limit(5),
      db
        .select()
        .from(tedSurfaced)
        .where(gte(tedSurfaced.surfacedAt, weekAgo))
        .orderBy(desc(tedSurfaced.surfacedAt))
        .limit(10),
      db.select().from(tedKillSwitch).where(eq(tedKillSwitch.id, 1)).limit(1),
      db
        .select()
        .from(tedActivityLog)
        .where(and(eq(tedActivityLog.level, "error"), gte(tedActivityLog.timestamp, weekAgo)))
        .orderBy(desc(tedActivityLog.timestamp))
        .limit(5),
    ]);

  const draftsThisWeek = await db
    .select({ id: tedDrafts.id })
    .from(tedDrafts)
    .where(gte(tedDrafts.createdAt, weekAgo));
  const editRate =
    draftsThisWeek.length > 0
      ? new Set(recentEdits.map((e) => e.draftId)).size / draftsThisWeek.length
      : 0;

  // Weekly token cost — every job logs {payload: {cost: number}} into
  // ted_activity_log. Sum it for a rough $/week figure and bucket by day
  // for the chart.
  const costRows = await db
    .select({ timestamp: tedActivityLog.timestamp, payload: tedActivityLog.payload })
    .from(tedActivityLog)
    .where(gte(tedActivityLog.timestamp, weekAgo));
  const costByDay = new Map<string, number>();
  // Pre-seed last 7 days with 0 so the chart shows gaps too.
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
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

  const kill = ks[0];

  const [dbResult, freshness] = await Promise.all([dbCheck(), freshnessCheck()]);
  const checks: Check[] = [
    dbResult,
    envCheck("ANTHROPIC_API_KEY", true),
    envCheck("POSTGRES_URL", true),
    envCheck("RESEND_API_KEY", false),
    envCheck("TED_ADMIN_ALERT_EMAIL", false),
    ...freshness,
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ted</h1>
          <p className="text-sm text-foreground-subtle">
            Community agent for the free Clubhouse. Drafts → human review → posts.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/ted/queue" className="text-sm rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">
            Review queue
          </Link>
          <Link href="/admin/ted/welcomes" className="text-sm rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">
            Welcomes
          </Link>
          <Link href="/admin/ted/log" className="text-sm rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">
            Activity log
          </Link>
          <Link href="/admin/ted/members" className="text-sm rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">
            Members
          </Link>
          <Link href="/admin/ted/settings" className="text-sm rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">
            Settings
          </Link>
        </div>
      </div>

      {kill?.paused ? (
        <div className="rounded-md bg-coral/10 border border-coral/30 p-4">
          <div className="text-sm font-semibold text-coral">Ted is paused</div>
          <div className="text-xs text-foreground-subtle mt-1">
            Paused by {kill.pausedBySlug ?? "unknown"} at {kill.pausedAt?.toISOString() ?? "—"}.
            Reason: {kill.reason ?? "no reason given"}.
          </div>
        </div>
      ) : null}

      <section className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard label="Drafts pending review" value={pendingDrafts.length} />
        <StatCard label="Edit rate (7d)" value={`${Math.round(editRate * 100)}%`} />
        <StatCard
          label="Voice-pass rate (7d)"
          value={voicePassRate === null ? "—" : `${Math.round(voicePassRate * 100)}%`}
        />
        <StatCard label="Welcomes ready to post" value={pendingWelcomes.length} />
        <StatCard label="Threads surfaced (7d)" value={recentSurfaces.length} />
        <StatCard label="Cost (7d)" value={`$${weeklyCost.toFixed(2)}`} />
      </section>

      <CostTrendChart data={costChartData} />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GateCard label="Prompts" enabled={kill?.postPromptEnabled ?? false} />
        <GateCard label="Welcomes" enabled={kill?.postWelcomeEnabled ?? false} />
        <GateCard label="Surfacing" enabled={kill?.surfaceThreadsEnabled ?? false} />
      </section>

      {recentErrors.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Recent errors</h2>
          <div className="space-y-2">
            {recentErrors.map((e) => (
              <div key={e.id} className="text-xs rounded-md bg-coral/5 border border-coral/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-coral">{e.job} :: {e.action}</span>
                  <span className="text-foreground-subtle">{e.timestamp.toISOString()}</span>
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
                <tr key={c.label} className="border-b border-white/5 last:border-0">
                  <td className="p-2 text-white w-1/3">{c.label}</td>
                  <td className="p-2 w-24">
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        c.status === "ok"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : c.status === "warn"
                            ? "bg-yellow-500/10 text-yellow-300"
                            : "bg-coral/10 text-coral"
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
      <div className="text-xs text-foreground-subtle uppercase tracking-wide">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function GateCard({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-foreground-subtle uppercase tracking-wide">Posting gate</div>
        <div className="mt-1 text-lg font-semibold text-white">{label}</div>
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-white/10 text-foreground-subtle"
        }`}
      >
        {enabled ? "enabled" : "shadow"}
      </span>
    </div>
  );
}
