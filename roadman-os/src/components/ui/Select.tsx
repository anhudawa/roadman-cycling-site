'use client'

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label displayed above the select */
  label?: string
  /** Error message displayed below the select */
  error?: string
  /** Available options */
  options: SelectOption[]
  /** Placeholder text for the empty option */
  placeholder?: string
}

/**
 * Styled select dropdown with label and error support.
 * Forwards ref for form library integration.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options,
      placeholder = 'Select...',
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-off-white mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none bg-charcoal border rounded-lg px-3 py-2 pr-10 text-off-white',
              'focus:outline-none focus:ring-2 focus:border-coral transition-colors',
              error
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-mid-grey/30 focus:ring-coral/50',
              className,
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-grey" />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-red-400 mt-1">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
