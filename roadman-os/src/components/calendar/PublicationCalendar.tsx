'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday as dateFnsIsToday,
  format,
  getDay,
} from 'date-fns'

import { cn } from '@/lib/utils/cn'
import type { Platform, PublicationStatus } from '@/types/database'
import type { PublicationWithDetails } from '@/components/calendar/CalendarChip'
import { CalendarChip } from '@/components/calendar/CalendarChip'
import { CalendarHeader, type ViewMode } from '@/components/calendar/CalendarHeader'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PublicationCalendarProps {
  publications: PublicationWithDetails[]
  platforms: Platform[]
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns Mon–Sun dates for the week containing `date`. */
function getWeekDates(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

/** Returns an array of weeks (each week is an array of 7 days) for the month grid. */
function getMonthDates(date: Date): Date[][] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  // Grid starts on Monday of the week containing the first day of the month
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  // Grid ends on Sunday of the week containing the last day of the month
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }
  return weeks
}

/** Get the date a publication falls on. */
function getPublicationDate(pub: PublicationWithDetails): Date | null {
  const dateStr = pub.scheduled_at ?? pub.published_at
  if (!dateStr) return null
  return new Date(dateStr)
}

/** Format hour from a date string, e.g. "14:00" */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

// ---------------------------------------------------------------------------
// Day names
// ---------------------------------------------------------------------------

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ---------------------------------------------------------------------------
// Time slots for week view
// ---------------------------------------------------------------------------

const HOUR_SLOTS = Array.from({ length: 18 }, (_, i) => i + 6) // 06:00 - 23:00

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PublicationCalendar({ publications, platforms }: PublicationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    () => platforms.map((p) => p.id),
  )
  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus | 'all'>('all')
  const [editingPublication, setEditingPublication] = useState<PublicationWithDetails | null>(null)

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      if (direction === 'today') {
        setCurrentDate(new Date())
        return
      }
      setCurrentDate((prev) => {
        if (viewMode === 'week') {
          return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
        }
        return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
      })
    },
    [viewMode],
  )

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      // Platform filter
      if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(pub.platform_id)) {
        return false
      }
      // Status filter
      if (selectedStatus !== 'all' && pub.status !== selectedStatus) {
        return false
      }
      return true
    })
  }, [publications, selectedPlatforms, selectedStatus])

  // ---------------------------------------------------------------------------
  // Group publications by day
  // ---------------------------------------------------------------------------

  const publicationsByDay = useMemo(() => {
    const map = new Map<string, PublicationWithDetails[]>()
    for (const pub of filteredPublications) {
      const date = getPublicationDate(pub)
      if (!date) continue
      const key = format(date, 'yyyy-MM-dd')
      const existing = map.get(key) ?? []
      existing.push(pub)
      map.set(key, existing)
    }
    return map
  }, [filteredPublications])

  // ---------------------------------------------------------------------------
  // Click handlers
  // ---------------------------------------------------------------------------

  const handleChipClick = useCallback((pub: PublicationWithDetails) => {
    setEditingPublication(pub)
  }, [])

  const handleCloseEdit = useCallback(() => {
    setEditingPublication(null)
  }, [])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onNavigate={handleNavigate}
        onViewChange={setViewMode}
        platforms={platforms}
        selectedPlatforms={selectedPlatforms}
        onPlatformFilterChange={setSelectedPlatforms}
        selectedStatus={selectedStatus}
        onStatusFilterChange={setSelectedStatus}
      />

      {viewMode === 'week' ? (
        <WeekView
          currentDate={currentDate}
          publicationsByDay={publicationsByDay}
          onChipClick={handleChipClick}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          publicationsByDay={publicationsByDay}
          onChipClick={handleChipClick}
        />
      )}

      {/* Edit publication detail panel */}
      {editingPublication && (
        <PublicationDetail
          publication={editingPublication}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Week View
// ---------------------------------------------------------------------------

function WeekView({
  currentDate,
  publicationsByDay,
  onChipClick,
}: {
  currentDate: Date
  publicationsByDay: Map<string, PublicationWithDetails[]>
  onChipClick: (pub: PublicationWithDetails) => void
}) {
  const weekDates = getWeekDates(currentDate)

  return (
    <div className="border border-mid-grey/20 rounded-xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-mid-grey/20">
        <div className="border-r border-mid-grey/20" />
        {weekDates.map((date) => {
          const today = dateFnsIsToday(date)
          return (
            <div
              key={date.toISOString()}
              className={cn(
                'px-2 py-3 text-center border-r border-mid-grey/20 last:border-r-0',
                today && 'bg-coral/10',
              )}
            >
              <div className="font-heading text-xs text-mid-grey uppercase tracking-wider">
                {DAY_NAMES[getDay(date) === 0 ? 6 : getDay(date) - 1]}
              </div>
              <div
                className={cn(
                  'text-lg font-heading mt-0.5',
                  today ? 'text-coral' : 'text-off-white',
                )}
              >
                {format(date, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] max-h-[600px] overflow-y-auto">
        {HOUR_SLOTS.map((hour) => (
          <div key={hour} className="contents">
            {/* Time label */}
            <div className="border-r border-b border-mid-grey/20 px-2 py-1 text-[10px] text-mid-grey font-body text-right">
              {formatHour(hour)}
            </div>

            {/* Day cells for this hour */}
            {weekDates.map((date) => {
              const dayKey = format(date, 'yyyy-MM-dd')
              const dayPubs = publicationsByDay.get(dayKey) ?? []
              const hourPubs = dayPubs.filter((pub) => {
                const pubDate = getPublicationDate(pub)
                if (!pubDate) return false
                return pubDate.getHours() === hour
              })
              const today = dateFnsIsToday(date)

              return (
                <div
                  key={`${date.toISOString()}-${hour}`}
                  className={cn(
                    'border-r border-b border-mid-grey/20 last:border-r-0 min-h-[40px] p-0.5',
                    today && 'bg-coral/5',
                  )}
                >
                  {hourPubs.map((pub) => (
                    <CalendarChip
                      key={pub.id}
                      publication={pub}
                      onClick={onChipClick}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Month View
// ---------------------------------------------------------------------------

function MonthView({
  currentDate,
  publicationsByDay,
  onChipClick,
}: {
  currentDate: Date
  publicationsByDay: Map<string, PublicationWithDetails[]>
  onChipClick: (pub: PublicationWithDetails) => void
}) {
  const weeks = getMonthDates(currentDate)
  const currentMonth = currentDate.getMonth()

  return (
    <div className="border border-mid-grey/20 rounded-xl overflow-hidden">
      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b border-mid-grey/20">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-center font-heading text-xs text-mid-grey uppercase tracking-wider border-r border-mid-grey/20 last:border-r-0"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 border-b border-mid-grey/20 last:border-b-0">
          {week.map((date) => {
            const dayKey = format(date, 'yyyy-MM-dd')
            const dayPubs = publicationsByDay.get(dayKey) ?? []
            const isCurrentMonth = date.getMonth() === currentMonth
            const today = dateFnsIsToday(date)
            const maxVisible = 3
            const overflow = dayPubs.length - maxVisible

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  'min-h-[100px] border-r border-mid-grey/20 last:border-r-0 p-1.5',
                  !isCurrentMonth && 'opacity-40',
                  today && 'border-l-2 border-l-coral bg-coral/5',
                )}
              >
                {/* Day number */}
                <div
                  className={cn(
                    'text-sm font-heading mb-1',
                    today ? 'text-coral' : 'text-off-white/70',
                  )}
                >
                  {format(date, 'd')}
                </div>

                {/* Publication chips */}
                <div className="space-y-0.5">
                  {dayPubs.slice(0, maxVisible).map((pub) => (
                    <CalendarChip
                      key={pub.id}
                      publication={pub}
                      onClick={onChipClick}
                    />
                  ))}
                  {overflow > 0 && (
                    <div className="text-[10px] text-mid-grey font-body px-2 py-0.5">
                      +{overflow} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Publication detail panel (modal-like)
// ---------------------------------------------------------------------------

function PublicationDetail({
  publication,
  onClose,
}: {
  publication: PublicationWithDetails
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Publication details"
          className="relative w-full max-w-md bg-charcoal border border-mid-grey/20 rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-mid-grey/20">
            <h2 className="text-lg font-heading uppercase text-off-white">
              Publication Details
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-mid-grey hover:text-off-white transition-colors p-1 rounded-md hover:bg-white/10"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            <DetailRow label="Asset" value={publication.asset?.title ?? 'Untitled'} />
            <DetailRow label="Platform" value={publication.platform?.name ?? 'Unknown'} />
            <DetailRow label="Status" value={publication.status} />
            {publication.scheduled_at && (
              <DetailRow
                label="Scheduled"
                value={format(new Date(publication.scheduled_at), 'PPp')}
              />
            )}
            {publication.published_at && (
              <DetailRow
                label="Published"
                value={format(new Date(publication.published_at), 'PPp')}
              />
            )}
            {publication.external_url && (
              <DetailRow label="URL" value={publication.external_url} />
            )}
            {publication.error_message && (
              <div>
                <span className="text-xs text-mid-grey font-body uppercase tracking-wider">
                  Error
                </span>
                <p className="text-sm text-red-400 font-body mt-0.5">
                  {publication.error_message}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-3 border-t border-mid-grey/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-mid-grey hover:text-off-white transition-colors rounded-lg hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-mid-grey font-body uppercase tracking-wider">
        {label}
      </span>
      <p className="text-sm text-off-white font-body mt-0.5">
        {value}
      </p>
    </div>
  )
}
