import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { getSponsorsWithCampaigns } from '@/lib/queries/sponsor-performance'

export const metadata = {
  title: 'Sponsor Reports — Roadman OS',
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

const campaignStatusVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red'> = {
  draft: 'grey',
  planned: 'blue',
  active: 'green',
  completed: 'grey',
  cancelled: 'red',
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function SponsorReportsPage() {
  const sponsors = await getSponsorsWithCampaigns()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sponsor Reports"
        description="Active sponsors and campaign performance"
        actions={
          <Link
            href="/performance"
            className="text-sm text-coral hover:text-coral/80 transition-colors"
          >
            Back to Performance
          </Link>
        }
      />

      {sponsors.length === 0 ? (
        <EmptyState
          title="No sponsors yet"
          description="Sponsors will appear here once they are added to the system."
        />
      ) : (
        <div className="space-y-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link
                    href={`/performance/sponsors/${sponsor.id}`}
                    className="font-heading text-lg text-off-white hover:text-coral transition-colors"
                  >
                    {sponsor.name}
                  </Link>
                  {sponsor.contact_name && (
                    <p className="text-sm text-mid-grey mt-0.5">
                      {sponsor.contact_name}
                      {sponsor.contact_email && ` — ${sponsor.contact_email}`}
                    </p>
                  )}
                </div>
                <Badge variant={statusVariant[sponsor.status] ?? 'default'} size="md">
                  {formatLabel(sponsor.status)}
                </Badge>
              </div>

              {sponsor.deal_value_cents !== null && sponsor.deal_value_cents > 0 && (
                <p className="text-sm text-off-white mb-3">
                  Deal value: <span className="font-medium">£{(sponsor.deal_value_cents / 100).toFixed(2)}</span>
                </p>
              )}

              {/* Campaigns */}
              {sponsor.campaigns.length > 0 ? (
                <div>
                  <h4 className="text-xs uppercase text-mid-grey mb-2">Campaigns</h4>
                  <div className="space-y-2">
                    {sponsor.campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between rounded-lg bg-charcoal/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="text-sm text-off-white hover:text-coral transition-colors"
                          >
                            {campaign.title}
                          </Link>
                          <Badge
                            variant={campaignStatusVariant[campaign.status] ?? 'default'}
                            size="sm"
                          >
                            {formatLabel(campaign.status)}
                          </Badge>
                        </div>
                        <span className="text-xs text-mid-grey">
                          {campaign.assetCount} asset{campaign.assetCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-mid-grey">No campaigns linked</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
