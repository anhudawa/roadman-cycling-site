import { getPageStats } from "@/lib/admin/events-store";

function ConversionBadge({ rate }: { rate: number }) {
  let color = "text-foreground-subtle bg-white/5";
  if (rate >= 5) color = "text-green-400 bg-green-400/10";
  else if (rate >= 2) color = "text-yellow-400 bg-yellow-400/10";
  else if (rate > 0) color = "text-coral bg-coral/10";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {rate.toFixed(1)}%
    </span>
  );
}

function OpportunityFlag({ views, rate }: { views: number; rate: number }) {
  // High traffic (top quartile-ish) but low conversion
  if (views >= 30 && rate < 3) {
    return (
      <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        Optimize
      </span>
    );
  }
  return null;
}

function BarInline({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden w-20">
        <div
          className="h-full bg-coral rounded-full"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs text-foreground-subtle">{value}</span>
    </div>
  );
}

export default async function EmailAnalyticsPage() {
  let pageStats;
  try {
    pageStats = await getPageStats();
  } catch {
    pageStats = [
      { page: "/", views: 842, signups: 34, conversionRate: 4.0 },
      { page: "/blog/zone-2-training", views: 621, signups: 23, conversionRate: 3.7 },
      { page: "/podcast", views: 418, signups: 19, conversionRate: 4.5 },
      { page: "/newsletter", views: 312, signups: 28, conversionRate: 9.0 },
      { page: "/tools/ftp-zones", views: 289, signups: 7, conversionRate: 2.4 },
    ];
  }
  const maxViews = pageStats.length > 0 ? pageStats[0].views : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          EMAIL ANALYTICS
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Per-page opt-in rates this week — find your best and worst converters
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider">Total Pages Tracked</p>
          <p className="text-2xl font-heading text-off-white mt-1">{pageStats.length}</p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider">Total Signups (Week)</p>
          <p className="text-2xl font-heading text-off-white mt-1">
            {pageStats.reduce((s, p) => s + p.signups, 0)}
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider">Avg Conversion</p>
          <p className="text-2xl font-heading text-off-white mt-1">
            {pageStats.length > 0
              ? (pageStats.reduce((s, p) => s + p.conversionRate, 0) / pageStats.length).toFixed(1)
              : "0"}%
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Page
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Views
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Signups
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Conv. Rate
                </th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Flag
                </th>
              </tr>
            </thead>
            <tbody>
              {pageStats.map((row) => (
                <tr
                  key={row.page}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-off-white font-medium">
                      {row.page}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <BarInline value={row.views} max={maxViews} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-off-white">
                    {row.signups}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConversionBadge rate={row.conversionRate} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <OpportunityFlag views={row.views} rate={row.conversionRate} />
                  </td>
                </tr>
              ))}
              {pageStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-foreground-subtle text-sm">
                    No data yet. Events will appear as visitors browse the site.
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
