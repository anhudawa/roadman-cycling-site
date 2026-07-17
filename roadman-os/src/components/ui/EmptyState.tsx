import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface EmptyStateProps {
  /** Icon displayed above the title — defaults to Inbox */
  icon?: React.ReactNode
  /** Primary message */
  title: string
  /** Supporting text below the title */
  description?: string
  /** Action slot — typically a Button */
  action?: React.ReactNode
}

/**
 * Centred empty-state placeholder for tables, lists, and pages.
 * Server component — no client-side hooks required.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="text-mid-grey/50 mb-4">
        {icon || <Inbox className="w-12 h-12" />}
      </div>
      <h3 className="text-lg font-medium text-off-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-mid-grey mb-4 max-w-sm">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
