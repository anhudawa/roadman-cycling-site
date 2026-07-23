'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { DecayingAsset } from '@/lib/queries/decay'

const severityVariant: Record<string, 'red' | 'amber' | 'grey'> = {
  critical: 'red',
  warning: 'amber',
  mild: 'grey',
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function DecayDashboardPage() {
  const [assets, setAssets] = useState<DecayingAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Fetch decay data via an inline server action call
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/reports/decay')
        if (res.ok) {
          const data = await res.json()
          setAssets(data.assets ?? [])
        }
      } catch {
        // Silently handle fetch errors in demo mode
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDismiss = useCallback((assetId: string) => {
    setDismissed((prev) => new Set([...prev, assetId]))
  }, [])

  const visibleAssets = assets.filter((a) => !dismissed.has(a.asset_id))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content Decay Alerts"
        description="Content showing significant drops in performance"
        actions={
          <Link href="/performance">
            <Button variant="outline" size="sm">
              Back to Performance
            </Button>
          </Link>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <h4 className="text-xs uppercase text-red-400 mb-1">Critical</h4>
          <p className="font-heading text-2xl text-red-400">
            {visibleAssets.filter((a) => a.severity === 'critical').length}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <h4 className="text-xs uppercase text-amber-400 mb-1">Warning</h4>
          <p className="font-heading text-2xl text-amber-400">
            {visibleAssets.filter((a) => a.severity === 'warning').length}
          </p>
        </div>
        <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-4">
          <h4 className="text-xs uppercase text-mid-grey mb-1">Mild</h4>
          <p className="font-heading text-2xl text-mid-grey">
            {visibleAssets.filter((a) => a.severity === 'mild').length}
          </p>
        </div>
      </div>

      {/* Decaying assets list */}
      {loading ? (
        <div className="py-12 text-center text-mid-grey">Loading decay data...</div>
      ) : visibleAssets.length === 0 ? (
        <EmptyState
          title="No decaying content detected"
          description="All your published content is performing within normal ranges."
        />
      ) : (
        <div className="space-y-4">
          {visibleAssets.map((asset) => (
            <div
              key={asset.asset_id}
              className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/assets/${asset.asset_id}`}
                    className="font-heading text-lg text-off-white hover:text-coral transition-colors"
                  >
                    {asset.asset_title}
                  </Link>
                  <Badge variant="default" size="sm">
                    {formatLabel(asset.asset_type)}
                  </Badge>
                  <Badge variant={severityVariant[asset.severity]} size="sm">
                    {formatLabel(asset.severity)}
                  </Badge>
                </div>
                <button
                  onClick={() => handleDismiss(asset.asset_id)}
                  className="text-xs text-mid-grey hover:text-off-white transition-colors px-3 py-1 rounded-lg border border-mid-grey/20"
                >
                  Dismiss
                </button>
              </div>

              {/* Decay metrics */}
              <div className="flex items-center gap-6 mb-3 text-sm">
                <div>
                  <span className="text-mid-grey">Previous: </span>
                  <span className="text-off-white">{formatNumber(asset.previousViews)} views</span>
                </div>
                <div>
                  <span className="text-mid-grey">Current: </span>
                  <span className="text-off-white">{formatNumber(asset.currentViews)} views</span>
                </div>
                <div className="text-red-400 font-medium">
                  ↓ {asset.decayPercentage}% decline
                </div>
                {asset.publish_date && (
                  <div className="text-mid-grey text-xs">
                    Published: {asset.publish_date}
                  </div>
                )}
              </div>

              {/* Suggested actions */}
              {asset.suggestedActions.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase text-mid-grey mb-2">Suggested Actions</h4>
                  <ul className="space-y-1">
                    {asset.suggestedActions.map((action, i) => (
                      <li key={i} className="text-sm text-off-white/80 flex items-start gap-2">
                        <span className="text-coral mt-0.5 shrink-0">&#8250;</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
