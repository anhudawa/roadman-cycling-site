import { requireAuth } from "@/lib/admin/auth";
import {
  getMrrSummary,
  formatCents,
  formatCentsCompact,
  TARGET_MRR_CENTS,
} from "@/lib/crm/mission-control";
import { TimeSeriesChart } from "../components/charts/TimeSeriesChart";

export const dynamic = "force-dynamic";

function pctFmt(n: number): string {
  return `${n.toFixed(1)}%`;
}

export default async function MissionControlPage() {
  await requireAuth();

  const summary = await getMrrSummary({ trendDays: 90 });

  if (!summary) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          MISSION CONTROL
        </h1>
        <div className="p-6 rounded-xl border border-coral/20 bg-coral/5 text-coral">
          Stripe isn&apos;t reachable — check STRIPE_SECRET_KEY on Vercel and
          confirm the /api/cron/stripe-snapshot cron is running.
        </div>
      </div>
    );
  }

  const { now, trend } = summary;

  const target = TARGET_MRR_CENTS;
  const pctToTarget = Math.min(100, (now.mrrCents / target) * 100);
  const monthsRemaining = summary.monthsToTargetAtCurrentPace;
  const monthsStr =
    monthsRemaining === null
      ? "—"
      : monthsRemaining >= 120
        ? ">10 yrs"
        : `${monthsRemaining.toFixed(1)} mo`;

  const chartData = trend.map((p) => ({
    date: p.date,
    MRR: p.mrrCents / 100,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            MISSION CONTROL
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {now.fromSnapshot
              ? `MRR snapshot ${new Date(now.asOf).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}. Target ${formatCents(target)} MRR.`
              : "Live Stripe fetch (no snapshot yet). Target $100,000 MRR."}
          </p>
        </div>
      </div>

      {/* Hero — MRR + glide path */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-background-elevated border border-coral/20 rounded-xl p-6 bg-gradient-to-br from-coral/[0.04] to-transparent">
          <div className="flex items-baseline gap-3 flex-wrap">
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle">
              Current MRR
            </p>
            {summary.moMChangePct !== null && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                  summary.moMChangePct >= 0
                    ? "text-green-400 bg-green-400/10 border-green-400/30"
                    : "text-coral bg-coral/10 border-coral/30"
                }`}
              >
                {summary.moMChangePct >= 0 ? "+" : ""}
                {summary.moMChangePct.toFixed(1)}% MoM
              </span>
            )}
          </div>
          <p className="font-heading text-off-white text-5xl mt-2 tracking-wide">
            {formatCents(now.mrrCents)}
          </p>
          <p className="text-foreground-muted text-sm mt-1">
            {now.activeSubscriptions.toLocaleString()} active ·{" "}
            {now.trialingCount} trialing ·{" "}
            {now.pastDueCount > 0 ? (
              <span className="text-coral">
                {now.pastDueCount} past due ({formatCents(now.pastDueMrrCents)})
              </span>
            ) : (
              <span>0 past due</span>
            )}
          </p>

          {/* Glide path bar */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between text-[10px] uppercase tracking-widest text-foreground-subtle mb-1">
              <span>Glide path to {formatCentsCompact(target)}</span>
              <span>{pctToTarget.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-coral to-coral-hover rounded-full"
                style={{ width: `${pctToTarget}%` }}
              />
            </div>
            <p className="text-foreground-subtle text-xs mt-2">
              Need {formatCents(Math.max(0, target - now.mrrCents))} more.
              At {formatCents(summary.monthlyNetAddCents)}/mo net add (30-day
              avg) that&apos;s{" "}
              <span className="text-off-white font-semibold">{monthsStr}</span>
              .
            </p>
          </div>
        </div>

        {/* Side stack: net add, churn, trial conv */}
        <div className="flex flex-col gap-3">
          <Tile
            label="Monthly net MRR add"
            value={formatCents(summary.monthlyNetAddCents)}
            sub={`${formatCents(summary.avgDailyNetAdd30dCents)}/day avg`}
            tone={summary.monthlyNetAddCents >= 0 ? "good" : "bad"}
          />
          <Tile
            label="Churn (30d)"
            value={
              summary.churnedSubscribers30d === 0
                ? "0"
                : `${summary.churnedSubscribers30d} subs`
            }
            sub={
              summary.approxChurnedMrrCents > 0
                ? `≈ ${formatCents(summary.approxChurnedMrrCents)} MRR`
                : "No churn recorded"
            }
            tone={summary.churnedSubscribers30d > 0 ? "bad" : "good"}
          />
          <Tile
            label="Trial → paid (30d)"
            value={pctFmt(summary.trialConversionRate * 100)}
            sub={`${summary.trialsConverted30d}/${summary.trialsStarted30d} trials`}
            tone="neutral"
          />
        </div>
      </div>

      {/* MRR trend line */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium">
              MRR Trend (90d)
            </p>
            <p className="text-foreground-muted text-xs">
              USD per month, normalised across plans
            </p>
          </div>
          {trend.length < 2 && (
            <p className="text-[10px] text-coral">
              Need ≥2 snapshots — cron runs daily 06:50 UTC
            </p>
          )}
        </div>
        {trend.length >= 2 ? (
          <TimeSeriesChart
            data={chartData}
            dataKeys={[{ key: "MRR", color: "#E8836B", label: "MRR (USD)" }]}
            height={280}
          />
        ) : (
          <div className="h-72 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <p className="text-foreground-subtle text-sm">
              Chart populates after the stripe-snapshot cron has run for 2+ days
            </p>
          </div>
        )}
      </div>

      {/* Unit diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmallTile
          label="ARPU"
          value={
            now.activeSubscriptions > 0
              ? formatCents(
                  Math.round(now.mrrCents / now.activeSubscriptions)
                )
              : "—"
          }
          sub="MRR / active subs"
        />
        <SmallTile
          label="Annual-plan MRR"
          value={formatCents(now.annualMrrCents)}
          sub={
            now.mrrCents > 0
              ? `${((now.annualMrrCents / now.mrrCents) * 100).toFixed(0)}% of MRR`
              : "—"
          }
        />
        <SmallTile
          label="At-risk MRR"
          value={formatCents(now.pastDueMrrCents)}
          sub={`${now.pastDueCount} past-due ${now.pastDueCount === 1 ? "sub" : "subs"}`}
          tone={now.pastDueMrrCents > 0 ? "bad" : "good"}
        />
      </div>

      {/* Decision lane */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-foreground-subtle font-medium mb-3">
          Decisions this page unlocks
        </p>
        <ul className="text-sm text-foreground-muted space-y-2">
          <li className="flex gap-2">
            <span className="text-coral mt-0.5">→</span>
            Are we on track for {formatCentsCompact(target)} MRR? If net add
            is less than{" "}
            {formatCents(Math.round(target / 18 / 100) * 100)}/mo you won&apos;t
            hit it inside 18 months at current pace.
          </li>
          <li className="flex gap-2">
            <span className="text-coral mt-0.5">→</span>
            Any past-due MRR? Recover first — churn prevention is the cheapest
            MRR there is.
          </li>
          <li className="flex gap-2">
            <span className="text-coral mt-0.5">→</span>
            Trial conversion below ~35%? Tighten the trial experience before
            pouring more top-of-funnel into it.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const valColor =
    tone === "good"
      ? "text-green-400"
      : tone === "bad"
        ? "text-coral"
        : "text-off-white";
  return (
    <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-foreground-subtle">
        {label}
      </p>
      <p className={`font-heading text-2xl tracking-wide mt-1 ${valColor}`}>
        {value}
      </p>
      <p className="text-foreground-subtle text-xs mt-1">{sub}</p>
    </div>
  );
}

function SmallTile({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const valColor =
    tone === "good"
      ? "text-green-400"
      : tone === "bad"
        ? "text-coral"
        : "text-off-white";
  return (
    <div className="bg-background-elevated border border-white/5 rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-foreground-subtle">
        {label}
      </p>
      <p className={`font-heading text-xl tracking-wide mt-1 ${valColor}`}>
        {value}
      </p>
      <p className="text-foreground-subtle text-xs mt-1">{sub}</p>
    </div>
  );
}
