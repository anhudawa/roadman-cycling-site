import Link from "next/link";
import { Card, CardBody } from "@/components/admin/ui";
import { TimeSeriesChart } from "../../components/charts/TimeSeriesChart";
import {
  getLatestRunMatrix,
  getMentionRateOverTime,
  type LatestRun,
  type MentionRatePoint,
} from "@/lib/citation-tests/store";

const SECTION_H2 =
  "font-body font-semibold text-[13px] text-[var(--color-fg)] mb-4";
const STAT_LABEL =
  "text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]";
const STAT_VALUE =
  "text-xl font-mono tabular-nums text-[var(--color-fg)] mt-1";

export async function CitationsPanel() {
  let matrix: LatestRun[] = [];
  let series: MentionRatePoint[] = [];
  try {
    [matrix, series] = await Promise.all([
      getLatestRunMatrix(),
      getMentionRateOverTime(12),
    ]);
  } catch {
    // brand_citation_runs table missing or DB down — empty state below.
  }

  const totalLatest = matrix.length;
  const mentionedLatest = matrix.filter((r) => r.mentioned).length;
  const mentionRatePct =
    totalLatest > 0 ? (mentionedLatest / totalLatest) * 100 : 0;

  return (
    <Card>
      <CardBody compact>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className={SECTION_H2}>Answer-engine citations</h2>
          <Link
            href="/admin/measurement/citations"
            className="text-xs underline text-[var(--color-fg-muted)]"
          >
            Manage prompts →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className={STAT_LABEL}>Latest mention rate</p>
            <p className={STAT_VALUE}>{mentionRatePct.toFixed(0)}%</p>
          </div>
          <div>
            <p className={STAT_LABEL}>Mentioned (latest)</p>
            <p className={STAT_VALUE}>
              {mentionedLatest}/{totalLatest}
            </p>
          </div>
          <div>
            <p className={STAT_LABEL}>Tracked weeks</p>
            <p className={STAT_VALUE}>{series.length}</p>
          </div>
        </div>

        {series.length > 0 ? (
          <TimeSeriesChart
            data={series.map((s) => ({
              date: s.date,
              rate: Math.round(s.rate * 100),
            }))}
            dataKeys={[
              { key: "rate", color: "#4AAE8C", label: "Mention rate %" },
            ]}
            height={200}
          />
        ) : (
          <p className="text-sm text-[var(--color-fg-subtle)]">
            No citation runs recorded yet. The cron runs Mondays 09:00 UTC,
            or you can trigger one manually from the citations page.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
