'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { SyncJob, MetricSource } from '@/types/database'

// ==========================================================================
// Types
// ==========================================================================

export interface SyncHistoryProps {
  /** Initial sync jobs loaded from the server */
  initialJobs: SyncJob[]
}

// ==========================================================================
// Helpers
// ==========================================================================

const SOURCE_LABELS: Record<MetricSource, string> = {
  youtube: 'YouTube',
  spotify: 'Spotify',
  apple_podcasts: 'Apple Podcasts',
  instagram: 'Meta',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  twitter_x: 'X / Twitter',
  linkedin: 'LinkedIn',
  website: 'Website',
  beehiiv: 'Beehiiv',
  ga4: 'GA4',
  skool: 'Skool',
  manual: 'Manual',
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', variant: 'green' as const }
    case 'running':
      return { label: 'Running', variant: 'blue' as const }
    case 'pending':
      return { label: 'Pending', variant: 'grey' as const }
    case 'failed':
      return { label: 'Failed', variant: 'red' as const }
    default:
      return { label: status, variant: 'grey' as const }
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return '-'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)}m`
}

// ==========================================================================
// Component
// ==========================================================================

/**
 * Recent sync jobs table with source and status filters.
 */
export function SyncHistory({ initialJobs }: SyncHistoryProps) {
  const [filterSource, setFilterSource] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredJobs = initialJobs.filter((job) => {
    if (filterSource !== 'all' && job.source !== filterSource) return false
    if (filterStatus !== 'all' && job.status !== filterStatus) return false
    return true
  })

  // Get unique sources from jobs
  const sources = Array.from(new Set(initialJobs.map((j) => j.source)))
  const statuses = Array.from(new Set(initialJobs.map((j) => j.status)))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-off-white">Sync History</h3>
        <div className="flex gap-2">
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-1.5 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50"
          >
            <option value="all">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s] ?? s}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-mid-grey/20 bg-charcoal px-3 py-1.5 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50"
          >
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-mid-grey/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-charcoal border-b border-mid-grey/20">
            <tr>
              <th className="py-3 px-4 text-left text-mid-grey font-medium">
                Source
              </th>
              <th className="py-3 px-4 text-left text-mid-grey font-medium">
                Status
              </th>
              <th className="py-3 px-4 text-left text-mid-grey font-medium">
                Started
              </th>
              <th className="py-3 px-4 text-right text-mid-grey font-medium">
                Duration
              </th>
              <th className="py-3 px-4 text-right text-mid-grey font-medium">
                Records
              </th>
              <th className="py-3 px-4 text-left text-mid-grey font-medium">
                Error
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mid-grey/10">
            {filteredJobs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-mid-grey"
                >
                  No sync jobs match the current filters.
                </td>
              </tr>
            )}
            {filteredJobs.map((job) => {
              const statusBadge = getStatusBadge(job.status)
              return (
                <tr key={job.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-off-white">
                    {SOURCE_LABELS[job.source] ?? job.source}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusBadge.variant} size="sm">
                      {statusBadge.label}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-mid-grey">
                    {formatDate(job.started_at)}
                  </td>
                  <td className="py-3 px-4 text-right text-mid-grey">
                    {formatDuration(job.started_at, job.completed_at)}
                  </td>
                  <td className="py-3 px-4 text-right text-off-white">
                    {job.records_synced.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-red-400 text-sm truncate max-w-[200px]">
                    {job.error_message ?? '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
