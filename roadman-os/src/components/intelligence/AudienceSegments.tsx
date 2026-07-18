'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Plus,
  RefreshCw,
  Shield,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { AudienceSegment } from '@/types/database'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

// ---------------------------------------------------------------------------
// Affinity Bar (topic affinities visualisation)
// ---------------------------------------------------------------------------

function AffinityBars({ affinities }: { affinities: Record<string, number> }) {
  const entries = Object.entries(affinities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6) // show top 6

  if (entries.length === 0) {
    return <span className="text-xs text-mid-grey">No topic affinities set</span>
  }

  return (
    <div className="space-y-1">
      {entries.map(([topic, value]) => (
        <div key={topic} className="flex items-center gap-2">
          <span className="w-28 text-xs text-mid-grey truncate">{topic}</span>
          <div className="flex-1 h-3 bg-charcoal rounded border border-mid-grey/10">
            <div
              className="h-full bg-coral rounded transition-all"
              style={{ width: `${Math.min(100, value * 100)}%` }}
            />
          </div>
          <span className="w-10 text-right text-[10px] text-mid-grey">
            {(value * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create/Edit Modal
// ---------------------------------------------------------------------------

function SegmentModal({
  segment,
  onClose,
  onSave,
}: {
  segment: AudienceSegment | null // null = create new
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(segment?.name ?? '')
  const [description, setDescription] = useState(segment?.description ?? '')
  const [discoveryMethod, setDiscoveryMethod] = useState(segment?.discovery_method ?? 'manual')
  const [affinityText, setAffinityText] = useState(
    segment?.topic_affinities ? JSON.stringify(segment.topic_affinities, null, 2) : '{}',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    let topicAffinities: Record<string, number> = {}
    try {
      topicAffinities = JSON.parse(affinityText)
    } catch {
      setError('Topic affinities must be valid JSON')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const url = '/api/intelligence/segments'
      const method = segment ? 'PATCH' : 'POST'
      const body = segment
        ? { id: segment.id, name, description: description || null, discovery_method: discoveryMethod, topic_affinities: topicAffinities }
        : { name, description: description || null, discovery_method: discoveryMethod, topic_affinities: topicAffinities }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        onSave()
        onClose()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-charcoal border border-mid-grey/30 rounded-xl shadow-2xl w-full max-w-lg space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-off-white">
            {segment ? 'Edit Segment' : 'Create Segment'}
          </h2>
          <button type="button" onClick={onClose} className="text-mid-grey hover:text-off-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-off-white mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Supplement-Curious Returner"
              className="w-full bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
            />
          </div>

          <div>
            <label className="block text-sm text-off-white mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe this audience segment…"
              className="w-full bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
            />
          </div>

          <div>
            <label className="block text-sm text-off-white mb-1">Discovery Method</label>
            <select
              value={discoveryMethod}
              onChange={(e) => setDiscoveryMethod(e.target.value)}
              className="w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white text-sm focus:outline-none focus:ring-2 focus:ring-coral/50"
            >
              <option value="manual">Manual</option>
              <option value="kmeans_topic_affinity">K-means Topic Affinity</option>
              <option value="engagement_pattern">Engagement Pattern</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-off-white mb-1">
              Topic Affinities (JSON)
            </label>
            <textarea
              value={affinityText}
              onChange={(e) => setAffinityText(e.target.value)}
              rows={4}
              placeholder='{"supplements": 0.8, "indoor_training": 0.6}'
              className="w-full bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral/50"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={saving}>
            {segment ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Segment Card
// ---------------------------------------------------------------------------

function SegmentCard({
  segment,
  onEdit,
  onToggle,
  onDelete,
}: {
  segment: AudienceSegment
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-charcoal/50 p-4 space-y-3 transition-opacity',
        segment.is_active ? 'border-mid-grey/20' : 'border-mid-grey/10 opacity-60',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-coral" />
            <h3 className="text-sm font-medium text-off-white">{segment.name}</h3>
            {!segment.is_active && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-mid-grey/10 text-mid-grey">
                Inactive
              </span>
            )}
          </div>
          {segment.description && (
            <p className="text-xs text-mid-grey mt-1">{segment.description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-semibold text-off-white">
            {formatNumber(segment.member_count)}
          </p>
          <p className="text-[10px] text-mid-grey">members</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded border border-mid-grey/10 bg-charcoal px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Method</p>
          <p className="text-xs text-off-white mt-0.5 truncate">
            {segment.discovery_method.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="rounded border border-mid-grey/10 bg-charcoal px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Revenue Rate</p>
          <p className="text-xs text-off-white mt-0.5">
            {segment.revenue_rate !== null ? `$${segment.revenue_rate.toFixed(2)}` : '—'}
          </p>
        </div>
        <div className="rounded border border-mid-grey/10 bg-charcoal px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Computed</p>
          <p className="text-xs text-off-white mt-0.5">
            {new Date(segment.computed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Topic affinities */}
      <AffinityBars affinities={segment.topic_affinities} />

      {/* Privacy note */}
      <div className="flex items-center gap-1.5 text-[10px] text-mid-grey">
        <Shield className="h-3 w-3" />
        First-party data only. Member keys are SHA-256 hashed — no raw emails stored.
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-mid-grey/10">
        <Button size="sm" variant="ghost" icon={<Edit3 className="h-3 w-3" />} onClick={onEdit}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={segment.is_active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
          onClick={onToggle}
        >
          {segment.is_active ? 'Deactivate' : 'Activate'}
        </Button>
        {!segment.is_active && (
          <Button size="sm" variant="ghost" icon={<Trash2 className="h-3 w-3 text-red-400" />} onClick={onDelete}>
            Delete members
          </Button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AudienceSegments() {
  const [segments, setSegments] = useState<AudienceSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState<AudienceSegment | null>(null)

  const fetchSegments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (!showInactive) params.set('active', 'true')
      const res = await fetch(`/api/intelligence/segments?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSegments(data.segments || [])
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [showInactive])

  useEffect(() => {
    fetchSegments()
  }, [fetchSegments])

  const handleToggle = async (segment: AudienceSegment) => {
    await fetch('/api/intelligence/segments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: segment.id, is_active: !segment.is_active }),
    })
    await fetchSegments()
  }

  const handleDeleteMembers = async (segmentId: string) => {
    await fetch(`/api/intelligence/segments/members?segment_id=${segmentId}`, {
      method: 'DELETE',
    })
    await fetchSegments()
  }

  const totalMembers = segments.reduce((s, seg) => s + seg.member_count, 0)
  const activeCount = segments.filter((s) => s.is_active).length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-3">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Segments</p>
          <p className="text-lg font-semibold text-off-white mt-0.5">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-3">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Total Members</p>
          <p className="text-lg font-semibold text-coral mt-0.5">{formatNumber(totalMembers)}</p>
        </div>
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-3">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">Avg Segment Size</p>
          <p className="text-lg font-semibold text-off-white mt-0.5">
            {activeCount > 0 ? formatNumber(Math.round(totalMembers / activeCount)) : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-mid-grey/20 bg-charcoal p-3">
          <p className="text-[10px] uppercase tracking-wider text-mid-grey">With Revenue</p>
          <p className="text-lg font-semibold text-green-400 mt-0.5">
            {segments.filter((s) => s.revenue_rate !== null && s.revenue_rate > 0).length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => { setEditingSegment(null); setModalOpen(true) }}
        >
          Create Segment
        </Button>
        <label className="flex items-center gap-2 text-sm text-mid-grey cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-mid-grey/30 bg-charcoal text-coral focus:ring-coral/50"
          />
          Show inactive
        </label>
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={fetchSegments}
          loading={loading}
          className="ml-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Loading */}
      {loading && segments.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && segments.length === 0 && (
        <div className="text-center py-16 text-mid-grey">
          <Users className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">No audience segments</p>
          <p className="text-sm mt-1">
            Create segments manually or run the discovery pipeline to cluster your audience by engagement patterns.
          </p>
        </div>
      )}

      {/* Segment cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {segments.map((segment) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            onEdit={() => { setEditingSegment(segment); setModalOpen(true) }}
            onToggle={() => handleToggle(segment)}
            onDelete={() => handleDeleteMembers(segment.id)}
          />
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <SegmentModal
          segment={editingSegment}
          onClose={() => setModalOpen(false)}
          onSave={fetchSegments}
        />
      )}
    </div>
  )
}
