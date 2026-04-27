'use client'

import { useEffect } from 'react'

/**
 * Global error boundary — catches errors thrown in the root layout
 * itself (where regular error.tsx can't reach). Must render its own
 * <html> + <body> because the normal layout has failed.
 *
 * Intentionally inline-styled: if the root layout is broken, the app's
 * CSS pipeline (Tailwind, design tokens, etc.) may not be available.
 * This file has to stand alone.
 *
 * Same reporting flow as src/app/error.tsx: beacon the error to
 * /api/events so it lands alongside server errors captured by
 * src/instrumentation.ts.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    console.error('[global-error]', error)
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      try {
        const payload = {
          type: 'error_report',
          page:
            typeof window !== 'undefined' ? window.location.pathname : '/',
          source: 'client-global',
          meta: {
            message: (error?.message ?? '').slice(0, 500),
            digest: error?.digest ?? '',
            stack: (error?.stack ?? '').slice(0, 2000),
            url: typeof window !== 'undefined' ? window.location.href : '',
          },
        }
        const blob = new Blob([JSON.stringify(payload)], {
          type: 'application/json',
        })
        navigator.sendBeacon('/api/events', blob)
      } catch {
        // Never block rendering.
      }
    }
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          background: '#1a0b2e',
          color: '#f5f0e8',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <main
          style={{
            maxWidth: '640px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '6rem',
              lineHeight: 1,
              color: '#f16363',
              margin: 0,
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            BONK
          </p>
          <h1
            style={{
              fontSize: '2rem',
              margin: '1rem 0 0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
            Even the best riders hit the wall sometimes. Please reload the page.
          </p>
          {error?.digest ? (
            <p
              style={{
                opacity: 0.4,
                fontSize: '0.875rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                marginBottom: '1.5rem',
              }}
            >
              Error ID: {error.digest}
            </p>
          ) : null}
          {/* Intentional raw <a>: root layout has crashed, so router/Link
              context may be unsafe. A full page reload is the recovery path. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#f16363',
              color: '#1a0b2e',
              borderRadius: '999px',
              textDecoration: 'none',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Back to home
          </a>
        </main>
      </body>
    </html>
  )
}
