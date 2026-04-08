const PLACEHOLDER_DATA = [
  { page: "/blog/zone-2-training-guide", views: 1284, signups: 47, convRate: 3.7 },
  { page: "/blog/winter-base-miles", views: 892, signups: 31, convRate: 3.5 },
  { page: "/blog/ftp-test-protocol", views: 756, signups: 19, convRate: 2.5 },
  { page: "/podcast/ep-42-nutrition", views: 623, signups: 28, convRate: 4.5 },
  { page: "/blog/gravel-bike-setup", views: 541, signups: 12, convRate: 2.2 },
  { page: "/", views: 2103, signups: 84, convRate: 4.0 },
  { page: "/podcast", views: 478, signups: 22, convRate: 4.6 },
  { page: "/blog/indoor-training-apps", views: 412, signups: 8, convRate: 1.9 },
];

function ConvBadge({ rate }: { rate: number }) {
  let color = "text-foreground-subtle bg-white/5";
  if (rate >= 4) color = "text-green-400 bg-green-400/10";
  else if (rate >= 2.5) color = "text-yellow-400 bg-yellow-400/10";
  else if (rate > 0) color = "text-coral bg-coral/10";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {rate.toFixed(1)}%
    </span>
  );
}

export default async function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          CONTENT PERFORMANCE
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Page-level views, signups, and conversion rates
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Pages Tracked
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {PLACEHOLDER_DATA.length}
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Total Views
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {PLACEHOLDER_DATA.reduce((s, p) => s + p.views, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Avg Conv. Rate
          </p>
          <p className="text-2xl font-heading text-off-white tracking-wide">
            {(PLACEHOLDER_DATA.reduce((s, p) => s + p.convRate, 0) / PLACEHOLDER_DATA.length).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Content table */}
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
                  Conv Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {PLACEHOLDER_DATA.sort((a, b) => b.views - a.views).map((row) => (
                <tr
                  key={row.page}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-off-white font-medium">
                      {row.page}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-off-white tabular-nums">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-off-white tabular-nums">
                    {row.signups}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConvBadge rate={row.convRate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
