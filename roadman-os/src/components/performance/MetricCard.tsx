import { cn } from '@/lib/utils/cn'
import type { TrendResult } from '@/lib/queries/performance'

export interface MetricCardProps {
  title: string
  value: string
  trend: TrendResult
}

/**
 * Dashboard metric card with value and trend indicator.
 * Trend arrow: green up, red down, grey flat.
 */
export function MetricCard({ title, value, trend }: MetricCardProps) {
  const trendColour =
    trend.direction === 'up'
      ? 'text-emerald-400'
      : trend.direction === 'down'
        ? 'text-red-400'
        : 'text-mid-grey'

  const trendArrow =
    trend.direction === 'up'
      ? '↑'
      : trend.direction === 'down'
        ? '↓'
        : '→'

  return (
    <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-5">
      <h3 className="font-heading text-xs uppercase tracking-wide text-mid-grey mb-2">
        {title}
      </h3>
      <p className="font-heading text-2xl text-off-white mb-1">{value}</p>
      <div className={cn('flex items-center gap-1 text-sm', trendColour)}>
        <span className="text-base">{trendArrow}</span>
        <span>
          {trend.percentage > 0 ? `${trend.percentage}%` : 'No change'}
          {' '}
          <span className="text-mid-grey text-xs">vs previous period</span>
        </span>
      </div>
    </div>
  )
}
