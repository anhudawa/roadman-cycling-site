'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  type: ToastType
  title: string
  message?: string
  /** Auto-dismiss duration in ms (default 5000) */
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: string
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void
}

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const typeConfig: Record<
  ToastType,
  { icon: typeof CheckCircle; colour: string }
> = {
  success: { icon: CheckCircle, colour: 'text-emerald-400' },
  error: { icon: XCircle, colour: 'text-red-400' },
  warning: { icon: AlertTriangle, colour: 'text-amber-400' },
  info: { icon: Info, colour: 'text-blue-400' },
}

const MAX_VISIBLE = 5

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

/* ------------------------------------------------------------------ */
/*  Individual toast                                                   */
/* ------------------------------------------------------------------ */

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const config = typeConfig[item.type]
  const Icon = config.icon

  // Slide-in animation
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  // Auto-dismiss
  useEffect(() => {
    const duration = item.duration ?? 5000
    timerRef.current = setTimeout(() => onDismiss(item.id), duration)
    return () => clearTimeout(timerRef.current)
  }, [item.id, item.duration, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 w-80 bg-charcoal border border-mid-grey/20 rounded-lg shadow-lg p-4',
        'transition-all duration-300 ease-out',
        mounted
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.colour)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-off-white">{item.title}</p>
        {item.message && (
          <p className="text-sm text-mid-grey mt-0.5">{item.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 text-mid-grey hover:text-off-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

let toastCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = `toast-${++toastCounter}`
    setToasts((prev) => {
      const next = [...prev, { ...options, id }]
      // Evict oldest if we exceed the max
      if (next.length > MAX_VISIBLE) {
        return next.slice(next.length - MAX_VISIBLE)
      }
      return next
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx
}
