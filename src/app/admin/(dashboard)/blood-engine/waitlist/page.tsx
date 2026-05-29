import { requireAuth } from "@/lib/admin/auth";
import { listWaitlist, waitlistStats } from "@/lib/blood-engine/waitlist";
import { UnsubscribeButton } from "./UnsubscribeButton";

export const dynamic = "force-dynamic";

export default async function BloodEngineWaitlistAdminPage() {
  await requireAuth();
  const [entries, stats] = await Promise.all([listWaitlist(), waitlistStats()]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="font-heading tracking-[0.3em] text-coral text-sm mb-2">
          Blood Engine
        </p>
        <h1 className="font-heading uppercase text-off-white text-4xl mb-4">
          Waiting list
        </h1>
        <p className="text-foreground-muted text-sm">
          Everyone who&apos;s signed up on <code>/blood-engine</code> before launch.
          Export by copy/paste, or wire this into a Beehiiv sync when the
          launch email goes out.
        </p>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard label="Total signups" value={stats.total} color="text-off-white" />
        <StatCard label="Active" value={stats.active} color="text-emerald-400" />
        <StatCard label="Notified" value={stats.notified} color="text-coral" />
        <StatCard label="Unsubscribed" value={stats.unsubscribed} color="text-foreground-subtle" />
      </div>

      {/* ── By source ─────────────────────────────────────────── */}
      {Object.keys(stats.bySource).length > 0 ? (
        <div className="mb-10">
          <h2 className="font-heading uppercase text-off-white text-xl mb-3">
            By source
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.bySource)
              .sort((a, b) => b[1] - a[1])
              .map(([src, n]) => (
                <span
                  key={src}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background-elevated px-3 py-1.5 text-sm"
                >
                  <span className="text-off-white">{src}</span>
                  <span className="text-coral font-heading tabular-nums">{n}</span>
                </span>
              ))}
          </div>
        </div>
      ) : null}

      {/* ── Table ─────────────────────────────────────────────── */}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-background-elevated p-8 text-center text-foreground-muted">
          No signups yet.
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-background-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left border-b border-white/10">
              <tr className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Signed up</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((e) => {
                const status = e.unsubscribedAt
                  ? "unsubscribed"
                  : e.notifiedAt
                    ? "notified"
                    : "active";
                return (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-off-white">{e.email}</td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {e.source ?? <span className="text-foreground-subtle">—</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted whitespace-nowrap">
                      {e.createdAt?.toISOString?.().slice(0, 10) ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!e.unsubscribedAt ? (
                        <UnsubscribeButton email={e.email} />
                      ) : (
                        <span className="text-foreground-subtle text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-background-elevated p-4">
      <p className="text-[10px] font-heading uppercase tracking-wider text-foreground-subtle mb-1">
        {label}
      </p>
      <p className={`font-heading text-3xl tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: "active" | "notified" | "unsubscribed" }) {
  const cls = {
    active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    notified: "bg-coral/15 text-coral border-coral/40",
    unsubscribed: "bg-white/5 text-foreground-subtle border-white/10",
  }[status];
  return (
    <span
      className={`text-[10px] font-heading uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}
    >
      {status}
    </span>
  );
}
