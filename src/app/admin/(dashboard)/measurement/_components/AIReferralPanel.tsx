import { Card, CardBody } from "@/components/admin/ui";
import { DonutChart } from "../../components/charts/DonutChart";
import { TimeSeriesChart } from "../../components/charts/TimeSeriesChart";
import {
  getAIReferralBreakdown,
  getAIReferralDaily,
  type AIReferralBreakdownRow,
  type AIReferralDailyRow,
} from "@/lib/admin/events-store";

const SECTION_H2 =
  "font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4";

export async function AIReferralPanel({
  from,
  to,
}: {
  from: Date;
  to: Date;
}) {
  let breakdown: AIReferralBreakdownRow[] = [];
  let daily: AIReferralDailyRow[] = [];
  try {
    [breakdown, daily] = await Promise.all([
      getAIReferralBreakdown(from, to),
      getAIReferralDaily(from, to),
    ]);
  } catch {
    // DB unavailable — fall through to empty state.
  }

  const total = breakdown.reduce((sum, r) => sum + r.count, 0);

  return (
    <Card>
      <CardBody compact>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className={SECTION_H2}>AI referrals</h2>
          <span className="text-xs text-[var(--color-fg-subtle)] font-mono tabular-nums">
            {total.toLocaleString()} events
          </span>
        </div>

        {total === 0 ? (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            No AI-attributed traffic for this range yet. Once visitors land
            from ChatGPT, Perplexity, Claude, Gemini, etc. (with{" "}
            <code className="text-[10px] px-1 py-0.5 rounded bg-white/5">
              utm_source
            </code>{" "}
            or a Referer), they&apos;ll show up here.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DonutChart
              data={breakdown.map((r) => ({
                name: r.aiReferrer,
                value: r.count,
              }))}
            />
            <TimeSeriesChart
              data={daily.map((d) => ({ date: d.date, total: d.total }))}
              dataKeys={[
                { key: "total", color: "#A07ED9", label: "AI visits" },
              ]}
              height={200}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
