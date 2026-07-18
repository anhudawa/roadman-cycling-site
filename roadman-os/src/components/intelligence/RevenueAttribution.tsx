'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  PoundSterling,
  Hash,
  Eye,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  TrendingUp,
  Users,
  BarChart3,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventTypeBreakdown {
  [eventType: string]: number
}

interface AttrMethodBreakdown {
  [method: string]: { revenue_cents: number; count: number }
}

interface SummaryData {
  total_revenue_cents: number
  event_count: number
  by_event_type: Record<string, { count: number; revenue_cents: number }>
  by_attribution_method: Record<string, { count: number; revenue_cents: number }>
}

interface TopicRow {
  topic_id: string
  topic_name: string
  revenue_cents: number
  count: number
  by_attribution_method: AttrMethodBreakdown
}

interface MonthRow {
  month: string
  revenue_cents: number
  count: number
  by_event_type: EventTypeBreakdown
}

interface AttrRow {
  attribution_method: string
  revenue_cents: number
  count: number
  percentage: number
  is_direct: boolean
}

interface ContentItem {
  id: string
  title: string
  type: string
}

interface NDYWeek {
  week: string
  join_count: number
  content_published: ContentItem[]
}

interface CohortView {
  cohort_months: string[]
  all_months: string[]
  data: Record<string, Record<string, { revenue_cents: number; count: number }>>
}

interface RevenueResponse {
  summary: SummaryData
  by_topic: TopicRow[]
  by_month: MonthRow[]
  by_attribution: AttrRow[]
  ndy_join_curve: NDYWeek[]
  cohort_view: CohortView
  period: { start: string; end: string }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EVENT_TYPE_COLOURS: Record<string, string> = {
  join: '#F16363',     // coral
  renewal: '#4C1273',  // purple
  purchase: '#3B82F6', // blue
  booking: '#22C55E',  // green
  churn: '#EF4444',    // red (shown as negative)
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  join: 'Join',
  renewal: 'Renewal',
  purchase: 'Purchase',
  booking: 'Booking',
  churn: 'Churn',
}

const ATTR_METHOD_LABELS: Record<string, string> = {
  utm: 'UTM (direct)',
  survey: 'Survey',
  last_touch: 'Last Touch',
  manual: 'Manual',
  unset: 'Unset',
}

const YEAR_OPTIONS = [2024, 2025, 2026, 2027]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPounds(cents: number): string {
  const pounds = cents / 100
  const isNegative = pounds < 0
  const abs = Math.abs(pounds)
  const formatted = abs >= 1000
    ? '£' + abs.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : '£' + abs.toFixed(0)
  return isNegative ? `-${formatted}` : formatted
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function monthLabel(yyyymm: string): string {
  const [yr, mo] = yyyymm.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[parseInt(mo, 10) - 1] + ' ' + yr.slice(2)
}

function shortMonth(yyyymm: string): string {
  const mo = parseInt(yyyymm.split('-')[1], 10)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[mo - 1]
}

function isDirectAttribution(method: string): boolean {
  return method === 'utm'
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Summary stat cards grid */
function SummaryCards({ summary }: { summary: SummaryData }) {
  const utmRevenue = summary.by_attribution_method['utm']?.revenue_cents || 0
  const totalAbs = Object.values(summary.by_attribution_method).reduce(
    (s, v) => s + Math.abs(v.revenue_cents),
    0,
  ) || 1
  const utmPct = Math.round((Math.abs(utmRevenue) / totalAbs) * 100)
  const inferredPct = 100 - utmPct

  const cards = [
    {
      label: 'Total Revenue',
      value: formatPounds(summary.total_revenue_cents),
      icon: PoundSterling,
      colour: 'text-coral',
    },
    {
      label: 'Total Events',
      value: formatNumber(summary.event_count),
      icon: Hash,
      colour: 'text-off-white',
    },
    {
      label: 'UTM-Attributed',
      value: `${utmPct}%`,
      icon: ShieldCheck,
      colour: 'text-green-400',
      sublabel: 'Directly tracked',
    },
    {
      label: 'Inferred',
      value: `${inferredPct}%`,
      icon: ShieldAlert,
      colour: 'text-yellow-400',
      sublabel: 'Survey, last-touch, manual',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-mid-grey/20 bg-charcoal p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <c.icon className={cn('h-3.5 w-3.5', c.colour)} />
            <p className="text-[10px] uppercase tracking-wider text-mid-grey">
              {c.label}
            </p>
          </div>
          <p className={cn('text-lg font-semibold', c.colour)}>
            {c.value}
          </p>
          {c.sublabel && (
            <p className="text-[10px] text-mid-grey mt-0.5">{c.sublabel}</p>
          )}
        </div>
      ))}
    </div>
  )
}

/** Revenue by month — stacked bar chart (SVG) */
function RevenueByMonthChart({ data }: { data: MonthRow[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No monthly revenue data in this period
      </div>
    )
  }

  const eventTypes = ['join', 'renewal', 'purchase', 'booking', 'churn']

  // Compute positive stack and negative stack per month
  const monthStacks = data.map((m) => {
    const positives: { type: string; value: number }[] = []
    const negatives: { type: string; value: number }[] = []

    for (const et of eventTypes) {
      const val = m.by_event_type[et] || 0
      if (et === 'churn' || val < 0) {
        negatives.push({ type: et, value: Math.abs(val) })
      } else if (val > 0) {
        positives.push({ type: et, value: val })
      }
    }

    const positiveTotal = positives.reduce((s, p) => s + p.value, 0)
    const negativeTotal = negatives.reduce((s, n) => s + n.value, 0)

    return { month: m.month, positives, negatives, positiveTotal, negativeTotal }
  })

  const maxPositive = Math.max(...monthStacks.map((s) => s.positiveTotal), 1)
  const maxNegative = Math.max(...monthStacks.map((s) => s.negativeTotal), 0)
  const totalRange = maxPositive + maxNegative

  // Chart dimensions
  const width = 800
  const height = 280
  const padding = { top: 20, right: 20, bottom: 40, left: 70 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const barWidth = Math.max(20, Math.min(60, (plotW / data.length) - 8))
  const barGap = (plotW - barWidth * data.length) / (data.length + 1)

  // Y-axis: zero line position
  const zeroY = padding.top + (maxPositive / totalRange) * plotH

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-coral" />
        Revenue by Month
      </h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px]"
          preserveAspectRatio="xMinYMid meet"
        >
          {/* Zero line */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="#555"
            strokeWidth="1"
            strokeDasharray="4 2"
          />

          {/* Y-axis labels */}
          <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" className="fill-mid-grey" fontSize="10">
            {formatPounds(maxPositive)}
          </text>
          <text x={padding.left - 8} y={zeroY + 4} textAnchor="end" className="fill-mid-grey" fontSize="10">
            {'£'}0
          </text>
          {maxNegative > 0 && (
            <text x={padding.left - 8} y={padding.top + plotH} textAnchor="end" className="fill-mid-grey" fontSize="10">
              -{formatPounds(maxNegative)}
            </text>
          )}

          {/* Bars */}
          {monthStacks.map((stack, i) => {
            const x = padding.left + barGap + i * (barWidth + barGap)

            // Positive stacked bars (grow upward from zero line)
            let currentY = zeroY
            const positiveBars = stack.positives.map((seg) => {
              const segHeight = (seg.value / totalRange) * plotH
              currentY -= segHeight
              return (
                <rect
                  key={`pos-${seg.type}`}
                  x={x}
                  y={currentY}
                  width={barWidth}
                  height={segHeight}
                  fill={EVENT_TYPE_COLOURS[seg.type] || '#666'}
                  rx="2"
                />
              )
            })

            // Negative bars (grow downward from zero line)
            let negY = zeroY
            const negativeBars = stack.negatives.map((seg) => {
              const segHeight = (seg.value / totalRange) * plotH
              const bar = (
                <rect
                  key={`neg-${seg.type}`}
                  x={x}
                  y={negY}
                  width={barWidth}
                  height={segHeight}
                  fill={EVENT_TYPE_COLOURS[seg.type] || '#EF4444'}
                  rx="2"
                  opacity="0.6"
                />
              )
              negY += segHeight
              return bar
            })

            return (
              <g key={stack.month}>
                {positiveBars}
                {negativeBars}
                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="fill-mid-grey"
                  fontSize="10"
                >
                  {shortMonth(stack.month)}
                </text>
                {/* Value label */}
                <text
                  x={x + barWidth / 2}
                  y={zeroY - (stack.positiveTotal / totalRange) * plotH - 4}
                  textAnchor="middle"
                  className="fill-off-white"
                  fontSize="9"
                >
                  {formatPounds(stack.positiveTotal)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-mid-grey">
        {eventTypes.map((et) => (
          <span key={et} className="flex items-center gap-1">
            <span
              className="w-3 h-2 rounded-sm"
              style={{ backgroundColor: EVENT_TYPE_COLOURS[et] }}
            />
            {EVENT_TYPE_LABELS[et] || et}
            {et === 'churn' && ' (negative)'}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Revenue by Topic — horizontal bar chart with attribution breakdown */
function RevenueByTopicChart({ data }: { data: TopicRow[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No topic-attributed revenue in this period
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map((d) => Math.abs(d.revenue_cents)), 1)

  // SVG dimensions
  const barHeight = 28
  const labelWidth = 140
  const valueWidth = 80
  const padding = { top: 10, right: 10, bottom: 10, left: 0 }
  const width = 800
  const chartWidth = width - labelWidth - valueWidth - padding.left - padding.right
  const height = padding.top + padding.bottom + data.length * (barHeight + 8)

  // SVG defs for hatched pattern (inferred attribution)
  const hatchId = 'inferred-hatch'

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-coral" />
        Revenue by Topic
      </h3>
      <p className="text-[10px] text-mid-grey flex items-center gap-1">
        <Info className="h-3 w-3" />
        Solid = UTM-attributed (directly tracked). Hatched = inferred (survey, last-touch, manual).
      </p>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[500px]"
          preserveAspectRatio="xMinYMid meet"
        >
          <defs>
            <pattern id={hatchId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            </pattern>
          </defs>

          {data.map((topic, i) => {
            const y = padding.top + i * (barHeight + 8)
            const totalWidth = (Math.abs(topic.revenue_cents) / maxRevenue) * chartWidth

            // Split bar by attribution method
            const utmAmount = topic.by_attribution_method['utm']?.revenue_cents || 0
            const inferredAmount = Math.abs(topic.revenue_cents) - Math.abs(utmAmount)
            const utmWidth = (Math.abs(utmAmount) / maxRevenue) * chartWidth
            const inferredWidth = (Math.abs(inferredAmount) / maxRevenue) * chartWidth

            return (
              <g key={topic.topic_id}>
                {/* Topic name */}
                <text
                  x={labelWidth - 8}
                  y={y + barHeight / 2 + 1}
                  textAnchor="end"
                  className="fill-off-white"
                  fontSize="11"
                  dominantBaseline="middle"
                >
                  {topic.topic_name.length > 18
                    ? topic.topic_name.slice(0, 18) + '…'
                    : topic.topic_name}
                </text>

                {/* UTM portion (solid) */}
                {utmWidth > 0 && (
                  <rect
                    x={labelWidth}
                    y={y}
                    width={utmWidth}
                    height={barHeight}
                    fill="#F16363"
                    rx="3"
                  />
                )}

                {/* Inferred portion (hatched) */}
                {inferredWidth > 0 && (
                  <g>
                    <rect
                      x={labelWidth + utmWidth}
                      y={y}
                      width={inferredWidth}
                      height={barHeight}
                      fill="#F16363"
                      opacity="0.4"
                      rx={utmWidth > 0 ? 0 : 3}
                    />
                    <rect
                      x={labelWidth + utmWidth}
                      y={y}
                      width={inferredWidth}
                      height={barHeight}
                      fill={`url(#${hatchId})`}
                      rx={utmWidth > 0 ? 0 : 3}
                    />
                  </g>
                )}

                {/* Value label */}
                <text
                  x={labelWidth + totalWidth + 6}
                  y={y + barHeight / 2 + 1}
                  className="fill-mid-grey"
                  fontSize="10"
                  dominantBaseline="middle"
                >
                  {formatPounds(topic.revenue_cents)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-mid-grey">
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-coral" />
          UTM-attributed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 rounded-sm bg-coral/40 relative overflow-hidden">
            <span className="absolute inset-0" style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)',
            }} />
          </span>
          Inferred
        </span>
      </div>
    </div>
  )
}

/** NDY Join Curve — weekly join line chart with content overlay */
function NDYJoinCurve({ data }: { data: NDYWeek[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No NDY join data in this period
      </div>
    )
  }

  const maxJoins = Math.max(...data.map((d) => d.join_count), 1)

  const width = 800
  const height = 220
  const padding = { top: 20, right: 30, bottom: 50, left: 40 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const xStep = plotW / Math.max(data.length - 1, 1)

  // Build line path
  const points = data.map((d, i) => {
    const x = padding.left + i * xStep
    const y = padding.top + plotH - (d.join_count / maxJoins) * plotH
    return { x, y, ...d }
  })

  const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`

  // Area fill
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${padding.top + plotH} L ${points[0].x},${padding.top + plotH} Z`
    : ''

  // X-axis labels (show every N weeks for readability)
  const labelInterval = Math.max(1, Math.floor(data.length / 10))

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Users className="h-4 w-4 text-coral" />
        NDY Join Curve
      </h3>
      <p className="text-[10px] text-mid-grey">
        Weekly community joins. Dots below the line mark content published that week &mdash; spot what drives join spikes.
      </p>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px]"
          preserveAspectRatio="xMinYMid meet"
        >
          {/* Area fill */}
          {areaPath && (
            <path d={areaPath} fill="rgba(241, 99, 99, 0.1)" />
          )}

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#F16363"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={p.week}>
              <circle cx={p.x} cy={p.y} r="3" fill="#F16363" />

              {/* Content published dots (below the chart) */}
              {p.content_published.length > 0 && (
                <g>
                  {p.content_published.slice(0, 3).map((c, ci) => (
                    <circle
                      key={c.id}
                      cx={p.x}
                      cy={padding.top + plotH + 12 + ci * 8}
                      r="3"
                      fill="#4C1273"
                      opacity="0.8"
                    />
                  ))}
                </g>
              )}

              {/* Hover tooltip area */}
              <rect
                x={p.x - xStep / 2}
                y={padding.top}
                width={xStep}
                height={plotH}
                fill="transparent"
                className="group"
              />
            </g>
          ))}

          {/* X-axis week labels */}
          {points.filter((_, i) => i % labelInterval === 0).map((p) => (
            <text
              key={`lbl-${p.week}`}
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-mid-grey"
              fontSize="9"
            >
              {p.week.replace(/^\d{4}-/, '')}
            </text>
          ))}

          {/* Y-axis labels */}
          <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" className="fill-mid-grey" fontSize="10">
            {maxJoins}
          </text>
          <text x={padding.left - 6} y={padding.top + plotH} textAnchor="end" className="fill-mid-grey" fontSize="10">
            0
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-mid-grey">
        <span className="flex items-center gap-1">
          <span className="w-4 h-[2px] bg-coral" /> Weekly joins
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple" /> Content published
        </span>
      </div>
    </div>
  )
}

/** Attribution Honesty Panel */
function AttributionHonestyPanel({ data }: { data: AttrRow[] }) {
  const utmRow = data.find((d) => d.attribution_method === 'utm')
  const utmPct = utmRow?.percentage || 0
  const inferredPct = data
    .filter((d) => d.attribution_method !== 'utm')
    .reduce((s, d) => s + d.percentage, 0)

  return (
    <div className="rounded-lg border-2 border-coral/30 bg-charcoal p-5 space-y-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-coral mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-off-white">
            Attribution Honesty
          </h3>
          <p className="text-sm text-mid-grey mt-1">
            <span className="text-green-400 font-semibold">{utmPct.toFixed(1)}%</span>{' '}
            of revenue is UTM-attributed (directly tracked).{' '}
            <span className="text-yellow-400 font-semibold">{inferredPct.toFixed(1)}%</span>{' '}
            is inferred (last-touch, survey, manual).
          </p>
          <p className="text-xs text-mid-grey/70 mt-2 border-t border-mid-grey/20 pt-2">
            UTM-attributed and inferred revenue are never blended in this dashboard.
            Each figure carries its attribution label.
          </p>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.map((row) => (
          <div
            key={row.attribution_method}
            className={cn(
              'rounded-lg border p-2.5',
              row.is_direct
                ? 'border-green-400/30 bg-green-400/5'
                : 'border-yellow-400/20 bg-yellow-400/5',
            )}
          >
            <p className="text-[10px] uppercase tracking-wider text-mid-grey flex items-center gap-1">
              {row.is_direct ? (
                <ShieldCheck className="h-3 w-3 text-green-400" />
              ) : (
                <ShieldAlert className="h-3 w-3 text-yellow-400" />
              )}
              {ATTR_METHOD_LABELS[row.attribution_method] || row.attribution_method}
            </p>
            <p className="text-sm font-semibold text-off-white mt-1">
              {formatPounds(row.revenue_cents)}
            </p>
            <p className="text-[10px] text-mid-grey">
              {row.percentage.toFixed(1)}% &middot; {row.count} events
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Cohort View — simple table */
function CohortTable({ cohort }: { cohort: CohortView }) {
  if (cohort.cohort_months.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No cohort data in this period
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Eye className="h-4 w-4 text-coral" />
        Cohort View
      </h3>
      <p className="text-[10px] text-mid-grey">
        First-event month in rows, subsequent months in columns. Values show revenue.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-mid-grey/20">
              <th className="text-left py-2 px-2 text-mid-grey font-medium">Cohort</th>
              {cohort.all_months.map((m) => (
                <th key={m} className="text-center py-2 px-1 text-mid-grey font-medium">
                  {shortMonth(m)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohort.cohort_months.map((cm) => (
              <tr key={cm} className="border-b border-mid-grey/10">
                <td className="py-1.5 px-2 text-off-white font-medium whitespace-nowrap">
                  {monthLabel(cm)}
                </td>
                {cohort.all_months.map((m) => {
                  const cell = cohort.data[cm]?.[m]
                  if (!cell || m < cm) {
                    return (
                      <td key={m} className="text-center py-1.5 px-1 text-mid-grey/30">
                        &mdash;
                      </td>
                    )
                  }

                  // Intensity based on revenue
                  const maxCohortRevenue = Math.max(
                    ...cohort.all_months
                      .map((month) => Math.abs(cohort.data[cm]?.[month]?.revenue_cents || 0))
                      .filter(Boolean),
                    1,
                  )
                  const intensity = Math.abs(cell.revenue_cents) / maxCohortRevenue
                  const bgOpacity = Math.max(0.1, Math.min(0.6, intensity))

                  return (
                    <td
                      key={m}
                      className="text-center py-1.5 px-1 text-off-white"
                      style={{ backgroundColor: `rgba(241, 99, 99, ${bgOpacity})` }}
                    >
                      {formatPounds(cell.revenue_cents)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function RevenueAttribution() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [attrFilter, setAttrFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RevenueResponse | null>(null)
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([])
  const [topicsLoading, setTopicsLoading] = useState(true)

  // Load topics on mount
  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch('/api/intelligence/topics')
        if (res.ok) {
          const json = await res.json()
          setTopics(json.topics || [])
        }
      } catch {
        // Topics endpoint may not exist yet
      } finally {
        setTopicsLoading(false)
      }
    }
    fetchTopics()
  }, [])

  // Fetch revenue data when filters change
  const fetchRevenueData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ year: String(year) })
      if (topicFilter) params.set('topic_id', topicFilter)
      if (attrFilter) params.set('attribution_method', attrFilter)

      const res = await fetch(`/api/intelligence/revenue?${params.toString()}`)
      if (res.ok) {
        const json: RevenueResponse = await res.json()
        setData(json)
      }
    } catch {
      // Network error — leave existing data in place
    } finally {
      setLoading(false)
    }
  }, [year, topicFilter, attrFilter])

  useEffect(() => {
    fetchRevenueData()
  }, [fetchRevenueData])

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Year selector */}
        <div>
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Year
          </label>
          <div className="flex rounded-lg border border-mid-grey/30 overflow-hidden">
            {YEAR_OPTIONS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  year === y
                    ? 'bg-coral text-white'
                    : 'bg-charcoal text-mid-grey hover:text-off-white',
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Topic filter */}
        <div className="min-w-[180px]">
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Topic
          </label>
          <select
            value={topicFilter ?? ''}
            onChange={(e) => setTopicFilter(e.target.value || null)}
            disabled={topicsLoading}
            className={cn(
              'w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white',
              'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
            )}
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Attribution method filter */}
        <div>
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Attribution
          </label>
          <div className="flex rounded-lg border border-mid-grey/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setAttrFilter(null)}
              className={cn(
                'px-3 py-2 text-sm transition-colors',
                attrFilter === null
                  ? 'bg-coral text-white'
                  : 'bg-charcoal text-mid-grey hover:text-off-white',
              )}
            >
              All
            </button>
            {['utm', 'survey', 'last_touch', 'manual'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAttrFilter(m)}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  attrFilter === m
                    ? 'bg-coral text-white'
                    : 'bg-charcoal text-mid-grey hover:text-off-white',
                )}
              >
                {ATTR_METHOD_LABELS[m] || m}
              </button>
            ))}
          </div>
        </div>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRevenueData}
          loading={loading}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Loading state */}
      {loading && !data && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !data && (
        <div className="text-center py-16 text-mid-grey">
          <PoundSterling className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">
            No revenue data available
          </p>
          <p className="text-sm mt-1">
            Revenue events will appear here once tracking is active
          </p>
        </div>
      )}

      {/* Data display */}
      {data && (
        <div className="space-y-6">
          {/* Summary cards */}
          <SummaryCards summary={data.summary} />

          {/* Attribution Honesty Panel */}
          <AttributionHonestyPanel data={data.by_attribution} />

          {/* Revenue by month chart */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
            <RevenueByMonthChart data={data.by_month} />
          </div>

          {/* Revenue by topic chart */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
            <RevenueByTopicChart data={data.by_topic} />
          </div>

          {/* NDY Join Curve */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
            <NDYJoinCurve data={data.ndy_join_curve} />
          </div>

          {/* Cohort View */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
            <CohortTable cohort={data.cohort_view} />
          </div>
        </div>
      )}
    </div>
  )
}
