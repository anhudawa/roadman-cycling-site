'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  RefreshCw,
  Video,
  FileText,
  Mail,
  Mic,
  Image as ImageIcon,
  Smartphone,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormatBreakdown {
  asset_type: string
  pieces: number
  total_views: number
  total_engagement: number
  avg_views: number
  avg_engagement: number
}

interface TopicResult {
  topic_id: string
  topic_name: string
  commercial_category: string | null
  formats: FormatBreakdown[]
}

interface FormatResponse {
  topics: TopicResult[]
  insights: unknown[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  youtube_video: <Video className="h-3.5 w-3.5" />,
  blog_post: <FileText className="h-3.5 w-3.5" />,
  podcast_episode: <Mic className="h-3.5 w-3.5" />,
  newsletter: <Mail className="h-3.5 w-3.5" />,
  reel: <Smartphone className="h-3.5 w-3.5" />,
  short: <Smartphone className="h-3.5 w-3.5" />,
  carousel: <ImageIcon className="h-3.5 w-3.5" />,
  social_post: <MessageSquare className="h-3.5 w-3.5" />,
}

const FORMAT_COLOURS: Record<string, string> = {
  youtube_video: '#FF6B6B',
  blog_post: '#60A5FA',
  podcast_episode: '#A855F7',
  newsletter: '#34D399',
  reel: '#F472B6',
  short: '#FBBF24',
  carousel: '#FB923C',
  social_post: '#818CF8',
}

function formatLabel(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------------------------------------------------------------------------
// Topic Format Chart (SVG horizontal bar chart)
// ---------------------------------------------------------------------------

function TopicFormatChart({ topic }: { topic: TopicResult }) {
  const maxEng = Math.max(...topic.formats.map((f) => f.avg_engagement), 1)

  return (
    <div className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-off-white">{topic.topic_name}</h3>
        {topic.commercial_category && (
          <span className="text-[10px] text-mid-grey">{topic.commercial_category}</span>
        )}
      </div>

      {/* Horizontal bar chart */}
      <div className="space-y-2">
        {topic.formats.map((format) => {
          const widthPct = Math.max(3, (format.avg_engagement / maxEng) * 100)
          const colour = FORMAT_COLOURS[format.asset_type] || '#6B7280'
          const icon = FORMAT_ICONS[format.asset_type] || <FileText className="h-3.5 w-3.5" />
          const insufficientSample = format.pieces < 3

          return (
            <div key={format.asset_type} className="flex items-center gap-3">
              <div className="w-28 flex items-center gap-1.5 text-xs text-mid-grey shrink-0">
                <span className="text-off-white">{icon}</span>
                <span className="truncate">{formatLabel(format.asset_type)}</span>
              </div>
              <div className="flex-1 h-7 relative bg-charcoal rounded border border-mid-grey/10">
                <div
                  className={cn('h-full rounded transition-all', insufficientSample && 'opacity-40')}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: colour,
                  }}
                />
                <span className="absolute right-2 top-1 text-[11px] text-off-white font-medium">
                  {formatNumber(format.avg_engagement)} avg eng
                </span>
              </div>
              <div className="w-24 text-right text-xs text-mid-grey shrink-0">
                {format.pieces} piece{format.pieces > 1 ? 's' : ''}
                {insufficientSample && (
                  <span className="text-yellow-400 ml-1" title="Fewer than 3 pieces — low confidence">
                    ⚠
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary row */}
      {topic.formats.length >= 2 && topic.formats[0].pieces >= 3 && topic.formats[1].pieces >= 3 && (
        <div className="text-xs text-mid-grey pt-1 border-t border-mid-grey/10">
          {formatLabel(topic.formats[0].asset_type)} leads at{' '}
          <span className="text-off-white font-medium">
            {(topic.formats[0].avg_engagement / Math.max(topic.formats[1].avg_engagement, 1)).toFixed(1)}:1
          </span>{' '}
          ratio vs {formatLabel(topic.formats[1].asset_type)}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function FormatEffectiveness() {
  const [data, setData] = useState<FormatResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedTopic) params.set('topic_id', selectedTopic)
      const res = await fetch(`/api/intelligence/format-effectiveness?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [selectedTopic])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const topics = data?.topics || []

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-off-white mb-1.5">Topic</label>
          <select
            value={selectedTopic ?? ''}
            onChange={(e) => setSelectedTopic(e.target.value || null)}
            className="w-full appearance-none bg-charcoal border border-mid-grey/30 rounded-lg px-3 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-coral/50"
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.topic_id} value={t.topic_id}>
                {t.topic_name}
              </option>
            ))}
          </select>
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
      {!loading && topics.length === 0 && (
        <div className="text-center py-16 text-mid-grey">
          <BarChart3 className="mx-auto h-12 w-12 mb-3 text-mid-grey/50" />
          <p className="text-lg font-medium text-off-white">No format data yet</p>
          <p className="text-sm mt-1">
            Needs published assets with performance data across multiple formats per topic.
          </p>
        </div>
      )}

      {/* Topic charts */}
      {topics.length > 0 && (
        <div className="space-y-4">
          {topics.map((topic) => (
            <TopicFormatChart key={topic.topic_id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}
