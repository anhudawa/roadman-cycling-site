import { maskEmail } from "@/lib/admin/events-store";
import {
  getTrialsAtRisk,
  getStalledSubscribers,
  getHealthStats,
  type AtRiskTrial,
  type StalledSubscriber,
} from "@/lib/admin/subscribers-store";

const DEMO_TRIALS: AtRiskTrial[] = [
  { email: "j***n@gmail.com", trialStartedAt: new Date(Date.now() - 5 * 86400000), daysLeft: 2, sourcePage: "/blog/zone-2-training" },
  { email: "s***a@outlook.com", trialStartedAt: new Date(Date.now() - 4 * 86400000), daysLeft: 3, sourcePage: "/" },
  { email: "m***e@yahoo.com", trialStartedAt: new Date(Date.now() - 2 * 86400000), daysLeft: 5, sourcePage: "/podcast" },
];

const DEMO_STALLED: StalledSubscriber[] = [
  { email: "r***k@gmail.com", signedUpAt: new Date(Date.now() - 21 * 86400000), stalledStage: "no_skool", daysSinceSignup: 21 },
  { email: "d***s@icloud.com", signedUpAt: new Date(Date.now() - 18 * 86400000), stalledStage: "no_skool", daysSinceSignup: 18 },
  { email: "l***y@hotmail.com", signedUpAt: new Date(Date.now() - 16 * 86400000), stalledStage: "no_trial", daysSinceSignup: 16 },
];

function stageLabel(stage: string): string {
  switch (stage) {
    case "no_skool": return "Not joined Skool";
    case "no_trial": return "No trial started";
    case "no_paid": return "Trial not converted";
    default: return stage;
  }
}

function stageColor(stage: string): string {
  switch (stage) {
    case "no_skool": return "text-coral bg-coral/10";
    case "no_trial": return "text-yellow-400 bg-yellow-400/10";
    case "no_paid": return "text-blue-400 bg-blue-400/10";
    default: return "text-foreground-subtle bg-white/5";
  }
}

export default async function HealthPage() {
  let trials = DEMO_TRIALS;
  let stalled = DEMO_STALLED;
  let healthStats = { trialToPaidRate: 62.5, trialToPaidRateAvg: 58.3, newSignupsTrend: 8.2, communityGrowthRate: 12.1 };
  let usingLiveData = false;

  try {
    const [t, s, h] = await Promise.all([
      getTrialsAtRisk(),
      getStalledSubscribers(),
      getHealthStats(),
    ]);
    // If the DB query succeeded (even with empty arrays / zeros), show the
    // real numbers instead of fake demo placeholders.
    trials = t;
    stalled = s;
    healthStats = h;
    usingLiveData = true;
  } catch {
    // DB not available — demo data already set
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          HEALTH
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          {usingLiveData ? "Churn risk signals and funnel health" : "Demo data \u2014 will populate as subscribers flow through"}
        </p>
      </div>

      {/* Health indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Trial → Paid (This Week)
          </p>
          <p className="text-2xl font-heading text-off-white">
            {healthStats.trialToPaidRate.toFixed(0)}%
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            Avg: {healthStats.trialToPaidRateAvg.toFixed(0)}%
          </p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            New Signups Trend
          </p>
          <p className={`text-2xl font-heading ${healthStats.newSignupsTrend >= 0 ? "text-green-400" : "text-coral"}`}>
            {healthStats.newSignupsTrend >= 0 ? "+" : ""}{healthStats.newSignupsTrend.toFixed(0)}%
          </p>
          <p className="text-xs text-foreground-subtle mt-1">vs previous week</p>
        </div>
        <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
          <p className="text-foreground-subtle text-xs uppercase tracking-wider mb-1">
            Community Growth
          </p>
          <p className={`text-2xl font-heading ${healthStats.communityGrowthRate >= 0 ? "text-green-400" : "text-coral"}`}>
            {healthStats.communityGrowthRate >= 0 ? "+" : ""}{healthStats.communityGrowthRate.toFixed(0)}%
          </p>
          <p className="text-xs text-foreground-subtle mt-1">Skool joins vs prev week</p>
        </div>
      </div>

      {/* Trials at risk */}
      <div className="bg-background-elevated border border-red-500/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <h2 className="font-heading text-sm text-red-400 tracking-wider">
            AT RISK — TRIALS EXPIRING ({trials.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Email</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Trial Started</th>
                <th className="text-right px-3 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Days Left</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((t, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-off-white font-mono">{maskEmail(t.email)}</td>
                  <td className="px-3 py-3 text-foreground-muted">
                    {t.trialStartedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t.daysLeft <= 1 ? "text-red-400 bg-red-400/10" :
                      t.daysLeft <= 3 ? "text-yellow-400 bg-yellow-400/10" :
                      "text-foreground-muted bg-white/5"
                    }`}>
                      {t.daysLeft}d
                    </span>
                  </td>
                  <td className="px-5 py-3 text-foreground-subtle">{t.sourcePage ?? "--"}</td>
                </tr>
              ))}
              {trials.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-foreground-subtle">No active trials</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stalled in funnel */}
      <div className="bg-background-elevated border border-yellow-500/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <h2 className="font-heading text-sm text-yellow-400 tracking-wider">
            STALLED IN FUNNEL ({stalled.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Email</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Signed Up</th>
                <th className="text-left px-3 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Stuck At</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">Days</th>
              </tr>
            </thead>
            <tbody>
              {stalled.map((s, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-off-white font-mono">{maskEmail(s.email)}</td>
                  <td className="px-3 py-3 text-foreground-muted">
                    {s.signedUpAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageColor(s.stalledStage)}`}>
                      {stageLabel(s.stalledStage)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-foreground-muted tabular-nums">{s.daysSinceSignup}d</td>
                </tr>
              ))}
              {stalled.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-foreground-subtle">No stalled subscribers</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
