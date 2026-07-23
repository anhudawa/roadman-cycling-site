'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, X, ExternalLink } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SimilarItem = {
  entity_type: string
  entity_id: string
  title: string
  description: string | null
  similarity?: number
  metadata?: Record<string, unknown>
}

type ReuseRecommendationsProps = {
  /** Current title being entered */
  title: string
  /** Current description being entered */
  description: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Shown on the new asset page after title/description entry.
 * Shows top 5 similar existing assets so the user can reuse or reference them.
 */
export function ReuseRecommendations({ title, description }: ReuseRecommendationsProps) {
  const [results, setResults] = useState<SimilarItem[]>([])
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchText = [title, description].filter(Boolean).join(' ').trim()

  const fetchSimilar = useCallback(async (text: string) => {
    if (text.length < 10) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(text)}&mode=keyword&type=asset&limit=5`,
      )
      if (res.ok) {
        const data = await res.json()
        setResults(data.results ?? [])
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isDismissed) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSimilar(searchText)
    }, 500)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchText, isDismissed, fetchSimilar])

  if (isDismissed || results.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-coral/20 bg-coral/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-coral" />
          <h3 className="text-sm font-medium text-off-white">Similar existing content</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="rounded p-1 text-mid-grey/50 hover:text-off-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mb-3 text-xs text-mid-grey/60">
        These existing assets look similar. Consider reusing or referencing them.
      </p>

      <div className="space-y-2">
        {results.map((item) => (
          <a
            key={item.entity_id}
            href={`/assets/${item.entity_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-lg border border-mid-grey/10 bg-charcoal/30 p-3 transition-colors hover:border-mid-grey/30"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-off-white">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 truncate text-xs text-mid-grey/60">
                  {item.description.slice(0, 100)}
                </p>
              )}
              {item.metadata && (
                <div className="mt-1 flex gap-1.5">
                  {item.metadata.type != null ? (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-mid-grey">
                      {String(item.metadata.type).replace(/_/g, ' ')}
                    </span>
                  ) : null}
                  {item.metadata.status != null ? (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-mid-grey">
                      {String(item.metadata.status)}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mid-grey/40" />
          </a>
        ))}
      </div>

      {isLoading && (
        <p className="mt-2 text-xs text-mid-grey/40">Checking for similar content...</p>
      )}
    </div>
  )
}
