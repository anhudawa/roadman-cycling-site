import type { PerformanceRecord } from '@/types/database'

export interface SkoolHistoryTableProps {
  /** Performance records to display. */
  records: PerformanceRecord[]
  /** Whether to show the MRR column (only relevant for the NDY tier). */
  showMrr?: boolean
}

/**
 * Read-only table of historical Skool metrics.
 * Server component — no client-side hooks required.
 */
export function SkoolHistoryTable({
  records,
  showMrr = false,
}: SkoolHistoryTableProps) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-mid-grey py-4">
        No metrics recorded yet. Submit the form above to get started.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-mid-grey/20 text-left text-mid-grey">
            <th className="pb-2 pr-4 font-medium">Period</th>
            <th className="pb-2 pr-4 font-medium">Members</th>
            <th className="pb-2 pr-4 font-medium">Active</th>
            <th className="pb-2 pr-4 font-medium">Joins</th>
            <th className="pb-2 pr-4 font-medium">Left</th>
            <th className="pb-2 pr-4 font-medium">Posts</th>
            <th className="pb-2 pr-4 font-medium">Comments</th>
            {showMrr && <th className="pb-2 font-medium">MRR</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const cm = record.custom_metrics as Record<string, unknown>
            const periodLabel = `${String(cm.period_start ?? record.recorded_at).slice(0, 10)} (${String(cm.period ?? '-')})`

            return (
              <tr
                key={record.id}
                className="border-b border-mid-grey/10 text-off-white"
              >
                <td className="py-2 pr-4">{periodLabel}</td>
                <td className="py-2 pr-4">{record.reach.toLocaleString()}</td>
                <td className="py-2 pr-4">{record.views.toLocaleString()}</td>
                <td className="py-2 pr-4">{record.subscribers_gained.toLocaleString()}</td>
                <td className="py-2 pr-4">{Number(cm.members_left ?? 0).toLocaleString()}</td>
                <td className="py-2 pr-4">{Number(cm.posts ?? 0).toLocaleString()}</td>
                <td className="py-2 pr-4">{record.comments.toLocaleString()}</td>
                {showMrr && (
                  <td className="py-2">
                    ${(record.revenue_cents / 100).toLocaleString()}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
