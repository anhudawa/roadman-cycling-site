import { Badge } from '@/components/ui/Badge'
import type { Classification } from '@/lib/queries/performance'

export interface ClassificationBadgeProps {
  classification: Classification
}

const classificationVariant: Record<Classification, 'green' | 'blue' | 'grey' | 'red'> = {
  Exceptional: 'green',
  Strong: 'blue',
  Average: 'grey',
  Weak: 'red',
}

/**
 * Classification badge for content performance ranking.
 * Exceptional = green, Strong = blue, Average = grey, Weak = red.
 */
export function ClassificationBadge({ classification }: ClassificationBadgeProps) {
  return (
    <Badge variant={classificationVariant[classification]} size="sm">
      {classification}
    </Badge>
  )
}
