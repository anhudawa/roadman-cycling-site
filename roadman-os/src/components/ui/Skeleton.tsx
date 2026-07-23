import { cn } from '@/lib/utils/cn'

// ---------------------------------------------------------------------------
// Base Skeleton
// ---------------------------------------------------------------------------

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

/**
 * Base skeleton shimmer element.
 * Server component — no client-side hooks required.
 */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-mid-grey/20',
        className,
      )}
      style={style}
    />
  )
}

// ---------------------------------------------------------------------------
// Skeleton Variants
// ---------------------------------------------------------------------------

/**
 * Card-shaped skeleton for dashboard cards, campaign cards, etc.
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-mid-grey/20 bg-charcoal p-5 space-y-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

/**
 * Table-shaped skeleton for list/table views.
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-mid-grey/20">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            className={cn('h-4', i === 0 ? 'w-1/3' : 'w-1/6')}
          />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex items-center gap-4 px-4 py-3"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              className={cn(
                'h-4',
                colIdx === 0 ? 'w-1/3' : 'w-1/6',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Text-block skeleton for description/body areas.
 */
export function SkeletonText({
  lines = 3,
  className,
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={`line-${i}`}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full',
          )}
        />
      ))}
    </div>
  )
}

/**
 * Chart-shaped skeleton for performance/analytics sections.
 */
export function SkeletonChart({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-mid-grey/20 bg-charcoal p-5 space-y-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>
      {/* Chart area */}
      <div className="flex items-end gap-2 h-40 pt-4">
        {[65, 45, 80, 55, 90, 40, 70].map((h, i) => (
          <Skeleton
            key={`bar-${i}`}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`label-${i}`} className="h-3 w-8" />
        ))}
      </div>
    </div>
  )
}

/**
 * Metric stat card skeleton.
 */
export function SkeletonStat({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-mid-grey/20 bg-charcoal p-5 space-y-3',
        className,
      )}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}
