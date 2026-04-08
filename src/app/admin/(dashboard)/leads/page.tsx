import { getRecentLeads, getLeadTotals } from "@/lib/admin/events-store";

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <span className="text-foreground-subtle text-xs">--</span>;
  if (previous === 0) return <span className="text-green-400 text-xs">New</span>;

  const change = ((current - previous) / previous) * 100;
  const isUp = change >= 0;

  return (
    <span className={`text-xs font-medium flex items-center gap-0.5 ${isUp ? "text-green-400" : "text-coral"}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isUp ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
        )}
      </svg>
      {Math.abs(change).toFixed(0)}% vs prev
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LeadsPage() {
  const [leads, totals] = await Promise.all([getRecentLeads(100), getLeadTotals()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">LEADS</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Recent email signups and lead trends
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">Today</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-heading text-off-white">{totals.today}</p>
            <TrendIndicator current={totals.today} previous={totals.previousDay} />
          </div>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">This Week</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-heading text-off-white">{totals.thisWeek}</p>
            <TrendIndicator current={totals.thisWeek} previous={totals.previousWeek} />
          </div>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">This Month</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-heading text-off-white">{totals.thisMonth}</p>
            <TrendIndicator current={totals.thisMonth} previous={totals.previousMonth} />
          </div>
        </div>
      </div>

      {/* Leads table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider">
            RECENT SIGNUPS ({leads.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Source Page
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr
                  key={`${lead.email}-${i}`}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-off-white font-mono">
                    {lead.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-muted whitespace-nowrap">
                    {formatDate(lead.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-muted">
                    {lead.source}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-foreground-subtle text-sm">
                    No signups recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
