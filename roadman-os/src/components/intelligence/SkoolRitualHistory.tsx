'use client'

import { useState, useEffect } from 'react'
import { History, Users, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { CommunitySnapshot } from '@/types/database'

/**
 * Recent community snapshot history — sidebar display for the Skool ritual page.
 * Fetches the last 8 snapshots and shows a compact trend view.
 */
export function SkoolRitualHistory() {
  const [snapshots, setSnapshots] = useState<CommunitySnapshot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSnapshots() {
      try {
        const res = await fetch('/api/intelligence/community-snapshots?limit=8')
        if (res.ok) {
          const data = await res.json()
          setSnapshots(data.snapshots || [])
        }
      } catch {
        // Silent fail — history is supplementary
      } finally {
        setLoading(false)
      }
    }
    fetchSnapshots()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <div className="rounded-lg border border-mid-grey/30 bg-charcoal p-6 text-center">
        <History className="mx-auto h-8 w-8 text-mid-grey mb-2" />
        <p className="text-sm text-mid-grey">No snapshots yet</p>
        <p className="text-xs text-mid-grey/70 mt-1">
          Enter your first weekly snapshot to start tracking
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
        <History className="h-4 w-4 text-mid-grey" />
        Recent Snapshots
      </h3>

      {snapshots.map((s) => {
        const netGrowth = s.new_members - s.churned_members
        return (
          <div
            key={s.id}
            className="rounded-lg border border-mid-grey/20 bg-charcoal p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-off-white">
                {s.community === 'ndy' ? 'Not Done Yet' : 'Free Community'}
              </span>
              <span className="text-xs text-mid-grey">
                w/c {s.week_start}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-3 w-3 text-mid-grey" />
                  <span className="text-sm font-semibold text-off-white">
                    {s.total_members.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] text-mid-grey">Total</span>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1">
                  {netGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      netGrowth > 0
                        ? 'text-green-400'
                        : netGrowth < 0
                          ? 'text-red-400'
                          : 'text-mid-grey',
                    )}
                  >
                    {netGrowth > 0 ? '+' : ''}
                    {netGrowth}
                  </span>
                </div>
                <span className="text-[10px] text-mid-grey">Net</span>
              </div>

              <div>
                <span className="text-sm font-semibold text-off-white">
                  {s.posts_count}
                </span>
                <span className="text-[10px] text-mid-grey block">Posts</span>
              </div>
            </div>

            {s.notes && (
              <p className="text-xs text-mid-grey/80 truncate" title={s.notes}>
                {s.notes}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
