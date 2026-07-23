'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Catch-all error boundary for the (app) route group.
 * Shows a brand-styled error page with retry and home navigation.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error for debugging — in production this would go to an error service
    console.error('[Roadman OS Error]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>

      {/* Title */}
      <h1 className="font-heading text-2xl uppercase tracking-wide text-off-white mb-2">
        Something went wrong
      </h1>

      {/* Message */}
      <p className="text-sm text-mid-grey mb-2 max-w-md">
        An unexpected error occurred. This has been noted and we&apos;ll look into it.
        You can try again or head back to the dashboard.
      </p>

      {/* Error digest (helpful for support) */}
      {error.digest && (
        <p className="text-xs text-mid-grey/50 mb-6 font-mono">
          Error reference: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <Button
          variant="primary"
          onClick={reset}
          icon={<RotateCcw className="h-4 w-4" />}
        >
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/')}
          icon={<Home className="h-4 w-4" />}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
