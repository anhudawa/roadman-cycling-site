'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Database,
  Activity,
  Tag,
  Shield,
  Clock,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { DataQualityLog, MetricSource } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeekData {
  week_start: string
  row_count: number
}

interface HeatmapSource {
  source: string
  weeks: WeekData[]
}

interface DarkSource {
  source: string
  latest_date: string | null
  days_dark: number | null
}

interface AliasCoverage {
  total_aliases: number
  topics_with_aliases: number
  topics_without_aliases: number
}

interface CommercialCategoryCoverage {
  categorised: number
  uncategorised: number
}

interface TaxonomyHealth {
  total_tracked_topics: number
  untagged_asset_pct: number
  alias_coverage: AliasCoverage
  commercial_category_coverage: CommercialCategoryCoverage
}

interface StaleWarning {
  topic_id: string
  topic_name: string
  latest_computed_at: string | null
}

interface SyncJobEntry {
  id: string
  source: MetricSource
  status: string
  started_at: string | null
  completed_at: string | null
  records_synced: number
  error_message: string | null
}

interface SyncJobGroup {
  source: string
  jobs: SyncJobEntry[]
}

interface PipelineStats {
  total_daily_rows: number
  total_gsc_rows: number
  total_tdm_rows: number
  total_seasonal_rows: number
  total_insights: number
  total_anomalies: number
}

interface OpsData {
  sync_coverage_heatmap: HeatmapSource[]
  topic_taxonomy_health: TaxonomyHealth
  stale_index_warnings: StaleWarning[]
  dark_sources: DarkSource[]
  sync_job_status: SyncJobGroup[]
  quality_checks: DataQualityLog[]
  pipeline_stats: PipelineStats
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SOURCE_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  spotify: 'Spotify',
  apple_podcasts: 'Apple Podcasts',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  twitter_x: 'Twitter/X',
  linkedin: 'LinkedIn',
  website: 'Website',
  beehiiv: 'Beehiiv',
  ga4: 'GA4',
  skool: 'Skool',
  manual: 'Manual',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Dark Source Alert Banner */
function DarkSourceAlerts({ sources }: { sources: DarkSource[] }) {
  if (sources.length === 0) return null

  return (
    <div className="rounded-xl border-2 border-red-500/60 bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-400">
            Dark Source Alert
          </h3>
          <p className="text-xs text-mid-grey mt-1">
            Sources with no data received in the last 3 days. This may indicate a broken sync or expired credential.
          </p>
          <div className="mt-3 space-y-2">
            {sources.map((s) => (
              <div
                key={s.source}
                className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/20 px-3 py-2"
              >
                <span className="text-sm text-off-white">
                  {SOURCE_LABELS[s.source] || s.source}
                </span>
                <span className="text-sm text-red-400 font-medium">
                  {s.days_dark !== null
                    ? `${s.days_dark} day${s.days_dark === 1 ? '' : 's'} dark`
                    : 'No data ever received'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Sync Coverage Heatmap — SVG grid */
function SyncCoverageHeatmap({ data }: { data: HeatmapSource[] }) {
  const [hoveredCell, setHoveredCell] = useState<{
    source: string
    week: string
    count: number
    x: number
    y: number
  } | null>(null)

  if (data.length === 0) return null

  const cellW = 44
  const cellH = 28
  const labelW = 120
  const headerH = 40
  const gap = 2
  const cols = data[0].weeks.length
  const rows = data.length
  const svgW = labelW + cols * (cellW + gap)
  const svgH = headerH + rows * (cellH + gap)

  function getCellColour(count: number): string {
    if (count === 0) return '#EF4444' // red — no data
    if (count < 5) return '#EAB308' // yellow — sparse
    return '#22C55E' // green — healthy
  }

  return (
    <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Activity className="h-4 w-4 text-coral" />
        Sync Coverage Heatmap
      </h3>
      <p className="text-xs text-mid-grey">
        Row count per source per week over the last 12 weeks. Green = data present, yellow = sparse (&lt;5 rows), red = zero rows.
      </p>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full min-w-[700px]"
          preserveAspectRatio="xMinYMin meet"
        >
          {/* Week headers */}
          {data[0].weeks.map((w, ci) => {
            const x = labelW + ci * (cellW + gap)
            const weekDate = new Date(w.week_start)
            const label = weekDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })
            return (
              <text
                key={w.week_start}
                x={x + cellW / 2}
                y={headerH - 8}
                textAnchor="middle"
                className="fill-mid-grey"
                fontSize="9"
              >
                {label}
              </text>
            )
          })}

          {/* Source rows */}
          {data.map((src, ri) => {
            const y = headerH + ri * (cellH + gap)
            return (
              <g key={src.source}>
                {/* Source label */}
                <text
                  x={labelW - 8}
                  y={y + cellH / 2 + 4}
                  textAnchor="end"
                  className="fill-mid-grey"
                  fontSize="10"
                >
                  {SOURCE_LABELS[src.source] || src.source}
                </text>

                {/* Week cells */}
                {src.weeks.map((w, ci) => {
                  const x = labelW + ci * (cellW + gap)
                  return (
                    <rect
                      key={w.week_start}
                      x={x}
                      y={y}
                      width={cellW}
                      height={cellH}
                      rx={4}
                      fill={getCellColour(w.row_count)}
                      opacity={0.85}
                      className="cursor-pointer transition-opacity hover:opacity-100"
                      onMouseEnter={(e) => {
                        const rect = (e.target as SVGRectElement).getBoundingClientRect()
                        setHoveredCell({
                          source: SOURCE_LABELS[src.source] || src.source,
                          week: w.week_start,
                          count: w.row_count,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        })
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Tooltip rendered outside SVG for proper layering */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-charcoal border border-mid-grey/30 rounded px-3 py-2 text-xs shadow-lg whitespace-nowrap">
            <div className="text-off-white font-medium">{hoveredCell.source}</div>
            <div className="text-mid-grey">
              Week of {formatDate(hoveredCell.week)}
            </div>
            <div className="text-off-white mt-1">
              {hoveredCell.count} row{hoveredCell.count === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-mid-grey">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm" style={{ background: '#22C55E' }} /> Data present
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm" style={{ background: '#EAB308' }} /> Sparse (&lt;5)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm" style={{ background: '#EF4444' }} /> No data
        </span>
      </div>
    </div>
  )
}

/** Topic Taxonomy Health */
function TaxonomyHealthSection({ data }: { data: TaxonomyHealth }) {
  const taggedPct = 100 - data.untagged_asset_pct

  return (
    <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-4 space-y-4">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Tag className="h-4 w-4 text-coral" />
        Topic Taxonomy Health
      </h3>

      {/* Tracked topics count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-mid-grey">Tracked topics</span>
        <span className="text-sm font-medium text-off-white">
          {data.total_tracked_topics}
        </span>
      </div>

      {/* Asset tagging progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-mid-grey">Published assets tagged</span>
          <span
            className={cn(
              'font-medium',
              taggedPct >= 80 ? 'text-green-400' : taggedPct >= 50 ? 'text-yellow-400' : 'text-red-400',
            )}
          >
            {taggedPct}%
          </span>
        </div>
        <div className="h-2 bg-charcoal rounded-full border border-mid-grey/10 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              taggedPct >= 80 ? 'bg-green-400' : taggedPct >= 50 ? 'bg-yellow-400' : 'bg-red-400',
            )}
            style={{ width: `${taggedPct}%` }}
          />
        </div>
      </div>

      {/* Alias coverage */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-mid-grey">Alias coverage</span>
        <span className="text-sm text-off-white">
          {data.alias_coverage.topics_with_aliases} of{' '}
          {data.alias_coverage.topics_with_aliases + data.alias_coverage.topics_without_aliases} topics
          <span className="text-mid-grey ml-1">
            ({data.alias_coverage.total_aliases} total aliases)
          </span>
        </span>
      </div>

      {/* Commercial category coverage */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-mid-grey">Commercial categories</span>
        <span className="text-sm text-off-white">
          {data.commercial_category_coverage.categorised} categorised
          <span className="text-mid-grey ml-1">
            / {data.commercial_category_coverage.uncategorised} uncategorised
          </span>
        </span>
      </div>
    </div>
  )
}

/** Stale Index Warnings */
function StaleIndexWarnings({ warnings }: { warnings: StaleWarning[] }) {
  if (warnings.length === 0) return null

  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-3">
      <h3 className="text-sm font-medium text-yellow-400 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Stale Seasonal Indices ({warnings.length})
      </h3>
      <p className="text-xs text-mid-grey">
        These topics have seasonal indices that have not been recomputed in over 14 days.
      </p>
      <div className="space-y-1.5">
        {warnings.map((w) => (
          <div
            key={w.topic_id}
            className="flex items-center justify-between rounded-lg bg-yellow-500/5 border border-yellow-500/10 px-3 py-2"
          >
            <span className="text-sm text-off-white">{w.topic_name}</span>
            <span className="text-xs text-yellow-400">
              {w.latest_computed_at
                ? `Last computed ${formatDate(w.latest_computed_at)}`
                : 'Never computed'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Sync Job Status — collapsible per source */
function SyncJobStatus({ groups }: { groups: SyncJobGroup[] }) {
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())

  function toggleSource(source: string) {
    setExpandedSources((prev) => {
      const next = new Set(prev)
      if (next.has(source)) {
        next.delete(source)
      } else {
        next.add(source)
      }
      return next
    })
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-4">
        <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
          <Zap className="h-4 w-4 text-coral" />
          Sync Job Status
        </h3>
        <p className="text-sm text-mid-grey mt-2">No sync jobs recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Zap className="h-4 w-4 text-coral" />
        Sync Job Status
      </h3>

      <div className="space-y-2">
        {groups.map((group) => {
          const isExpanded = expandedSources.has(group.source)
          const latestJob = group.jobs[0]
          const hasErrors = group.jobs.some((j) => j.status === 'error')

          return (
            <div
              key={group.source}
              className="rounded-lg border border-mid-grey/10 bg-charcoal overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleSource(group.source)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-mid-grey" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-mid-grey" />
                  )}
                  <span className="text-sm text-off-white">
                    {SOURCE_LABELS[group.source] || group.source}
                  </span>
                  {hasErrors && (
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                  )}
                </div>
                {latestJob && (
                  <span className="text-xs text-mid-grey">
                    Latest: {latestJob.started_at ? formatDateTime(latestJob.started_at) : '—'}
                  </span>
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-mid-grey border-b border-mid-grey/10">
                        <th className="py-1.5 pr-3">Started</th>
                        <th className="py-1.5 pr-3">Status</th>
                        <th className="py-1.5 pr-3">Records</th>
                        <th className="py-1.5">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.jobs.map((job) => (
                        <tr
                          key={job.id}
                          className="border-b border-mid-grey/5 last:border-0"
                        >
                          <td className="py-1.5 pr-3 text-mid-grey">
                            {job.started_at ? formatDateTime(job.started_at) : '—'}
                          </td>
                          <td className="py-1.5 pr-3">
                            <StatusBadge status={job.status} />
                          </td>
                          <td className="py-1.5 pr-3 text-off-white">
                            {formatNumber(job.records_synced)}
                          </td>
                          <td className="py-1.5 text-red-400 truncate max-w-[200px]">
                            {job.error_message || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Status badge for sync jobs */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: 'bg-green-400/10 text-green-400',
    completed: 'bg-green-400/10 text-green-400',
    error: 'bg-red-400/10 text-red-400',
    failed: 'bg-red-400/10 text-red-400',
    running: 'bg-yellow-400/10 text-yellow-400',
    pending: 'bg-yellow-400/10 text-yellow-400',
  }

  return (
    <span
      className={cn(
        'inline-block px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider',
        styles[status.toLowerCase()] || 'bg-mid-grey/10 text-mid-grey',
      )}
    >
      {status}
    </span>
  )
}

/** Quality check status badge */
function QualityStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pass: 'bg-green-400/10 text-green-400',
    warn: 'bg-yellow-400/10 text-yellow-400',
    fail: 'bg-red-400/10 text-red-400',
  }

  return (
    <span
      className={cn(
        'inline-block px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider',
        styles[status] || 'bg-mid-grey/10 text-mid-grey',
      )}
    >
      {status}
    </span>
  )
}

/** Data Quality Log */
function QualityCheckLog({ checks }: { checks: DataQualityLog[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleCheck(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (checks.length === 0) {
    return (
      <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-4">
        <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-coral" />
          Data Quality Log
        </h3>
        <p className="text-sm text-mid-grey mt-2">No quality checks in the last 30 days.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Shield className="h-4 w-4 text-coral" />
        Data Quality Log
      </h3>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-mid-grey border-b border-mid-grey/10">
            <th className="py-1.5 pr-3">Status</th>
            <th className="py-1.5 pr-3">Check</th>
            <th className="py-1.5 pr-3">Checked</th>
            <th className="py-1.5">Details</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => {
            const isExpanded = expandedIds.has(check.id)
            const hasDetails =
              check.details && Object.keys(check.details).length > 0

            return (
              <tr
                key={check.id}
                className="border-b border-mid-grey/5 last:border-0"
              >
                <td className="py-1.5 pr-3">
                  <QualityStatusBadge status={check.status} />
                </td>
                <td className="py-1.5 pr-3 text-off-white">
                  {check.check_name}
                </td>
                <td className="py-1.5 pr-3 text-mid-grey">
                  {formatDateTime(check.checked_at)}
                </td>
                <td className="py-1.5">
                  {hasDetails ? (
                    <button
                      type="button"
                      onClick={() => toggleCheck(check.id)}
                      className="text-coral hover:text-coral/80 transition-colors"
                    >
                      {isExpanded ? 'Hide' : 'Show'}
                    </button>
                  ) : (
                    <span className="text-mid-grey">—</span>
                  )}
                  {isExpanded && hasDetails && (
                    <pre className="mt-1 text-[10px] text-mid-grey bg-charcoal rounded p-2 overflow-x-auto max-w-md">
                      {JSON.stringify(check.details, null, 2)}
                    </pre>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Pipeline Stats — row of stat cards */
function PipelineStatsCards({ stats }: { stats: PipelineStats }) {
  const cards = [
    { label: 'Performance Daily', value: stats.total_daily_rows, icon: Activity },
    { label: 'Search Console', value: stats.total_gsc_rows, icon: Database },
    { label: 'Topic Daily Metrics', value: stats.total_tdm_rows, icon: Activity },
    { label: 'Seasonal Indices', value: stats.total_seasonal_rows, icon: Clock },
    { label: 'Insights', value: stats.total_insights, icon: Zap },
    { label: 'Anomalies', value: stats.total_anomalies, icon: AlertTriangle },
  ]

  return (
    <div className="rounded-xl border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Database className="h-4 w-4 text-coral" />
        Pipeline Stats
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-mid-grey/20 bg-charcoal p-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <c.icon className="h-3 w-3 text-coral" />
              <p className="text-[10px] uppercase tracking-wider text-mid-grey">
                {c.label}
              </p>
            </div>
            <p className="text-lg font-semibold text-off-white">
              {formatNumber(c.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function IntelligenceOps() {
  const [data, setData] = useState<OpsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/intelligence/ops')
      if (!res.ok) {
        throw new Error(`Failed to fetch ops data (${res.status})`)
      }
      const json: OpsData = await res.json()
      setData(json)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + auto-poll every 60 seconds
  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-3" />
        <p className="text-lg font-medium text-off-white">
          Failed to load ops data
        </p>
        <p className="text-sm text-mid-grey mt-1">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Refresh bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-mid-grey">
          {lastRefresh && (
            <>
              Last refreshed{' '}
              {lastRefresh.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              {' · '}Auto-refreshes every 60s
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          loading={loading}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* 1. Dark Source Alerts — top prominence */}
      <DarkSourceAlerts sources={data.dark_sources} />

      {/* 2. Sync Coverage Heatmap */}
      <SyncCoverageHeatmap data={data.sync_coverage_heatmap} />

      {/* 3. Taxonomy Health + Stale Warnings — side by side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaxonomyHealthSection data={data.topic_taxonomy_health} />
        <StaleIndexWarnings warnings={data.stale_index_warnings} />
      </div>

      {/* 4. Pipeline Stats */}
      <PipelineStatsCards stats={data.pipeline_stats} />

      {/* 5. Sync Job Status */}
      <SyncJobStatus groups={data.sync_job_status} />

      {/* 6. Data Quality Log */}
      <QualityCheckLog checks={data.quality_checks} />
    </div>
  )
}
