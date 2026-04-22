import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { FunnelDisplay } from "../components/charts/FunnelDisplay";
import { CohortTable } from "../components/CohortTable";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import {
  getFunnelStats,
  getCohortData,
  getSourceBreakdown,
  type FunnelStats,
  type CohortRow,
  type SourceRow,
} from "@/lib/admin/subscribers-store";

const DEMO_FUNNEL: FunnelStats = {
  signups: 142, skoolJoins: 23, trialStarts: 8, paidMembers: 5, activeAfter30d: 3,
};

const DEMO_COHORTS: CohortRow[] = [
  { week: "2026-03-31", signups: 142, skoolJoins: 23, trialStarts: 8, paidMembers: 5, activeAfter30d: 0 },
  { week: "2026-03-24", signups: 128, skoolJoins: 19, trialStarts: 6, paidMembers: 4, activeAfter30d: 3 },
  { week: "2026-03-17", signups: 135, skoolJoins: 21, trialStarts: 7, paidMembers: 4, activeAfter30d: 3 },
];

const DEMO_SOURCES: SourceRow[] = [
  { source: "organic", signups: 62, paidMembers: 1, convRate: 1.6 },
  { source: "podcast", signups: 45, paidMembers: 3, convRate: 6.7 },
  { source: "referral", signups: 18, paidMembers: 1, convRate: 5.6 },
  { source: "social", signups: 17, paidMembers: 0, convRate: 0 },
];

export default async function FunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "30d";
  const { from, to } = parseTimeRange(rangeParam);

  let funnel = DEMO_FUNNEL;
  let cohorts = DEMO_COHORTS;
  let sources = DEMO_SOURCES;
  let usingLiveData = false;

  try {
    const [f, c, s] = await Promise.all([
      getFunnelStats(from, to),
      getCohortData(from, to),
      getSourceBreakdown(from, to),
    ]);
    // If the DB query succeeded (even with zeros), trust the live numbers —
    // showing demo data when real data is just empty misled us into thinking
    // the site was more active than it was.
    funnel = f;
    cohorts = c;
    sources = s;
    usingLiveData = true;
  } catch {
    // DB not available — demo data already set
  }

  const funnelSteps = [
    { label: "Email Signups", value: funnel.signups },
    { label: "Skool Joins", value: funnel.skoolJoins },
    { label: "Trial Starts", value: funnel.trialStarts },
    { label: "Paid Members", value: funnel.paidMembers },
    { label: "Active 30d", value: funnel.activeAfter30d },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            FUNNEL
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {usingLiveData
              ? "End-to-end conversion tracking"
              : "Demo data \u2014 subscriber data will populate as signups flow through"}
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>

      {/* Funnel visualization */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          CONVERSION FUNNEL
        </h2>
        <FunnelDisplay steps={funnelSteps} />
      </div>

      {/* Cohort table */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          WEEKLY COHORTS
        </h2>
        <CohortTable rows={cohorts} />
      </div>

      {/* Source breakdown */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          ACQUISITION SOURCE BREAKDOWN
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Source
                </th>
                <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Signups
                </th>
                <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Paid
                </th>
                <th className="text-right py-3 pl-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                  Conv %
                </th>
              </tr>
            </thead>
            <tbody>
              {sources.map((row) => (
                <tr key={row.source} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-off-white capitalize">{row.source}</td>
                  <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">{row.signups}</td>
                  <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">{row.paidMembers}</td>
                  <td className="py-3 pl-3 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      row.convRate >= 5 ? "text-green-400 bg-green-400/10" :
                      row.convRate >= 2 ? "text-yellow-400 bg-yellow-400/10" :
                      row.convRate > 0 ? "text-[var(--color-bad)] bg-[var(--color-bad-tint)]" :
                      "text-foreground-subtle bg-white/5"
                    }`}>
                      {row.convRate.toFixed(1)}%
                    </span>
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
