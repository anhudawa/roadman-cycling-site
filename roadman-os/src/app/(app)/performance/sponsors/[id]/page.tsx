import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getSponsor,
  getSponsorPerformance,
  getSponsorContent,
  parseSponsorDeliverables,
} from '@/lib/queries/sponsor-performance'

export const metadata = {
  title: 'Sponsor Detail — Roadman OS',
}

interface SponsorDetailPageProps {
  params: { id: string }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatCurrency(cents: number): string {
  return `£${(cents / 100).toFixed(2)}`
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const statusVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red' | 'purple'> = {
  prospect: 'grey',
  contacted: 'blue',
  negotiating: 'amber',
  active: 'green',
  paused: 'purple',
  completed: 'grey',
  lost: 'red',
}

const deliverableStatusVariant: Record<string, 'green' | 'amber' | 'grey' | 'red'> = {
  delivered: 'green',
  completed: 'green',
  in_progress: 'amber',
  pending: 'grey',
  overdue: 'red',
}

export default async function SponsorDetailPage({ params }: SponsorDetailPageProps) {
  const [sponsor, performance, content] = await Promise.all([
    getSponsor(params.id),
    getSponsorPerformance(params.id),
    getSponsorContent(params.id),
  ])

  if (!sponsor) {
    notFound()
  }

  const deliverables = parseSponsorDeliverables(sponsor)
  const deliveredCount = deliverables.filter(
    (d) => d.status === 'delivered' || d.status === 'completed',
  ).length
  const progressPercent = deliverables.length > 0
    ? Math.round((deliveredCount / deliverables.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={sponsor.name}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href={`/api/reports/sponsor/${params.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                Export Report
              </Button>
            </Link>
            <Link href="/performance/sponsors">
              <Button variant="outline" size="sm">
                Back to Sponsors
              </Button>
            </Link>
          </div>
        }
      />

      {/* Sponsor info + status */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={statusVariant[sponsor.status] ?? 'default'} size="md">
          {formatLabel(sponsor.status)}
        </Badge>
        {sponsor.deal_value_cents !== null && sponsor.deal_value_cents > 0 && (
          <span className="text-sm text-off-white">
            Deal value: <span className="font-medium">{formatCurrency(sponsor.deal_value_cents)}</span>
          </span>
        )}
        {sponsor.contract_start && sponsor.contract_end && (
          <span className="text-sm text-mid-grey">
            {sponsor.contract_start} to {sponsor.contract_end}
          </span>
        )}
      </div>

      {/* Deliverables tracker */}
      {deliverables.length > 0 && (
        <div>
          <h2 className="font-heading text-lg uppercase text-off-white mb-4">
            Deliverables
          </h2>
          <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-5 space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-mid-grey">Overall Progress</span>
                <span className="text-sm text-off-white font-medium">
                  {deliveredCount} / {deliverables.length} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-charcoal rounded-full h-3">
                <div
                  className="bg-coral h-3 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Deliverables list */}
            <div className="space-y-2">
              {deliverables.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-charcoal/30 px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-off-white">{d.name}</p>
                    {d.description && (
                      <p className="text-xs text-mid-grey mt-0.5">{d.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {d.dueDate && (
                      <span className="text-xs text-mid-grey">Due: {d.dueDate}</span>
                    )}
                    <Badge
                      variant={deliverableStatusVariant[d.status] ?? 'grey'}
                      size="sm"
                    >
                      {formatLabel(d.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance summary */}
      <div>
        <h2 className="font-heading text-lg uppercase text-off-white mb-4">
          Performance Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricBox title="Views" value={formatNumber(performance.totalViews)} />
          <MetricBox title="Engagement" value={formatNumber(performance.totalEngagement)} />
          <MetricBox title="Impressions" value={formatNumber(performance.totalImpressions)} />
          <MetricBox title="Reach" value={formatNumber(performance.totalReach)} />
          <MetricBox title="Revenue" value={formatCurrency(performance.revenueCents)} />
        </div>
      </div>

      {/* Content list */}
      <div>
        <h2 className="font-heading text-lg uppercase text-off-white mb-4">
          Content
        </h2>
        {content.length === 0 ? (
          <EmptyState
            title="No content linked to this sponsor"
            description="Assets from sponsor campaigns will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mid-grey/20 text-left">
                  <th className="pb-3 font-medium text-mid-grey">Title</th>
                  <th className="pb-3 font-medium text-mid-grey">Type</th>
                  <th className="pb-3 font-medium text-mid-grey">Status</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Views</th>
                  <th className="pb-3 font-medium text-mid-grey text-right">Engagement</th>
                  <th className="pb-3 font-medium text-mid-grey">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mid-grey/10">
                {content.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/assets/${item.id}`}
                        className="text-off-white hover:text-coral transition-colors"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="default" size="sm">
                        {formatLabel(item.type)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={item.status === 'published' ? 'green' : 'grey'} size="sm">
                        {formatLabel(item.status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-off-white">
                      {formatNumber(item.views)}
                    </td>
                    <td className="py-3 text-right text-off-white">
                      {formatNumber(item.engagement)}
                    </td>
                    <td className="py-3 text-mid-grey">
                      {item.publishDate ?? '—'}
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

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function MetricBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-4">
      <h4 className="text-xs uppercase text-mid-grey mb-1">{title}</h4>
      <p className="font-heading text-xl text-off-white">{value}</p>
    </div>
  )
}
