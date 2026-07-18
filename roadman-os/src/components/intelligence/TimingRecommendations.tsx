'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  Calendar,
  TrendingUp,
  RefreshCw,
  Video,
  FileText,
  Mail,
  Mic,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { SeasonalIndex, Insight, TrendConfidence } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PeakWithTopic extends SeasonalIndex {
  topics?: { name: string; slug: string; commercial_category: string | null } | null
}

interface TimingResponse {
  upcoming_peaks: PeakWithTopic[]
  timing_insights: Insight[]
  current_week: number
}

const FORMAT_CONFIG: Record<string, { weeks: number; label: string; icon: React.ReactNode; colour: string }> = {
  blog: { weeks: 6, label: 'Blog', icon: <FileText className="h-3 w-3" />, colour: 'bg-blue-400' },
  video: { weeks: 2, label: 'Video', icon: <Video className="h-3 w-3" />, colour: 'bg-red-400' },
  newsletter: { weeks: 1, label: 'Email', icon: <Mail className="h-3 w-3" />, colour: 'bg-green-400' },
  podcast: { weeks: 3, label: 'Podcast', icon: <Mic className="h-3 w-3" />, colour: 'bg-purple' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function weekToMonth(w: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const idx = Math.min(11, Math.floor(((w - 1) / 52) * 12))
  return months[idx]
}

function confidenceColour(c: TrendConfidence): string {
  switch (c) {
    case 'established': return 'text-coral'
    case 'probable': return 'text-coral/80'
    case 'emerging': return 'text-yellow-400'
    default: return 'text-mid-grey'
  }
}

// ---------------------------------------------------------------------------
// Timeline Row
// ---------------------------------------------------------------------------

function PeakTimeline({
  peak,
  currentWeek,
}: {
  peak: PeakWithTopic
  currentWeek: number
}) {
  const topic = peak.topics as unknown as { name: string; commercial_category: string | null } | null
  if (!topic) return null

  const weeksUntilPeak = ((peak.iso_week - currentWeek + 52) % 52) || 52
  const timelineWidth = 12 // show 12-week window

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-coral" />
          <span className="text-sm font-medium text-off-white">{topic.name}</span>
          <span className={cn('text-xs', confidenceColour(peak.confidence))}>
            {peak.index_value.toFixed(1)}× peak
          </span>
        </div>
        <span className="text-xs text-mid-grey">
          Week {peak.iso_week} ({weekToMonth(peak.iso_week)}) — {weeksUntilPeak}w away
        </span>
      </div>

      {/* Format publish-by bars */}
      <div className="space-y-1.5">
        {Object.entries(FORMAT_CONFIG).map(([format, config]) => {
          const publishByWeek = ((peak.iso_week - config.weeks + 52) % 52) || 52
          const weeksUntilPublish = ((publishByWeek - currentWeek + 52) % 52) || 52
          const isPast = weeksUntilPublish > 50 // wrapped around = already past
          const isUrgent = weeksUntilPublish <= 2 && !isPast

          // Position on timeline (0% = now, 100% = 12 weeks out)
          const publishPct = isPast ? 0 : Math.min(100, (weeksUntilPublish / timelineWidth) * 100)
          const peakPct = Math.min(100, (weeksUntilPeak / timelineWidth) * 100)

          return (
            <div key={format} className="flex items-center gap-2">
              <div className="w-20 flex items-center gap-1 text-xs text-mid-grey">
                {config.icon}
                {config.label}
              </div>
              <div className="flex-1 h-6 relative bg-charcoal rounded border border-mid-grey/10">
                {/* Publish-by marker */}
                {!isPast && (
                  <div
                    className={cn(
                      'absolute top-0 h-full w-1 rounded',
                      isUrgent ? 'bg-red-400 animate-pulse' : config.colour,
                    )}
                    style={{ left: `${publishPct}%` }}
                    title={`Publish by week ${publishByWeek} (${weeksUntilPublish}w)`}
                  />
                )}
                {/* Publish-by to peak bar */}
                {!isPast && (
                  <div
                    className={cn('absolute top-1 bottom-1 rounded opacity-20', config.colour)}
                    style={{
                      left: `${publishPct}%`,
                      width: `${Math.max(0, peakPct - publishPct)}%`,
                    }}
                  />
                )}
                {/* Peak marker */}
                <div
                  className="absolute top-0 h-full w-1 bg-coral rounded"
                  style={{ left: `${peakPct}%` }}
                />
                {/* Label */}
                <span
                  className={cn(
                    'absolute top-0.5 text-[10px]',
                    isPast ? 'text-mid-grey/50 left-1' : 'text-off-white',
                  )}
                  style={isPast ? undefined : { left: `${Math.max(0, publishPct - 1)}%`, paddingLeft: '6px' }}
                >
                  {isPast ? 'Window passed' : `${weeksUntilPublish}w`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Timeline legend */}
      <div className="flex items-center gap-4 text-[10px] text-mid-grey">
        <span>← Now</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-4 bg-coral rounded-sm" /> Demand peak
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-4 bg-blue-400 rounded-sm" /> Publish-by
        </span>
        <span>{timelineWidth} weeks →</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function TimingRecommendations() {
  const [data, setData] = useState<TimingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lookahead, setLookahead] = useState(12)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/intelligence/timing?weeks=${lookahead}`)
      if (res.ok) {
        setData(await res.json())
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [lookahead])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Deduplicate peaks by topic (keep highest index)
  const deduplicatedPeaks = data
    ? Array.from(
        data.upcoming_peaks
          .reduce((map, peak) => {
            const existing = map.get(peak.topic_id)
            if (!existing || peak.index_value > existing.index_value) {
              map.set(peak.topic_id, peak)
            }
            return map
          }, new Map<string, PeakWithTopic>())
          .values(),
      ).sort((a, b) => {
        // Sort by weeks until peak
        const aWeeks = ((a.iso_week - (data.current_week || 1) + 52) % 52) || 52
        const bWeeks = ((b.iso_week - (data.current_week || 1) + 52) % 52) || 52
        return aWeeks - bWeeks
      })
    : []

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-off-white mb-1.5">
            Lookahead
          </label>
          <div className="flex rounded-lg border border-mid-grey/30 overflow-hidden">
            {[8, 12, 16, 24].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setLookahead(w)}
                className={cn(
                  'px-3 py-2 text-sm transition-colors',
                  lookahead === w
                    ? 'bg-coral text-white'
                    : 'bg-charcoal text-mid-grey hover:text-off-white',
                )}
              >
                {w}w
              </button>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={fetchData}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Loading */}
      {loading && !data && (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && deduplicatedPeaks.length === 0 && (
        <div className="text-center py-16 text-mid-grey">
          <Clock className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">No upcoming peaks</p>
          <p className="text-sm mt-1">
            No seasonal demand peaks detected in the next {lookahead} weeks.
          </p>
        </div>
      )}

      {/* Peak timelines */}
      {deduplicatedPeaks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-off-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-coral" />
            Upcoming Demand Peaks ({deduplicatedPeaks.length} topics)
          </h3>
          {deduplicatedPeaks.map((peak) => (
            <PeakTimeline
              key={`${peak.topic_id}-${peak.iso_week}`}
              peak={peak}
              currentWeek={data?.current_week || 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
