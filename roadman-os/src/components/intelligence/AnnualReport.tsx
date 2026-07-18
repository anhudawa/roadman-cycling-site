'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  BarChart3,
  Users,
  MessageSquare,
  Lightbulb,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SeasonalWeek {
  iso_week: number
  index_value: number
  confidence_score: number
  confidence: string
}

interface AlmanacEntry {
  topic_id: string
  topic_name: string
  topic_slug: string
  weeks: SeasonalWeek[]
  peak_week: number
  peak_index: number
  confidence: string
}

interface TopicMovement {
  topic_id: string
  topic_name: string
  growth_pct?: number
  decline_pct?: number
}

interface DemographicShift {
  age_bracket: string
  gender: string
  q1_share_pct: number
  q4_share_pct: number
  change_pct: number
}

interface CommunityTheme {
  topic_id: string
  topic_name: string
  total_posts: number
}

interface HeadlineStats {
  total_views: number
  total_engagement: number
  total_search_impressions: number
  total_revenue_cents: number
  yoy_views_pct: number | null
  yoy_engagement_pct: number | null
  yoy_search_impressions_pct: number | null
  yoy_revenue_pct: number | null
}

interface NotableAnomaly {
  id: string
  topic_id: string | null
  topic_name: string | null
  detected_on: string
  metric: string
  expected_value: number
  actual_value: number
  z_score: number
  direction: 'above' | 'below'
}

interface TopInsight {
  id: string
  type: string
  status: string
  statement: string
  topic_id: string | null
  topic_name: string | null
  confidence_score: number
  confidence: string
  sponsor_safe: boolean
  created_at: string
}

interface AnnualReportData {
  year: number
  generated_at: string
  seasonal_almanac: AlmanacEntry[]
  rising_topics: TopicMovement[]
  falling_topics: TopicMovement[]
  demographic_shifts: DemographicShift[]
  community_themes: CommunityTheme[]
  headline_stats: HeadlineStats
  notable_anomalies: NotableAnomaly[]
  top_insights: TopInsight[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatRevenue(cents: number): string {
  const pounds = cents / 100
  if (pounds >= 1_000_000) return '£' + (pounds / 1_000_000).toFixed(1) + 'M'
  if (pounds >= 1_000) return '£' + (pounds / 1_000).toFixed(1) + 'K'
  return '£' + pounds.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function isoWeekToMonth(week: number): number {
  return Math.min(11, Math.floor(((week - 1) / 52) * 12))
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Stat card with optional YoY change arrow */
function StatCard({
  label,
  value,
  yoyPct,
}: {
  label: string
  value: string
  yoyPct: number | null
}) {
  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-4">
      <p className="text-[10px] uppercase tracking-wider text-mid-grey">{label}</p>
      <p className="text-2xl font-semibold text-off-white mt-1">{value}</p>
      {yoyPct !== null && (
        <div className={cn('flex items-center gap-1 mt-1 text-sm', yoyPct >= 0 ? 'text-green-400' : 'text-red-400')}>
          {yoyPct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{yoyPct >= 0 ? '+' : ''}{yoyPct}% YoY</span>
        </div>
      )}
    </div>
  )
}

/** Seasonal Almanac — 12-month grid showing which topics peak in each month */
function SeasonalAlmanacGrid({ almanac }: { almanac: AlmanacEntry[] }) {
  // Group topics by their peak month
  const monthBuckets = useMemo(() => {
    const buckets: { month: string; topics: { name: string; peak_index: number; confidence: string }[] }[] =
      MONTH_LABELS.map((m) => ({ month: m, topics: [] }))

    for (const entry of almanac) {
      if (entry.peak_index <= 0) continue
      const monthIdx = isoWeekToMonth(entry.peak_week)
      buckets[monthIdx].topics.push({
        name: entry.topic_name,
        peak_index: Math.round(entry.peak_index * 100) / 100,
        confidence: entry.confidence,
      })
    }

    // Sort topics within each month by peak_index desc
    for (const bucket of buckets) {
      bucket.topics.sort((a, b) => b.peak_index - a.peak_index)
    }

    return buckets
  }, [almanac])

  if (almanac.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No seasonal data available for this year
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {monthBuckets.map((bucket) => (
        <div
          key={bucket.month}
          className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-3"
        >
          <p className="text-xs font-medium text-coral uppercase tracking-wider mb-2">
            {bucket.month}
          </p>
          {bucket.topics.length === 0 ? (
            <p className="text-[10px] text-mid-grey/50">No peaks</p>
          ) : (
            <div className="space-y-1.5">
              {bucket.topics.map((t) => (
                <div key={t.name}>
                  <p className="text-xs text-off-white truncate">{t.name}</p>
                  <p className="text-[10px] text-mid-grey">
                    {t.peak_index.toFixed(2)}× avg
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** Rising & Falling Topics — two columns */
function TopicMovementColumns({
  rising,
  falling,
}: {
  rising: TopicMovement[]
  falling: TopicMovement[]
}) {
  if (rising.length === 0 && falling.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No significant topic movements detected
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Rising */}
      <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-2">
        <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Rising Topics
        </h4>
        {rising.length === 0 ? (
          <p className="text-xs text-mid-grey">None</p>
        ) : (
          <div className="space-y-2">
            {rising.map((t) => (
              <div key={t.topic_id} className="flex items-center justify-between">
                <span className="text-sm text-off-white truncate">{t.topic_name}</span>
                <span className="text-sm font-medium text-green-400 shrink-0 ml-2">
                  +{t.growth_pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Falling */}
      <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-2">
        <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          Falling Topics
        </h4>
        {falling.length === 0 ? (
          <p className="text-xs text-mid-grey">None</p>
        ) : (
          <div className="space-y-2">
            {falling.map((t) => (
              <div key={t.topic_id} className="flex items-center justify-between">
                <span className="text-sm text-off-white truncate">{t.topic_name}</span>
                <span className="text-sm font-medium text-red-400 shrink-0 ml-2">
                  -{t.decline_pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Demographic Shifts — SVG grouped bar chart */
function DemographicShiftsChart({ shifts }: { shifts: DemographicShift[] }) {
  if (shifts.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No demographic data available
      </div>
    )
  }

  // Get unique age brackets, preserving a sensible order
  const ageBrackets = useMemo(() => {
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const s of shifts) {
      if (!seen.has(s.age_bracket)) {
        seen.add(s.age_bracket)
        ordered.push(s.age_bracket)
      }
    }
    return ordered
  }, [shifts])

  // Aggregate by age bracket (average across genders for the bar chart)
  const bracketData = useMemo(() => {
    return ageBrackets.map((bracket) => {
      const rows = shifts.filter((s) => s.age_bracket === bracket)
      const q1Avg = rows.reduce((sum, r) => sum + r.q1_share_pct, 0) / (rows.length || 1)
      const q4Avg = rows.reduce((sum, r) => sum + r.q4_share_pct, 0) / (rows.length || 1)
      return { bracket, q1: q1Avg, q4: q4Avg }
    })
  }, [ageBrackets, shifts])

  const maxVal = Math.max(...bracketData.flatMap((d) => [d.q1, d.q4]), 1)

  const width = 700
  const height = 280
  const padding = { top: 20, right: 20, bottom: 60, left: 50 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const groupWidth = plotW / bracketData.length
  const barWidth = groupWidth * 0.3
  const gap = groupWidth * 0.1

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[500px]"
        preserveAspectRatio="xMinYMid meet"
      >
        {/* Y-axis gridlines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const yVal = (pct / 100) * maxVal
          const y = padding.top + plotH - (yVal / maxVal) * plotH
          return (
            <g key={pct}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + plotW}
                y2={y}
                stroke="rgba(128,128,128,0.15)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-mid-grey"
                fontSize="10"
              >
                {yVal.toFixed(0)}%
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {bracketData.map((d, i) => {
          const groupX = padding.left + i * groupWidth
          const q1Height = (d.q1 / maxVal) * plotH
          const q4Height = (d.q4 / maxVal) * plotH

          return (
            <g key={d.bracket}>
              {/* Q1 bar */}
              <rect
                x={groupX + gap}
                y={padding.top + plotH - q1Height}
                width={barWidth}
                height={q1Height}
                fill="#4C1273"
                rx="2"
              />
              {/* Q4 bar */}
              <rect
                x={groupX + gap + barWidth + 4}
                y={padding.top + plotH - q4Height}
                width={barWidth}
                height={q4Height}
                fill="#F16363"
                rx="2"
              />
              {/* Label */}
              <text
                x={groupX + groupWidth / 2}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="fill-mid-grey"
                fontSize="10"
              >
                {d.bracket}
              </text>
            </g>
          )
        })}

        {/* Baseline */}
        <line
          x1={padding.left}
          y1={padding.top + plotH}
          x2={padding.left + plotW}
          y2={padding.top + plotH}
          stroke="rgba(128,128,128,0.3)"
        />
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-mid-grey mt-2">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-purple rounded-sm" /> Q1
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-coral rounded-sm" /> Q4
        </span>
      </div>
    </div>
  )
}

/** Community Themes — horizontal bar chart */
function CommunityThemesChart({ themes }: { themes: CommunityTheme[] }) {
  if (themes.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No community data available
      </div>
    )
  }

  const maxPosts = Math.max(...themes.map((t) => t.total_posts), 1)

  return (
    <div className="space-y-2">
      {themes.map((theme, i) => (
        <div key={theme.topic_id} className="flex items-center gap-3">
          <span className="w-5 text-right text-xs text-mid-grey shrink-0">{i + 1}</span>
          <span className="w-32 text-sm text-off-white truncate shrink-0">{theme.topic_name}</span>
          <div className="flex-1 h-5 bg-charcoal rounded border border-mid-grey/10">
            <div
              className="h-full bg-coral/80 rounded transition-all"
              style={{ width: `${(theme.total_posts / maxPosts) * 100}%` }}
            />
          </div>
          <span className="w-16 text-right text-xs text-mid-grey shrink-0">
            {formatNumber(theme.total_posts)}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Notable Anomalies — list with z-score badges */
function AnomaliesList({ anomalies }: { anomalies: NotableAnomaly[] }) {
  if (anomalies.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No anomalies detected this year
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {anomalies.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-lg border border-mid-grey/10 bg-charcoal px-3 py-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                a.direction === 'above' ? 'bg-green-400' : 'bg-red-400',
              )}
            />
            <div className="min-w-0">
              <p className="text-sm text-off-white truncate">
                {a.topic_name || 'Unknown topic'} — {a.metric}
              </p>
              <p className="text-xs text-mid-grey">
                {a.detected_on} — expected {formatNumber(Math.round(a.expected_value))}, actual {formatNumber(Math.round(a.actual_value))}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded shrink-0 ml-2',
              Math.abs(a.z_score) >= 4
                ? 'bg-red-400/10 text-red-400'
                : Math.abs(a.z_score) >= 3
                  ? 'bg-yellow-400/10 text-yellow-400'
                  : 'bg-mid-grey/10 text-mid-grey',
            )}
          >
            {a.direction === 'above' ? '↑' : '↓'} {Math.abs(a.z_score).toFixed(1)}σ
          </span>
        </div>
      ))}
    </div>
  )
}

/** Top Insights — card list */
function InsightsList({ insights }: { insights: TopInsight[] }) {
  if (insights.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No validated insights for this year
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className="rounded-lg border border-mid-grey/10 bg-charcoal px-4 py-3 space-y-1"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-off-white">{insight.statement}</p>
            <div className="flex items-center gap-2 shrink-0">
              {insight.sponsor_safe && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-green-400/10 text-green-400">
                  Sponsor Safe
                </span>
              )}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-coral/10 text-coral">
                {insight.confidence_score.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-mid-grey">
            {insight.topic_name && <span>{insight.topic_name}</span>}
            <span>{insight.type.replace(/_/g, ' ')}</span>
            <span>{insight.status}</span>
            <span>
              {new Date(insight.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AnnualReport() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear - 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<AnnualReportData | null>(null)

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/intelligence/annual-report?year=${year}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to load report')
        return
      }
      const data: AnnualReportData = await res.json()
      setReport(data)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleExportJson = useCallback(() => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `annual-report-${report.year}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [report])

  // Year selector options (current year back 5 years)
  const yearOptions = useMemo(() => {
    const years: number[] = []
    for (let y = currentYear; y >= currentYear - 5; y--) {
      years.push(y)
    }
    return years
  }, [currentYear])

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className={cn(
              'appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white',
              'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
            )}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchReport}
          loading={loading}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>

        {report && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            icon={<Download className="h-4 w-4" />}
          >
            Export JSON
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading && !report && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="space-y-8">
          {/* Header */}
          <div className="rounded-xl bg-deep-purple p-8 text-center">
            <h2 className="font-heading text-4xl sm:text-5xl uppercase text-off-white tracking-wide">
              State of the Masters Cyclist {report.year}
            </h2>
            <div className="mt-3 h-1 w-24 mx-auto bg-coral rounded-full" />
            <p className="mt-3 text-sm text-mid-grey">
              Generated {new Date(report.generated_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* 1. Headline Stats */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2 uppercase tracking-wider">
              <BarChart3 className="h-4 w-4 text-coral" />
              Headline Stats
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Total Views"
                value={formatNumber(report.headline_stats.total_views)}
                yoyPct={report.headline_stats.yoy_views_pct}
              />
              <StatCard
                label="Total Engagement"
                value={formatNumber(report.headline_stats.total_engagement)}
                yoyPct={report.headline_stats.yoy_engagement_pct}
              />
              <StatCard
                label="Search Impressions"
                value={formatNumber(report.headline_stats.total_search_impressions)}
                yoyPct={report.headline_stats.yoy_search_impressions_pct}
              />
              <StatCard
                label="Revenue"
                value={formatRevenue(report.headline_stats.total_revenue_cents)}
                yoyPct={report.headline_stats.yoy_revenue_pct}
              />
            </div>
          </section>

          {/* 2. Seasonal Almanac */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2 uppercase tracking-wider">
              <BarChart3 className="h-4 w-4 text-coral" />
              Seasonal Almanac
            </h3>
            <SeasonalAlmanacGrid almanac={report.seasonal_almanac} />
          </section>

          {/* 3. Rising & Falling Topics */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-coral" />
              Topic Momentum (H1 vs H2)
            </h3>
            <TopicMovementColumns
              rising={report.rising_topics}
              falling={report.falling_topics}
            />
          </section>

          {/* 4. Demographic Shifts */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2 uppercase tracking-wider">
              <Users className="h-4 w-4 text-coral" />
              Demographic Shifts (Q1 vs Q4)
            </h3>
            <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
              <DemographicShiftsChart shifts={report.demographic_shifts} />
            </div>
          </section>

          {/* 5. Community Themes */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2 uppercase tracking-wider">
              <MessageSquare className="h-4 w-4 text-coral" />
              Community Themes
            </h3>
            <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
              <CommunityThemesChart themes={report.community_themes} />
            </div>
          </section>

          {/* 6. Notable Anomalies */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2 uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-coral" />
              Notable Anomalies ({report.notable_anomalies.length})
            </h3>
            <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
              <AnomaliesList anomalies={report.notable_anomalies} />
            </div>
          </section>

          {/* 7. Top Insights */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2 uppercase tracking-wider">
              <Lightbulb className="h-4 w-4 text-coral" />
              Top Insights ({report.top_insights.length})
            </h3>
            <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
              <InsightsList insights={report.top_insights} />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
