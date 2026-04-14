import { requireAuth } from "@/lib/admin/auth";
import { getAllReports } from "@/lib/crm/reports";
import { STAGE_COLORS, STAGE_LABELS } from "@/lib/crm/pipeline";

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
  const { funnel, weekly, owners, email, throughput } = await getAllReports();

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
                      "qualified",
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
                        "qualified",
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
    </div>
  );
}
