import { requireAuth } from "@/lib/admin/auth";
import {
  getMrrSummary,
  formatCents,
  formatCentsCompact,
  TARGET_MRR_CENTS,
} from "@/lib/crm/mission-control";
import { TimeSeriesChart } from "../components/charts/TimeSeriesChart";
import {
  Card,
  CardBody,
  PageHeader,
  Pill,
  SectionLabel,
  StatTile,
} from "@/components/admin/ui";

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
        <PageHeader title="Mission Control" />
        <Card tone="danger">
          <CardBody>
            <SectionLabel tone="coral">Stripe unreachable</SectionLabel>
            <p className="text-foreground-muted text-sm mt-2">
              Check <code className="bg-black/40 px-1 rounded">STRIPE_SECRET_KEY</code>{" "}
              on Vercel and confirm the{" "}
              <code className="bg-black/40 px-1 rounded">/api/cron/stripe-snapshot</code>{" "}
              cron is running. Once it lands a row in{" "}
              <code className="bg-black/40 px-1 rounded">stripe_snapshots</code>,
              this page populates.
            </p>
          </CardBody>
        </Card>
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

  const asOfLabel = new Date(now.asOf).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mission Control"
        subtitle={
          now.fromSnapshot
            ? `MRR snapshot ${asOfLabel} · target ${formatCents(target)} MRR`
            : "Live Stripe fetch (no snapshot yet) · target $100,000 MRR"
        }
      />

      {/* Hero: MRR + glide path + side tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card tone="raised" className="lg:col-span-2">
          <CardBody className="p-6">
            <div className="flex items-baseline gap-3 flex-wrap">
              <SectionLabel>Current MRR</SectionLabel>
              {summary.moMChangePct !== null && (
                <Pill tone={summary.moMChangePct >= 0 ? "good" : "bad"}>
                  {summary.moMChangePct >= 0 ? "+" : ""}
                  {summary.moMChangePct.toFixed(1)}% MoM
                </Pill>
              )}
            </div>
            <p className="font-heading text-off-white text-5xl mt-2 tracking-wide tabular-nums">
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
              <div className="flex items-baseline justify-between mb-1.5">
                <SectionLabel>
                  Glide path to {formatCentsCompact(target)}
                </SectionLabel>
                <span className="text-foreground-subtle text-xs tabular-nums">
                  {pctToTarget.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-coral to-coral-hover rounded-full transition-all"
                  style={{ width: `${pctToTarget}%` }}
                />
              </div>
              <p className="text-foreground-subtle text-xs mt-2 leading-relaxed">
                Need {formatCents(Math.max(0, target - now.mrrCents))} more. At{" "}
                {formatCents(summary.monthlyNetAddCents)}/mo net add (30-day avg)
                that&apos;s{" "}
                <span className="text-off-white font-semibold">{monthsStr}</span>.
              </p>
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-3">
          <StatTile
            label="Monthly net MRR add"
            value={formatCents(summary.monthlyNetAddCents)}
            sub={`${formatCents(summary.avgDailyNetAdd30dCents)}/day avg`}
            tone={summary.monthlyNetAddCents >= 0 ? "good" : "bad"}
          />
          <StatTile
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
          <StatTile
            label="Trial → paid (30d)"
            value={pctFmt(summary.trialConversionRate * 100)}
            sub={`${summary.trialsConverted30d}/${summary.trialsStarted30d} trials`}
          />
        </div>
      </div>

      {/* MRR trend chart */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <SectionLabel>MRR Trend (90 days)</SectionLabel>
              <p className="text-foreground-subtle text-xs mt-1">
                USD per month, normalised across plans
              </p>
            </div>
            {trend.length < 2 && (
              <Pill tone="warn">
                Need ≥2 snapshots — cron runs daily 06:50 UTC
              </Pill>
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
                Chart populates after the stripe-snapshot cron has run for 2+
                days
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Unit diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile
          label="ARPU"
          value={
            now.activeSubscriptions > 0
              ? formatCents(Math.round(now.mrrCents / now.activeSubscriptions))
              : "—"
          }
          sub="MRR / active subs"

        />
        <StatTile
          label="Annual-plan MRR"
          value={formatCents(now.annualMrrCents)}
          sub={
            now.mrrCents > 0
              ? `${((now.annualMrrCents / now.mrrCents) * 100).toFixed(0)}% of MRR`
              : "—"
          }

        />
        <StatTile
          label="At-risk MRR"
          value={formatCents(now.pastDueMrrCents)}
          sub={`${now.pastDueCount} past-due ${
            now.pastDueCount === 1 ? "sub" : "subs"
          }`}
          tone={now.pastDueMrrCents > 0 ? "bad" : "good"}

        />
      </div>

      {/* Decisions this page unlocks */}
      <Card>
        <CardBody>
          <SectionLabel>Decisions this page unlocks</SectionLabel>
          <ul className="text-sm text-foreground-muted space-y-2 mt-3">
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
        </CardBody>
      </Card>
    </div>
  );
}
