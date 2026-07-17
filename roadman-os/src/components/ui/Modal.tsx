'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const

export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Optional heading displayed in the modal header */
  title?: string
  children: React.ReactNode
  /** Width constraint */
  size?: keyof typeof sizeStyles
}

/**
 * Accessible modal dialog with overlay, escape-to-close,
 * and enter/exit transitions. Prevents body scroll when open.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle open/close transitions
  useEffect(() => {
    if (open) {
      setVisible(true)
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true)
        })
      })
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [open])

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  // Focus trap — focus the dialog when it opens
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [open])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 transition-opacity duration-200',
          animating ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={cn(
            'relative w-full bg-charcoal border border-mid-grey/20 rounded-xl shadow-2xl',
            'transition-all duration-200',
            animating
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95',
            sizeStyles[size],
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-mid-grey/20">
              <h2 className="text-lg font-heading uppercase text-off-white">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-mid-grey hover:text-off-white transition-colors p-1 rounded-md hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Close button when no title */}
          {!title && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 text-mid-grey hover:text-off-white transition-colors p-1 rounded-md hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Body */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
