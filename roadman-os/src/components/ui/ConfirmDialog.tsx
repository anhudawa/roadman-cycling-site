'use client'

import { AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Modal } from './Modal'
import { Button } from './Button'

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColour: 'text-red-400',
    confirmVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColour: 'text-amber-400',
    confirmVariant: 'primary' as const,
  },
  info: {
    icon: Info,
    iconColour: 'text-blue-400',
    confirmVariant: 'primary' as const,
  },
} as const

export interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  open: boolean
  /** Callback to close the dialog */
  onClose: () => void
  /** Callback when confirm is clicked */
  onConfirm: () => void
  /** Dialog heading */
  title?: string
  /** Descriptive message body */
  message: string
  /** Label for the confirm button */
  confirmText?: string
  /** Label for the cancel button */
  cancelText?: string
  /** Visual severity variant */
  variant?: keyof typeof variantConfig
  /** Show loading state on the confirm button */
  loading?: boolean
}

/**
 * Pre-built confirmation dialog built on top of Modal.
 * Supports danger, warning, and info variants.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full mb-4',
            variant === 'danger' && 'bg-red-500/10',
            variant === 'warning' && 'bg-amber-500/10',
            variant === 'info' && 'bg-blue-500/10',
          )}
        >
          <Icon className={cn('h-6 w-6', config.iconColour)} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-off-white mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-mid-grey mb-6">{message}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="ghost"
            size="md"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            size="md"
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
