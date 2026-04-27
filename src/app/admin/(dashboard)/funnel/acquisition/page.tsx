/**
 * Acquisition funnel — Visit → Engagement → Email → Paid → Community.
 *
 * Snapshot counting model: distinct sessions per stage in the selected
 * date range. Backed by the existing `events` table (no migration). See
 * `src/lib/admin/funnel-queries.ts` for the queries and stage-event map.
 */

import { Suspense } from "react";
import { TimeRangePicker } from "../../components/TimeRangePicker";
import { Card, CardBody } from "@/components/admin/ui";
import { FunnelDisplay } from "../../components/charts/FunnelDisplay";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { getAcquisitionFunnel } from "@/lib/admin/funnel-queries";
import { FunnelTabs } from "../_components/FunnelTabs";

export const dynamic = "force-dynamic";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export default async function AcquisitionFunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const rangeParam = typeof resolved.range === "string" ? resolved.range : "30d";
  const { from, to } = parseTimeRange(rangeParam);

  const funnel = await getAcquisitionFunnel(from, to);
  const funnelSteps = funnel.stages.map((s) => ({ label: s.label, value: s.sessionCount }));
  const visitCount = funnel.stages[0]?.sessionCount ?? 0;
  const overallConversionToEmail =
    visitCount > 0
      ? (funnel.stages.find((s) => s.stage === "email_captured")?.sessionCount ?? 0) / visitCount
      : 0;
  const overallConversionToPaid =
    visitCount > 0
      ? (funnel.stages.find((s) => s.stage === "paid_conversion")?.sessionCount ?? 0) / visitCount
      : 0;

  return (
    <div className="space-y-6">
      <FunnelTabs active="acquisition" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            ACQUISITION FUNNEL
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Visit → Engagement → Email → Paid → Community. Distinct sessions per stage in range.
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>

      {/* Top-line conversion summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardBody compact>
            <p className="text-xs uppercase tracking-wider text-foreground-subtle">Visits</p>
            <p className="font-heading text-2xl text-off-white tabular-nums mt-1">
              {visitCount.toLocaleString()}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody compact>
            <p className="text-xs uppercase tracking-wider text-foreground-subtle">
              Visit → Email
            </p>
            <p className="font-heading text-2xl text-off-white tabular-nums mt-1">
              {pct(overallConversionToEmail)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody compact>
            <p className="text-xs uppercase tracking-wider text-foreground-subtle">Visit → Paid</p>
            <p className="font-heading text-2xl text-off-white tabular-nums mt-1">
              {pct(overallConversionToPaid)}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Funnel visualization */}
      <Card>
        <CardBody compact>
          <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
            Conversion funnel
          </h2>
          <FunnelDisplay steps={funnelSteps} />
        </CardBody>
      </Card>

      {/* Drop-off analysis */}
      <Card>
        <CardBody compact>
          <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
            Drop-off between stages
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-4 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    From → To
                  </th>
                  <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Drop
                  </th>
                  <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Drop %
                  </th>
                  <th className="text-right py-3 pl-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
                    Conv %
                  </th>
                </tr>
              </thead>
              <tbody>
                {funnel.dropOffs.map((d) => {
                  const fromLabel =
                    funnel.stages.find((s) => s.stage === d.fromStage)?.label ?? d.fromStage;
                  const toLabel =
                    funnel.stages.find((s) => s.stage === d.toStage)?.label ?? d.toStage;
                  return (
                    <tr key={`${d.fromStage}-${d.toStage}`} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-off-white">
                        {fromLabel} <span className="text-foreground-subtle">→</span> {toLabel}
                      </td>
                      <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">
                        {d.drop.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">
                        {pct(d.dropRate)}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            d.conversionRate >= 0.5
                              ? "text-green-400 bg-green-400/10"
                              : d.conversionRate >= 0.2
                                ? "text-yellow-400 bg-yellow-400/10"
                                : d.conversionRate > 0
                                  ? "text-[var(--color-bad)] bg-[var(--color-bad-tint)]"
                                  : "text-foreground-subtle bg-white/5"
                          }`}
                        >
                          {pct(d.conversionRate)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Top converting paths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardBody compact>
            <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
              Top entry pages → Email captured
            </h2>
            <PathTable paths={funnel.topPathsToEmail} />
          </CardBody>
        </Card>
        <Card>
          <CardBody compact>
            <h2 className="font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4">
              Top entry pages → Paid conversion
            </h2>
            <PathTable paths={funnel.topPathsToPaid} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function PathTable({ paths }: { paths: Array<{ entryPage: string; sessionsConverted: number }> }) {
  if (paths.length === 0) {
    return (
      <p className="text-sm text-foreground-subtle">
        No converting sessions in this range yet.
      </p>
    );
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left py-2 pr-4 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
            Entry page
          </th>
          <th className="text-right py-2 pl-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
            Sessions
          </th>
        </tr>
      </thead>
      <tbody>
        {paths.map((p) => (
          <tr key={p.entryPage} className="border-b border-white/5">
            <td className="py-2 pr-4 text-off-white truncate max-w-[260px]">
              <code className="text-xs">{p.entryPage}</code>
            </td>
            <td className="py-2 pl-3 text-right text-foreground-muted tabular-nums">
              {p.sessionsConverted.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
