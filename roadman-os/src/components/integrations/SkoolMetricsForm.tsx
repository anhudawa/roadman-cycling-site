'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { saveSkoolMetrics } from '@/lib/actions/skool'
import { SkoolHistoryTable } from '@/components/integrations/SkoolHistoryTable'
import type { PerformanceRecord } from '@/types/database'

/** NDY monthly subscription price in dollars. */
const NDY_PRICE_DOLLARS = 195

export interface SkoolMetricsFormProps {
  /** Which community tier this form is for. */
  tier: 'clubhouse' | 'not_done_yet'
  /** Historical records to display beneath the form. */
  history: PerformanceRecord[]
}

/**
 * Client-side form for manually submitting Skool community metrics.
 * For the NDY tier, MRR is calculated live as member_count changes.
 */
export function SkoolMetricsForm({ tier, history }: SkoolMetricsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [memberCount, setMemberCount] = useState<number>(0)

  const isNDY = tier === 'not_done_yet'
  const calculatedMrr = isNDY ? memberCount * NDY_PRICE_DOLLARS : 0

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    formData.set('tier', tier)

    startTransition(async () => {
      const result = await saveSkoolMetrics(formData)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error ?? 'Failed to save metrics')
      }
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            name="period"
            label="Period"
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            required
          />

          <Input
            name="period_start"
            label="Period Start"
            type="date"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="member_count"
            label="Member Count"
            type="number"
            min={0}
            required
            onChange={(e) => setMemberCount(Number(e.target.value) || 0)}
          />

          <Input
            name="active_members"
            label="Active Members"
            type="number"
            min={0}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="new_joins"
            label="New Joins"
            type="number"
            min={0}
            required
          />

          <Input
            name="members_left"
            label="Members Left"
            type="number"
            min={0}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="posts"
            label="Posts"
            type="number"
            min={0}
            required
          />

          <Input
            name="comments"
            label="Comments"
            type="number"
            min={0}
            required
          />
        </div>

        {isNDY && (
          <div className="rounded-lg border border-purple/30 bg-purple/10 px-4 py-3">
            <p className="text-sm text-off-white">
              <span className="font-medium">Calculated MRR:</span>{' '}
              <span className="text-purple font-semibold">
                ${calculatedMrr.toLocaleString()}
              </span>
              <span className="text-mid-grey ml-2">
                ({memberCount} members x ${NDY_PRICE_DOLLARS}/mo)
              </span>
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-400">Metrics saved successfully</p>
        )}

        <Button type="submit" size="sm" loading={isPending}>
          Save Metrics
        </Button>
      </form>

      {/* History */}
      <div className="mt-8">
        <h4 className="text-sm font-medium text-off-white mb-3">
          Recent Entries
        </h4>
        <SkoolHistoryTable records={history} showMrr={isNDY} />
      </div>
    </div>
  )
}
