import { cn } from '@/lib/utils/cn'

// ==========================================================================
// Types
// ==========================================================================

export type FreshnessLevel = 'fresh' | 'stale' | 'critical' | 'never'

export interface DataFreshnessIndicatorProps {
  /** Last synced timestamp (ISO string) */
  lastSyncedAt: string | null
  /** Optional label shown next to the dot */
  showLabel?: boolean
  /** Optional custom class */
  className?: string
}

// ==========================================================================
// Helpers
// ==========================================================================

function getFreshnessLevel(lastSyncedAt: string | null): FreshnessLevel {
  if (!lastSyncedAt) return 'never'

  const hoursAgo =
    (Date.now() - new Date(lastSyncedAt).getTime()) / (1000 * 60 * 60)

  if (hoursAgo < 24) return 'fresh'
  if (hoursAgo < 72) return 'stale'
  return 'critical'
}

function getFreshnessLabel(level: FreshnessLevel): string {
  switch (level) {
    case 'fresh':
      return 'Up to date'
    case 'stale':
      return 'Stale'
    case 'critical':
      return 'Outdated'
    case 'never':
      return 'Never synced'
  }
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return new Date(dateStr).toLocaleDateString('en-GB')
}

// ==========================================================================
// Component
// ==========================================================================

/**
 * Green/Amber/Red dot indicator showing data freshness.
 *
 * - Green: synced within 24 hours
 * - Amber: synced 1-3 days ago
 * - Red: synced more than 3 days ago
 * - Grey: never synced
 */
export function DataFreshnessIndicator({
  lastSyncedAt,
  showLabel = true,
  className,
}: DataFreshnessIndicatorProps) {
  const level = getFreshnessLevel(lastSyncedAt)

  const dotColours: Record<FreshnessLevel, string> = {
    fresh: 'bg-emerald-400',
    stale: 'bg-amber-400',
    critical: 'bg-red-400',
    never: 'bg-mid-grey',
  }

  const pulseColours: Record<FreshnessLevel, string> = {
    fresh: 'bg-emerald-400/40',
    stale: 'bg-amber-400/40',
    critical: 'bg-red-400/40',
    never: '',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex items-center justify-center">
        {/* Pulse animation for non-never states */}
        {level !== 'never' && (
          <span
            className={cn(
              'absolute inline-flex h-3 w-3 rounded-full animate-ping opacity-75',
              pulseColours[level],
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex h-2.5 w-2.5 rounded-full',
            dotColours[level],
          )}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-mid-grey">
          {lastSyncedAt
            ? getRelativeTime(lastSyncedAt)
            : getFreshnessLabel(level)}
        </span>
      )}
    </div>
  )
}
