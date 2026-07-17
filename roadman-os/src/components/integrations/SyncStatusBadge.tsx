import { Badge } from '@/components/ui/Badge'
import { getSyncFreshness } from '@/lib/queries/integrations'

export interface SyncStatusBadgeProps {
  lastSyncedAt: string | null
}

/**
 * Colour-coded badge showing sync freshness.
 *  - Green: synced within 24 hours
 *  - Amber: synced 1–3 days ago
 *  - Red:   synced more than 3 days ago or errored
 *  - Grey:  never synced
 */
export function SyncStatusBadge({ lastSyncedAt }: SyncStatusBadgeProps) {
  const freshness = getSyncFreshness(lastSyncedAt)

  const config = {
    fresh: { label: 'Synced', variant: 'green' as const },
    stale: { label: 'Stale', variant: 'amber' as const },
    critical: { label: 'Outdated', variant: 'red' as const },
    never: { label: 'Never synced', variant: 'grey' as const },
  }

  const { label, variant } = config[freshness]

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  )
}
