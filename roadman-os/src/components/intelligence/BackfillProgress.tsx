'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Database,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BackfillProgressData {
  source: 'youtube' | 'beehiiv' | 'ga4'
  total_batches: number
  completed_batches: number
  records_written: number
  current_batch_start: string | null
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  error_message: string | null
  started_at: string | null
  completed_at: string | null
}

interface BackfillSummary {
  total_records_backfilled: number
  all_completed: boolean
  any_running: boolean
  any_failed: boolean
  sources_completed: number
  sources_total: number
}

interface BackfillResponse {
  progress: BackfillProgressData[]
  summary: BackfillSummary
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_CONFIG: Record<
  string,
  { label: string; description: string; colour: string; icon: string }
> = {
  youtube: {
    label: 'YouTube Analytics',
    description: 'Video views, watch time, subscribers, and engagement per day',
    colour: 'bg-red-500',
    icon: 'YT',
  },
  beehiiv: {
    label: 'Beehiiv Newsletters',
    description: 'Email opens, clicks, and subscriber activity per post',
    colour: 'bg-amber-500',
    icon: 'BH',
  },
  ga4: {
    label: 'Google Analytics 4',
    description: 'Page views, sessions, and engagement per URL per day',
    colour: 'bg-blue-500',
    icon: 'GA',
  },
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-mid-grey/20 text-mid-grey',
    icon: Clock,
  },
  running: {
    label: 'Running',
    className: 'bg-coral/20 text-coral',
    icon: RefreshCw,
  },
  paused: {
    label: 'Paused',
    className: 'bg-amber-400/20 text-amber-400',
    icon: Pause,
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-400/20 text-green-400',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-400/20 text-red-400',
    icon: AlertTriangle,
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return '< 1 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}m`
}

function estimateTimeRemaining(
  completedBatches: number,
  totalBatches: number,
  startedAt: string | null,
): string | null {
  if (!startedAt || completedBatches === 0 || totalBatches === 0) return null

  const elapsed = Date.now() - new Date(startedAt).getTime()
  const msPerBatch = elapsed / completedBatches
  const remainingBatches = totalBatches - completedBatches
  const remainingMs = msPerBatch * remainingBatches

  return formatDuration(remainingMs / 60_000)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Status badge */
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
      )}
    >
      <Icon className={cn('h-3 w-3', status === 'running' && 'animate-spin')} />
      {config.label}
    </span>
  )
}

/** Pure CSS progress bar */
function ProgressBar({
  completed,
  total,
}: {
  completed: number
  total: number
}) {
  const pct = total > 0 ? Math.min(100, (completed / total) * 100) : 0

  return (
    <div className="w-full h-2 rounded-full bg-mid-grey/20 overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          pct >= 100 ? 'bg-green-400' : 'bg-coral',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/** Individual source card */
function SourceCard({
  progress,
  onAction,
  actionLoading,
}: {
  progress: BackfillProgressData
  onAction: (source: string, action: 'start' | 'resume' | 'cancel') => void
  actionLoading: string | null
}) {
  const config = SOURCE_CONFIG[progress.source]
  const pct =
    progress.total_batches > 0
      ? Math.round((progress.completed_batches / progress.total_batches) * 100)
      : 0

  const timeRemaining = estimateTimeRemaining(
    progress.completed_batches,
    progress.total_batches,
    progress.started_at,
  )

  const isLoading = actionLoading === progress.source

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white',
              config.colour,
            )}
          >
            {config.icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-off-white">
              {config.label}
            </h3>
            <p className="text-xs text-mid-grey mt-0.5">{config.description}</p>
          </div>
        </div>
        <StatusBadge status={progress.status} />
      </div>

      {/* Progress bar */}
      {progress.total_batches > 0 && (
        <div className="space-y-1.5">
          <ProgressBar
            completed={progress.completed_batches}
            total={progress.total_batches}
          />
          <div className="flex items-center justify-between text-xs text-mid-grey">
            <span>
              {progress.completed_batches} / {progress.total_batches} batches ({pct}%)
            </span>
            {timeRemaining && progress.status === 'running' && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{timeRemaining} remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-md border border-mid-grey/10 bg-charcoal px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">
            Records Written
          </p>
          <p className="text-sm font-semibold text-off-white mt-0.5">
            {formatNumber(progress.records_written)}
          </p>
        </div>
        {progress.current_batch_start && (
          <div className="rounded-md border border-mid-grey/10 bg-charcoal px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-mid-grey">
              Current Batch
            </p>
            <p className="text-sm font-semibold text-off-white mt-0.5">
              {formatDate(progress.current_batch_start)}
            </p>
          </div>
        )}
        {progress.started_at && (
          <div className="rounded-md border border-mid-grey/10 bg-charcoal px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-mid-grey">
              Started
            </p>
            <p className="text-sm font-semibold text-off-white mt-0.5">
              {formatDate(progress.started_at)}
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {progress.error_message && (
        <div className="flex items-start gap-2 rounded-md border border-red-400/20 bg-red-400/5 px-3 py-2">
          <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400">{progress.error_message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {progress.status === 'pending' && (
          <Button
            variant="primary"
            size="sm"
            loading={isLoading}
            icon={<Play className="h-3.5 w-3.5" />}
            onClick={() => onAction(progress.source, 'start')}
          >
            Start Backfill
          </Button>
        )}
        {(progress.status === 'paused' || progress.status === 'failed') && (
          <Button
            variant="primary"
            size="sm"
            loading={isLoading}
            icon={<Play className="h-3.5 w-3.5" />}
            onClick={() => onAction(progress.source, 'resume')}
          >
            Resume
          </Button>
        )}
        {progress.status === 'running' && (
          <Button
            variant="danger"
            size="sm"
            loading={isLoading}
            icon={<Pause className="h-3.5 w-3.5" />}
            onClick={() => onAction(progress.source, 'cancel')}
          >
            Cancel
          </Button>
        )}
        {progress.status === 'completed' && (
          <Button
            variant="ghost"
            size="sm"
            loading={isLoading}
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => onAction(progress.source, 'start')}
          >
            Re-run
          </Button>
        )}
      </div>
    </div>
  )
}

/** Overall summary banner */
function SummaryBanner({ summary }: { summary: BackfillSummary }) {
  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-coral" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-mid-grey">
              Total Records Backfilled
            </p>
            <p className="text-lg font-semibold text-off-white">
              {formatNumber(summary.total_records_backfilled)}
            </p>
          </div>
        </div>

        <div className="h-8 w-px bg-mid-grey/20 hidden sm:block" />

        <div>
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">
            Sources Complete
          </p>
          <p className="text-lg font-semibold text-off-white">
            {summary.sources_completed} / {summary.sources_total}
          </p>
        </div>

        <div className="h-8 w-px bg-mid-grey/20 hidden sm:block" />

        <div>
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">
            Status
          </p>
          <p
            className={cn(
              'text-sm font-medium mt-0.5',
              summary.all_completed
                ? 'text-green-400'
                : summary.any_failed
                  ? 'text-red-400'
                  : summary.any_running
                    ? 'text-coral'
                    : 'text-mid-grey',
            )}
          >
            {summary.all_completed
              ? 'All sources backfilled'
              : summary.any_failed
                ? 'Some sources failed'
                : summary.any_running
                  ? 'Backfill in progress'
                  : 'Ready to start'}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Coverage grid — shows which years have data per source */
function CoverageGrid({ progress }: { progress: BackfillProgressData[] }) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i)

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Database className="h-4 w-4 text-coral" />
        Data Coverage
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-mid-grey">
              <th className="text-left py-1.5 pr-4 font-medium">Source</th>
              {years.map((y) => (
                <th key={y} className="text-centre py-1.5 px-3 font-medium">
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {progress.map((p) => {
              const config = SOURCE_CONFIG[p.source]
              return (
                <tr key={p.source} className="border-t border-mid-grey/10">
                  <td className="py-2 pr-4 text-off-white font-medium">
                    {config.label}
                  </td>
                  {years.map((y) => {
                    // Determine coverage based on status and date range
                    const hasCoverage = p.status === 'completed'
                    return (
                      <td key={y} className="py-2 px-3 text-centre">
                        {hasCoverage ? (
                          <span className="inline-block h-3 w-3 rounded-sm bg-green-400/70" />
                        ) : p.status === 'running' ? (
                          <span className="inline-block h-3 w-3 rounded-sm bg-coral/50 animate-pulse" />
                        ) : (
                          <span className="inline-block h-3 w-3 rounded-sm bg-mid-grey/20" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-mid-grey">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-green-400/70 rounded-sm" /> Data available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-coral/50 rounded-sm" /> In progress
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-mid-grey/20 rounded-sm" /> No data
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function BackfillProgress() {
  const [data, setData] = useState<BackfillResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch progress data
  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/intelligence/backfill')
      if (res.ok) {
        const json: BackfillResponse = await res.json()
        setData(json)
      }
    } catch {
      // Network error — leave existing data in place
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  // Poll for updates when any source is running
  useEffect(() => {
    if (!data?.summary.any_running) return

    const interval = setInterval(fetchProgress, 5000)
    return () => clearInterval(interval)
  }, [data?.summary.any_running, fetchProgress])

  // Handle start/resume/cancel
  const handleAction = useCallback(
    async (source: string, action: 'start' | 'resume' | 'cancel') => {
      setActionLoading(source)

      try {
        const body: Record<string, string> = { action, source }

        // For start action, we need a connection_id
        // In a real implementation, this would come from a connection picker
        // For now, we pass a placeholder that the API will validate
        if (action === 'start') {
          // TODO: Add connection picker UI — for now this will use the
          // latest active connection for the source
          body.connection_id = '00000000-0000-0000-0000-000000000000'
        }

        await fetch('/api/intelligence/backfill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        // Refresh progress
        await fetchProgress()
      } catch {
        // Network error — ignore
      } finally {
        setActionLoading(null)
      }
    },
    [fetchProgress],
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-centre py-16 text-mid-grey">
        <Database className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
        <p className="text-lg font-medium text-off-white">
          Unable to load backfill status
        </p>
        <p className="text-sm mt-1">
          Check your connection and try again
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={fetchProgress}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <SummaryBanner summary={data.summary} />

      {/* Source cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {data.progress.map((p) => (
          <SourceCard
            key={p.source}
            progress={p}
            onAction={handleAction}
            actionLoading={actionLoading}
          />
        ))}
      </div>

      {/* Coverage grid */}
      <CoverageGrid progress={data.progress} />

      {/* Refresh control */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchProgress}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      </div>
    </div>
  )
}
