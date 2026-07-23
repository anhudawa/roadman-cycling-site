'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search,
  FileText,
  Lightbulb,
  Target,
  CheckSquare,
  FileAudio,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SearchMode = 'keyword' | 'semantic' | 'combined'

type SearchResultItem = {
  entity_type: string
  entity_id: string
  title: string
  description: string | null
  similarity?: number
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ENTITY_CONFIG: Record<string, { label: string; icon: React.ReactNode; href: (id: string) => string; colour: string }> = {
  asset: { label: 'Asset', icon: <FileText className="h-4 w-4" />, href: (id) => `/assets/${id}`, colour: 'bg-coral/10 text-coral' },
  idea: { label: 'Idea', icon: <Lightbulb className="h-4 w-4" />, href: (id) => `/ideas/${id}`, colour: 'bg-yellow-400/10 text-yellow-400' },
  campaign: { label: 'Campaign', icon: <Target className="h-4 w-4" />, href: (id) => `/campaigns/${id}`, colour: 'bg-blue-400/10 text-blue-400' },
  task: { label: 'Task', icon: <CheckSquare className="h-4 w-4" />, href: (id) => `/tasks/${id}`, colour: 'bg-green-400/10 text-green-400' },
  transcript: { label: 'Transcript', icon: <FileAudio className="h-4 w-4" />, href: (id) => `/transcripts/${id}`, colour: 'bg-purple-400/10 text-purple-400' },
}

const ENTITY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'asset', label: 'Assets' },
  { value: 'idea', label: 'Ideas' },
  { value: 'campaign', label: 'Campaigns' },
  { value: 'task', label: 'Tasks' },
  { value: 'transcript', label: 'Transcripts' },
]

const PILLARS: { value: string; label: string }[] = [
  { value: '', label: 'All pillars' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'strength_and_conditioning', label: 'S&C' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'le_metier', label: 'Le Metier' },
]

const MODES: { value: SearchMode; label: string }[] = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'semantic', label: 'Semantic' },
  { value: 'combined', label: 'Combined' },
]

const PER_PAGE = 20

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<SearchMode>('keyword')
  const [entityType, setEntityType] = useState('')
  const [pillar, setPillar] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const totalPages = Math.ceil(total / PER_PAGE)

  // -------------------------------------------------------------------------
  // Fetch results
  // -------------------------------------------------------------------------
  const fetchResults = useCallback(async () => {
    if (!query || query.length < 2) {
      setResults([])
      setTotal(0)
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        mode,
        limit: String(PER_PAGE),
        offset: String((page - 1) * PER_PAGE),
      })
      if (entityType) params.set('type', entityType)
      if (pillar) params.set('pillar', pillar)

      const res = await fetch(`/api/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results ?? [])
        setTotal(data.total ?? 0)
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }, [query, mode, entityType, pillar, page])

  // Auto-fetch when params change
  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  // Sync URL query param
  useEffect(() => {
    const urlQ = searchParams.get('q') ?? ''
    if (urlQ && urlQ !== query) {
      setQuery(urlQ)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    router.push(`/search?q=${encodeURIComponent(query)}`, { scroll: false })
    fetchResults()
  }

  // -------------------------------------------------------------------------
  // Group results by entity type
  // -------------------------------------------------------------------------
  const grouped = new Map<string, SearchResultItem[]>()
  for (const item of results) {
    const list = grouped.get(item.entity_type) ?? []
    list.push(item)
    grouped.set(item.entity_type, list)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search"
        description="Find assets, ideas, campaigns, tasks, and transcripts across Roadman OS."
      />

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mid-grey/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anything..."
            className="w-full rounded-lg border border-mid-grey/30 bg-charcoal py-2.5 pl-10 pr-4 font-body text-sm text-off-white placeholder:text-mid-grey/50 focus:border-coral/50 focus:outline-none focus:ring-1 focus:ring-coral/30"
          />
        </div>
        <Button type="submit" variant="primary" icon={<Search className="h-4 w-4" />}>
          Search
        </Button>
        <Button
          type="button"
          variant="ghost"
          icon={<SlidersHorizontal className="h-4 w-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </form>

      {/* Filters bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4">
          {/* Mode toggle */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-mid-grey/60">Mode</label>
            <div className="flex gap-1 rounded-lg border border-mid-grey/20 p-0.5">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => { setMode(m.value); setPage(1) }}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                    mode === m.value
                      ? 'bg-coral text-white'
                      : 'text-mid-grey hover:text-off-white',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Entity type */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-mid-grey/60">Type</label>
            <select
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(1) }}
              className="rounded-lg border border-mid-grey/30 bg-charcoal px-3 py-1.5 text-sm text-off-white focus:border-coral/50 focus:outline-none"
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Pillar */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-mid-grey/60">Pillar</label>
            <select
              value={pillar}
              onChange={(e) => { setPillar(e.target.value); setPage(1) }}
              className="rounded-lg border border-mid-grey/30 bg-charcoal px-3 py-1.5 text-sm text-off-white focus:border-coral/50 focus:outline-none"
            >
              {PILLARS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-6">
          <p className="text-sm text-mid-grey">
            {total} result{total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>

          {Array.from(grouped.entries()).map(([type, items]) => {
            const config = ENTITY_CONFIG[type]
            if (!config) return null

            return (
              <div key={type}>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-mid-grey/60">
                  {config.icon}
                  <span>{config.label}s</span>
                  <span className="text-mid-grey/30">({items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <a
                      key={`${item.entity_type}-${item.entity_id}`}
                      href={config.href(item.entity_id)}
                      className="block rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 transition-colors hover:border-mid-grey/40 hover:bg-charcoal"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-medium text-off-white">
                              {item.title}
                            </h3>
                            <span className={cn('shrink-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider', config.colour)}>
                              {config.label}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-mid-grey/70">
                              {item.description}
                            </p>
                          )}
                          {item.metadata && (
                            <div className="mt-2 flex gap-2">
                              {item.metadata.status != null ? (
                                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-mid-grey">
                                  {String(item.metadata.status)}
                                </span>
                              ) : null}
                              {item.metadata.pillar != null ? (
                                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-mid-grey">
                                  {String(item.metadata.pillar).replace(/_/g, ' ')}
                                </span>
                              ) : null}
                              {item.metadata.type != null ? (
                                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-mid-grey">
                                  {String(item.metadata.type).replace(/_/g, ' ')}
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                        {item.similarity !== undefined && (
                          <span className="shrink-0 rounded bg-coral/10 px-2 py-0.5 text-[10px] text-coral">
                            {(item.similarity * 100).toFixed(0)}% match
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span className="text-sm text-mid-grey">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                icon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && query.length >= 2 && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-mid-grey/30" />
          <h3 className="text-lg font-medium text-off-white">No results found</h3>
          <p className="mt-1 text-sm text-mid-grey">
            Try different keywords or adjust your filters.
          </p>
        </div>
      )}

      {/* Initial state */}
      {!isLoading && query.length < 2 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-mid-grey/30" />
          <h3 className="text-lg font-medium text-off-white">Start searching</h3>
          <p className="mt-1 text-sm text-mid-grey">
            Enter at least 2 characters to search across all content.
          </p>
        </div>
      )}
    </div>
  )
}
