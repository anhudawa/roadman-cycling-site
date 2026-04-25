import { maskEmail } from "@/lib/admin/events-store";
import type { CohortRow } from "@/lib/admin/subscribers-store";

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "--";
  return `${((numerator / denominator) * 100).toFixed(0)}%`;
}

function formatWeek(iso: string): string {
  const d = new Date(iso);
  const end = new Date(d.getTime() + 6 * 24 * 60 * 60 * 1000);
  const fmt = (date: Date) =>
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(d)} $€“ ${fmt(end)}`;
}

export function CohortTable({ rows }: { rows: CohortRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
        <p className="text-foreground-subtle text-sm">
          No cohort data yet. Signups will appear here as they progress through the funnel.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 pr-4 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              Cohort
            </th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              Signups
            </th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              $†’ Skool
            </th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              $†’ Trial
            </th>
            <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              $†’ Paid
            </th>
            <th className="text-right py-3 pl-3 text-xs uppercase tracking-wider text-foreground-subtle font-medium">
              30d Active
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.week} className="border-b border-white/5">
              <td className="py-3 pr-4 text-off-white whitespace-nowrap">
                {formatWeek(row.week)}
              </td>
              <td className="py-3 px-3 text-right text-off-white tabular-nums">
                {row.signups}
              </td>
              <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">
                {row.skoolJoins} <span className="text-xs text-foreground-subtle">({pct(row.skoolJoins, row.signups)})</span>
              </td>
              <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">
                {row.trialStarts} <span className="text-xs text-foreground-subtle">({pct(row.trialStarts, row.skoolJoins)})</span>
              </td>
              <td className="py-3 px-3 text-right text-foreground-muted tabular-nums">
                {row.paidMembers} <span className="text-xs text-foreground-subtle">({pct(row.paidMembers, row.trialStarts)})</span>
              </td>
              <td className="py-3 pl-3 text-right tabular-nums">
                {row.activeAfter30d > 0 ? (
                  <span className="text-green-400">
                    {row.activeAfter30d} <span className="text-xs">({pct(row.activeAfter30d, row.paidMembers)})</span>
                  </span>
                ) : (
                  <span className="text-foreground-subtle">--</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
