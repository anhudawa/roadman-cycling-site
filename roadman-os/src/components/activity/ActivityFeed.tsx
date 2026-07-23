'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  Activity,
  Filter,
  ChevronDown,
  Loader2,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatActivityEntry } from '@/lib/utils/format-activity'
import type { ActivityAction } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActivityEntry = {
  id: string
  actor_id: string | null
  action: ActivityAction
  entity_type: string
  entity_id: string
  changes: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  actor_name: string | null
  actor_avatar_url: string | null
}

type ActorOption = {
  id: string
  full_name: string
  display_name: string | null
}

interface ActivityFeedProps {
  /** Initial entries to display (server-rendered) */
  initialEntries?: ActivityEntry[]
  /** Initial total count */
  initialTotal?: number
  /** Available actors for the filter dropdown */
  actors?: ActorOption[]
  /** Whether to show filters */
  showFilters?: boolean
  /** Max entries per page */
  perPage?: number
  /** Compact mode (no filters, smaller) */
  compact?: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENTITY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'campaign', label: 'Campaign' },
  { value: 'asset', label: 'Asset' },
  { value: 'task', label: 'Task' },
  { value: 'idea', label: 'Idea' },
  { value: 'publication', label: 'Publication' },
  { value: 'comment', label: 'Comment' },
]

const ACTION_TYPES = [
  { value: '', label: 'All actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'status_changed', label: 'Status changed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'commented', label: 'Commented' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'approved', label: 'Approved' },
]

/** Map entity types to their URL prefix. */
const entityRoutes: Record<string, string> = {
  campaign: '/campaigns',
  asset: '/assets',
  task: '/tasks',
  idea: '/ideas',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityFeed({
  initialEntries = [],
  initialTotal = 0,
  actors = [],
  showFilters = true,
  perPage = 20,
  compact = false,
}: ActivityFeedProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>(initialEntries)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter state
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [actorId, setActorId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasMore = entries.length < total

  const fetchEntries = useCallback(
    async (pageNum: number, append: boolean = false) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(pageNum))
        params.set('per_page', String(perPage))
        if (entityType) params.set('entity_type', entityType)
        if (action) params.set('action', action)
        if (actorId) params.set('actor_id', actorId)
        if (dateFrom) params.set('date_from', dateFrom)
        if (dateTo) params.set('date_to', dateTo)

        const res = await fetch(`/api/activity?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch activity')

        const data = await res.json()
        setTotal(data.total)

        if (append) {
          setEntries((prev) => [...prev, ...data.entries])
        } else {
          setEntries(data.entries)
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    },
    [entityType, action, actorId, dateFrom, dateTo, perPage],
  )

  // Re-fetch when filters change
  useEffect(() => {
    // Only fetch if filters have been interacted with (not on initial mount with data)
    if (
      initialEntries.length > 0 &&
      !entityType &&
      !action &&
      !actorId &&
      !dateFrom &&
      !dateTo &&
      page === 1
    ) {
      return
    }
    setPage(1)
    fetchEntries(1)
  }, [entityType, action, actorId, dateFrom, dateTo]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleLoadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchEntries(nextPage, true)
  }

  function handleApplyFilters() {
    setPage(1)
    fetchEntries(1)
  }

  const selectClass = cn(
    'bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-1.5',
    'text-sm text-off-white',
    'focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/50',
  )

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      {showFilters && !compact && (
        <div>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-sm text-mid-grey hover:text-off-white transition-colors mb-3"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                filtersOpen && 'rotate-180',
              )}
            />
          </button>

          {filtersOpen && (
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-mid-grey/20 bg-charcoal p-4 mb-4">
              <div>
                <label className="text-xs text-mid-grey mb-1 block">
                  Entity type
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className={selectClass}
                >
                  {ENTITY_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-mid-grey mb-1 block">
                  Action
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className={selectClass}
                >
                  {ACTION_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {actors.length > 0 && (
                <div>
                  <label className="text-xs text-mid-grey mb-1 block">
                    Actor
                  </label>
                  <select
                    value={actorId}
                    onChange={(e) => setActorId(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">All team</option>
                    {actors.map((actor) => (
                      <option key={actor.id} value={actor.id}>
                        {actor.display_name || actor.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-mid-grey mb-1 block">
                  From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={selectClass}
                />
              </div>

              <div>
                <label className="text-xs text-mid-grey mb-1 block">
                  To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={selectClass}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Entry list */}
      {entries.length > 0 ? (
        <div className="space-y-1">
          {entries.map((entry) => {
            const description = formatActivityEntry({
              ...entry,
              actor_name: entry.actor_name,
            })
            const route = entityRoutes[entry.entity_type]
            const timestamp = formatDistanceToNow(parseISO(entry.created_at), {
              addSuffix: true,
            })

            return (
              <div
                key={entry.id}
                className="flex items-start justify-between gap-4 rounded-lg px-3 py-2.5 transition hover:bg-white/5"
              >
                <div className="flex items-start gap-3 text-sm">
                  {/* Actor avatar */}
                  {entry.actor_name ? (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-purple/30 flex items-center justify-center mt-0.5">
                      <span className="text-xs text-off-white">
                        {getInitials(entry.actor_name)}
                      </span>
                    </div>
                  ) : (
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-mid-grey/50" />
                  )}

                  <p className="text-off-white/90">
                    {route ? (
                      <Link
                        href={`${route}/${entry.entity_id}`}
                        className="hover:text-coral transition-colors"
                      >
                        {description}
                      </Link>
                    ) : (
                      description
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-mid-grey whitespace-nowrap">
                  {timestamp}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        !loading && (
          <EmptyState
            icon={<Activity className="w-10 h-10" />}
            title="No activity yet"
            description="Activity will appear here as your team takes action."
          />
        )
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadMore}
            loading={loading}
          >
            Load more
          </Button>
        </div>
      )}

      {/* Loading indicator for filter changes */}
      {loading && entries.length === 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-mid-grey" />
        </div>
      )}
    </div>
  )
}
