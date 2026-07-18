'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  Edit3,
  Shield,
  ShieldOff,
  RefreshCw,
  Filter,
  Clock,
  TrendingUp,
  Search,
  BarChart3,
  Users,
  AlertTriangle,
  FileText,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { Insight, InsightType, InsightStatus, TrendConfidence } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InsightWithTopic extends Insight {
  topics?: { name: string; slug: string; pillar: string | null; commercial_category: string | null } | null
}

type FilterStatus = InsightStatus | 'all'
type FilterType = InsightType | 'all'

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'candidate', label: 'Candidates' },
  { value: 'validated', label: 'Validated' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'actioned', label: 'Actioned' },
  { value: 'archived', label: 'Archived' },
]

const TYPE_OPTIONS: { value: FilterType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All types', icon: <Filter className="h-3 w-3" /> },
  { value: 'seasonal_peak', label: 'Seasonal Peak', icon: <TrendingUp className="h-3 w-3" /> },
  { value: 'timing_recommendation', label: 'Timing', icon: <Clock className="h-3 w-3" /> },
  { value: 'format_effectiveness', label: 'Format', icon: <BarChart3 className="h-3 w-3" /> },
  { value: 'audience_affinity', label: 'Audience', icon: <Users className="h-3 w-3" /> },
  { value: 'demand_gap', label: 'Demand Gap', icon: <Search className="h-3 w-3" /> },
  { value: 'decay_seasonal', label: 'Decay', icon: <AlertTriangle className="h-3 w-3" /> },
  { value: 'anomaly', label: 'Anomaly', icon: <Zap className="h-3 w-3" /> },
  { value: 'manual', label: 'Manual', icon: <FileText className="h-3 w-3" /> },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function confidenceBadge(confidence: TrendConfidence) {
  const styles: Record<TrendConfidence, string> = {
    established: 'bg-coral/20 text-coral',
    probable: 'bg-coral/10 text-coral/80',
    emerging: 'bg-yellow-400/10 text-yellow-400',
    noise: 'bg-mid-grey/10 text-mid-grey',
  }
  return (
    <span className={cn('text-[10px] uppercase tracking-wider px-2 py-0.5 rounded', styles[confidence])}>
      {confidence}
    </span>
  )
}

function statusBadge(status: InsightStatus) {
  const styles: Record<InsightStatus, string> = {
    candidate: 'bg-blue-400/10 text-blue-400',
    validated: 'bg-green-400/10 text-green-400',
    dismissed: 'bg-red-400/10 text-red-400',
    archived: 'bg-mid-grey/10 text-mid-grey',
    actioned: 'bg-purple/10 text-purple',
  }
  return (
    <span className={cn('text-[10px] uppercase tracking-wider px-2 py-0.5 rounded', styles[status])}>
      {status}
    </span>
  )
}

function typeIcon(type: InsightType): React.ReactNode {
  const match = TYPE_OPTIONS.find((t) => t.value === type)
  return match?.icon ?? <Lightbulb className="h-3 w-3" />
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// InsightCard
// ---------------------------------------------------------------------------

function InsightCard({
  insight,
  onAction,
}: {
  insight: InsightWithTopic
  onAction: (id: string, action: string, payload?: Record<string, unknown>) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(insight.statement)
  const [dismissReason, setDismissReason] = useState('')
  const [showDismiss, setShowDismiss] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleAction = async (action: string, payload?: Record<string, unknown>) => {
    setBusy(true)
    await onAction(insight.id, action, payload)
    setBusy(false)
    setEditing(false)
    setShowDismiss(false)
  }

  const evidence = insight.evidence as Record<string, unknown>

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-coral">{typeIcon(insight.type)}</span>
          {statusBadge(insight.status)}
          {confidenceBadge(insight.confidence)}
          {insight.sponsor_safe && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-green-400/10 text-green-400">
              Sponsor safe
            </span>
          )}
        </div>
        <div className="text-[10px] text-mid-grey whitespace-nowrap">
          {insight.confidence_score.toFixed(0)}/100
        </div>
      </div>

      {/* Statement */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAction('edit', { statement: editText })}
              loading={busy}
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditText(insight.statement) }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-off-white leading-relaxed">{insight.statement}</p>
      )}

      {/* Topic + metadata */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-mid-grey">
        {insight.topics && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-coral" />
            {(insight.topics as unknown as { name: string }).name}
          </span>
        )}
        {insight.commercial_category && (
          <span>Category: {insight.commercial_category}</span>
        )}
        {insight.valid_from && insight.valid_until && (
          <span>Valid: {formatDate(insight.valid_from)} – {formatDate(insight.valid_until)}</span>
        )}
        <span>Created: {formatDate(insight.created_at)}</span>
      </div>

      {/* Evidence summary */}
      {Object.keys(evidence).length > 0 && (
        <details className="text-xs">
          <summary className="text-mid-grey cursor-pointer hover:text-off-white transition-colors">
            View evidence
          </summary>
          <pre className="mt-2 p-2 rounded bg-charcoal border border-mid-grey/10 text-mid-grey overflow-x-auto text-[11px]">
            {JSON.stringify(evidence, null, 2)}
          </pre>
        </details>
      )}

      {/* Dismiss reason input */}
      {showDismiss && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Reason for dismissing (optional)"
            value={dismissReason}
            onChange={(e) => setDismissReason(e.target.value)}
            className="w-full bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleAction('dismiss', { reason: dismissReason })}
              loading={busy}
            >
              Confirm Dismiss
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDismiss(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!editing && !showDismiss && (
        <div className="flex flex-wrap gap-2 pt-1">
          {insight.status === 'candidate' && (
            <>
              <Button
                size="sm"
                variant="primary"
                icon={<CheckCircle2 className="h-3 w-3" />}
                onClick={() => handleAction('validate')}
                loading={busy}
              >
                Validate
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={<XCircle className="h-3 w-3" />}
                onClick={() => setShowDismiss(true)}
              >
                Dismiss
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon={<Edit3 className="h-3 w-3" />}
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={insight.sponsor_safe ? <ShieldOff className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
            onClick={() => handleAction('toggle_sponsor_safe', { sponsor_safe: !insight.sponsor_safe })}
            loading={busy}
          >
            {insight.sponsor_safe ? 'Remove sponsor safe' : 'Mark sponsor safe'}
          </Button>
          {insight.status === 'validated' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction('archive')}
              loading={busy}
            >
              Archive
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function InsightReview() {
  const [insights, setInsights] = useState<InsightWithTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('candidate')
  const [filterType, setFilterType] = useState<FilterType>('all')

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterType !== 'all') params.set('type', filterType)
      params.set('limit', '100')

      const res = await fetch(`/api/intelligence/insights?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights || [])
      }
    } catch {
      // Network error — leave state as-is
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterType])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const handleAction = async (id: string, action: string, payload?: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/intelligence/insights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...payload }),
      })
      if (res.ok) {
        // Refresh the list
        await fetchInsights()
      }
    } catch {
      // Silently fail — card stays in current state
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await fetch('/api/intelligence/insights', { method: 'POST' })
      await fetchInsights()
    } catch {
      // Ignore
    } finally {
      setGenerating(false)
    }
  }

  // Count by status for summary
  const candidateCount = insights.filter((i) => i.status === 'candidate').length
  const validatedCount = insights.filter((i) => i.status === 'validated').length

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-3">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Pending Review</p>
          <p className="text-lg font-semibold text-blue-400 mt-0.5">{candidateCount}</p>
        </div>
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-3">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Validated</p>
          <p className="text-lg font-semibold text-green-400 mt-0.5">{validatedCount}</p>
        </div>
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-3">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Total Shown</p>
          <p className="text-lg font-semibold text-off-white mt-0.5">{insights.length}</p>
        </div>
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-3">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Sponsor Safe</p>
          <p className="text-lg font-semibold text-coral mt-0.5">
            {insights.filter((i) => i.sponsor_safe).length}
          </p>
        </div>
      </div>

      {/* Filters + actions */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-off-white mb-1.5">Status</label>
          <div className="flex rounded-lg border border-mid-grey/30 overflow-hidden">
            {STATUS_OPTIONS.slice(0, 4).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterStatus(opt.value)}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  filterStatus === opt.value
                    ? 'bg-coral text-white'
                    : 'bg-charcoal text-mid-grey hover:text-off-white',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="min-w-[180px]">
          <label className="block text-sm font-medium text-off-white mb-1.5">Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            icon={<Zap className="h-4 w-4" />}
            onClick={handleGenerate}
            loading={generating}
          >
            Generate Now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchInsights}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && insights.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && insights.length === 0 && (
        <div className="text-center py-16 text-mid-grey">
          <Lightbulb className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">No insights found</p>
          <p className="text-sm mt-1">
            {filterStatus === 'candidate'
              ? 'Run the generator to create candidate insights from your trend data.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      )}

      {/* Insight cards */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} onAction={handleAction} />
        ))}
      </div>
    </div>
  )
}
