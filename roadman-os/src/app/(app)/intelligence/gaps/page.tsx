'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, AlertTriangle, BarChart3, Grid3x3, FileText, Lightbulb } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import type { ContentPillar, AssetType } from '@/types/database'

// ---------------------------------------------------------------------------
// Types (mirror gap-detection.ts)
// ---------------------------------------------------------------------------

type PillarCoverage = {
  pillar: ContentPillar
  label: string
  count: number
  percentage: number
  isUnderRepresented: boolean
}

type TopicCoverage = {
  topicId: string
  topicName: string
  pillar: ContentPillar | null
  assetCount: number
  formats: AssetType[]
  isFlagged: boolean
  flagReason: string | null
}

type FormatDiversity = {
  pillar: ContentPillar
  label: string
  formats: { type: AssetType; count: number }[]
  missingFormats: AssetType[]
  diversityScore: number
}

type GapRecommendation = {
  type: string
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  pillar?: ContentPillar
  topicId?: string
  topicName?: string
}

type GapAnalysis = {
  pillarCoverage: PillarCoverage[]
  topicCoverage: TopicCoverage[]
  formatDiversity: FormatDiversity[]
  recommendations: GapRecommendation[]
  totalAssets: number
  analysedAt: string
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

const PILLAR_COLOURS: Record<ContentPillar, string> = {
  coaching: '#F16363',
  nutrition: '#34D399',
  strength_and_conditioning: '#60A5FA',
  recovery: '#A78BFA',
  le_metier: '#FBBF24',
}

const SEVERITY_STYLES: Record<string, string> = {
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-yellow-400/30 bg-yellow-400/5',
  low: 'border-blue-400/30 bg-blue-400/5',
}

const SEVERITY_TEXT: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
}

// ---------------------------------------------------------------------------
// SVG Bar Chart
// ---------------------------------------------------------------------------

function PillarBarChart({ data, totalAssets }: { data: PillarCoverage[]; totalAssets: number }) {
  const chartWidth = 600
  const chartHeight = 200
  const barGap = 20
  const barWidth = (chartWidth - barGap * (data.length + 1)) / data.length
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`} className="w-full max-w-2xl">
      {/* Threshold line at 10% */}
      {(() => {
        const thresholdY = chartHeight - (0.1 * totalAssets / maxCount) * chartHeight
        return (
          <g>
            <line
              x1={barGap}
              x2={chartWidth - barGap}
              y1={thresholdY + 10}
              y2={thresholdY + 10}
              stroke="#F16363"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <text
              x={chartWidth - barGap}
              y={thresholdY + 6}
              textAnchor="end"
              className="text-[10px] fill-coral/60"
            >
              10% threshold
            </text>
          </g>
        )
      })()}

      {data.map((d, i) => {
        const barHeight = (d.count / maxCount) * chartHeight
        const x = barGap + i * (barWidth + barGap)
        const y = chartHeight - barHeight + 10

        return (
          <g key={d.pillar}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={PILLAR_COLOURS[d.pillar]}
              opacity={d.isUnderRepresented ? 0.5 : 0.85}
            />
            {/* Count label */}
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className="text-xs fill-off-white"
            >
              {d.count}
            </text>
            {/* Percentage */}
            <text
              x={x + barWidth / 2}
              y={y - 18}
              textAnchor="middle"
              className="text-[10px] fill-mid-grey"
            >
              {(d.percentage * 100).toFixed(1)}%
            </text>
            {/* Pillar label */}
            <text
              x={x + barWidth / 2}
              y={chartHeight + 28}
              textAnchor="middle"
              className="text-[10px] fill-mid-grey"
            >
              {d.label}
            </text>
            {/* Warning indicator */}
            {d.isUnderRepresented && (
              <text
                x={x + barWidth / 2}
                y={chartHeight + 44}
                textAnchor="middle"
                className="text-xs fill-coral"
              >
                !!
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Topic Heat Map (topics x formats)
// ---------------------------------------------------------------------------

function TopicHeatMap({ data }: { data: TopicCoverage[] }) {
  // Collect all unique formats
  const allFormats = Array.from(
    new Set(data.flatMap((t) => t.formats)),
  ).sort()

  if (allFormats.length === 0 || data.length === 0) {
    return <p className="text-sm text-mid-grey">No topic/format data to display.</p>
  }

  // Limit to flagged or top topics to keep the map readable
  const displayTopics = data
    .filter((t) => t.assetCount > 0)
    .sort((a, b) => b.assetCount - a.assetCount)
    .slice(0, 20)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-charcoal px-3 py-2 text-left text-[10px] uppercase tracking-wider text-mid-grey/60">
              Topic
            </th>
            {allFormats.map((f) => (
              <th
                key={f}
                className="px-2 py-2 text-center text-[10px] uppercase tracking-wider text-mid-grey/60"
              >
                {f.replace(/_/g, ' ').slice(0, 10)}
              </th>
            ))}
            <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-mid-grey/60">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {displayTopics.map((topic) => (
            <tr key={topic.topicId} className="border-t border-mid-grey/10">
              <td className="sticky left-0 bg-charcoal px-3 py-1.5 text-off-white/80">
                <div className="flex items-center gap-1.5">
                  {topic.isFlagged && (
                    <AlertTriangle className="h-3 w-3 shrink-0 text-yellow-400" />
                  )}
                  <span className="truncate">{topic.topicName}</span>
                </div>
              </td>
              {allFormats.map((format) => {
                const hasFormat = topic.formats.includes(format)
                return (
                  <td key={format} className="px-2 py-1.5 text-center">
                    <div
                      className={cn(
                        'mx-auto h-5 w-5 rounded',
                        hasFormat ? 'bg-coral/40' : 'bg-white/3',
                      )}
                    />
                  </td>
                )
              })}
              <td className="px-3 py-1.5 text-center text-off-white/60">
                {topic.assetCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GapsPage() {
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/intelligence/gaps')
      if (!res.ok) throw new Error('Failed to fetch gap analysis')
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Content Gaps" />
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content Gaps"
        description={`Analysed ${analysis.totalAssets} assets across ${analysis.pillarCoverage.length} pillars and ${analysis.topicCoverage.length} topics.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchAnalysis}
            loading={isLoading}
          >
            Re-analyse
          </Button>
        }
      />

      {/* Pillar coverage */}
      <section className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-coral" />
          <h2 className="font-heading text-lg uppercase text-off-white">Pillar Coverage</h2>
        </div>
        <PillarBarChart data={analysis.pillarCoverage} totalAssets={analysis.totalAssets} />
      </section>

      {/* Topic heat map */}
      <section className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-coral" />
          <h2 className="font-heading text-lg uppercase text-off-white">Topic x Format Heat Map</h2>
        </div>
        <TopicHeatMap data={analysis.topicCoverage} />
      </section>

      {/* Format diversity table */}
      <section className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-coral" />
          <h2 className="font-heading text-lg uppercase text-off-white">Format Diversity</h2>
        </div>
        <div className="space-y-3">
          {analysis.formatDiversity.map((fd) => (
            <div
              key={fd.pillar}
              className="rounded-lg border border-mid-grey/10 bg-charcoal/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: PILLAR_COLOURS[fd.pillar] }}
                  />
                  <span className="text-sm font-medium text-off-white">{fd.label}</span>
                </div>
                <span className="text-xs text-mid-grey">
                  Diversity: {(fd.diversityScore * 100).toFixed(0)}%
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {fd.formats.map((f) => (
                  <span
                    key={f.type}
                    className="rounded bg-coral/10 px-2 py-0.5 text-[10px] text-coral"
                  >
                    {f.type.replace(/_/g, ' ')} ({f.count})
                  </span>
                ))}
                {fd.missingFormats.map((f) => (
                  <span
                    key={f}
                    className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-mid-grey/40 line-through"
                  >
                    {f.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="rounded-lg border border-mid-grey/20 bg-charcoal/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-coral" />
          <h2 className="font-heading text-lg uppercase text-off-white">Gap Recommendations</h2>
          <span className="ml-auto text-xs text-mid-grey">
            {analysis.recommendations.length} recommendation{analysis.recommendations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {analysis.recommendations.length === 0 && (
          <p className="text-sm text-mid-grey">No gaps detected. Your content coverage is well balanced.</p>
        )}

        <div className="space-y-2">
          {analysis.recommendations.map((rec, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg border p-4',
                SEVERITY_STYLES[rec.severity] ?? 'border-mid-grey/20',
              )}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={cn('mt-0.5 h-4 w-4 shrink-0', SEVERITY_TEXT[rec.severity])} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-off-white">{rec.title}</h3>
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider', SEVERITY_TEXT[rec.severity])}>
                      {rec.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-mid-grey/70">{rec.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Last analysed */}
      <p className="text-right text-xs text-mid-grey/40">
        Last analysed: {new Date(analysis.analysedAt).toLocaleString('en-GB')}
      </p>
    </div>
  )
}
