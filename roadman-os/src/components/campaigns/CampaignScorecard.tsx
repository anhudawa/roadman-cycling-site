'use client'

import Link from 'next/link'
import type {
  CampaignPerformanceSummary,
  CampaignROI,
  CampaignComparison,
} from '@/lib/queries/campaign-performance'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CampaignScorecardProps {
  campaignId: string
  performance: CampaignPerformanceSummary
  roi: CampaignROI | null
  comparisons: CampaignComparison[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatCurrency(cents: number): string {
  return `£${(cents / 100).toFixed(2)}`
}

function formatLabel(source: string): string {
  return source
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CampaignScorecard({
  campaignId,
  performance,
  roi,
  comparisons,
}: CampaignScorecardProps) {
  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Reach" value={formatNumber(performance.totalReach)} />
        <SummaryCard title="Engagement" value={formatNumber(performance.totalEngagement)} />
        <SummaryCard title="Views" value={formatNumber(performance.totalViews)} />
        <SummaryCard title="Revenue" value={formatCurrency(performance.revenueCents)} />
      </div>

      {/* Per-platform breakdown */}
      {performance.platformBreakdown.length > 0 && (
        <div>
          <h3 className="font-heading text-sm uppercase text-mid-grey mb-3">
            Platform Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mid-grey/20 text-left">
                  <th className="pb-3 font-medium text-mid-grey">Platform</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Views</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Engagement</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Reach</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mid-grey/10">
                {performance.platformBreakdown.map((p) => (
                  <tr key={p.source}>
                    <td className="py-3 pr-4 text-off-white">{formatLabel(p.source)}</td>
                    <td className="py-3 text-right text-off-white">{formatNumber(p.views)}</td>
                    <td className="py-3 text-right text-off-white">{formatNumber(p.engagement)}</td>
                    <td className="py-3 text-right text-off-white">{formatNumber(p.reach)}</td>
                    <td className="py-3 text-right text-off-white">{formatCurrency(p.revenueCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top performing asset */}
      {performance.topAsset && (
        <div>
          <h3 className="font-heading text-sm uppercase text-mid-grey mb-3">
            Top Performing Asset
          </h3>
          <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-4">
            <Link
              href={`/assets/${performance.topAsset.id}`}
              className="text-off-white hover:text-coral transition-colors font-medium"
            >
              {performance.topAsset.title}
            </Link>
            <p className="text-sm text-mid-grey mt-1">
              {formatLabel(performance.topAsset.type)} — {formatNumber(performance.topAsset.views)} views, {formatNumber(performance.topAsset.engagement)} engagements
            </p>
          </div>
        </div>
      )}

      {/* ROI section (sponsored campaigns only) */}
      {roi && (
        <div>
          <h3 className="font-heading text-sm uppercase text-mid-grey mb-3">
            Campaign ROI
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <SummaryCard title="Deal Value" value={formatCurrency(roi.dealValueCents)} />
            <SummaryCard title="Cost per Impression" value={`£${roi.costPerImpression.toFixed(4)}`} />
            <SummaryCard title="Cost per View" value={`£${roi.costPerView.toFixed(4)}`} />
            <SummaryCard title="Cost per Engagement" value={`£${roi.costPerEngagement.toFixed(4)}`} />
          </div>

          {/* Deliverables progress */}
          {roi.totalCount > 0 && (
            <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-mid-grey">Deliverables Progress</span>
                <span className="text-sm text-off-white">
                  {roi.deliveredCount} / {roi.totalCount}
                </span>
              </div>
              <div className="w-full bg-charcoal rounded-full h-2">
                <div
                  className="bg-coral h-2 rounded-full transition-all"
                  style={{ width: `${(roi.deliveredCount / roi.totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campaign comparison chart (SVG bar chart) */}
      {comparisons.length > 1 && (
        <div>
          <h3 className="font-heading text-sm uppercase text-mid-grey mb-3">
            Comparison with Similar Campaigns
          </h3>
          <ComparisonChart
            comparisons={comparisons}
            currentCampaignId={campaignId}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-4">
      <h4 className="text-xs uppercase text-mid-grey mb-1">{title}</h4>
      <p className="font-heading text-xl text-off-white">{value}</p>
    </div>
  )
}

function ComparisonChart({
  comparisons,
  currentCampaignId,
}: {
  comparisons: CampaignComparison[]
  currentCampaignId: string
}) {
  const chartWidth = 700
  const chartHeight = 280
  const barPadding = 12
  const labelHeight = 50
  const topPadding = 20
  const leftPadding = 60
  const plotWidth = chartWidth - leftPadding - 20
  const plotHeight = chartHeight - labelHeight - topPadding

  const maxViews = Math.max(...comparisons.map((c) => c.views), 1)
  const barWidth = Math.max(
    (plotWidth - barPadding * (comparisons.length - 1)) / comparisons.length,
    30,
  )

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full max-w-[700px]"
        role="img"
        aria-label="Campaign comparison bar chart"
      >
        {/* Bars */}
        {comparisons.map((c, i) => {
          const barHeight = (c.views / maxViews) * plotHeight
          const x = leftPadding + i * (barWidth + barPadding)
          const y = topPadding + plotHeight - barHeight
          const isCurrent = c.id === currentCampaignId
          const colour = isCurrent ? '#F16363' : '#4C1273'

          return (
            <g key={c.id}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colour}
                rx={3}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fill="#FAFAFA"
                fontSize={10}
                fontFamily="sans-serif"
              >
                {formatNumber(c.views)}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                fill={isCurrent ? '#F16363' : '#545559'}
                fontSize={8}
                fontFamily="sans-serif"
                fontWeight={isCurrent ? 'bold' : 'normal'}
              >
                {c.title.length > 15 ? `${c.title.slice(0, 15)}...` : c.title}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
