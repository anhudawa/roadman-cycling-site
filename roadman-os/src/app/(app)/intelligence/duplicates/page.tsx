'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, X, Merge, RefreshCw, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import { dismissDuplicate, mergeAssets } from '@/lib/actions/duplicates'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DuplicateEntity = {
  entity_type: string
  entity_id: string
  chunk_text: string
}

type DuplicatePair = {
  pairKey: string
  entityA: DuplicateEntity
  entityB: DuplicateEntity
  similarity: number
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function entityHref(entityType: string, entityId: string): string {
  switch (entityType) {
    case 'asset': return `/assets/${entityId}`
    case 'idea': return `/ideas/${entityId}`
    case 'transcript': return `/transcripts/${entityId}`
    default: return '#'
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DuplicatesPage() {
  const [pairs, setPairs] = useState<DuplicatePair[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPair, setSelectedPair] = useState<DuplicatePair | null>(null)
  const [minSimilarity, setMinSimilarity] = useState(0.92)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set())

  // -------------------------------------------------------------------------
  // Fetch duplicates
  // -------------------------------------------------------------------------
  const fetchDuplicates = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Call the duplicate detection via API
      const res = await fetch(`/api/intelligence/duplicates?threshold=${minSimilarity}`)
      if (!res.ok) throw new Error('Failed to fetch duplicates')
      const data = await res.json()
      setPairs(data.pairs ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setIsLoading(false)
    }
  }, [minSimilarity])

  useEffect(() => {
    fetchDuplicates()
  }, [fetchDuplicates])

  // -------------------------------------------------------------------------
  // Dismiss
  // -------------------------------------------------------------------------
  async function handleDismiss(pair: DuplicatePair) {
    setActionInProgress(pair.pairKey)
    const result = await dismissDuplicate(pair.pairKey)
    if (result.success) {
      setDismissedKeys((prev) => new Set([...prev, pair.pairKey]))
      if (selectedPair?.pairKey === pair.pairKey) {
        setSelectedPair(null)
      }
    }
    setActionInProgress(null)
  }

  // -------------------------------------------------------------------------
  // Merge
  // -------------------------------------------------------------------------
  async function handleMerge(pair: DuplicatePair) {
    // Only merge if both are assets
    if (pair.entityA.entity_type !== 'asset' || pair.entityB.entity_type !== 'asset') {
      return
    }

    setActionInProgress(pair.pairKey)
    const result = await mergeAssets(pair.entityA.entity_id, pair.entityB.entity_id)
    if (result.success) {
      setDismissedKeys((prev) => new Set([...prev, pair.pairKey]))
      if (selectedPair?.pairKey === pair.pairKey) {
        setSelectedPair(null)
      }
    }
    setActionInProgress(null)
  }

  // Filter dismissed pairs
  const visiblePairs = pairs.filter((p) => !dismissedKeys.has(p.pairKey))

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Duplicate Detection"
        description="Find and resolve duplicate or near-duplicate content across your library."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchDuplicates}
            loading={isLoading}
          >
            Re-scan
          </Button>
        }
      />

      {/* Controls */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-mid-grey">
          <span>Min similarity:</span>
          <input
            type="range"
            min={80}
            max={99}
            value={minSimilarity * 100}
            onChange={(e) => setMinSimilarity(parseInt(e.target.value) / 100)}
            className="h-1.5 w-32 cursor-pointer accent-coral"
          />
          <span className="w-12 text-coral">{(minSimilarity * 100).toFixed(0)}%</span>
        </label>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {!isLoading && !error && visiblePairs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Copy className="mb-4 h-12 w-12 text-mid-grey/30" />
          <h3 className="text-lg font-medium text-off-white">No duplicates found</h3>
          <p className="mt-1 text-sm text-mid-grey">
            Your content library appears clean at the {(minSimilarity * 100).toFixed(0)}% similarity threshold.
          </p>
        </div>
      )}

      {!isLoading && visiblePairs.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: duplicate pairs list */}
          <div className="space-y-3">
            <p className="text-sm text-mid-grey">
              {visiblePairs.length} potential duplicate{visiblePairs.length !== 1 ? 's' : ''} found
            </p>
            {visiblePairs.map((pair) => (
              <button
                key={pair.pairKey}
                type="button"
                onClick={() => setSelectedPair(pair)}
                className={cn(
                  'w-full rounded-lg border p-4 text-left transition-colors',
                  selectedPair?.pairKey === pair.pairKey
                    ? 'border-coral/50 bg-coral/5'
                    : 'border-mid-grey/20 bg-charcoal/50 hover:border-mid-grey/40',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase text-mid-grey">
                        {pair.entityA.entity_type}
                      </span>
                      <span className="text-xs text-mid-grey/30">vs</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase text-mid-grey">
                        {pair.entityB.entity_type}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-off-white">
                      {pair.entityA.chunk_text.slice(0, 60)}
                    </p>
                    <p className="truncate text-xs text-mid-grey/60">
                      {pair.entityB.chunk_text.slice(0, 60)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-coral/10 px-2 py-0.5 text-[10px] text-coral">
                    {(pair.similarity * 100).toFixed(1)}%
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: side-by-side comparison */}
          <div className="lg:sticky lg:top-6">
            {selectedPair ? (
              <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-heading text-sm uppercase text-off-white">
                    Side-by-side comparison
                  </h3>
                  <span className="rounded bg-coral/10 px-2 py-0.5 text-xs text-coral">
                    {(selectedPair.similarity * 100).toFixed(1)}% similar
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Entity A */}
                  <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded bg-coral/10 px-2 py-0.5 text-[10px] uppercase text-coral">
                        {selectedPair.entityA.entity_type}
                      </span>
                      <a
                        href={entityHref(selectedPair.entityA.entity_type, selectedPair.entityA.entity_id)}
                        className="text-mid-grey hover:text-coral"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-off-white/80 leading-relaxed">
                      {selectedPair.entityA.chunk_text}
                    </p>
                  </div>

                  {/* Entity B */}
                  <div className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded bg-blue-400/10 px-2 py-0.5 text-[10px] uppercase text-blue-400">
                        {selectedPair.entityB.entity_type}
                      </span>
                      <a
                        href={entityHref(selectedPair.entityB.entity_type, selectedPair.entityB.entity_id)}
                        className="text-mid-grey hover:text-coral"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-off-white/80 leading-relaxed">
                      {selectedPair.entityB.chunk_text}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X className="h-4 w-4" />}
                    onClick={() => handleDismiss(selectedPair)}
                    loading={actionInProgress === selectedPair.pairKey}
                  >
                    Not a duplicate
                  </Button>
                  {selectedPair.entityA.entity_type === 'asset' &&
                    selectedPair.entityB.entity_type === 'asset' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Merge className="h-4 w-4" />}
                        onClick={() => handleMerge(selectedPair)}
                        loading={actionInProgress === selectedPair.pairKey}
                      >
                        Merge (keep A)
                      </Button>
                    )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-mid-grey/20 py-16 text-sm text-mid-grey">
                Select a pair to compare
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
