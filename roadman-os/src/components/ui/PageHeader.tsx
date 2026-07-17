import { cn } from '@/lib/utils/cn'

export interface PageHeaderProps {
  /** Page title — rendered uppercase in the heading font */
  title: string
  /** Optional supporting text below the title */
  description?: string
  /** Action slot — typically buttons aligned to the right */
  actions?: React.ReactNode
}

/**
 * Top-of-page header with title, optional description, and action slot.
 * Server component — no client-side hooks required.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="font-heading text-2xl uppercase text-off-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-mid-grey mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
