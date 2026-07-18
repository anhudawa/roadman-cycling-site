'use client'

import { useState, useCallback } from 'react'
import { Users, TrendingUp, TrendingDown, MessageSquare, FileText, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils/cn'

type Community = 'free' | 'ndy'

interface SnapshotFormData {
  community: Community
  week_start: string
  total_members: number
  new_members: number
  churned_members: number
  active_members: number | null
  posts_count: number
  comments_count: number
  notes: string
}

/** Returns the most recent Monday (today if Monday, else previous Monday). */
function getLastMonday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1 // Sunday = 6, Mon = 0, Tue = 1, ...
  d.setDate(d.getDate() - diff)
  return d.toISOString().slice(0, 10)
}

const INITIAL_STATE: SnapshotFormData = {
  community: 'free',
  week_start: getLastMonday(),
  total_members: 0,
  new_members: 0,
  churned_members: 0,
  active_members: null,
  posts_count: 0,
  comments_count: 0,
  notes: '',
}

/**
 * T57 — Skool Weekly Ritual Form.
 * Monday morning entry form for community_snapshots.
 * Sarah or Anthony enters Skool community metrics manually.
 */
export function SkoolRitualForm() {
  const [formData, setFormData] = useState<SnapshotFormData>(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const updateField = useCallback(
    <K extends keyof SnapshotFormData>(key: K, value: SnapshotFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
      setSubmitResult(null)
    },
    [],
  )

  const handleNumberChange = useCallback(
    (key: keyof SnapshotFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
      updateField(key, isNaN(val) ? 0 : val)
    },
    [updateField],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)
      setSubmitResult(null)

      try {
        const payload = {
          ...formData,
          active_members: formData.active_members || null,
          notes: formData.notes.trim() || null,
        }

        const res = await fetch('/api/intelligence/community-snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          setSubmitResult({
            type: 'error',
            message: data.error || 'Failed to save snapshot',
          })
          return
        }

        setSubmitResult({
          type: 'success',
          message: `${formData.community === 'ndy' ? 'Not Done Yet' : 'Free Community'} snapshot saved for w/c ${formData.week_start}`,
        })

        // Reset to opposite community for the second entry
        if (formData.community === 'free') {
          setFormData({
            ...INITIAL_STATE,
            community: 'ndy',
            week_start: formData.week_start,
          })
        } else {
          setFormData(INITIAL_STATE)
        }
      } catch {
        setSubmitResult({
          type: 'error',
          message: 'Network error — check your connection',
        })
      } finally {
        setSubmitting(false)
      }
    },
    [formData],
  )

  const netGrowth = formData.new_members - formData.churned_members

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Community toggle */}
      <div>
        <label className="block text-sm font-medium text-off-white mb-2">
          Community
        </label>
        <div className="flex gap-2">
          {(['free', 'ndy'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateField('community', c)}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors border',
                formData.community === c
                  ? 'bg-coral text-white border-coral'
                  : 'bg-charcoal text-mid-grey border-mid-grey/30 hover:border-mid-grey/60',
              )}
            >
              {c === 'free' ? 'Free Community' : 'Not Done Yet'}
            </button>
          ))}
        </div>
      </div>

      {/* Week selector */}
      <Input
        label="Week starting (Monday)"
        type="date"
        value={formData.week_start}
        onChange={(e) => updateField('week_start', e.target.value)}
      />

      {/* Member counts — primary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Input
            label="Total members"
            type="number"
            min={0}
            value={formData.total_members || ''}
            onChange={handleNumberChange('total_members')}
          />
          <div className="flex items-center gap-1 mt-1.5">
            <Users className="h-3.5 w-3.5 text-mid-grey" />
            <span className="text-xs text-mid-grey">Current headcount</span>
          </div>
        </div>

        <div>
          <Input
            label="New members"
            type="number"
            min={0}
            value={formData.new_members || ''}
            onChange={handleNumberChange('new_members')}
          />
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            <span className="text-xs text-green-400">Joined this week</span>
          </div>
        </div>

        <div>
          <Input
            label="Churned members"
            type="number"
            min={0}
            value={formData.churned_members || ''}
            onChange={handleNumberChange('churned_members')}
          />
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs text-red-400">Left this week</span>
          </div>
        </div>
      </div>

      {/* Net growth indicator */}
      {(formData.new_members > 0 || formData.churned_members > 0) && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
            netGrowth > 0
              ? 'bg-green-900/20 text-green-400'
              : netGrowth < 0
                ? 'bg-red-900/20 text-red-400'
                : 'bg-charcoal text-mid-grey',
          )}
        >
          {netGrowth > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : netGrowth < 0 ? (
            <TrendingDown className="h-4 w-4" />
          ) : null}
          <span>
            Net growth: {netGrowth > 0 ? '+' : ''}
            {netGrowth} members
          </span>
        </div>
      )}

      {/* Engagement metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Input
            label="Active members"
            type="number"
            min={0}
            value={formData.active_members ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
              updateField('active_members', val)
            }}
            hint="Optional — if tracked"
          />
        </div>

        <div>
          <Input
            label="Posts this week"
            type="number"
            min={0}
            value={formData.posts_count || ''}
            onChange={handleNumberChange('posts_count')}
          />
          <div className="flex items-center gap-1 mt-1.5">
            <FileText className="h-3.5 w-3.5 text-mid-grey" />
            <span className="text-xs text-mid-grey">New posts</span>
          </div>
        </div>

        <div>
          <Input
            label="Comments this week"
            type="number"
            min={0}
            value={formData.comments_count || ''}
            onChange={handleNumberChange('comments_count')}
          />
          <div className="flex items-center gap-1 mt-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-mid-grey" />
            <span className="text-xs text-mid-grey">Total comments</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <Textarea
        label="Notes"
        placeholder="Anything notable this week — spikes, events, community vibes..."
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        maxLength={1000}
      />

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          loading={submitting}
          icon={<Send className="h-4 w-4" />}
        >
          Save Snapshot
        </Button>

        {submitResult && (
          <p
            className={cn(
              'text-sm',
              submitResult.type === 'success' ? 'text-green-400' : 'text-red-400',
            )}
          >
            {submitResult.message}
          </p>
        )}
      </div>
    </form>
  )
}
