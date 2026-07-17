'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import type { Platform, PublicationStatus } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewMode = 'week' | 'month'

export interface CalendarHeaderProps {
  currentDate: Date
  viewMode: ViewMode
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (mode: ViewMode) => void
  platforms: Platform[]
  selectedPlatforms: string[]
  onPlatformFilterChange: (platformIds: string[]) => void
  selectedStatus: PublicationStatus | 'all'
  onStatusFilterChange: (status: PublicationStatus | 'all') => void
}

// ---------------------------------------------------------------------------
// Status options
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: PublicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
  { value: 'removed', label: 'Removed' },
]

// ---------------------------------------------------------------------------
// Platform multi-select dropdown
// ---------------------------------------------------------------------------

function PlatformFilter({
  platforms,
  selectedPlatforms,
  onPlatformFilterChange,
}: {
  platforms: Platform[]
  selectedPlatforms: string[]
  onPlatformFilterChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const allSelected = selectedPlatforms.length === platforms.length
  const noneSelected = selectedPlatforms.length === 0

  function togglePlatform(id: string) {
    if (selectedPlatforms.includes(id)) {
      onPlatformFilterChange(selectedPlatforms.filter((p) => p !== id))
    } else {
      onPlatformFilterChange([...selectedPlatforms, id])
    }
  }

  function toggleAll() {
    if (allSelected) {
      onPlatformFilterChange([])
    } else {
      onPlatformFilterChange(platforms.map((p) => p.id))
    }
  }

  const label =
    allSelected || noneSelected
      ? 'All Platforms'
      : `${selectedPlatforms.length} platform${selectedPlatforms.length === 1 ? '' : 's'}`

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        icon={<Filter className="h-3.5 w-3.5" />}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-40 w-56 rounded-lg border border-mid-grey/20 bg-charcoal shadow-xl">
          <div className="p-2 border-b border-mid-grey/20">
            <label className="flex items-center gap-2 px-2 py-1.5 text-xs text-off-white cursor-pointer hover:bg-white/5 rounded">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-mid-grey/40 bg-charcoal text-coral focus:ring-coral/50"
              />
              Select All
            </label>
          </div>
          <div className="max-h-60 overflow-y-auto p-2 space-y-0.5">
            {platforms.map((platform) => (
              <label
                key={platform.id}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-off-white/80 cursor-pointer hover:bg-white/5 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                  className="rounded border-mid-grey/40 bg-charcoal text-coral focus:ring-coral/50"
                />
                {platform.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalendarHeader({
  currentDate,
  viewMode,
  onNavigate,
  onViewChange,
  platforms,
  selectedPlatforms,
  onPlatformFilterChange,
  selectedStatus,
  onStatusFilterChange,
}: CalendarHeaderProps) {
  // Format the date label based on view mode
  const dateLabel =
    viewMode === 'week'
      ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
      : format(currentDate, 'MMMM yyyy')

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side: navigation + date label */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prev')}
            aria-label={`Previous ${viewMode}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('next')}
            aria-label={`Next ${viewMode}`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={() => onNavigate('today')}>
          Today
        </Button>

        <h2 className="font-heading text-lg text-off-white uppercase tracking-wide ml-2">
          {dateLabel}
        </h2>
      </div>

      {/* Right side: filters + view toggle */}
      <div className="flex items-center gap-2">
        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusFilterChange(e.target.value as PublicationStatus | 'all')}
          className="appearance-none bg-charcoal border border-mid-grey/30 rounded-md px-3 py-1.5 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50 cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Platform filter */}
        <PlatformFilter
          platforms={platforms}
          selectedPlatforms={selectedPlatforms}
          onPlatformFilterChange={onPlatformFilterChange}
        />

        {/* View toggle */}
        <div className="flex rounded-lg border border-mid-grey/30 overflow-hidden">
          <button
            type="button"
            onClick={() => onViewChange('week')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'week'
                ? 'bg-coral text-white'
                : 'bg-transparent text-mid-grey hover:text-off-white hover:bg-white/5',
            )}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => onViewChange('month')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'month'
                ? 'bg-coral text-white'
                : 'bg-transparent text-mid-grey hover:text-off-white hover:bg-white/5',
            )}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  )
}
