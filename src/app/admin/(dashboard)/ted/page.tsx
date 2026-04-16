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
import { and, desc, eq, gte } from "drizzle-orm";
import { requireAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

function weekAgoTimestamp(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
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

  const kill = ks[0];

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
          <Link href="/admin/ted/log" className="text-sm rounded-md bg-white/10 px-3 py-1.5 text-white hover:bg-white/15">
            Activity log
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

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Drafts pending review" value={pendingDrafts.length} />
        <StatCard label="Edit rate (7d)" value={`${Math.round(editRate * 100)}%`} />
        <StatCard label="Welcomes ready to post" value={pendingWelcomes.length} />
        <StatCard label="Threads surfaced (7d)" value={recentSurfaces.length} />
      </section>

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
