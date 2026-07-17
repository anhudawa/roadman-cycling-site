import { Badge } from '@/components/ui/Badge'
import type { BadgeProps } from '@/components/ui/Badge'

// ---------------------------------------------------------------------------
// Brief status badge — maps status to colour variant
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: BadgeProps['variant'] }
> = {
  draft: { label: 'Draft', variant: 'grey' },
  submitted: { label: 'Submitted', variant: 'blue' },
  approved: { label: 'Approved', variant: 'green' },
  rejected: { label: 'Rejected', variant: 'red' },
}

interface BriefStatusBadgeProps {
  status: string
  className?: string
}

export function BriefStatusBadge({ status, className }: BriefStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    variant: 'default' as const,
  }

  return (
    <Badge variant={config.variant} size="md" className={className}>
      {config.label}
    </Badge>
  )
}
