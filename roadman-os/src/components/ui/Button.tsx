'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const variantStyles = {
  primary: 'bg-coral text-white hover:bg-coral/90',
  secondary: 'bg-purple text-white hover:bg-purple/90',
  ghost: 'bg-transparent text-off-white hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-mid-grey/30 text-off-white hover:bg-white/5',
} as const

const sizeStyles = {
  sm: 'text-sm px-3 py-1.5 rounded-md',
  md: 'text-sm px-4 py-2 rounded-lg',
  lg: 'text-base px-6 py-3 rounded-lg',
} as const

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: keyof typeof variantStyles
  /** Size preset */
  size?: keyof typeof sizeStyles
  /** Show a loading spinner and disable the button */
  loading?: boolean
  /** Optional icon rendered before children */
  icon?: React.ReactNode
}

/**
 * Primary action button with variant and size support.
 * Supports loading state, optional leading icon, and forwards ref.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-coral/50 focus:ring-offset-2 focus:ring-offset-charcoal',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children && (
          <span className={cn(loading && 'opacity-70')}>{children}</span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
