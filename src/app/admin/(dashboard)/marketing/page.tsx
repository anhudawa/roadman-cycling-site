import Link from "next/link";
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { requireAuth } from "@/lib/admin/auth";
import {
  getMarketingDashboard,
  listRecentMarketingSpend,
} from "@/lib/admin/marketing-queries";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import {
  Card,
  CardBody,
  CardHeader,
  Num,
  PageHeader,
} from "@/components/admin/ui";
import {
  MARKETING_CHANNEL_LABELS,
  type AttributionTouch,
  type MarketingChannel,
} from "@/lib/marketing/attribution";
import type { MarketingPerformanceRow } from "@/lib/admin/marketing-attribution";
import { deleteMarketingSpendAction } from "./actions";
import { MarketingSpendForm } from "./MarketingSpendForm";

export const dynamic = "force-dynamic";

function money(cents: number | null) {
  if (cents === null) return "—";
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card>
      <CardBody compact>
        <p className="text-xs font-semibold text-[var(--color-fg-muted)]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-[var(--color-fg)]">
          <Num>{value}</Num>
        </p>
        {detail ? (
          <p className="mt-1 text-xs text-[var(--color-fg-subtle)]">{detail}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

function PerformanceTable({
  rows,
  showCampaign = false,
}: {
  rows: MarketingPerformanceRow[];
  showCampaign?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--color-fg-subtle)]">
        No applications or recorded spend in this period.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="py-3 pr-4 text-left text-xs font-semibold text-[var(--color-fg-muted)]">
              {showCampaign ? "Campaign" : "Channel"}
            </th>
            {showCampaign ? (
              <th className="px-3 py-3 text-left text-xs font-semibold text-[var(--color-fg-muted)]">
                Channel
              </th>
            ) : null}
            <th className="px-3 py-3 text-right text-xs font-semibold text-[var(--color-fg-muted)]">
              Applications
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-[var(--color-fg-muted)]">
              Signed up
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-[var(--color-fg-muted)]">
              Sign-up rate
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-[var(--color-fg-muted)]">
              Spend
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-[var(--color-fg-muted)]">
              Cost / apply
            </th>
            <th className="py-3 pl-3 text-right text-xs font-semibold text-[var(--color-fg-muted)]">
              Cost / client
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-[var(--color-border)]">
              <td className="max-w-[260px] truncate py-3 pr-4 font-medium text-[var(--color-fg)]">
                {showCampaign ? row.campaign : row.label}
              </td>
              {showCampaign ? (
                <td className="px-3 py-3 text-[var(--color-fg-muted)]">
                  {row.label}
                </td>
              ) : null}
              <td className="px-3 py-3 text-right text-[var(--color-fg-muted)]">
                <Num>{row.applications.toLocaleString()}</Num>
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-fg-muted)]">
                <Num>{row.signedUp.toLocaleString()}</Num>
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-fg-muted)]">
                <Num>{percent(row.signUpRate)}</Num>
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-fg-muted)]">
                <Num>{money(row.spendCents)}</Num>
              </td>
              <td className="px-3 py-3 text-right text-[var(--color-fg-muted)]">
                <Num>{money(row.costPerApplicationCents)}</Num>
              </td>
              <td className="py-3 pl-3 text-right font-medium text-[var(--color-fg)]">
                <Num>{money(row.costPerSignedUpCents)}</Num>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function MarketingPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string | string[];
    touch?: string | string[];
  }>;
}) {
  await requireAuth();
  const resolved = await searchParams;
  const range = typeof resolved.range === "string" ? resolved.range : "30d";
  const touch: AttributionTouch =
    resolved.touch === "first" ? "first" : "last";
  const { from, to } = parseTimeRange(range);
  const [{ performance }, recentSpend] = await Promise.all([
    getMarketingDashboard(from, to, touch),
    listRecentMarketingSpend(),
  ]);

  const signUpRate =
    performance.totalApplications > 0
      ? performance.signedUpApplications / performance.totalApplications
      : null;
  const bestPaid = performance.bestPaidChannel;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing"
        subtitle="NDY applications, signed-up coaching clients and acquisition cost by channel."
        actions={
          <Suspense fallback={null}>
            <TimeRangePicker />
          </Suspense>
        }
      />

      <div className="flex items-center gap-1 rounded-[var(--radius-admin-md)] bg-[var(--color-sunken)] p-1">
        {(["last", "first"] as const).map((option) => (
          <Link
            key={option}
            href={`/admin/marketing?range=${encodeURIComponent(range)}&touch=${option}`}
            className={`rounded-[var(--radius-admin-md)] px-3 py-1.5 text-xs font-medium ${
              touch === option
                ? "bg-[var(--color-raised)] text-[var(--color-fg)]"
                : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
            }`}
          >
            {option === "last" ? "Last touch" : "First touch"}
          </Link>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="NDY applications"
          value={performance.totalApplications.toLocaleString()}
        />
        <Metric
          label="Signed-up clients"
          value={performance.signedUpApplications.toLocaleString()}
          detail={`${percent(signUpRate)} of applications`}
        />
        <Metric
          label="Tracked source"
          value={percent(performance.trackedShare)}
          detail={`${performance.trackedApplications} attributed applications`}
        />
        <Metric
          label="Recorded spend"
          value={money(performance.totalSpendCents)}
          detail="EUR in selected period"
        />
        <Metric
          label="Best paid client cost"
          value={money(bestPaid?.costPerSignedUpCents ?? null)}
          detail={bestPaid ? bestPaid.label : "Needs spend and a signed-up client"}
        />
      </section>

      <Card>
        <CardHeader
          title="Channel performance"
          subtitle={`${touch === "last" ? "Last" : "First"}-touch attribution. A client is counted only after the application is moved to Signed Up.`}
        />
        <CardBody className="pt-1">
          <PerformanceTable rows={performance.channels} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Campaign performance"
          subtitle="UTM campaign names connect applications to campaign-level spend."
        />
        <CardBody className="pt-1">
          <PerformanceTable rows={performance.campaigns} showCampaign />
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <Card>
          <CardHeader
            title="Record marketing spend"
            subtitle="Use the same campaign name carried in utm_campaign."
          />
          <CardBody className="pt-2">
            <MarketingSpendForm />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent spend"
            subtitle="Manual now; Google and Meta imports can write to the same ledger later."
          />
          <CardBody className="pt-1">
            {recentSpend.length === 0 ? (
              <p className="text-sm text-[var(--color-fg-subtle)]">
                No marketing spend has been recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="py-3 pr-3 text-left text-xs font-semibold text-[var(--color-fg-muted)]">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-[var(--color-fg-muted)]">
                        Channel
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-[var(--color-fg-muted)]">
                        Campaign
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-semibold text-[var(--color-fg-muted)]">
                        Spend
                      </th>
                      <th className="py-3 pl-3 text-right text-xs font-semibold text-[var(--color-fg-muted)]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSpend.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-[var(--color-border)]"
                      >
                        <td className="py-3 pr-3 text-[var(--color-fg-muted)]">
                          <Num>{entry.spendDate}</Num>
                        </td>
                        <td className="px-3 py-3 text-[var(--color-fg)]">
                          {MARKETING_CHANNEL_LABELS[
                            entry.channel as MarketingChannel
                          ] ?? entry.channel}
                        </td>
                        <td className="max-w-[220px] truncate px-3 py-3 text-[var(--color-fg-muted)]">
                          {entry.campaign || "Unlabelled"}
                        </td>
                        <td className="px-3 py-3 text-right text-[var(--color-fg)]">
                          <Num>{money(entry.amountCents)}</Num>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <form action={deleteMarketingSpendAction}>
                            <input type="hidden" name="id" value={entry.id} />
                            <button
                              type="submit"
                              className="focus-ring rounded-[var(--radius-admin-md)] px-2 py-1 text-xs text-[var(--color-bad)] hover:bg-[var(--color-bad-tint)]"
                            >
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <p className="text-xs leading-5 text-[var(--color-fg-subtle)]">
        Cost metrics appear only after spend is recorded. Direct / unknown
        shows where links need UTMs; it is not silently assigned to a paid
        channel.
      </p>
    </div>
  );
}
