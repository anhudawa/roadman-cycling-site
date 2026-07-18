'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Printer,
  Users,
  TrendingUp,
  Lightbulb,
  BarChart3,
  ChevronDown,
  RefreshCw,
  Shield,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { TrendConfidence } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryOption {
  name: string
  topic_count: number
}

interface TopicSummary {
  id: string
  name: string
  slug: string
}

interface DemographicRow {
  age_bracket: string
  gender: string
  share_pct: number
  sample_size: number
}

interface AudienceData {
  demographics: DemographicRow[]
  period_start: string | null
  period_end: string | null
  sample_rows: number
}

interface CommunitySize {
  free: number
  ndy: number
  total: number
  as_of: string | null
}

interface SeasonalWeek {
  iso_week: number
  avg_index: number
  topics_in_week: number
  per_topic: { topic_id: string; index_value: number }[]
}

interface SeasonalCurve {
  metric: string
  weeks: SeasonalWeek[]
  years_observed: number
  data_points: number
}

interface PackInsight {
  id: string
  type: string
  status: string
  statement: string
  topic_id: string | null
  confidence_score: number
  confidence: TrendConfidence
  sponsor_safe: boolean
  valid_from: string | null
  valid_until: string | null
  evidence: Record<string, unknown>
  created_at: string
  topics: { name: string; slug: string } | null
}

interface FormatBreakdown {
  asset_type: string
  pieces: number
  total_views: number
  total_engagement: number
  avg_views: number
  avg_engagement: number
}

interface TopicFormat {
  topic_id: string
  topic_name: string
  formats: FormatBreakdown[]
}

interface PackData {
  category: string
  topics: TopicSummary[]
  audience: AudienceData
  community_size: CommunitySize
  seasonal_curve: SeasonalCurve
  insights: PackInsight[]
  format_effectiveness: TopicFormat[]
  generated_at: string
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

function formatLabel(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function isoWeekToMonth(w: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = Math.min(11, Math.floor(((w - 1) / 52) * 12))
  return months[monthIndex]
}

const CONFIDENCE_COLOURS: Record<TrendConfidence, string> = {
  noise: '#6B7280',
  emerging: '#FBBF24',
  probable: '#60A5FA',
  established: '#34D399',
}

const CONFIDENCE_BG: Record<TrendConfidence, string> = {
  noise: 'bg-gray-500/20 text-gray-400',
  emerging: 'bg-yellow-500/20 text-yellow-400',
  probable: 'bg-blue-500/20 text-blue-400',
  established: 'bg-green-500/20 text-green-400',
}

const GENDER_COLOURS: Record<string, string> = {
  male: '#60A5FA',
  female: '#F472B6',
  other: '#A855F7',
  unknown: '#6B7280',
}

const FORMAT_COLOURS: Record<string, string> = {
  youtube_video: '#FF6B6B',
  blog_post: '#60A5FA',
  podcast_episode: '#A855F7',
  newsletter: '#34D399',
  reel: '#F472B6',
  short: '#FBBF24',
  carousel: '#FB923C',
  social_post: '#818CF8',
}

// ---------------------------------------------------------------------------
// Print CSS — injected once
// ---------------------------------------------------------------------------

const PRINT_STYLE_ID = 'sponsor-pack-print-css'

function ensurePrintStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(PRINT_STYLE_ID)) return

  const style = document.createElement('style')
  style.id = PRINT_STYLE_ID
  style.textContent = `
    @media print {
      /* Hide everything except the pack */
      body > *:not(#__next),
      nav, aside, header,
      [data-print-hide] {
        display: none !important;
      }
      /* Pack-specific print overrides */
      .sponsor-pack-container {
        background: white !important;
        color: #1a1a1a !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .sponsor-pack-container * {
        color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-break-before {
        page-break-before: always;
      }
      .print-hide {
        display: none !important;
      }
      @page {
        margin: 1.5cm;
        size: A4 portrait;
      }
    }
  `
  document.head.appendChild(style)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Pack header — deep-purple background with coral accent */
function PackHeader({ category, generatedAt }: { category: string; generatedAt: string }) {
  return (
    <div className="rounded-t-xl overflow-hidden">
      <div className="bg-[#210140] px-8 py-6">
        <h1 className="font-display text-3xl uppercase tracking-wider text-off-white">
          Roadman Cycling
        </h1>
        <div className="h-1 w-24 bg-coral mt-2 rounded-full" />
        <p className="text-lg text-off-white/80 mt-3 font-medium">
          {formatLabel(category)} Sponsor Evidence Pack
        </p>
        <p className="text-sm text-off-white/50 mt-1">
          Generated {formatDate(generatedAt)}
        </p>
      </div>
    </div>
  )
}

/** Audience demographics — horizontal bar chart grouped by age bracket */
function AudienceOverview({
  audience,
  communitySize,
}: {
  audience: AudienceData
  communitySize: CommunitySize
}) {
  // Aggregate by age bracket across genders for sorting
  const ageBrackets = useMemo(() => {
    const bracketMap = new Map<string, DemographicRow[]>()
    for (const row of audience.demographics) {
      if (!bracketMap.has(row.age_bracket)) bracketMap.set(row.age_bracket, [])
      bracketMap.get(row.age_bracket)!.push(row)
    }
    return Array.from(bracketMap.entries())
      .map(([bracket, rows]) => ({
        bracket,
        rows,
        totalPct: rows.reduce((s, r) => s + r.share_pct, 0),
      }))
      .sort((a, b) => a.bracket.localeCompare(b.bracket))
  }, [audience.demographics])

  const maxPct = Math.max(...ageBrackets.map((b) => b.totalPct), 1)

  // SVG dimensions
  const barHeight = 28
  const gap = 8
  const labelWidth = 70
  const chartWidth = 500
  const svgHeight = ageBrackets.length * (barHeight + gap) + 30

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-5 w-5 text-coral" />
        <h2 className="font-display text-xl uppercase text-off-white">Audience Overview</h2>
      </div>

      {/* Community headline stat */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="rounded-lg bg-[#210140]/50 p-4 text-center">
          <p className="text-2xl font-bold text-coral">{formatNumber(communitySize.total)}</p>
          <p className="text-xs text-mid-grey mt-1">Total Community</p>
        </div>
        <div className="rounded-lg bg-[#210140]/50 p-4 text-center">
          <p className="text-2xl font-bold text-off-white">{formatNumber(communitySize.free)}</p>
          <p className="text-xs text-mid-grey mt-1">Free Members</p>
        </div>
        <div className="rounded-lg bg-[#210140]/50 p-4 text-center">
          <p className="text-2xl font-bold text-off-white">{formatNumber(communitySize.ndy)}</p>
          <p className="text-xs text-mid-grey mt-1">Not Done Yet (Paid)</p>
        </div>
      </div>
      {communitySize.as_of && (
        <p className="text-[10px] text-mid-grey">
          Community data as of {formatDate(communitySize.as_of)}
        </p>
      )}

      {/* Demographics bar chart */}
      {ageBrackets.length > 0 ? (
        <>
          <h3 className="text-sm font-medium text-off-white mt-4">Demographics by Age &amp; Gender</h3>
          <svg
            viewBox={`0 0 ${labelWidth + chartWidth + 60} ${svgHeight}`}
            className="w-full"
            role="img"
            aria-label="Demographics horizontal bar chart"
          >
            {ageBrackets.map((bracket, i) => {
              const y = i * (barHeight + gap)
              let xOffset = labelWidth + 10

              return (
                <g key={bracket.bracket}>
                  {/* Label */}
                  <text
                    x={labelWidth}
                    y={y + barHeight / 2 + 4}
                    textAnchor="end"
                    className="text-[11px]"
                    fill="#9ca3af"
                  >
                    {bracket.bracket}
                  </text>

                  {/* Stacked bars by gender */}
                  {bracket.rows
                    .sort((a, b) => a.gender.localeCompare(b.gender))
                    .map((row) => {
                      const width = Math.max(2, (row.share_pct / maxPct) * (chartWidth - 60))
                      const barX = xOffset
                      xOffset += width
                      return (
                        <g key={`${bracket.bracket}-${row.gender}`}>
                          <rect
                            x={barX}
                            y={y}
                            width={width}
                            height={barHeight}
                            rx={3}
                            fill={GENDER_COLOURS[row.gender] || '#6B7280'}
                            opacity={0.85}
                          />
                          {width > 30 && (
                            <text
                              x={barX + width / 2}
                              y={y + barHeight / 2 + 4}
                              textAnchor="middle"
                              className="text-[10px] font-medium"
                              fill="#ffffff"
                            >
                              {row.share_pct.toFixed(1)}%
                            </text>
                          )}
                        </g>
                      )
                    })}

                  {/* Total label */}
                  <text
                    x={xOffset + 6}
                    y={y + barHeight / 2 + 4}
                    className="text-[10px]"
                    fill="#9ca3af"
                  >
                    {bracket.totalPct.toFixed(1)}%
                  </text>
                </g>
              )
            })}

            {/* Legend */}
            {Object.entries(GENDER_COLOURS).map(([gender, colour], i) => {
              const hasData = audience.demographics.some((d) => d.gender === gender)
              if (!hasData) return null
              return (
                <g key={gender} transform={`translate(${labelWidth + 10 + i * 90}, ${svgHeight - 16})`}>
                  <rect width={10} height={10} rx={2} fill={colour} opacity={0.85} />
                  <text x={14} y={9} className="text-[10px]" fill="#9ca3af">
                    {formatLabel(gender)}
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="text-[10px] text-mid-grey">
            Based on {audience.sample_rows} data points
            {audience.period_start && audience.period_end && (
              <> from {formatDate(audience.period_start)} to {formatDate(audience.period_end)}</>
            )}
          </p>
        </>
      ) : (
        <p className="text-sm text-mid-grey">No demographic data available.</p>
      )}
    </div>
  )
}

/** Seasonal demand curve — SVG line chart */
function SeasonalDemandCurve({ curve }: { curve: SeasonalCurve }) {
  const weeks = curve.weeks
  if (weeks.length === 0) {
    return (
      <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-coral" />
          <h2 className="font-display text-xl uppercase text-off-white">Seasonal Demand Curve</h2>
        </div>
        <p className="text-sm text-mid-grey">No seasonal data available for this category.</p>
      </div>
    )
  }

  const padding = { top: 30, right: 30, bottom: 50, left: 55 }
  const width = 700
  const height = 280
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const maxIndex = Math.max(...weeks.map((w) => w.avg_index), 1)
  const minIndex = Math.min(...weeks.map((w) => w.avg_index), 0)
  const range = maxIndex - minIndex || 1

  // Build path
  const points = weeks.map((w, i) => {
    const x = padding.left + (i / Math.max(weeks.length - 1, 1)) * plotW
    const y = padding.top + plotH - ((w.avg_index - minIndex) / range) * plotH
    return { x, y, week: w }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + plotH} L ${points[0].x} ${padding.top + plotH} Z`

  // Find peak weeks (top 3)
  const peakWeeks = [...weeks]
    .sort((a, b) => b.avg_index - a.avg_index)
    .slice(0, 3)
    .map((w) => w.iso_week)

  // Month labels on x-axis
  const monthLabels: { x: number; label: string }[] = []
  let lastMonth = ''
  for (const p of points) {
    const month = isoWeekToMonth(p.week.iso_week)
    if (month !== lastMonth) {
      monthLabels.push({ x: p.x, label: month })
      lastMonth = month
    }
  }

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6 space-y-3 print-break-before">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-coral" />
        <h2 className="font-display text-xl uppercase text-off-white">Seasonal Demand Curve</h2>
      </div>
      <p className="text-xs text-mid-grey mb-2">
        Search impressions index across 53 weeks, averaged across {weeks[0]?.topics_in_week ?? 0} topic(s).
        Based on {curve.years_observed} year(s) of data ({curve.data_points} data points).
      </p>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Seasonal demand curve">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padding.top + plotH - frac * plotH
          const val = minIndex + frac * range
          return (
            <g key={frac}>
              <line x1={padding.left} y1={y} x2={padding.left + plotW} y2={y} stroke="#374151" strokeWidth={0.5} />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[9px]" fill="#6B7280">
                {val.toFixed(1)}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="#F16363" opacity={0.1} />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#F16363" strokeWidth={2} strokeLinejoin="round" />

        {/* Peak annotations */}
        {points
          .filter((p) => peakWeeks.includes(p.week.iso_week))
          .map((p) => (
            <g key={`peak-${p.week.iso_week}`}>
              <circle cx={p.x} cy={p.y} r={4} fill="#F16363" stroke="#210140" strokeWidth={2} />
              <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] font-medium" fill="#F16363">
                W{p.week.iso_week} ({p.week.avg_index.toFixed(2)})
              </text>
            </g>
          ))}

        {/* Month labels */}
        {monthLabels.map((m) => (
          <text key={m.label + m.x} x={m.x} y={height - 10} textAnchor="middle" className="text-[9px]" fill="#6B7280">
            {m.label}
          </text>
        ))}

        {/* Axis labels */}
        <text
          x={padding.left - 40}
          y={padding.top + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90, ${padding.left - 40}, ${padding.top + plotH / 2})`}
          className="text-[9px]"
          fill="#6B7280"
        >
          Index Value
        </text>
      </svg>
    </div>
  )
}

/** Insight cards */
function InsightCards({ insights }: { insights: PackInsight[] }) {
  if (insights.length === 0) {
    return (
      <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-coral" />
          <h2 className="font-display text-xl uppercase text-off-white">Established Insights</h2>
        </div>
        <p className="text-sm text-mid-grey">No sponsor-safe validated insights for this category yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6 space-y-4 print-break-before">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-5 w-5 text-coral" />
        <h2 className="font-display text-xl uppercase text-off-white">Established Insights</h2>
      </div>
      <p className="text-xs text-mid-grey mb-3">
        {insights.length} sponsor-safe insight{insights.length !== 1 ? 's' : ''} (validated or actioned).
      </p>
      <div className="grid gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-lg border border-mid-grey/10 bg-[#210140]/30 p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-off-white flex-1">{insight.statement}</p>
              <span
                className={cn(
                  'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                  CONFIDENCE_BG[insight.confidence],
                )}
              >
                <Shield className="h-3 w-3" />
                {insight.confidence}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-mid-grey">
              {insight.topics && (
                <span>Topic: {insight.topics.name}</span>
              )}
              <span>Score: {(insight.confidence_score * 100).toFixed(0)}%</span>
              <span>Type: {formatLabel(insight.type)}</span>
              {insight.valid_from && insight.valid_until && (
                <span>Valid: {formatDate(insight.valid_from)} – {formatDate(insight.valid_until)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Format effectiveness — per-topic horizontal bars */
function FormatEffectivenessSection({ topics }: { topics: TopicFormat[] }) {
  if (topics.length === 0) {
    return (
      <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-coral" />
          <h2 className="font-display text-xl uppercase text-off-white">Format Effectiveness</h2>
        </div>
        <p className="text-sm text-mid-grey">No format performance data available for this category.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6 space-y-4 print-break-before">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-5 w-5 text-coral" />
        <h2 className="font-display text-xl uppercase text-off-white">Format Effectiveness</h2>
      </div>
      <p className="text-xs text-mid-grey mb-3">
        Average engagement per piece by content format, per topic.
      </p>

      {topics.map((topic) => {
        const maxEng = Math.max(...topic.formats.map((f) => f.avg_engagement), 1)
        const barH = 24
        const gapY = 6
        const labelW = 110
        const chartW = 450
        const svgH = topic.formats.length * (barH + gapY) + 10

        return (
          <div key={topic.topic_id} className="space-y-2">
            <h3 className="text-sm font-medium text-off-white">{topic.topic_name}</h3>
            <svg
              viewBox={`0 0 ${labelW + chartW + 100} ${svgH}`}
              className="w-full"
              role="img"
              aria-label={`Format effectiveness for ${topic.topic_name}`}
            >
              {topic.formats.map((format, i) => {
                const y = i * (barH + gapY)
                const widthPct = Math.max(4, (format.avg_engagement / maxEng) * chartW)
                const colour = FORMAT_COLOURS[format.asset_type] || '#6B7280'
                const insufficientSample = format.pieces < 3

                return (
                  <g key={format.asset_type} opacity={insufficientSample ? 0.5 : 1}>
                    {/* Label */}
                    <text x={labelW} y={y + barH / 2 + 4} textAnchor="end" className="text-[10px]" fill="#9ca3af">
                      {formatLabel(format.asset_type)}
                    </text>

                    {/* Bar */}
                    <rect
                      x={labelW + 8}
                      y={y}
                      width={widthPct}
                      height={barH}
                      rx={3}
                      fill={colour}
                    />

                    {/* Value label */}
                    <text
                      x={labelW + 8 + widthPct + 6}
                      y={y + barH / 2 + 4}
                      className="text-[10px]"
                      fill="#d1d5db"
                    >
                      {formatNumber(format.avg_engagement)} avg eng · {format.pieces} piece{format.pieces !== 1 ? 's' : ''}
                      {insufficientSample ? ' (low sample)' : ''}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )
      })}
    </div>
  )
}

/** Footer with date range and confidentiality notice */
function PackFooter({ data }: { data: PackData }) {
  // Compute date range from insights and seasonal data
  const dates: string[] = []
  for (const insight of data.insights) {
    if (insight.valid_from) dates.push(insight.valid_from)
    if (insight.valid_until) dates.push(insight.valid_until)
    if (insight.created_at) dates.push(insight.created_at)
  }
  if (data.audience.period_start) dates.push(data.audience.period_start)
  if (data.audience.period_end) dates.push(data.audience.period_end)
  if (data.community_size.as_of) dates.push(data.community_size.as_of)

  dates.sort()
  const earliest = dates[0] ? formatDate(dates[0]) : 'N/A'
  const latest = dates[dates.length - 1] ? formatDate(dates[dates.length - 1]) : 'N/A'

  return (
    <div className="rounded-b-xl bg-[#210140] px-8 py-4 mt-6">
      <div className="h-px w-full bg-coral/30 mb-3" />
      <p className="text-[11px] text-off-white/60 leading-relaxed">
        Data covers {earliest} – {latest}. All figures carry sample sizes.
        Confidential — prepared for sponsor review.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SponsorEvidencePack() {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [packData, setPackData] = useState<PackData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch available categories on mount
  useEffect(() => {
    ensurePrintStyles()

    async function fetchCategories() {
      try {
        const res = await fetch('/api/intelligence/sponsor-packs')
        if (res.ok) {
          const json = await res.json()
          setCategories(json.categories || [])
        }
      } catch {
        // Ignore
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch pack data when category changes
  const fetchPack = useCallback(async (category: string) => {
    if (!category) {
      setPackData(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/intelligence/sponsor-packs?category=${encodeURIComponent(category)}`)
      if (res.ok) {
        setPackData(await res.json())
      } else {
        const json = await res.json().catch(() => ({ error: 'Failed to load pack' }))
        setError(json.error || 'Failed to load pack')
        setPackData(null)
      }
    } catch {
      setError('Network error — could not load pack.')
      setPackData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchPack(selectedCategory)
    } else {
      setPackData(null)
    }
  }, [selectedCategory, fetchPack])

  return (
    <div className="space-y-6">
      {/* Controls — hidden when printing */}
      <div className="flex flex-wrap items-end gap-4 print-hide" data-print-hide>
        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Commercial Category
          </label>
          {loadingCategories ? (
            <div className="flex items-center gap-2 text-sm text-mid-grey py-2">
              <LoadingSpinner size="sm" />
              Loading categories…
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 pr-8 text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50"
              >
                <option value="">Select a category…</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {formatLabel(cat.name)} ({cat.topic_count} topic{cat.topic_count !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-grey pointer-events-none" />
            </div>
          )}
        </div>

        {packData && (
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={() => fetchPack(selectedCategory)}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Printer className="h-4 w-4" />}
              onClick={() => window.print()}
            >
              Print / Export PDF
            </Button>
          </>
        )}
      </div>

      {/* Loading state */}
      {loading && !packData && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !packData && !error && !selectedCategory && (
        <div className="text-center py-16 text-mid-grey">
          <BarChart3 className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">Select a category</p>
          <p className="text-sm mt-1">
            Choose a commercial category to generate a branded sponsor evidence pack.
          </p>
        </div>
      )}

      {/* The pack itself */}
      {packData && (
        <div className="sponsor-pack-container rounded-xl border border-mid-grey/20 bg-charcoal overflow-hidden">
          <PackHeader category={packData.category} generatedAt={packData.generated_at} />

          {/* Topics covered */}
          <div className="px-8 pt-6">
            <p className="text-xs text-mid-grey mb-1">
              Topics in this category ({packData.topics.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {packData.topics.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center rounded-full bg-purple/20 px-2.5 py-0.5 text-xs text-off-white"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="px-8 py-6 space-y-6">
            <AudienceOverview
              audience={packData.audience}
              communitySize={packData.community_size}
            />
            <SeasonalDemandCurve curve={packData.seasonal_curve} />
            <InsightCards insights={packData.insights} />
            <FormatEffectivenessSection topics={packData.format_effectiveness} />
          </div>

          <PackFooter data={packData} />
        </div>
      )}
    </div>
  )
}
