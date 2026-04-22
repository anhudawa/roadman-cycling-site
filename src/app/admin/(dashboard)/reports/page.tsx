import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { getAllReports } from "@/lib/crm/reports";
import { getScoreBandDistribution, bandBadgeClass } from "@/lib/crm/scoring";
import { STAGE_COLORS, STAGE_LABELS } from "@/lib/crm/pipeline";
import {
  STAGE_LABELS as DEAL_STAGE_LABELS,
  STAGE_COLORS as DEAL_STAGE_COLORS,
  formatCurrency,
} from "@/lib/crm/deals";

export const dynamic = "force-dynamic";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background-elevated border border-white/5 rounded-xl p-6">
      <h2 className="font-heading text-sm tracking-wider uppercase text-foreground-muted mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default async function ReportsPage() {
  const user = await requireAuth();
  const { funnel, weekly, owners, email, throughput, deals } = await getAllReports();
  const scoreDist = await getScoreBandDistribution().catch(() => ({
    hot: 0,
    warm: 0,
    cool: 0,
    cold: 0,
  }));
  const scoreTotal = scoreDist.hot + scoreDist.warm + scoreDist.cool + scoreDist.cold;

  const funnelMax = Math.max(1, ...funnel.map((f) => f.count));
  const weeklyMax = Math.max(1, ...weekly.map((w) => w.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider uppercase">
          Reports
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Pipeline, engagement &amp; throughput — signed in as {user.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <Card title="Pipeline Funnel">
          <ul className="space-y-3">
            {funnel.map((row) => {
              const pct = Math.round((row.count / funnelMax) * 100);
              const color = STAGE_COLORS[row.stage];
              return (
                <li key={row.stage}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-off-white uppercase tracking-wider">
                      {STAGE_LABELS[row.stage]}
                    </span>
                    <span className="tabular-nums text-foreground-muted">
                      {row.count}
                      {row.conversionFromPrev !== null && (
                        <span className="ml-2 text-foreground-subtle">
                          {row.conversionFromPrev}% conv
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded overflow-hidden">
                    <div
                      className={`h-full ${color.dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Applications per week */}
        <Card title="Applications — Last 12 Weeks">
          <div className="flex items-end gap-1.5 h-40">
            {weekly.map((w) => {
              const pct = Math.round((w.count / weeklyMax) * 100);
              return (
                <div
                  key={w.weekStart}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${w.label}: ${w.count}`}
                >
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-coral/70 hover:bg-coral rounded-t transition-colors"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-foreground-subtle tabular-nums">
                    {w.count}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-foreground-subtle">
            <span>{weekly[0]?.label}</span>
            <span>{weekly[weekly.length - 1]?.label}</span>
          </div>
        </Card>
      </div>

      {/* Lead score distribution */}
      <Card title="Lead Score Distribution">
        {scoreTotal === 0 ? (
          <p className="text-sm text-foreground-subtle">
            No scores yet. Run the score-all cron or use Recompute on a contact.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["hot", "warm", "cool", "cold"] as const).map((b) => {
              const count = scoreDist[b];
              const pct = Math.round((count / scoreTotal) * 100);
              return (
                <div
                  key={b}
                  className={`rounded-lg border px-3 py-3 ${bandBadgeClass(b)}`}
                >
                  <p className="text-[10px] uppercase tracking-widest opacity-80">
                    {b}
                  </p>
                  <p className="font-heading text-2xl tracking-wider mt-1 tabular-nums">
                    {count}
                  </p>
                  <p className="text-xs tabular-nums opacity-70">{pct}%</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Owner breakdown */}
      <Card title="Owner Breakdown">
        {owners.length === 0 ? (
          <p className="text-sm text-foreground-subtle">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-foreground-subtle">
                  <th className="text-left py-2 font-medium">Owner</th>
                  <th className="text-right py-2 font-medium">Total</th>
                  {(
                    [
                      "awaiting_response",
                      "contacted",
                      "offered",
                      "accepted",
                      "rejected",
                    ] as const
                  ).map((s) => (
                    <th key={s} className="text-right py-2 font-medium">
                      {STAGE_LABELS[s]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {owners.map((o) => (
                  <tr
                    key={o.slug}
                    className="border-t border-white/5 text-off-white"
                  >
                    <td className="py-2">{o.name}</td>
                    <td className="text-right tabular-nums font-medium">
                      {o.total}
                    </td>
                    {(
                      [
                        "awaiting_response",
                        "contacted",
                        "offered",
                        "accepted",
                        "rejected",
                      ] as const
                    ).map((s) => (
                      <td
                        key={s}
                        className="text-right tabular-nums text-foreground-muted"
                      >
                        {o.perStage[s] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email engagement */}
        <Card title="Email Engagement (Last 30d)">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Sent", value: email.sent, rate: null },
              {
                label: "Delivered",
                value: email.delivered,
                rate: email.deliveryRate,
              },
              { label: "Opened", value: email.opened, rate: email.openRate },
              {
                label: "Clicked",
                value: email.clicked,
                rate: email.clickRate,
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-white/[0.02] border border-white/5 rounded-lg p-3"
              >
                <p className="text-[10px] uppercase tracking-widest text-foreground-subtle">
                  {m.label}
                </p>
                <p className="font-heading text-2xl text-off-white tracking-wider mt-1 tabular-nums">
                  {m.value}
                </p>
                {m.rate !== null && (
                  <p className="text-xs text-accent tabular-nums mt-0.5">
                    {m.rate}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Task throughput */}
        <Card title="Task Throughput">
          {throughput.length === 0 ? (
            <p className="text-sm text-foreground-subtle">No tasks yet.</p>
          ) : (
            <ul className="space-y-2">
              {throughput.map((t) => (
                <li
                  key={t.slug}
                  className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm text-off-white">{t.name}</span>
                  <div className="flex items-center gap-4 text-xs tabular-nums">
                    <span className="text-green-400">
                      {t.completedLast7d}{" "}
                      <span className="text-foreground-subtle">done/7d</span>
                    </span>
                    <span className="text-amber-400">
                      {t.open}{" "}
                      <span className="text-foreground-subtle">open</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Revenue */}
      <div className="pt-2">
        <h2 className="font-heading text-xl text-off-white tracking-wider uppercase mb-4">
          Revenue
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Pipeline by Stage">
            {deals.pipelineByStage.every((p) => p.count === 0) ? (
              <p className="text-sm text-foreground-subtle">No deals yet.</p>
            ) : (
              <ul className="space-y-3">
                {deals.pipelineByStage.map((row) => {
                  const color = DEAL_STAGE_COLORS[row.stage];
                  return (
                    <li key={row.stage}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-off-white uppercase tracking-wider flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                          {DEAL_STAGE_LABELS[row.stage]}
                        </span>
                        <span className="tabular-nums text-foreground-muted">
                          {row.count}{" "}
                          <span className="text-foreground-subtle ml-2">
                            {formatCurrency(row.totalCents, "EUR")}
                          </span>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Won Revenue — Last 90 Days">
            {(() => {
              const max = Math.max(
                1,
                ...deals.wonLast90dByWeek.map((w) => w.totalCents)
              );
              return (
                <div>
                  <div className="flex items-end gap-1.5 h-40">
                    {deals.wonLast90dByWeek.map((w) => {
                      const pct = Math.round((w.totalCents / max) * 100);
                      return (
                        <div
                          key={w.weekStart}
                          className="flex-1 flex flex-col items-center gap-1"
                          title={`${w.label}: ${formatCurrency(w.totalCents, "EUR")}`}
                        >
                          <div className="w-full flex-1 flex items-end">
                            <div
                              className="w-full bg-green-500/60 hover:bg-green-400 rounded-t transition-colors"
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-foreground-subtle">
                    <span>{deals.wonLast90dByWeek[0]?.label}</span>
                    <span>
                      {deals.wonLast90dByWeek[deals.wonLast90dByWeek.length - 1]?.label}
                    </span>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card title="Win Rate (Last 90d)">
            <p className="font-heading text-5xl text-off-white tracking-wider tabular-nums">
              {deals.winRate90d}%
            </p>
            <p className="text-xs text-foreground-subtle mt-2 uppercase tracking-widest">
              Won ÷ (Won + Lost) among deals closed in last 90d
            </p>
          </Card>

          <Card title="Top 5 Open Deals">
            {deals.topOpenDeals.length === 0 ? (
              <p className="text-sm text-foreground-subtle">No open deals.</p>
            ) : (
              <ul className="space-y-2">
                {deals.topOpenDeals.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                  >
                    <Link
                      href={`/admin/deals/${d.id}`}
                      className="text-sm text-off-white hover:text-[var(--color-fg)] truncate"
                    >
                      {d.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs tabular-nums">
                      <span className="text-foreground-subtle uppercase tracking-widest text-[10px]">
                        {DEAL_STAGE_LABELS[d.stage]}
                      </span>
                      <span className="text-coral font-heading tracking-wider">
                        {formatCurrency(d.valueCents, d.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
