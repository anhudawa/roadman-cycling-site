import { Suspense } from "react";
import { APP_WAITLIST_TAG } from "@/lib/newsletter/beehiiv-segmentation";
import { getAppWaitlistFunnel } from "@/lib/admin/app-waitlist-funnel";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { Card, CardBody } from "@/components/admin/ui";
import { TimeRangePicker } from "../../components/TimeRangePicker";
import { FunnelDisplay } from "../../components/charts/FunnelDisplay";
import { FunnelTabs } from "../_components/FunnelTabs";

export const dynamic = "force-dynamic";

function pct(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export default async function AppWaitlistFunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rangeParam = typeof params.range === "string" ? params.range : "30d";
  const { from, to } = parseTimeRange(rangeParam);
  const funnel = await getAppWaitlistFunnel(from, to);

  return (
    <div className="space-y-6">
      <FunnelTabs active="app" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-off-white">
            APP WAITLIST
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            One audience, source-level attribution · Beehiiv tag {APP_WAITLIST_TAG}
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>

      {!funnel.available ? (
        <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-yellow-200">
          The event database is not available in this environment. No demo
          numbers are shown; live figures will appear when the connection is
          restored.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Unique joins"
          value={funnel.operational.uniqueLeads.toLocaleString()}
          note="Server-recorded, deduplicated leads"
        />
        <MetricCard
          label="Tracked app sessions"
          value={funnel.tracked.appSessions.toLocaleString()}
          note={`${funnel.tracked.appPageviews.toLocaleString()} pageviews with analytics consent`}
        />
        <MetricCard
          label="Visit → join"
          value={pct(funnel.tracked.trackedVisitToCaptureRate)}
          note="Consented sessions only"
        />
        <MetricCard
          label="AI-referred sessions"
          value={funnel.tracked.aiSessions.toLocaleString()}
          note={`${funnel.tracked.sourceTaggedSessions.toLocaleString()} source-tagged app sessions`}
        />
      </div>

      <Card>
        <CardBody compact>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-body text-[13px] font-semibold text-[var(--color-fg)]">
                Consented app conversion funnel
              </h2>
              <p className="mt-1 text-xs text-foreground-subtle">
                Comparable stages use browser analytics; the operational join
                total below remains server-side and does not depend on consent.
              </p>
            </div>
            <p className="text-xs text-foreground-subtle">
              Form start {pct(funnel.tracked.formStartRate)} · completion {pct(funnel.tracked.formCompletionRate)}
            </p>
          </div>
          <FunnelDisplay
            steps={[
              { label: "App visit", value: funnel.tracked.appSessions },
              { label: "Form start", value: funnel.tracked.formStartSessions },
              {
                label: "Confirmed capture",
                value: funnel.tracked.confirmedCaptureSessions,
              },
            ]}
          />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <BreakdownCard
          title="Acquisition sources"
          empty="No source-attributed app joins in this range yet."
          rows={funnel.acquisitionSources}
        />
        <BreakdownCard
          title="Form placement"
          empty="No app form joins in this range yet."
          rows={funnel.placements}
        />
      </div>

      <Card>
        <CardBody compact>
          <h2 className="font-body text-[13px] font-semibold text-[var(--color-fg)]">
            Acquisition health
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <HealthStat
              label="Content CTA sessions"
              value={funnel.tracked.contentCtaSessions}
              note="Tracked clicks into /app"
            />
            <HealthStat
              label="Submission attempts"
              value={funnel.operational.submissionAttempts}
              note="Server-side app form posts"
            />
            <HealthStat
              label="Repeat attempts"
              value={funnel.operational.repeatAttempts}
              note="Attempts beyond unique lead fingerprints"
            />
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <CardBody compact>
        <p className="text-xs uppercase tracking-wider text-foreground-subtle">
          {label}
        </p>
        <p className="mt-1 font-heading text-2xl tabular-nums text-off-white">
          {value}
        </p>
        <p className="mt-1 text-xs text-foreground-subtle">{note}</p>
      </CardBody>
    </Card>
  );
}

function BreakdownCard({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: Array<{
    key: string;
    label: string;
    submissions: number;
    uniqueLeads: number;
  }>;
}) {
  return (
    <Card>
      <CardBody compact>
        <h2 className="mb-4 font-body text-[13px] font-semibold text-[var(--color-fg)]">
          {title}
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-foreground-subtle">{empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4 text-left text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                    Source
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                    Leads
                  </th>
                  <th className="py-2 pl-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                    Attempts
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-off-white">{row.label}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-foreground-muted">
                      {row.uniqueLeads.toLocaleString()}
                    </td>
                    <td className="py-2 pl-3 text-right tabular-nums text-foreground-muted">
                      {row.submissions.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function HealthStat({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-foreground-subtle">
        {label}
      </dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums text-off-white">
        {value.toLocaleString()}
      </dd>
      <p className="mt-1 text-xs text-foreground-subtle">{note}</p>
    </div>
  );
}
