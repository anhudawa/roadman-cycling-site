'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataFreshnessIndicator } from './DataFreshnessIndicator'
import type { PlatformSyncSummary } from '@/lib/queries/sync'

// ==========================================================================
// Types
// ==========================================================================

export interface SyncStatusDashboardProps {
  /** Platform sync summaries from the server */
  summaries: PlatformSyncSummary[]
}

// ==========================================================================
// Component
// ==========================================================================

/**
 * Dashboard showing sync status for all connected platforms.
 *
 * Displays a table with:
 * - Platform name and connection status
 * - Last sync time with freshness indicator
 * - Records synced and error counts
 * - Per-platform and global "Sync Now" buttons
 */
export function SyncStatusDashboard({
  summaries,
}: SyncStatusDashboardProps) {
  const [syncing, setSyncing] = useState<Record<string, boolean>>({})
  const [syncingAll, setSyncingAll] = useState(false)

  const triggerSync = async (connectionId: string) => {
    setSyncing((prev) => ({ ...prev, [connectionId]: true }))
    try {
      await fetch('/api/sync/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      })
    } finally {
      setSyncing((prev) => ({ ...prev, [connectionId]: false }))
    }
  }

  const triggerSyncAll = async () => {
    setSyncingAll(true)
    try {
      await fetch('/api/sync/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    } finally {
      setSyncingAll(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-off-white">Sync Status</h3>
        <Button
          size="sm"
          variant="outline"
          loading={syncingAll}
          onClick={triggerSyncAll}
        >
          Sync All Now
        </Button>
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-8 text-center">
          <p className="text-mid-grey">
            No platform connections found. Connect platforms in the
            Integrations settings to see sync status.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-mid-grey/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-charcoal border-b border-mid-grey/20">
              <tr>
                <th className="py-3 px-4 text-left text-mid-grey font-medium">
                  Platform
                </th>
                <th className="py-3 px-4 text-left text-mid-grey font-medium">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-mid-grey font-medium">
                  Freshness
                </th>
                <th className="py-3 px-4 text-right text-mid-grey font-medium">
                  Last Sync
                </th>
                <th className="py-3 px-4 text-right text-mid-grey font-medium">
                  Records (7d)
                </th>
                <th className="py-3 px-4 text-right text-mid-grey font-medium">
                  Errors (7d)
                </th>
                <th className="py-3 px-4 text-right text-mid-grey font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mid-grey/10">
              {summaries.map((summary) => (
                <tr
                  key={summary.connectionId ?? summary.source}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="text-off-white font-medium">
                      {summary.platformName}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {summary.isActive ? (
                      <Badge variant="green" size="sm">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="grey" size="sm">
                        Disconnected
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <DataFreshnessIndicator
                      lastSyncedAt={summary.lastSyncedAt}
                    />
                  </td>
                  <td className="py-3 px-4 text-right text-mid-grey">
                    {summary.lastSyncStatus ? (
                      <div className="flex items-center justify-end gap-2">
                        <Badge
                          variant={
                            summary.lastSyncStatus === 'completed'
                              ? 'green'
                              : summary.lastSyncStatus === 'failed'
                                ? 'red'
                                : summary.lastSyncStatus === 'running'
                                  ? 'blue'
                                  : 'grey'
                          }
                          size="sm"
                        >
                          {summary.lastRecordsSynced} records
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-mid-grey/60">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-off-white">
                    {summary.totalRecordsLast7Days.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {summary.failedJobsLast7Days > 0 ? (
                      <Badge variant="red" size="sm">
                        {summary.failedJobsLast7Days}
                      </Badge>
                    ) : (
                      <span className="text-mid-grey/60">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {summary.connectionId && summary.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={syncing[summary.connectionId] ?? false}
                        onClick={() =>
                          triggerSync(summary.connectionId!)
                        }
                      >
                        Sync
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Error summary */}
      {summaries.some((s) => s.lastError) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
          <h4 className="text-sm font-medium text-red-400">
            Recent Sync Errors
          </h4>
          {summaries
            .filter((s) => s.lastError)
            .map((s) => (
              <div
                key={s.connectionId ?? s.source}
                className="text-sm text-mid-grey"
              >
                <span className="text-off-white">{s.platformName}:</span>{' '}
                {s.lastError}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
