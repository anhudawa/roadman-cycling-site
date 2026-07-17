'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label displayed above the input */
  label?: string
  /** Error message displayed below the input */
  error?: string
  /** Hint text displayed below the input (hidden when error is present) */
  hint?: string
}

/**
 * Text input with optional label, error, and hint support.
 * Forwards ref for form library integration.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-off-white mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-charcoal border rounded-lg px-3 py-2 text-off-white',
            'placeholder:text-mid-grey',
            'focus:outline-none focus:ring-2 focus:border-coral transition-colors',
            error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-mid-grey/30 focus:ring-coral/50',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-400 mt-1">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-sm text-mid-grey mt-1">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
