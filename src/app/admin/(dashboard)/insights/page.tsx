import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { maskEmail } from "@/lib/admin/events-store";
import {
  getAskFunnel,
  getCoachingLeads,
  getEmailCaptureStats,
  getFlaggedAnswers,
  getLimiterDistribution,
  getTopPrimaryResults,
  getTopQuestions,
  getTopSources,
  getToolFunnels,
  type InsightsRange,
} from "@/lib/admin/insights-queries";
import type { ToolSlug } from "@/lib/tool-results/types";

/**
 * Phase 2 insights dashboard — the "what are riders actually doing?"
 * page. Nine panels, each backed by its own SQL aggregate in
 * insights-queries.ts. All default to the last 7 days; range is
 * URL-driven so bookmarks + back-button work.
 */

export const dynamic = "force-dynamic";

const RANGES: InsightsRange[] = ["24h", "7d", "30d", "all"];
const RANGE_LABEL: Record<InsightsRange, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  all: "All time",
};

const TOOL_LABEL: Record<ToolSlug, string> = {
  plateau: "Plateau",
  fuelling: "Fuelling",
  ftp_zones: "FTP zones",
};

export default async function AdminInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAuth();
  const { range: rawRange } = await searchParams;
  const range: InsightsRange =
    rawRange === "24h" || rawRange === "30d" || rawRange === "all" ? rawRange : "7d";

  const [
    toolFunnels,
    topQuestions,
    topPrimaryResults,
    limiterRows,
    flagged,
    topSources,
    askFunnel,
    coachingLeads,
    emailStats,
  ] = await Promise.all([
    getToolFunnels(range),
    getTopQuestions(range),
    getTopPrimaryResults(range),
    getLimiterDistribution(range),
    getFlaggedAnswers(range),
    getTopSources(range),
    getAskFunnel(range),
    getCoachingLeads(range),
    getEmailCaptureStats(range),
  ]);

  const limiterTotal = limiterRows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">Insights</h1>
          <p className="text-sm text-foreground-subtle mt-1">
            Tool funnels, Ask Roadman funnel, limiter distribution, flagged
            answers and coaching leads — backed by the same tables we power
            product off.
          </p>
        </div>
        <nav className="flex items-center gap-1 text-xs">
          {RANGES.map((r) => (
            <RangeTab key={r} current={range} value={r} label={RANGE_LABEL[r]} />
          ))}
        </nav>
      </header>

      {/* ── 1. Tool funnels ─────────────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white mb-1">Tool funnels</h2>
        <p className="text-xs text-foreground-subtle mb-4">
          Started → completed → saved → Ask Roadman handoff, per tool.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toolFunnels.map((f) => {
            const completionRate = f.started > 0 ? (f.completed / f.started) * 100 : 0;
            const saveRate = f.completed > 0 ? (f.saved / f.completed) * 100 : 0;
            const handoffRate = f.saved > 0 ? (f.handoff / f.saved) * 100 : 0;
            return (
              <div
                key={f.tool}
                className="rounded-md bg-white/5 border border-white/10 p-4"
              >
                <p className="text-xs tracking-widest font-heading text-[var(--color-muted)] mb-3">
                  {TOOL_LABEL[f.tool].toUpperCase()}
                </p>
                <FunnelRow label="Started" value={f.started} pct={null} />
                <FunnelRow
                  label="Completed"
                  value={f.completed}
                  pct={completionRate}
                />
                <FunnelRow label="Saved" value={f.saved} pct={saveRate} />
                <FunnelRow label="Handoff" value={f.handoff} pct={handoffRate} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 2 & 7. Ask funnel + email capture rate ──── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md bg-white/5 border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white mb-1">Ask Roadman funnel</h2>
          <p className="text-xs text-foreground-subtle mb-4">
            Sessions, questions, CTA clicks, profile saves.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Sessions" value={askFunnel.sessions} />
            <MiniStat label="Questions" value={askFunnel.questions} />
            <MiniStat label="CTA clicked" value={askFunnel.ctaClicked} />
            <MiniStat label="Profile saved" value={askFunnel.profileSaved} />
          </div>
        </div>
        <div className="rounded-md bg-white/5 border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white mb-1">Email capture</h2>
          <p className="text-xs text-foreground-subtle mb-4">
            How many saved tool results actually shipped a copy to the rider.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Saved" value={emailStats.total} />
            <MiniStat label="Emailed" value={emailStats.emailed} />
            <MiniStat
              label="Rate"
              value={`${emailStats.rate.toFixed(0)}%`}
              tone={emailStats.rate >= 90 ? "ok" : emailStats.rate >= 70 ? "warn" : "alert"}
            />
          </div>
        </div>
      </section>

      {/* ── 3. Top questions + 4. Top primary results ─ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-md bg-white/5 border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white mb-1">Top questions</h2>
          <p className="text-xs text-foreground-subtle mb-4">
            Grouped by the first 8 words — catches repeat phrasings.
          </p>
          {topQuestions.length === 0 ? (
            <p className="text-sm text-foreground-subtle">
              No user questions in this window.
            </p>
          ) : (
            <ol className="space-y-1 text-sm">
              {topQuestions.map((q, i) => (
                <li
                  key={`${q.snippet}-${i}`}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="text-foreground-muted truncate">
                    {q.snippet}
                  </span>
                  <span className="font-mono text-xs text-white shrink-0">
                    {q.count}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="rounded-md bg-white/5 border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white mb-1">Top primary results</h2>
          <p className="text-xs text-foreground-subtle mb-4">
            What result buckets riders are landing in, per tool.
          </p>
          {topPrimaryResults.length === 0 ? (
            <p className="text-sm text-foreground-subtle">No results yet.</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {topPrimaryResults.map((r, i) => (
                <li
                  key={`${r.tool}-${r.primaryResult}-${i}`}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="text-foreground-muted truncate">
                    <span className="text-[10px] uppercase tracking-widest text-foreground-subtle mr-2">
                      {TOOL_LABEL[r.tool] ?? r.tool}
                    </span>
                    {r.primaryResult}
                  </span>
                  <span className="font-mono text-xs text-white shrink-0">
                    {r.count}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ── 5. Limiter distribution ──────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white mb-1">Limiter distribution</h2>
        <p className="text-xs text-foreground-subtle mb-4">
          What riders self-identify as their biggest limiter in the profile
          step.
        </p>
        {limiterRows.length === 0 ? (
          <p className="text-sm text-foreground-subtle">
            No profiles with a limiter in this window.
          </p>
        ) : (
          <ul className="space-y-2">
            {limiterRows.map((r) => {
              const pct = limiterTotal > 0 ? (r.count / limiterTotal) * 100 : 0;
              return (
                <li key={r.limiter} className="text-sm">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="text-foreground-muted">{r.limiter}</span>
                    <span className="font-mono text-xs text-white shrink-0">
                      {r.count} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-bad)]/60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── 6. Top sources ──────────────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white mb-1">Top sources cited</h2>
        <p className="text-xs text-foreground-subtle mb-4">
          Retrieval items the model actually used in a streamed answer.
        </p>
        {topSources.length === 0 ? (
          <p className="text-sm text-foreground-subtle">
            No answers grounded in sources yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-foreground-subtle">
                <tr>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Source ID</th>
                  <th className="py-2 pr-4 text-right">Uses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topSources.map((s, i) => (
                  <tr key={`${s.sourceType}-${s.sourceId}-${i}`} className="text-foreground-muted">
                    <td className="py-2 pr-4 text-xs">{s.sourceType}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-white">
                      {s.sourceId}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs text-white">
                      {s.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── 7. Flagged answers (QA queue) ────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Flagged answers</h2>
            <p className="text-xs text-foreground-subtle mt-1">
              Assistant messages flagged by the citation post-filter or low
              confidence — newest first.
            </p>
          </div>
          <Link
            href="/admin/ask?filter=flagged"
            className="text-xs rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 px-3 py-1.5"
          >
            Open full queue
          </Link>
        </div>
        {flagged.length === 0 ? (
          <p className="text-sm text-foreground-subtle">
            No flagged answers in this window.
          </p>
        ) : (
          <ul className="space-y-3">
            {flagged.map((m) => (
              <li key={m.id} className="rounded-md bg-white/5 border border-white/10 p-3">
                <div className="flex items-baseline justify-between gap-3 mb-2 text-xs text-foreground-subtle">
                  <span>
                    {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </span>
                  <div className="flex gap-2">
                    {m.confidence && (
                      <span className="rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                        {m.confidence}
                      </span>
                    )}
                    {m.flagged && (
                      <span className="rounded-full bg-[var(--color-bad-tint)] text-[var(--color-bad)] border border-[var(--color-bad)]/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                        flagged
                      </span>
                    )}
                    {m.flags.map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {m.snippet}
                  {m.snippet.length >= 160 ? "…" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── 8. Coaching leads ───────────────────────── */}
      <section className="rounded-md bg-white/5 border border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white mb-1">Coaching leads</h2>
        <p className="text-xs text-foreground-subtle mb-4">
          Rider profiles marked &ldquo;interested&rdquo; or &ldquo;ready&rdquo;
          — most recently updated first.
        </p>
        {coachingLeads.length === 0 ? (
          <p className="text-sm text-foreground-subtle">
            No coaching-interest profiles in this window.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-foreground-subtle">
                <tr>
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">First name</th>
                  <th className="py-2 pr-4">Interest</th>
                  <th className="py-2 pr-4">Goal</th>
                  <th className="py-2 pr-4 text-right">FTP</th>
                  <th className="py-2 pr-4 text-right">Hrs/wk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coachingLeads.map((c) => (
                  <tr key={c.email} className="text-foreground-muted">
                    <td className="py-2 pr-4 whitespace-nowrap text-xs">
                      {c.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-white">
                      {maskEmail(c.email)}
                    </td>
                    <td className="py-2 pr-4 text-xs">{c.firstName ?? "—"}</td>
                    <td className="py-2 pr-4 text-xs">
                      <span
                        className={
                          c.coachingInterest === "ready"
                            ? "rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                            : "rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                        }
                      >
                        {c.coachingInterest}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs">{c.mainGoal ?? "—"}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs text-white">
                      {c.currentFtp ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs text-white">
                      {c.weeklyTrainingHours ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function RangeTab({
  current,
  value,
  label,
}: {
  current: InsightsRange;
  value: InsightsRange;
  label: string;
}) {
  const active = current === value;
  const href = `/admin/insights?range=${value}`;
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-[var(--color-bad-tint)] border border-[var(--color-bad)]/40 text-[var(--color-bad)] px-3 py-1 font-semibold"
          : "rounded-full bg-white/5 border border-white/10 text-foreground-muted hover:text-white hover:bg-white/10 px-3 py-1"
      }
    >
      {label}
    </Link>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "ok" | "warn" | "alert";
}) {
  const toneCls =
    tone === "ok"
      ? "text-emerald-300"
      : tone === "warn"
      ? "text-yellow-300"
      : tone === "alert"
      ? "text-[var(--color-bad)]"
      : "text-white";
  return (
    <div className="rounded-md bg-white/5 border border-white/10 p-3">
      <p className="text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
        {label}
      </p>
      <p className={`text-xl font-semibold ${toneCls}`}>{value}</p>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  pct,
}: {
  label: string;
  value: number;
  pct: number | null;
}) {
  return (
    <div className="flex items-baseline justify-between py-1 text-sm">
      <span className="text-foreground-muted">{label}</span>
      <span className="font-mono text-xs text-white">
        {value}
        {pct !== null && (
          <span className="text-foreground-subtle ml-2">
            {pct.toFixed(0)}%
          </span>
        )}
      </span>
    </div>
  );
}
