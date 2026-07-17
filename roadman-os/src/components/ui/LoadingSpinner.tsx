import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
} as const

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: keyof typeof sizeStyles
  /** Additional CSS classes */
  className?: string
}

/**
 * Spinning loader indicator.
 * Server component — no client-side hooks required.
 */
export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-coral', sizeStyles[size], className)}
    />
  )
}
