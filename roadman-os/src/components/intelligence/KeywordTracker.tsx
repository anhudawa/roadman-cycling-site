'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  TrendingUp,
  Target,
  Plus,
  Trash2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { KeywordMetric, Topic } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortField = 'keyword' | 'search_volume' | 'cpc_cents' | 'competition' | 'topic'
type SortDirection = 'asc' | 'desc'

interface KeywordRow {
  id: string
  keyword: string
  topic_id: string | null
  topic_name: string | null
  search_volume: number | null
  cpc_cents: number | null
  competition: number | null
  monthly_searches: { year: number; month: number; search_volume: number }[]
  position: number | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatCpc(cents: number | null): string {
  if (cents === null || cents === 0) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

function formatCompetition(comp: number | null): string {
  if (comp === null) return '—'
  if (comp < 0.33) return 'Low'
  if (comp < 0.67) return 'Med'
  return 'High'
}

function competitionColour(comp: number | null): string {
  if (comp === null) return 'text-mid-grey'
  if (comp < 0.33) return 'text-green-400'
  if (comp < 0.67) return 'text-yellow-400'
  return 'text-red-400'
}

// ---------------------------------------------------------------------------
// SVG Sparkline — tiny 60x20 bar chart for 12-month volume trend
// ---------------------------------------------------------------------------

function Sparkline({ data }: { data: { year: number; month: number; search_volume: number }[] }) {
  if (data.length === 0) {
    return <span className="text-mid-grey text-xs">—</span>
  }

  const width = 60
  const height = 20
  const sorted = [...data].sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month))
  const maxVol = Math.max(...sorted.map((d) => d.search_volume), 1)
  const barWidth = width / sorted.length - 1

  return (
    <svg width={width} height={height} className="inline-block">
      {sorted.map((d, i) => {
        const barHeight = Math.max(1, (d.search_volume / maxVol) * height)
        return (
          <rect
            key={`${d.year}-${d.month}`}
            x={i * (barWidth + 1)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx={0.5}
            className="fill-coral/70"
          />
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Ranking History Chart — SVG line chart, y-axis inverted (position 1 at top)
// ---------------------------------------------------------------------------

function RankingHistoryChart({ data }: { data: { date: string; position: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No ranking history available yet
      </div>
    )
  }

  const width = 600
  const height = 200
  const padding = { top: 20, right: 40, bottom: 30, left: 40 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  // Y-axis: position 1 at top, 100 at bottom (inverted)
  const maxPos = 100
  const xStep = plotW / Math.max(data.length - 1, 1)

  const points = data.map((d, i) => {
    const x = padding.left + i * xStep
    // Inverted: position 1 = top, 100 = bottom
    const y = padding.top + ((d.position - 1) / (maxPos - 1)) * plotH
    return { x, y, ...d }
  })

  const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`

  // Date labels (show ~5 evenly spaced)
  const labelInterval = Math.max(1, Math.floor(data.length / 5))

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]" preserveAspectRatio="xMinYMid meet">
          {/* Grid lines */}
          {[1, 10, 20, 50, 100].map((pos) => {
            const y = padding.top + ((pos - 1) / (maxPos - 1)) * plotH
            return (
              <g key={pos}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-mid-grey"
                  fontSize="9"
                >
                  {pos}
                </text>
              </g>
            )
          })}

          {/* Line */}
          <path d={linePath} fill="none" stroke="#F16363" strokeWidth="2" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-coral" />
          ))}

          {/* Date labels */}
          {data
            .filter((_, i) => i % labelInterval === 0)
            .map((d, i) => (
              <text
                key={d.date}
                x={padding.left + i * labelInterval * xStep}
                y={height - 5}
                textAnchor="middle"
                className="fill-mid-grey"
                fontSize="9"
              >
                {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </text>
            ))}

          {/* Y-axis label */}
          <text
            x={10}
            y={height / 2}
            textAnchor="middle"
            className="fill-mid-grey"
            fontSize="9"
            transform={`rotate(-90, 10, ${height / 2})`}
          >
            Position
          </text>
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Volume Trend Chart — SVG bar chart showing 12-month volumes
// ---------------------------------------------------------------------------

function VolumeTrendChart({ data }: { data: { year: number; month: number; search_volume: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="text-sm text-mid-grey text-center py-8">
        No volume trend data available yet
      </div>
    )
  }

  const width = 600
  const height = 180
  const padding = { top: 10, right: 10, bottom: 30, left: 40 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const sorted = [...data].sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month))
  const maxVol = Math.max(...sorted.map((d) => d.search_volume), 1)
  const barWidth = plotW / sorted.length - 4
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]" preserveAspectRatio="xMinYMid meet">
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padding.top + plotH - frac * plotH
            const val = Math.round(frac * maxVol)
            return (
              <g key={frac}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 5}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-mid-grey"
                  fontSize="9"
                >
                  {formatNumber(val)}
                </text>
              </g>
            )
          })}

          {/* Bars */}
          {sorted.map((d, i) => {
            const barH = Math.max(1, (d.search_volume / maxVol) * plotH)
            const x = padding.left + i * (barWidth + 4) + 2
            const y = padding.top + plotH - barH

            return (
              <g key={`${d.year}-${d.month}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={2}
                  className="fill-coral/80 hover:fill-coral transition-colors"
                />
                {/* Month label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-mid-grey"
                  fontSize="9"
                >
                  {months[d.month - 1]}
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
// Stats Cards
// ---------------------------------------------------------------------------

function StatsCards({ keywords }: { keywords: KeywordRow[] }) {
  const stats = useMemo(() => {
    const total = keywords.length
    const withVolume = keywords.filter((k) => k.search_volume !== null && k.search_volume > 0)
    const avgVolume =
      withVolume.length > 0
        ? Math.round(withVolume.reduce((sum, k) => sum + (k.search_volume ?? 0), 0) / withVolume.length)
        : 0
    const withPosition = keywords.filter((k) => k.position !== null)
    const top10 = keywords.filter((k) => k.position !== null && k.position <= 10)

    return { total, avgVolume, withPosition: withPosition.length, top10: top10.length }
  }, [keywords])

  const cards = [
    { label: 'Tracked Keywords', value: stats.total.toString(), icon: Search },
    { label: 'Avg. Volume', value: stats.avgVolume > 0 ? formatNumber(stats.avgVolume) : '—', icon: TrendingUp },
    { label: 'With Position Data', value: stats.withPosition.toString(), icon: Target },
    {
      label: 'Ranking Top 10',
      value: stats.top10.toString(),
      icon: ArrowUp,
      colour: stats.top10 > 0 ? 'text-green-400' : undefined,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div
            key={c.label}
            className="rounded-lg border border-mid-grey/20 bg-charcoal p-3"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-coral" />
              <p className="text-[10px] uppercase tracking-wider text-mid-grey">
                {c.label}
              </p>
            </div>
            <p
              className={cn(
                'text-lg font-semibold mt-1',
                c.colour ?? 'text-off-white',
              )}
            >
              {c.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function KeywordTracker() {
  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  const [keywords, setKeywords] = useState<KeywordRow[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Filters & sorting
  const [topicFilter, setTopicFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('keyword')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordRow | null>(null)

  // Add form
  const [newKeyword, setNewKeyword] = useState('')
  const [newTopicId, setNewTopicId] = useState('')
  const [adding, setAdding] = useState(false)

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  const fetchKeywords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (topicFilter) params.set('topic_id', topicFilter)
      if (searchFilter) params.set('keyword', searchFilter)
      params.set('limit', '500')

      const res = await fetch(`/api/intelligence/keywords?${params}`)
      if (res.ok) {
        const data = await res.json()
        const raw = (data.keywords ?? []) as KeywordMetric[]

        // Group by keyword, take the latest month's data, build row objects
        const byKeyword = new Map<string, KeywordMetric[]>()
        for (const km of raw) {
          const existing = byKeyword.get(km.keyword) ?? []
          existing.push(km)
          byKeyword.set(km.keyword, existing)
        }

        const rows: KeywordRow[] = Array.from(byKeyword.entries()).map(([kw, metrics]) => {
          // Sort by month descending, take latest
          const sorted = metrics.sort((a, b) => b.month.localeCompare(a.month))
          const latest = sorted[0]
          const topic = topics.find((t) => t.id === latest.topic_id)

          // Build monthly_searches from all months
          const monthly = sorted
            .filter((m) => m.search_volume !== null)
            .map((m) => {
              const [yearStr, monthStr] = m.month.split('-')
              return {
                year: parseInt(yearStr, 10),
                month: parseInt(monthStr, 10),
                search_volume: m.search_volume ?? 0,
              }
            })
            .reverse()

          return {
            id: latest.id,
            keyword: kw,
            topic_id: latest.topic_id,
            topic_name: topic?.name ?? null,
            search_volume: latest.search_volume,
            cpc_cents: latest.cpc_cents,
            competition: latest.competition,
            monthly_searches: monthly,
            position: null, // TODO: populate from rankings data when available
          }
        })

        setKeywords(rows)
      }
    } catch {
      // Network error — leave existing data in place
    } finally {
      setLoading(false)
    }
  }, [topicFilter, searchFilter, topics])

  // Load topics on mount
  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch('/api/intelligence/topics')
        if (res.ok) {
          const data = await res.json()
          setTopics(data.topics || [])
        }
      } catch {
        // Topics endpoint may not be ready yet
      }
    }
    fetchTopics()
  }, [])

  // Fetch keywords when filters or topics change
  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/intelligence/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          keywords: newKeyword.split(',').map((k) => k.trim()).filter(Boolean),
          topic_id: newTopicId || undefined,
        }),
      })
      if (res.ok) {
        setNewKeyword('')
        setNewTopicId('')
        await fetchKeywords()
      }
    } catch {
      // Error handled silently
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveKeyword = async (id: string) => {
    try {
      await fetch('/api/intelligence/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', keyword_id: id }),
      })
      await fetchKeywords()
    } catch {
      // Error handled silently
    }
  }

  const handleBulkRemove = async () => {
    for (const id of selectedIds) {
      await handleRemoveKeyword(id)
    }
    setSelectedIds(new Set())
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/intelligence/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      })
      await fetchKeywords()
    } catch {
      // Error handled silently
    } finally {
      setSyncing(false)
    }
  }

  const handleSeedFromGsc = async () => {
    setSyncing(true)
    try {
      await fetch('/api/intelligence/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_from_gsc' }),
      })
      await fetchKeywords()
    } catch {
      // Error handled silently
    } finally {
      setSyncing(false)
    }
  }

  // -----------------------------------------------------------------------
  // Sorting
  // -----------------------------------------------------------------------

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortedKeywords = useMemo(() => {
    const sorted = [...keywords]
    sorted.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'keyword':
          cmp = a.keyword.localeCompare(b.keyword)
          break
        case 'search_volume':
          cmp = (a.search_volume ?? 0) - (b.search_volume ?? 0)
          break
        case 'cpc_cents':
          cmp = (a.cpc_cents ?? 0) - (b.cpc_cents ?? 0)
          break
        case 'competition':
          cmp = (a.competition ?? 0) - (b.competition ?? 0)
          break
        case 'topic':
          cmp = (a.topic_name ?? '').localeCompare(b.topic_name ?? '')
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [keywords, sortField, sortDir])

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedKeywords.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sortedKeywords.map((k) => k.id)))
    }
  }

  // Sort indicator
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 inline ml-1" />
    )
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <StatsCards keywords={keywords} />

      {/* Controls bar */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Search Keywords
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-grey" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by keyword..."
              className={cn(
                'w-full bg-charcoal border border-mid-grey/30 rounded-lg pl-9 pr-3 py-2 text-off-white placeholder:text-mid-grey/50',
                'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
              )}
            />
          </div>
        </div>

        {/* Topic filter */}
        <div className="min-w-[180px]">
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Topic
          </label>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className={cn(
              'w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white',
              'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
            )}
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            loading={syncing}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedFromGsc}
            loading={syncing}
            icon={<Target className="h-4 w-4" />}
          >
            Seed from GSC
          </Button>
        </div>
      </div>

      {/* Add keyword form */}
      <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
        <h3 className="text-sm font-medium text-off-white mb-3 flex items-center gap-2">
          <Plus className="h-4 w-4 text-coral" />
          Add Keywords
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Enter keywords (comma-separated)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddKeyword()
              }}
              className={cn(
                'w-full bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white placeholder:text-mid-grey/50',
                'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
              )}
            />
          </div>
          <div className="min-w-[160px]">
            <select
              value={newTopicId}
              onChange={(e) => setNewTopicId(e.target.value)}
              className={cn(
                'w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white',
                'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
              )}
            >
              <option value="">No topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddKeyword}
            loading={adding}
            disabled={!newKeyword.trim()}
            icon={<Plus className="h-4 w-4" />}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-coral/30 bg-coral/5 px-4 py-2">
          <span className="text-sm text-off-white">
            {selectedIds.size} keyword{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={handleBulkRemove}
            icon={<Trash2 className="h-4 w-4" />}
          >
            Remove
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            loading={syncing}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Re-sync
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && keywords.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && keywords.length === 0 && (
        <div className="text-center py-16 text-mid-grey">
          <Search className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">
            No keywords tracked yet
          </p>
          <p className="text-sm mt-1">
            Add keywords above or seed from Google Search Console to get started
          </p>
        </div>
      )}

      {/* Keyword table */}
      {sortedKeywords.length > 0 && (
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mid-grey/20">
                  <th className="px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === sortedKeywords.length && sortedKeywords.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-mid-grey/30 bg-charcoal"
                    />
                  </th>
                  <th
                    className="px-3 py-2 text-left text-mid-grey font-medium cursor-pointer hover:text-off-white transition-colors"
                    onClick={() => handleSort('keyword')}
                  >
                    Keyword <SortIcon field="keyword" />
                  </th>
                  <th
                    className="px-3 py-2 text-left text-mid-grey font-medium cursor-pointer hover:text-off-white transition-colors"
                    onClick={() => handleSort('topic')}
                  >
                    Topic <SortIcon field="topic" />
                  </th>
                  <th
                    className="px-3 py-2 text-right text-mid-grey font-medium cursor-pointer hover:text-off-white transition-colors"
                    onClick={() => handleSort('search_volume')}
                  >
                    Volume <SortIcon field="search_volume" />
                  </th>
                  <th
                    className="px-3 py-2 text-right text-mid-grey font-medium cursor-pointer hover:text-off-white transition-colors"
                    onClick={() => handleSort('cpc_cents')}
                  >
                    CPC <SortIcon field="cpc_cents" />
                  </th>
                  <th
                    className="px-3 py-2 text-right text-mid-grey font-medium cursor-pointer hover:text-off-white transition-colors"
                    onClick={() => handleSort('competition')}
                  >
                    Competition <SortIcon field="competition" />
                  </th>
                  <th className="px-3 py-2 text-center text-mid-grey font-medium">
                    Trend
                  </th>
                  <th className="px-3 py-2 text-right text-mid-grey font-medium">
                    Position
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {sortedKeywords.map((kw) => (
                  <tr
                    key={kw.id}
                    className={cn(
                      'border-b border-mid-grey/10 hover:bg-white/[0.02] transition-colors cursor-pointer',
                      selectedKeyword?.id === kw.id && 'bg-coral/5',
                    )}
                    onClick={() => setSelectedKeyword(selectedKeyword?.id === kw.id ? null : kw)}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(kw.id)}
                        onChange={() => toggleSelect(kw.id)}
                        className="rounded border-mid-grey/30 bg-charcoal"
                      />
                    </td>
                    <td className="px-3 py-2 text-off-white font-medium">
                      {kw.keyword}
                    </td>
                    <td className="px-3 py-2 text-mid-grey text-sm">
                      {kw.topic_name ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right text-off-white tabular-nums">
                      {kw.search_volume !== null ? formatNumber(kw.search_volume) : '—'}
                    </td>
                    <td className="px-3 py-2 text-right text-off-white tabular-nums">
                      {formatCpc(kw.cpc_cents)}
                    </td>
                    <td className={cn('px-3 py-2 text-right', competitionColour(kw.competition))}>
                      {formatCompetition(kw.competition)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Sparkline data={kw.monthly_searches} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {kw.position !== null ? (
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-8 h-6 rounded text-xs font-medium',
                            kw.position <= 3
                              ? 'bg-green-400/20 text-green-400'
                              : kw.position <= 10
                                ? 'bg-yellow-400/20 text-yellow-400'
                                : 'bg-mid-grey/20 text-mid-grey',
                          )}
                        >
                          {kw.position}
                        </span>
                      ) : (
                        <span className="text-mid-grey">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw.id)}
                        className="text-mid-grey hover:text-red-400 transition-colors"
                        title="Remove keyword"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail panels — shown when a keyword is selected */}
      {selectedKeyword && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ranking history chart */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-2">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
              <Target className="h-4 w-4 text-coral" />
              Ranking History — &ldquo;{selectedKeyword.keyword}&rdquo;
            </h3>
            <RankingHistoryChart
              data={
                // TODO: Populate from actual ranking history data
                // For now, show empty state
                []
              }
            />
          </div>

          {/* Volume trend chart */}
          <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-2">
            <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-coral" />
              12-Month Volume — &ldquo;{selectedKeyword.keyword}&rdquo;
            </h3>
            <VolumeTrendChart data={selectedKeyword.monthly_searches} />
          </div>
        </div>
      )}
    </div>
  )
}
