'use client'

import { useMemo, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { CONTENT_PILLARS, IDEA_STATUSES } from '@/lib/constants'
import { QuickCaptureForm } from '@/components/ideas/QuickCaptureForm'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import type { IdeaWithCreator } from '@/lib/queries/ideas'

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_votes', label: 'Most Votes' },
  { value: 'pillar', label: 'Pillar' },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface IdeasClientProps {
  ideas: IdeaWithCreator[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IdeasClient({ ideas }: IdeasClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [pillarFilter, setPillarFilter] = useState<string>('')
  const [sort, setSort] = useState<string>('newest')

  // Client-side filter + sort
  const filtered = useMemo(() => {
    let result = ideas

    if (statusFilter) {
      result = result.filter((i) => i.status === statusFilter)
    }

    if (pillarFilter) {
      result = result.filter((i) => i.pillar === pillarFilter)
    }

    // Sort
    switch (sort) {
      case 'most_votes':
        result = [...result].sort((a, b) => b.score - a.score)
        break
      case 'pillar':
        result = [...result].sort((a, b) =>
          (a.pillar ?? '').localeCompare(b.pillar ?? ''),
        )
        break
      case 'newest':
      default:
        result = [...result].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        break
    }

    return result
  }, [ideas, statusFilter, pillarFilter, sort])

  const hasFilters = statusFilter || pillarFilter

  return (
    <div className="space-y-6">
      {/* Quick Capture */}
      <QuickCaptureForm />

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div className="w-full sm:w-44">
          <Select
            name="status-filter"
            options={IDEA_STATUSES as unknown as { value: string; label: string }[]}
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            name="pillar-filter"
            options={CONTENT_PILLARS as unknown as { value: string; label: string }[]}
            placeholder="All Pillars"
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            name="sort"
            options={SORT_OPTIONS}
            placeholder="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('')
              setPillarFilter('')
            }}
            className="text-sm text-mid-grey hover:text-coral transition-colors whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ideas grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="w-12 h-12" />}
          title={hasFilters ? 'No ideas match your filters' : 'No ideas yet'}
          description={
            hasFilters
              ? 'Try adjusting your filters.'
              : 'Use the form above to capture your first idea.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  )
}
