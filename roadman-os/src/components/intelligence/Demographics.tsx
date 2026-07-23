'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  Globe,
  PieChart,
  BarChart3,
  RefreshCw,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { AudienceDemographic, Topic } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AggregatedBucket {
  label: string
  share_pct: number
  absolute_value: number
}

interface DemographicsResponse {
  demographics: AudienceDemographic[]
  aggregated: {
    by_age: AggregatedBucket[]
    by_gender: AggregatedBucket[]
    by_country: AggregatedBucket[]
  }
}

type SourceFilter = 'all' | 'youtube' | 'meta' | 'ga4'

const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'meta', label: 'Meta' },
  { value: 'ga4', label: 'GA4' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatPct(n: number): string {
  return `${n.toFixed(1)}%`
}

// Age bracket sort order
const AGE_ORDER: Record<string, number> = {
  '13-17': 0,
  '18-24': 1,
  '25-34': 2,
  '35-44': 3,
  '45-54': 4,
  '55-64': 5,
  '65+': 6,
  unknown: 7,
}

function sortByAge(a: AggregatedBucket, b: AggregatedBucket): number {
  return (AGE_ORDER[a.label] ?? 99) - (AGE_ORDER[b.label] ?? 99)
}

// ---------------------------------------------------------------------------
// SVG Charts
// ---------------------------------------------------------------------------

/** Horizontal bar chart for age distribution */
function AgeDistributionChart({ data }: { data: AggregatedBucket[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No age data available
      </div>
    )
  }

  const sorted = [...data].sort(sortByAge)
  const maxPct = Math.max(...sorted.map((d) => d.share_pct), 1)

  const barHeight = 28
  const labelWidth = 60
  const valueWidth = 60
  const chartPadding = 8
  const totalHeight = sorted.length * (barHeight + chartPadding) + chartPadding
  const chartWidth = 500

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-coral" />
        Age Distribution
      </h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${totalHeight}`}
          className="w-full min-w-[350px]"
          preserveAspectRatio="xMinYMid meet"
        >
          {sorted.map((bucket, i) => {
            const y = chartPadding + i * (barHeight + chartPadding)
            const barWidth =
              ((chartWidth - labelWidth - valueWidth - chartPadding * 2) *
                bucket.share_pct) /
              maxPct

            return (
              <g key={bucket.label}>
                {/* Label */}
                <text
                  x={labelWidth - 8}
                  y={y + barHeight / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-off-white"
                  fontSize="12"
                >
                  {bucket.label}
                </text>

                {/* Bar background */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={chartWidth - labelWidth - valueWidth - chartPadding * 2}
                  height={barHeight}
                  rx="4"
                  fill="rgba(107, 114, 128, 0.15)"
                />

                {/* Bar fill */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={Math.max(barWidth, 2)}
                  height={barHeight}
                  rx="4"
                  fill="#F16363"
                  opacity={0.85}
                />

                {/* Value label */}
                <text
                  x={chartWidth - chartPadding}
                  y={y + barHeight / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-mid-grey"
                  fontSize="11"
                >
                  {formatPct(bucket.share_pct)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/** Donut/ring chart for gender split */
function GenderDonutChart({ data }: { data: AggregatedBucket[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No gender data available
      </div>
    )
  }

  const size = 200
  const cx = size / 2
  const cy = size / 2
  const outerRadius = 80
  const innerRadius = 52

  // Colours for each gender segment
  const colours: Record<string, string> = {
    male: '#F16363',
    female: '#FF6B6B',
    unknown: 'rgba(107, 114, 128, 0.5)',
  }

  // Calculate arcs
  const total = data.reduce((sum, d) => sum + d.share_pct, 0) || 1
  let currentAngle = -Math.PI / 2 // Start from 12 o'clock

  const arcs = data.map((bucket) => {
    const sweep = (bucket.share_pct / total) * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + sweep
    currentAngle = endAngle

    const x1Outer = cx + outerRadius * Math.cos(startAngle)
    const y1Outer = cy + outerRadius * Math.sin(startAngle)
    const x2Outer = cx + outerRadius * Math.cos(endAngle)
    const y2Outer = cy + outerRadius * Math.sin(endAngle)
    const x1Inner = cx + innerRadius * Math.cos(endAngle)
    const y1Inner = cy + innerRadius * Math.sin(endAngle)
    const x2Inner = cx + innerRadius * Math.cos(startAngle)
    const y2Inner = cy + innerRadius * Math.sin(startAngle)

    const largeArc = sweep > Math.PI ? 1 : 0

    const path = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      'Z',
    ].join(' ')

    return {
      ...bucket,
      path,
      colour: colours[bucket.label] ?? 'rgba(107, 114, 128, 0.5)',
    }
  })

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <PieChart className="h-4 w-4 text-coral" />
        Gender Split
      </h3>
      <div className="flex items-center gap-6">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-40 h-40 flex-shrink-0"
        >
          {arcs.map((arc) => (
            <path key={arc.label} d={arc.path} fill={arc.colour} />
          ))}
          {/* Centre label — total percentage */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="fill-off-white font-semibold"
            fontSize="16"
          >
            {data.length}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            className="fill-mid-grey"
            fontSize="10"
          >
            segments
          </text>
        </svg>

        {/* Legend */}
        <div className="space-y-2">
          {arcs.map((arc) => (
            <div key={arc.label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: arc.colour }}
              />
              <span className="text-sm text-off-white capitalize">
                {arc.label}
              </span>
              <span className="text-sm text-mid-grey">
                {formatPct(arc.share_pct)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Horizontal bar chart for top countries */
function CountriesChart({ data }: { data: AggregatedBucket[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No geographic data available
      </div>
    )
  }

  // Show top 10 countries
  const sorted = [...data]
    .sort((a, b) => b.share_pct - a.share_pct)
    .slice(0, 10)
  const maxPct = Math.max(...sorted.map((d) => d.share_pct), 1)

  const barHeight = 24
  const labelWidth = 80
  const valueWidth = 60
  const chartPadding = 6
  const totalHeight = sorted.length * (barHeight + chartPadding) + chartPadding
  const chartWidth = 500

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <Globe className="h-4 w-4 text-coral" />
        Top Countries
      </h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${totalHeight}`}
          className="w-full min-w-[350px]"
          preserveAspectRatio="xMinYMid meet"
        >
          {sorted.map((bucket, i) => {
            const y = chartPadding + i * (barHeight + chartPadding)
            const barWidth =
              ((chartWidth - labelWidth - valueWidth - chartPadding * 2) *
                bucket.share_pct) /
              maxPct

            return (
              <g key={bucket.label}>
                {/* Country label */}
                <text
                  x={labelWidth - 8}
                  y={y + barHeight / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-off-white"
                  fontSize="11"
                >
                  {bucket.label}
                </text>

                {/* Bar background */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={chartWidth - labelWidth - valueWidth - chartPadding * 2}
                  height={barHeight}
                  rx="3"
                  fill="rgba(107, 114, 128, 0.15)"
                />

                {/* Bar fill */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={Math.max(barWidth, 2)}
                  height={barHeight}
                  rx="3"
                  fill="#FF6B6B"
                  opacity={0.75}
                />

                {/* Value label */}
                <text
                  x={chartWidth - chartPadding}
                  y={y + barHeight / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  className="fill-mid-grey"
                  fontSize="11"
                >
                  {formatPct(bucket.share_pct)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary Stat Cards
// ---------------------------------------------------------------------------

function StatsRow({
  aggregated,
}: {
  aggregated: DemographicsResponse['aggregated']
}) {
  const stats = useMemo(() => {
    // Dominant age bracket
    const topAge =
      [...aggregated.by_age].sort((a, b) => b.share_pct - a.share_pct)[0] ??
      null

    // Gender split
    const maleEntry = aggregated.by_gender.find((g) => g.label === 'male')
    const femaleEntry = aggregated.by_gender.find((g) => g.label === 'female')
    const malePct = maleEntry?.share_pct ?? 0
    const femalePct = femaleEntry?.share_pct ?? 0

    // Top country
    const topCountry =
      [...aggregated.by_country].sort((a, b) => b.share_pct - a.share_pct)[0] ??
      null

    // Total audience (sum of absolute values from age data)
    const totalAudience = aggregated.by_age.reduce(
      (sum, b) => sum + b.absolute_value,
      0,
    )

    return { topAge, malePct, femalePct, topCountry, totalAudience }
  }, [aggregated])

  const cards = [
    {
      label: 'Dominant Age',
      value: stats.topAge
        ? `${stats.topAge.label} (${formatPct(stats.topAge.share_pct)})`
        : '—',
    },
    {
      label: 'Gender Split',
      value:
        stats.malePct > 0 || stats.femalePct > 0
          ? `${formatPct(stats.malePct)} M / ${formatPct(stats.femalePct)} F`
          : '—',
    },
    {
      label: 'Top Country',
      value: stats.topCountry
        ? `${stats.topCountry.label} (${formatPct(stats.topCountry.share_pct)})`
        : '—',
    },
    {
      label: 'Total Audience',
      value: stats.totalAudience > 0 ? formatNumber(stats.totalAudience) : '—',
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
          <p className="text-lg font-semibold mt-0.5 text-off-white">
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

export function Demographics() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [loading, setLoading] = useState(false)
  const [topicsLoading, setTopicsLoading] = useState(true)

  const [data, setData] = useState<DemographicsResponse | null>(null)

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
        // Topics endpoint may not exist yet — fallback handled by empty state
      } finally {
        setTopicsLoading(false)
      }
    }
    fetchTopics()
  }, [])

  // Fetch demographics data when filters change
  const fetchDemographics = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedTopicId) {
        params.set('topic_id', selectedTopicId)
      }
      if (sourceFilter !== 'all') {
        // Map 'meta' filter to the correct MetricSource values
        if (sourceFilter === 'meta') {
          params.set('source', 'facebook')
        } else {
          params.set('source', sourceFilter)
        }
      }

      const res = await fetch(
        `/api/intelligence/demographics?${params.toString()}`,
      )
      if (res.ok) {
        const json: DemographicsResponse = await res.json()
        setData(json)
      }
    } catch {
      // Network error — leave existing data in place
    } finally {
      setLoading(false)
    }
  }, [selectedTopicId, sourceFilter])

  useEffect(() => {
    fetchDemographics()
  }, [fetchDemographics])

  // Check if we have any meaningful data to display
  const hasData =
    data &&
    (data.aggregated.by_age.length > 0 ||
      data.aggregated.by_gender.length > 0 ||
      data.aggregated.by_country.length > 0)

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
            <option value="">All channels (no topic filter)</option>
            {topicsLoading ? (
              <option>Loading topics...</option>
            ) : (
              topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Source filter */}
        <div>
          <label className="block text-sm font-medium text-off-white mb-1.5">
            <Filter className="inline h-3.5 w-3.5 mr-1" />
            Platform
          </label>
          <div className="flex rounded-lg border border-mid-grey/30 overflow-hidden">
            {SOURCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSourceFilter(opt.value)}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  sourceFilter === opt.value
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
          onClick={fetchDemographics}
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
      {!loading && !hasData && (
        <div className="text-center py-16 text-mid-grey">
          <Users className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">
            No demographic data yet
          </p>
          <p className="text-sm mt-1">
            Run a demographics sync from the connections page to populate audience
            breakdowns across YouTube, Meta, and GA4.
          </p>
        </div>
      )}

      {/* Data display */}
      {hasData && data && (
        <div className="space-y-6">
          {/* Summary stat cards */}
          <StatsRow aggregated={data.aggregated} />

          {/* Charts grid — age + gender side by side, countries below */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Age distribution */}
            <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
              <AgeDistributionChart data={data.aggregated.by_age} />
            </div>

            {/* Gender split */}
            <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
              <GenderDonutChart data={data.aggregated.by_gender} />
            </div>
          </div>

          {/* Top countries — full width */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
            <CountriesChart data={data.aggregated.by_country} />
          </div>
        </div>
      )}
    </div>
  )
}
