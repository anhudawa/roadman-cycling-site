'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ASSET_TYPES, ASSET_STATUSES, CONTENT_PILLARS } from '@/lib/constants'

interface DropdownOption {
  id: string
  label: string
}

interface AssetFiltersProps {
  /** Campaign options for dropdown — fetched server-side and passed down */
  campaigns: DropdownOption[]
  /** Profile options for assigned-to dropdown — fetched server-side and passed down */
  profiles: DropdownOption[]
}

/**
 * Filter bar for the asset library.
 * All filter state is persisted in URL search params so filters
 * are shareable and survive page refreshes.
 */
export function AssetFilters({ campaigns, profiles }: AssetFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // ---------------------------------------------------------------------------
  // Search with debounce
  // ---------------------------------------------------------------------------
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') ?? '',
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 when filters change
      params.delete('page')
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams, startTransition],
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchValue(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        updateParams('search', value)
      }, 300)
    },
    [updateParams],
  )

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Select change handler
  // ---------------------------------------------------------------------------
  const handleSelectChange = useCallback(
    (key: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateParams(key, e.target.value)
    },
    [updateParams],
  )

  // ---------------------------------------------------------------------------
  // Date change handler
  // ---------------------------------------------------------------------------
  const handleDateChange = useCallback(
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateParams(key, e.target.value)
    },
    [updateParams],
  )

  // ---------------------------------------------------------------------------
  // Clear all filters
  // ---------------------------------------------------------------------------
  const hasFilters =
    searchParams.get('search') ||
    searchParams.get('type') ||
    searchParams.get('status') ||
    searchParams.get('pillar') ||
    searchParams.get('campaign_id') ||
    searchParams.get('assignee_id') ||
    searchParams.get('date_from') ||
    searchParams.get('date_to')

  const clearFilters = useCallback(() => {
    setSearchValue('')
    startTransition(() => {
      router.push('?', { scroll: false })
    })
  }, [router, startTransition])

  // ---------------------------------------------------------------------------
  // Shared select styles
  // ---------------------------------------------------------------------------
  const selectClassName = cn(
    'w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg',
    'px-3 py-2 pr-8 text-sm text-off-white',
    'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
  )

  return (
    <div className="space-y-3">
      {/* Row 1: search + main filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-grey" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchValue}
            onChange={handleSearchChange}
            className={cn(
              'w-full bg-charcoal border border-mid-grey/30 rounded-lg',
              'pl-9 pr-3 py-2 text-sm text-off-white placeholder:text-mid-grey',
              'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
            )}
          />
        </div>

        {/* Type */}
        <select
          value={searchParams.get('type') ?? ''}
          onChange={handleSelectChange('type')}
          className={cn(selectClassName, 'w-full sm:w-40')}
        >
          <option value="">All types</option>
          {ASSET_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={searchParams.get('status') ?? ''}
          onChange={handleSelectChange('status')}
          className={cn(selectClassName, 'w-full sm:w-40')}
        >
          <option value="">All statuses</option>
          {ASSET_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Pillar */}
        <select
          value={searchParams.get('pillar') ?? ''}
          onChange={handleSelectChange('pillar')}
          className={cn(selectClassName, 'w-full sm:w-44')}
        >
          <option value="">All pillars</option>
          {CONTENT_PILLARS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Campaign */}
        <select
          value={searchParams.get('campaign_id') ?? ''}
          onChange={handleSelectChange('campaign_id')}
          className={cn(selectClassName, 'w-full sm:w-44')}
        >
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Assigned to */}
        <select
          value={searchParams.get('assignee_id') ?? ''}
          onChange={handleSelectChange('assignee_id')}
          className={cn(selectClassName, 'w-full sm:w-44')}
        >
          <option value="">All assignees</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Row 2: date range + clear */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Date from */}
        <div className="w-full sm:w-44">
          <label className="block text-xs text-mid-grey mb-1">Updated from</label>
          <input
            type="date"
            value={searchParams.get('date_from') ?? ''}
            onChange={handleDateChange('date_from')}
            className={cn(
              'w-full bg-charcoal border border-mid-grey/30 rounded-lg',
              'px-3 py-2 text-sm text-off-white',
              'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
            )}
          />
        </div>

        {/* Date to */}
        <div className="w-full sm:w-44">
          <label className="block text-xs text-mid-grey mb-1">Updated to</label>
          <input
            type="date"
            value={searchParams.get('date_to') ?? ''}
            onChange={handleDateChange('date_to')}
            className={cn(
              'w-full bg-charcoal border border-mid-grey/30 rounded-lg',
              'px-3 py-2 text-sm text-off-white',
              'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors',
            )}
          />
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={cn(
              'inline-flex items-center gap-1.5 text-sm text-mid-grey',
              'hover:text-off-white transition-colors px-3 py-2',
            )}
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
