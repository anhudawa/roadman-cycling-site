import { getDashboardStats } from "@/lib/admin/events-store";
import { seedEvents } from "@/lib/admin/seed";

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
      {Math.abs(change).toFixed(0)}%
    </span>
  );
}

function StatCard({
  label,
  value,
  previousValue,
  format,
}: {
  label: string;
  value: number;
  previousValue: number;
  format?: "number" | "percent";
}) {
  const displayValue =
    format === "percent" ? `${value.toFixed(1)}%` : value.toLocaleString();

  return (
    <div className="bg-background-elevated border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
      <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-heading text-off-white tracking-wide">
          {displayValue}
        </p>
        <TrendIndicator current={value} previous={previousValue} />
      </div>
    </div>
  );
}

function MiniBar({ value, max, color = "coral" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const bg = color === "coral" ? "bg-coral" : color === "purple" ? "bg-purple" : "bg-green-400";
  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden w-full">
      <div
        className={`h-full ${bg} rounded-full transition-all`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export default async function AdminDashboardPage() {
  // Ensure seed data exists
  await seedEvents();

  const stats = await getDashboardStats();

  const periods = [
    { label: "Today", current: stats.today, previous: stats.previousDay },
    { label: "This Week", current: stats.thisWeek, previous: stats.previousWeek },
    { label: "This Month", current: stats.thisMonth, previous: stats.previousMonth },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          DASHBOARD
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          Overview of site performance
        </p>
      </div>

      {/* Period sections */}
      {periods.map((period) => (
        <section key={period.label}>
          <h2 className="font-heading text-lg text-foreground-muted tracking-wider mb-3">
            {period.label.toUpperCase()}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Visitors"
              value={period.current.visitors}
              previousValue={period.previous.visitors}
            />
            <StatCard
              label="Email Signups"
              value={period.current.signups}
              previousValue={period.previous.signups}
            />
            <StatCard
              label="Conversion Rate"
              value={period.current.conversionRate}
              previousValue={period.previous.conversionRate}
              format="percent"
            />
            <StatCard
              label="Skool Trials"
              value={period.current.skoolTrials}
              previousValue={period.previous.skoolTrials}
            />
          </div>
        </section>
      ))}

      {/* Quick visual: weekly visitors vs signups */}
      <section>
        <h2 className="font-heading text-lg text-foreground-muted tracking-wider mb-3">
          WEEKLY SNAPSHOT
        </h2>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Visitors</span>
              <span className="text-off-white">{stats.thisWeek.visitors.toLocaleString()}</span>
            </div>
            <MiniBar value={stats.thisWeek.visitors} max={stats.thisWeek.visitors} color="purple" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Signups</span>
              <span className="text-off-white">{stats.thisWeek.signups.toLocaleString()}</span>
            </div>
            <MiniBar value={stats.thisWeek.signups} max={stats.thisWeek.visitors} color="coral" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Skool Trials</span>
              <span className="text-off-white">{stats.thisWeek.skoolTrials}</span>
            </div>
            <MiniBar value={stats.thisWeek.skoolTrials} max={stats.thisWeek.signups || 1} color="green" />
          </div>
        </div>
      </section>
    </div>
  );
}
