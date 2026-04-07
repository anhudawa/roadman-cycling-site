'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main-content">
      <section className="relative min-h-[80vh] flex items-center justify-center bg-deep-purple overflow-hidden">
        {/* Grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <div className="relative z-20 w-full max-w-2xl mx-auto px-6 text-center pt-20">
          <p className="font-heading text-[6rem] md:text-[8rem] text-coral leading-none mb-4">
            BONK
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-off-white mb-6">
            SOMETHING WENT WRONG
          </h1>
          <p className="text-foreground-muted text-lg max-w-md mx-auto mb-4">
            Even the best riders hit the wall sometimes. An unexpected error
            occurred, but you can get back in the saddle.
          </p>
          {error.digest && (
            <p className="text-foreground-muted/50 text-sm font-mono mb-10">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => unstable_retry()} size="lg">
              Try Again
            </Button>
            <Button href="/" variant="ghost" size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
