import { cn } from '@/lib/utils/cn'

const variantStyles = {
  default: 'bg-mid-grey/20 text-off-white',
  coral: 'bg-coral/20 text-coral',
  purple: 'bg-purple/20 text-purple',
  green: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
  red: 'bg-red-500/20 text-red-400',
  blue: 'bg-blue-500/20 text-blue-400',
  grey: 'bg-mid-grey/20 text-mid-grey',
} as const

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
} as const

export interface BadgeProps {
  children: React.ReactNode
  /** Colour variant */
  variant?: keyof typeof variantStyles
  /** Size preset */
  size?: keyof typeof sizeStyles
  /** Additional CSS classes */
  className?: string
}

/**
 * Inline status badge with colour and size variants.
 * Server component — no client-side hooks required.
 */
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
