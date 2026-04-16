import { computePeriodStats, getStatsForRange, getDailyVisitors, getDailyBreakdown, type PeriodStats } from "@/lib/admin/events-store";
import { parseTimeRangeWithComparison } from "@/lib/admin/time-ranges";
import { requireAuth } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StatCard } from "./components/charts/StatCard";
import { TimeRangePicker } from "./components/TimeRangePicker";
import { TimeSeriesChart } from "./components/charts/TimeSeriesChart";
import { DonutChart } from "./components/charts/DonutChart";
import { FunnelDisplay } from "./components/charts/FunnelDisplay";

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

const DEMO_CURRENT: PeriodStats = { visitors: 1842, signups: 68, conversionRate: 3.7, skoolTrials: 8 };
const DEMO_PREVIOUS: PeriodStats = { visitors: 1650, signups: 59, conversionRate: 3.6, skoolTrials: 6 };

// Generate realistic 30-day demo visitor data
function generateDemoTimeSeries(): { date: string; visitors: number; signups: number }[] {
  const data: { date: string; visitors: number; signups: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    // Weekday boost: Mon-Fri gets higher traffic
    const dayOfWeek = d.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const baseVisitors = isWeekday ? 210 : 140;
    // Add some variance
    const visitors = baseVisitors + Math.round(Math.sin(i * 0.5) * 40 + (Math.random() * 30 - 15));
    const signups = Math.round(visitors * (0.034 + Math.random() * 0.012));
    data.push({ date: dateStr, visitors, signups });
  }
  return data;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireAuth();
  if (user.role !== "admin") {
    redirect("/admin/my-day");
  }

  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "30d";
  const { from, to, prevFrom, prevTo, label: rangeLabel, compLabel } =
    parseTimeRangeWithComparison(rangeParam);

  // ── Range-aware stats for stat cards ────────────────────────
  let currentStats: PeriodStats;
  let previousStats: PeriodStats;

  try {
    [currentStats, previousStats] = await Promise.all([
      computePeriodStats(from, to),
      computePeriodStats(prevFrom, prevTo),
    ]);
  } catch {
    // Database not provisioned yet — use demo data
    currentStats = DEMO_CURRENT;
    previousStats = DEMO_PREVIOUS;
  }

  // Compute percentage changes safely
  function pctChange(current: number, previous: number): number | undefined {
    if (previous === 0 && current === 0) return undefined;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }

  // ── Sparkline data — use the selected range (up to last 30 points) ──
  let sparkVisitors = [0, 0, 0, 0, 0, 0, 0];
  let sparkSignups = [0, 0, 0, 0, 0, 0, 0];
  let sparkTrials = [0, 0, 0, 0, 0, 0, 0];

  try {
    const daily = await getDailyBreakdown(from, to);
    if (daily.length > 0) {
      // Take up to last 30 data points for sparklines
      const tail = daily.slice(-30);
      sparkVisitors = tail.map((d) => d.visitors);
      sparkSignups = tail.map((d) => d.signups);
      sparkTrials = tail.map((d) => d.trials);
    }
  } catch {
    // Non-critical — hardcoded fallback already set
  }

  // ── Ranged data for tables and charts ───────────────────────
  let topPages = PLACEHOLDER_TOP_PAGES;
  let trafficSources = PLACEHOLDER_SOURCES;
  let timeSeries = generateDemoTimeSeries();

  try {
    const [rangedStats, dailyVisitors] = await Promise.all([
      getStatsForRange(from, to),
      getDailyVisitors(from, to),
    ]);

    // Trust the DB query outcome — if it returns empty arrays, show an empty
    // state instead of substituting fake top pages / referrers, which made
    // the dashboard look alive when nothing had been tracked yet.
    topPages = rangedStats.pages.slice(0, 5).map((p) => ({
      page: p.page,
      views: p.views,
      signups: p.signups,
      convRate: p.conversionRate,
    }));

    trafficSources = rangedStats.traffic.referrers.slice(0, 6).map((r) => ({
      name: r.referrer,
      value: r.count,
    }));

    timeSeries = dailyVisitors.map((d) => ({
      date: d.date,
      visitors: d.visitors,
      signups: 0,
    }));
  } catch {
    // DB not available — placeholders already set above
  }

  // ── Funnel uses the selected range ──────────────────────────
  const funnelSteps = [
    { label: "Visitors", value: currentStats.visitors },
    { label: "Email Signups", value: currentStats.signups },
    { label: "Skool Trials", value: currentStats.skoolTrials },
  ];


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

      {/* Stat cards — reflect selected range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`Visitors (${rangeLabel})`}
          value={currentStats.visitors}
          change={pctChange(currentStats.visitors, previousStats.visitors)}
          changeLabel={compLabel}
          sparkData={sparkVisitors}
        />
        <StatCard
          label={`Email Signups (${rangeLabel})`}
          value={currentStats.signups}
          change={pctChange(currentStats.signups, previousStats.signups)}
          changeLabel={compLabel}
          sparkData={sparkSignups}
        />
        <StatCard
          label={`Conversion Rate (${rangeLabel})`}
          value={`${currentStats.conversionRate.toFixed(1)}%`}
          change={pctChange(currentStats.conversionRate, previousStats.conversionRate)}
          changeLabel={compLabel}
        />
        <StatCard
          label={`Skool Trials (${rangeLabel})`}
          value={currentStats.skoolTrials}
          change={pctChange(currentStats.skoolTrials, previousStats.skoolTrials)}
          changeLabel={compLabel}
          sparkData={sparkTrials}
        />
      </div>

      {/* Period vs Previous comparison — contextual to selected range */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-3">
            CURRENT PERIOD ({rangeLabel.toUpperCase()})
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Visitors</p>
              <p className="text-xl font-heading text-off-white">{currentStats.visitors.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Signups</p>
              <p className="text-xl font-heading text-off-white">{currentStats.signups}</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Conv. Rate</p>
              <p className="text-xl font-heading text-off-white">{currentStats.conversionRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-foreground-subtle text-xs uppercase tracking-wider">Skool Trials</p>
              <p className="text-xl font-heading text-off-white">{currentStats.skoolTrials}</p>
            </div>
          </div>
        </div>
        {compLabel && (
          <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
            <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-3">
              PREVIOUS PERIOD ({compLabel.toUpperCase()})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-foreground-subtle text-xs uppercase tracking-wider">Visitors</p>
                <p className="text-xl font-heading text-off-white">{previousStats.visitors.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs uppercase tracking-wider">Signups</p>
                <p className="text-xl font-heading text-off-white">{previousStats.signups}</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs uppercase tracking-wider">Conv. Rate</p>
                <p className="text-xl font-heading text-off-white">{previousStats.conversionRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-foreground-subtle text-xs uppercase tracking-wider">Skool Trials</p>
                <p className="text-xl font-heading text-off-white">{previousStats.skoolTrials}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visitors Over Time chart */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          VISITORS OVER TIME
        </h2>
        <TimeSeriesChart
          data={timeSeries}
          dataKeys={[
            { key: "visitors", color: "#E8836B", label: "Visitors" },
            { key: "signups", color: "#4ADE80", label: "Signups" },
          ]}
          height={256}
        />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          CONVERSION FUNNEL ({rangeLabel.toUpperCase()})
        </h2>
        <FunnelDisplay steps={funnelSteps} />
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
                {topPages.map((row) => (
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

        {/* Traffic Sources — now with DonutChart */}
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
            TRAFFIC SOURCES
          </h2>
          <DonutChart data={trafficSources} />
        </div>
      </div>
    </div>
  );
}
