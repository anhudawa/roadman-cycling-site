'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES, CONTENT_PILLARS } from '@/lib/constants'

/**
 * Filter bar for the campaigns list page.
 * Updates URL search params for server-side filtering.
 */
export function CampaignFiltersBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/campaigns?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-grey" />
        <input
          type="search"
          placeholder="Search campaigns..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => updateParam('search', e.target.value)}
          className="w-full bg-charcoal border border-mid-grey/30 rounded-lg pl-9 pr-3 py-2 text-sm text-off-white placeholder:text-mid-grey focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
        />
      </div>

      {/* Type filter */}
      <select
        defaultValue={searchParams.get('type') ?? ''}
        onChange={(e) => updateParam('type', e.target.value)}
        className="bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
      >
        <option value="">All Types</option>
        {CAMPAIGN_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <select
        defaultValue={searchParams.get('status') ?? ''}
        onChange={(e) => updateParam('status', e.target.value)}
        className="bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
      >
        <option value="">All Statuses</option>
        {CAMPAIGN_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Pillar filter */}
      <select
        defaultValue={searchParams.get('pillar') ?? ''}
        onChange={(e) => updateParam('pillar', e.target.value)}
        className="bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50 focus:border-coral transition-colors"
      >
        <option value="">All Pillars</option>
        {CONTENT_PILLARS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  )
}
