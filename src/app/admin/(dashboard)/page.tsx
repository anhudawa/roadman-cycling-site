import { getDashboardStats, type DashboardStats } from "@/lib/admin/events-store";
import { Suspense } from "react";
import { StatCard } from "./components/charts/StatCard";
import { TimeRangePicker } from "./components/TimeRangePicker";

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
      <p className="text-foreground-subtle text-sm">{label}</p>
    </div>
  );
}

const PLACEHOLDER_TOP_PAGES = [
  { page: "/", views: 842, signups: 34, convRate: 4.0 },
  { page: "/blog/zone-2-training", views: 621, signups: 23, convRate: 3.7 },
  { page: "/podcast", views: 418, signups: 19, convRate: 4.5 },
  { page: "/blog/winter-base-miles", views: 312, signups: 11, convRate: 3.5 },
  { page: "/blog/ftp-test", views: 289, signups: 7, convRate: 2.4 },
];

const PLACEHOLDER_SOURCES = [
  { name: "Organic Search", value: 42 },
  { name: "Direct", value: 28 },
  { name: "Social", value: 18 },
  { name: "Referral", value: 12 },
];

const DEMO_STATS: DashboardStats = {
  today: { visitors: 127, signups: 5, conversionRate: 3.9, skoolTrials: 1 },
  thisWeek: { visitors: 1842, signups: 68, conversionRate: 3.7, skoolTrials: 8 },
  thisMonth: { visitors: 6430, signups: 241, conversionRate: 3.7, skoolTrials: 24 },
  previousDay: { visitors: 118, signups: 4, conversionRate: 3.4, skoolTrials: 0 },
  previousWeek: { visitors: 1650, signups: 59, conversionRate: 3.6, skoolTrials: 6 },
  previousMonth: { visitors: 5890, signups: 212, conversionRate: 3.6, skoolTrials: 19 },
};

export default async function AdminDashboardPage() {
  let stats: DashboardStats;
  try {
    stats = await getDashboardStats();
  } catch {
    // Database not provisioned yet — use demo data
    stats = DEMO_STATS;
  }

  // Compute percentage changes safely
  function pctChange(current: number, previous: number): number | undefined {
    if (previous === 0 && current === 0) return undefined;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            DASHBOARD
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Overview of site performance
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Visitors (Week)"
          value={stats.thisWeek.visitors}
          change={pctChange(stats.thisWeek.visitors, stats.previousWeek.visitors)}
          changeLabel="vs prev"
          sparkData={[12, 18, 14, 22, 19, 28, 24]}
        />
        <StatCard
          label="Email Signups (Week)"
          value={stats.thisWeek.signups}
          change={pctChange(stats.thisWeek.signups, stats.previousWeek.signups)}
          changeLabel="vs prev"
          sparkData={[3, 5, 4, 7, 6, 8, 5]}
        />
        <StatCard
          label="Conversion Rate"
          value={`${stats.thisWeek.conversionRate.toFixed(1)}%`}
          change={pctChange(stats.thisWeek.conversionRate, stats.previousWeek.conversionRate)}
          changeLabel="vs prev"
        />
        <StatCard
          label="Skool Trials (Week)"
          value={stats.thisWeek.skoolTrials}
          change={pctChange(stats.thisWeek.skoolTrials, stats.previousWeek.skoolTrials)}
          changeLabel="vs prev"
          sparkData={[1, 0, 2, 1, 3, 2, 1]}
        />
      </div>

      {/* Today and Month summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-3">
            TODAY
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Visitors</p>
              <p className="text-xl font-heading text-off-white">{stats.today.visitors}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Signups</p>
              <p className="text-xl font-heading text-off-white">{stats.today.signups}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Conv. Rate</p>
              <p className="text-xl font-heading text-off-white">{stats.today.conversionRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Skool Trials</p>
              <p className="text-xl font-heading text-off-white">{stats.today.skoolTrials}</p>
            </div>
          </div>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-3">
            THIS MONTH
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Visitors</p>
              <p className="text-xl font-heading text-off-white">{stats.thisMonth.visitors.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Signups</p>
              <p className="text-xl font-heading text-off-white">{stats.thisMonth.signups}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Conv. Rate</p>
              <p className="text-xl font-heading text-off-white">{stats.thisMonth.conversionRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Skool Trials</p>
              <p className="text-xl font-heading text-off-white">{stats.thisMonth.skoolTrials}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visitors Over Time chart area */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          VISITORS OVER TIME
        </h2>
        <ChartPlaceholder label="Time series chart will render once daily aggregation is wired up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Converting Pages */}
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
            TOP CONVERTING PAGES
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left pb-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Page
                  </th>
                  <th className="text-right pb-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Views
                  </th>
                  <th className="text-right pb-2 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Conv %
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLACEHOLDER_TOP_PAGES.map((row) => (
                  <tr key={row.page} className="border-b border-white/[0.03]">
                    <td className="py-2.5 text-sm text-off-white">{row.page}</td>
                    <td className="py-2.5 text-sm text-foreground-muted text-right tabular-nums">
                      {row.views}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          row.convRate >= 4
                            ? "text-green-400 bg-green-400/10"
                            : row.convRate >= 2.5
                              ? "text-yellow-400 bg-yellow-400/10"
                              : "text-coral bg-coral/10"
                        }`}
                      >
                        {row.convRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
            TRAFFIC SOURCES
          </h2>
          <div className="space-y-3">
            {PLACEHOLDER_SOURCES.map((source) => (
              <div key={source.name} className="flex items-center gap-3">
                <span className="text-sm text-foreground-muted w-32 truncate">
                  {source.name}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coral rounded-full transition-all"
                    style={{ width: `${source.value}%` }}
                  />
                </div>
                <span className="text-sm text-off-white tabular-nums w-10 text-right">
                  {source.value}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground-subtle mt-4">
            Donut chart will render once real traffic source data is aggregated
          </p>
        </div>
      </div>
    </div>
  );
}
