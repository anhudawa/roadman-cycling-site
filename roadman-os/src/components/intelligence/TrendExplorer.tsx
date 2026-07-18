'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type {
  SeasonalIndex,
  TopicDailyMetric,
  Forecast,
  Anomaly,
  Topic,
} from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TrendsResponse {
  topic_id: string
  metric: string
  source: string | null
  seasonal_indices: SeasonalIndex[]
  daily_metrics: Pick<
    TopicDailyMetric,
    'date' | 'views' | 'engagement' | 'search_impressions' | 'relative_interest'
  >[]
  forecasts: Pick<
    Forecast,
    'target_week' | 'forecast_value' | 'lower_bound' | 'upper_bound' | 'actual_value' | 'abs_pct_error'
  >[]
}

interface AnomaliesResponse {
  anomalies: (Anomaly & { topics?: { name: string; slug: string } })[]
}

type MetricKey = 'views' | 'engagement' | 'search_impressions'

const METRIC_OPTIONS: { value: MetricKey; label: string }[] = [
  { value: 'views', label: 'Views' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'search_impressions', label: 'Search Impressions' },
]

const PERIOD_OPTIONS = [
  { value: '90', label: '90 days' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function isoWeekToLabel(w: number): string {
  // Approximate month from ISO week
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = Math.min(11, Math.floor(((w - 1) / 52) * 12))
  return months[monthIndex]
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Seasonal index heatmap — 52-week bar chart */
function SeasonalChart({ indices }: { indices: SeasonalIndex[] }) {
  if (indices.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No seasonal data yet — needs ≥1 year of history
      </div>
    )
  }

  const maxIndex = Math.max(...indices.map((i) => i.index_value), 1)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Calendar className="h-4 w-4 text-coral" />
        Seasonal Index (52-week)
      </h3>
      <div className="flex items-end gap-[2px] h-32">
        {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => {
          const idx = indices.find((si) => si.iso_week === week)
          const value = idx?.index_value ?? 0
          const heightPct = Math.max(2, (value / maxIndex) * 100)
          const confidence = idx?.confidence ?? 'noise'

          const barColour =
            confidence === 'established'
              ? 'bg-coral'
              : confidence === 'probable'
                ? 'bg-coral/70'
                : confidence === 'emerging'
                  ? 'bg-coral/40'
                  : 'bg-mid-grey/30'

          return (
            <div
              key={week}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              <div
                className={cn(
                  'w-full rounded-t-sm transition-colors',
                  barColour,
                  'group-hover:brightness-125',
                )}
                style={{ height: `${heightPct}%` }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                <div className="bg-charcoal border border-mid-grey/30 rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                  <div className="text-off-white font-medium">
                    Week {week} — {isoWeekToLabel(week)}
                  </div>
                  <div className="text-mid-grey">
                    {value.toFixed(2)}× avg | {confidence}
                  </div>
                  {idx?.years_observed && (
                    <div className="text-mid-grey/70">
                      {idx.years_observed}yr data
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Month labels */}
      <div className="flex text-[10px] text-mid-grey">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
          (m) => (
            <span key={m} className="flex-1 text-center">
              {m}
            </span>
          ),
        )}
      </div>
      <div className="flex items-center gap-4 text-[10px] text-mid-grey">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-coral rounded-sm" /> Established
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-coral/70 rounded-sm" /> Probable
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-coral/40 rounded-sm" /> Emerging
        </span>
      </div>
    </div>
  )
}

/** Daily metrics time series with optional forecast overlay */
function DailyMetricsChart({
  daily,
  forecasts,
  anomalies,
  metric,
}: {
  daily: TrendsResponse['daily_metrics']
  forecasts: TrendsResponse['forecasts']
  anomalies: AnomaliesResponse['anomalies']
  metric: MetricKey
}) {
  if (daily.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No daily metrics in this period
      </div>
    )
  }

  // Build data points
  const values = daily.map((d) => d[metric] as number)
  const maxVal = Math.max(...values, 1)

  // Build anomaly date set for marker overlay
  const anomalyDates = new Set(anomalies.map((a) => a.detected_on))

  // Chart dimensions (SVG-based for clean rendering)
  const width = 800
  const height = 200
  const padding = { top: 10, right: 60, bottom: 30, left: 10 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const xStep = plotW / Math.max(daily.length - 1, 1)

  // Build polyline path for actual data
  const points = daily.map((d, i) => {
    const x = padding.left + i * xStep
    const y = padding.top + plotH - ((d[metric] as number) / maxVal) * plotH
    return `${x},${y}`
  })
  const linePath = `M ${points.join(' L ')}`

  // Area fill under the line
  const areaPath = `${linePath} L ${padding.left + (daily.length - 1) * xStep},${padding.top + plotH} L ${padding.left},${padding.top + plotH} Z`

  // Forecast overlay points
  const forecastPoints = forecasts.map((f, i) => {
    const x = padding.left + (daily.length + i) * xStep
    const y =
      padding.top + plotH - (f.forecast_value / maxVal) * plotH
    const yLower = f.lower_bound
      ? padding.top + plotH - (f.lower_bound / maxVal) * plotH
      : y
    const yUpper = f.upper_bound
      ? padding.top + plotH - (f.upper_bound / maxVal) * plotH
      : y
    return { x, y, yLower, yUpper, week: f.target_week }
  })

  // Confidence band polygon
  const bandPath =
    forecastPoints.length > 0
      ? `M ${forecastPoints.map((p) => `${p.x},${p.yUpper}`).join(' L ')} L ${forecastPoints
          .slice()
          .reverse()
          .map((p) => `${p.x},${p.yLower}`)
          .join(' L ')} Z`
      : ''

  // Forecast line
  const forecastLine =
    forecastPoints.length > 0
      ? `M ${forecastPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
      : ''

  // Connect actual to forecast
  const connectorLine =
    forecastPoints.length > 0 && points.length > 0
      ? `M ${points[points.length - 1]} L ${forecastPoints[0].x},${forecastPoints[0].y}`
      : ''

  // Date labels (show ~6 evenly spaced)
  const labelInterval = Math.max(1, Math.floor(daily.length / 6))
  const dateLabels = daily
    .filter((_, i) => i % labelInterval === 0)
    .map((d, i) => ({
      x: padding.left + i * labelInterval * xStep,
      label: new Date(d.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      }),
    }))

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-coral" />
        Daily {metric.replace('_', ' ')} with Forecast
      </h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width + (forecastPoints.length > 0 ? forecastPoints.length * xStep : 0)} ${height}`}
          className="w-full min-w-[600px]"
          preserveAspectRatio="xMinYMid meet"
        >
          {/* Area fill */}
          <path d={areaPath} fill="rgba(255, 107, 107, 0.1)" />

          {/* Actual line */}
          <path
            d={linePath}
            fill="none"
            stroke="#FF6B6B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Forecast confidence band */}
          {bandPath && (
            <path d={bandPath} fill="rgba(168, 85, 247, 0.15)" />
          )}

          {/* Connector from actual to forecast */}
          {connectorLine && (
            <path
              d={connectorLine}
              fill="none"
              stroke="#A855F7"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )}

          {/* Forecast line */}
          {forecastLine && (
            <path
              d={forecastLine}
              fill="none"
              stroke="#A855F7"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />
          )}

          {/* Anomaly markers */}
          {daily.map((d, i) => {
            if (!anomalyDates.has(d.date)) return null
            const x = padding.left + i * xStep
            const y =
              padding.top +
              plotH -
              ((d[metric] as number) / maxVal) * plotH
            return (
              <g key={`anomaly-${d.date}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="2"
                />
                <circle cx={x} cy={y} r="2" fill="#FBBF24" />
              </g>
            )
          })}

          {/* Date labels */}
          {dateLabels.map((dl) => (
            <text
              key={dl.label}
              x={dl.x}
              y={height - 5}
              textAnchor="middle"
              className="fill-mid-grey"
              fontSize="10"
            >
              {dl.label}
            </text>
          ))}

          {/* Y-axis max label */}
          <text
            x={width - padding.right + 5}
            y={padding.top + 4}
            className="fill-mid-grey"
            fontSize="10"
            dominantBaseline="hanging"
          >
            {formatNumber(maxVal)}
          </text>
          <text
            x={width - padding.right + 5}
            y={padding.top + plotH}
            className="fill-mid-grey"
            fontSize="10"
          >
            0
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-mid-grey">
        <span className="flex items-center gap-1">
          <span className="w-4 h-[2px] bg-coral" /> Actual
        </span>
        {forecasts.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-4 h-[2px] bg-purple border-dashed" style={{ borderTop: '2px dashed #A855F7', height: 0 }} /> Forecast
          </span>
        )}
        {anomalyDates.size > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border-2 border-yellow-400" /> Anomaly
          </span>
        )}
      </div>
    </div>
  )
}

/** Summary stats cards */
function StatsRow({
  daily,
  indices,
  metric,
}: {
  daily: TrendsResponse['daily_metrics']
  indices: SeasonalIndex[]
  metric: MetricKey
}) {
  const stats = useMemo(() => {
    if (daily.length === 0) return null

    const values = daily.map((d) => d[metric] as number)
    const total = values.reduce((a, b) => a + b, 0)
    const avg = total / values.length
    const latest = values[values.length - 1]
    const weekAgo = values.length > 7 ? values[values.length - 8] : null

    // Peak week from seasonal indices
    const peakWeek = indices.reduce(
      (best, si) =>
        si.index_value > (best?.index_value ?? 0) ? si : best,
      null as SeasonalIndex | null,
    )

    return { total, avg, latest, weekAgo, peakWeek }
  }, [daily, indices, metric])

  if (!stats) return null

  const weekChange =
    stats.weekAgo && stats.weekAgo > 0
      ? ((stats.latest - stats.weekAgo) / stats.weekAgo) * 100
      : null

  const cards = [
    {
      label: 'Period Total',
      value: formatNumber(stats.total),
    },
    {
      label: 'Daily Average',
      value: formatNumber(Math.round(stats.avg)),
    },
    {
      label: 'Week-on-Week',
      value: weekChange !== null ? `${weekChange > 0 ? '+' : ''}${weekChange.toFixed(1)}%` : '—',
      colour:
        weekChange !== null
          ? weekChange > 0
            ? 'text-green-400'
            : 'text-red-400'
          : undefined,
    },
    {
      label: 'Peak Season',
      value: stats.peakWeek
        ? `Wk ${stats.peakWeek.iso_week} (${stats.peakWeek.index_value.toFixed(1)}×)`
        : '—',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-mid-grey/20 bg-charcoal p-3"
        >
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">
            {c.label}
          </p>
          <p
            className={cn(
              'text-lg font-semibold mt-0.5',
              c.colour ?? 'text-off-white',
            )}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TrendExplorer() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [metric, setMetric] = useState<MetricKey>('views')
  const [period, setPeriod] = useState('365')
  const [loading, setLoading] = useState(false)
  const [topicsLoading, setTopicsLoading] = useState(true)

  const [trendData, setTrendData] = useState<TrendsResponse | null>(null)
  const [anomalies, setAnomalies] = useState<AnomaliesResponse['anomalies']>([])

  // Load topics on mount
  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch('/api/intelligence/topics')
        if (res.ok) {
          const data = await res.json()
          setTopics(data.topics || [])
          // Auto-select first topic
          if (data.topics?.length > 0) {
            setSelectedTopicId(data.topics[0].id)
          }
        }
      } catch {
        // Topics endpoint may not exist yet — fallback handled by empty state
      } finally {
        setTopicsLoading(false)
      }
    }
    fetchTopics()
  }, [])

  // Fetch trend data when topic/metric/period changes
  const fetchTrendData = useCallback(async () => {
    if (!selectedTopicId) return

    setLoading(true)
    try {
      const [trendsRes, anomaliesRes] = await Promise.all([
        fetch(
          `/api/intelligence/trends?topic_id=${selectedTopicId}&metric=${metric}&period=${period}`,
        ),
        fetch(
          `/api/intelligence/anomalies?topic_id=${selectedTopicId}&limit=50`,
        ),
      ])

      if (trendsRes.ok) {
        const data: TrendsResponse = await trendsRes.json()
        setTrendData(data)
      }

      if (anomaliesRes.ok) {
        const data: AnomaliesResponse = await anomaliesRes.json()
        setAnomalies(data.anomalies || [])
      }
    } catch {
      // Network error — leave existing data in place
    } finally {
      setLoading(false)
    }
  }, [selectedTopicId, metric, period])

  useEffect(() => {
    fetchTrendData()
  }, [fetchTrendData])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Topic selector */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Topic
          </label>
          <select
            value={selectedTopicId ?? ''}
            onChange={(e) => setSelectedTopicId(e.target.value || null)}
            disabled={topicsLoading}
            className={cn(
              'w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white',
              'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
            )}
          >
            {topicsLoading ? (
              <option>Loading topics…</option>
            ) : topics.length === 0 ? (
              <option>No tracked topics found</option>
            ) : (
              topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Metric selector */}
        <div>
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Metric
          </label>
          <div className="flex rounded-lg border border-mid-grey/30 overflow-hidden">
            {METRIC_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMetric(opt.value)}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  metric === opt.value
                    ? 'bg-coral text-white'
                    : 'bg-charcoal text-mid-grey hover:text-off-white',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period selector */}
        <div>
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Period
          </label>
          <div className="flex rounded-lg border border-mid-grey/30 overflow-hidden">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  period === opt.value
                    ? 'bg-coral text-white'
                    : 'bg-charcoal text-mid-grey hover:text-off-white',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTrendData}
          loading={loading}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Loading state */}
      {loading && !trendData && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !trendData && (
        <div className="text-center py-16 text-mid-grey">
          <TrendingUp className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">
            Select a topic to explore trends
          </p>
          <p className="text-sm mt-1">
            The trend engine analyses seasonal patterns, daily metrics, and anomalies
          </p>
        </div>
      )}

      {/* Data display */}
      {trendData && (
        <div className="space-y-6">
          {/* Summary stats */}
          <StatsRow
            daily={trendData.daily_metrics}
            indices={trendData.seasonal_indices}
            metric={metric}
          />

          {/* Daily metrics + forecast chart */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
            <DailyMetricsChart
              daily={trendData.daily_metrics}
              forecasts={trendData.forecasts}
              anomalies={anomalies}
              metric={metric}
            />
          </div>

          {/* Seasonal index chart */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
            <SeasonalChart indices={trendData.seasonal_indices} />
          </div>

          {/* Anomalies list */}
          {anomalies.length > 0 && (
            <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
              <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Recent Anomalies ({anomalies.length})
              </h3>
              <div className="space-y-2">
                {anomalies.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-mid-grey/10 bg-charcoal px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          a.direction === 'above'
                            ? 'bg-green-400'
                            : 'bg-red-400',
                        )}
                      />
                      <div>
                        <p className="text-sm text-off-white">
                          {a.metric} was{' '}
                          <span
                            className={
                              a.direction === 'above'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            {a.direction === 'above' ? '↑' : '↓'}{' '}
                            {Math.abs(a.z_score).toFixed(1)}σ
                          </span>{' '}
                          {a.direction} expected
                        </p>
                        <p className="text-xs text-mid-grey">
                          {a.detected_on} — expected{' '}
                          {formatNumber(Math.round(a.expected_value))}, actual{' '}
                          {formatNumber(Math.round(a.actual_value))}
                        </p>
                      </div>
                    </div>
                    {!a.is_acknowledged && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
