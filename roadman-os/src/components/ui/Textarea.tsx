'use client'

import { forwardRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label displayed above the textarea */
  label?: string
  /** Error message displayed below the textarea */
  error?: string
  /** Hint text displayed below the textarea (hidden when error is present) */
  hint?: string
  /** Maximum character count — shows counter when provided */
  maxLength?: number
}

/**
 * Multi-line text input with optional label, error, hint, and character count.
 * Forwards ref for form library integration.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, maxLength, id, onChange, ...props }, ref) => {
    const textareaId = id || props.name
    const [charCount, setCharCount] = useState(
      typeof props.value === 'string'
        ? props.value.length
        : typeof props.defaultValue === 'string'
          ? props.defaultValue.length
          : 0,
    )

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length)
        onChange?.(e)
      },
      [onChange],
    )

    const isOverLimit = maxLength !== undefined && charCount > maxLength

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-off-white mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full bg-charcoal border rounded-lg px-3 py-2 text-off-white',
            'placeholder:text-mid-grey',
            'focus:outline-none focus:ring-2 focus:border-coral transition-colors',
            'resize-y min-h-[80px]',
            error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-mid-grey/30 focus:ring-coral/50',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
                ? `${textareaId}-hint`
                : undefined
          }
          onChange={handleChange}
          {...props}
        />
        <div className="flex justify-between items-start mt-1">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-red-400"
              >
                {error}
              </p>
            )}
            {!error && hint && (
              <p
                id={`${textareaId}-hint`}
                className="text-sm text-mid-grey"
              >
                {hint}
              </p>
            )}
          </div>
          {maxLength !== undefined && (
            <span
              className={cn(
                'text-xs ml-2 shrink-0',
                isOverLimit ? 'text-red-400' : 'text-mid-grey',
              )}
            >
              {charCount} / {maxLength}
            </span>
          )}
        </div>
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
