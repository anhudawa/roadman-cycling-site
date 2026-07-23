import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { MetricCard } from '@/components/performance/MetricCard'
import { PlatformChart } from '@/components/performance/PlatformChart'
import { ClassificationBadge } from '@/components/performance/ClassificationBadge'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getPerformanceOverview,
  getPlatformComparison,
  getTopContent,
  parsePeriod,
} from '@/lib/queries/performance'

export const metadata = {
  title: 'Performance Dashboard — Roadman OS',
}

interface PerformancePageProps {
  searchParams: {
    period?: string
    from?: string
    to?: string
  }
}

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
] as const

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

export default async function PerformancePage({ searchParams }: PerformancePageProps) {
  const period = searchParams.period ?? '30d'

  // Support custom date range via from/to params
  const dateRange =
    searchParams.from && searchParams.to
      ? { from: searchParams.from, to: searchParams.to }
      : parsePeriod(period)

  const [overview, platformData, topContent] = await Promise.all([
    getPerformanceOverview(dateRange),
    getPlatformComparison(dateRange),
    getTopContent(dateRange, 10),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Performance"
        description="Content performance across all platforms"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/performance/sponsors"
              className="text-sm text-coral hover:text-coral/80 transition-colors mr-4"
            >
              Sponsor Reports
            </Link>
            <Link
              href="/performance/decay"
              className="text-sm text-coral hover:text-coral/80 transition-colors mr-4"
            >
              Decay Alerts
            </Link>
          </div>
        }
      />

      {/* Time period selector */}
      <div className="flex items-center gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/performance?period=${p.value}`}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              period === p.value
                ? 'bg-coral text-off-white'
                : 'bg-deep-purple/20 text-mid-grey hover:text-off-white hover:bg-deep-purple/40'
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={formatNumber(overview.totalViews)}
          trend={overview.viewsTrend}
        />
        <MetricCard
          title="Total Engagement"
          value={formatNumber(overview.totalEngagement)}
          trend={overview.engagementTrend}
        />
        <MetricCard
          title="Subscriber Growth"
          value={formatNumber(overview.subscriberGrowth)}
          trend={overview.subscriberTrend}
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(overview.revenueCents)}
          trend={overview.revenueTrend}
        />
      </div>

      {/* Platform comparison chart */}
      <div>
        <h2 className="font-heading text-lg uppercase text-off-white mb-4">
          Views by Platform
        </h2>
        <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-6">
          <PlatformChart data={platformData} />
        </div>
      </div>

      {/* Top content table */}
      <div>
        <h2 className="font-heading text-lg uppercase text-off-white mb-4">
          Top Content
        </h2>
        {topContent.length === 0 ? (
          <EmptyState
            title="No performance data yet"
            description="Performance records will appear here once content is published and metrics are synced."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mid-grey/20 text-left">
                  <th className="pb-3 font-medium text-mid-grey">Title</th>
                  <th className="pb-3 font-medium text-mid-grey">Type</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Views</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Engagement</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Revenue</th>
                  <th className="pb-3 font-medium text-mid-grey text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mid-grey/10">
                {topContent.map((item) => (
                  <tr key={item.asset_id} className="group">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/assets/${item.asset_id}`}
                        className="text-off-white hover:text-coral transition-colors"
                      >
                        {item.asset_title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="default" size="sm">
                        {formatLabel(item.asset_type)}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-off-white">
                      {formatNumber(item.views)}
                    </td>
                    <td className="py-3 text-right text-off-white">
                      {formatNumber(item.engagement)}
                    </td>
                    <td className="py-3 text-right text-off-white">
                      {formatCurrency(item.revenueCents)}
                    </td>
                    <td className="py-3 text-center">
                      <ClassificationBadge classification={item.classification} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
