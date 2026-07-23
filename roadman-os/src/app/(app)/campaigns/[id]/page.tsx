import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Pencil } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  getCampaign,
  getAssetsByCampaign,
  getTasksByCampaign,
  getPublicationsByCampaign,
  getActivityByCampaign,
} from '@/lib/queries/campaigns'
import {
  getCampaignPerformance,
  getCampaignROI,
  compareCampaigns,
} from '@/lib/queries/campaign-performance'
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES, CONTENT_PILLARS } from '@/lib/constants'
import { CampaignArchiveButton } from '@/components/campaigns/CampaignArchiveButton'
import { CampaignTabs } from '@/components/campaigns/CampaignTabs'

export const metadata = {
  title: 'Campaign Detail — Roadman OS',
}

interface CampaignDetailPageProps {
  params: { id: string }
}

/** Map status values to badge colour variants. */
const statusVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red' | 'purple'> = {
  draft: 'grey',
  planned: 'blue',
  active: 'green',
  completed: 'purple',
  cancelled: 'red',
}

const typeVariant: Record<string, 'coral' | 'purple' | 'amber' | 'blue' | 'green' | 'grey' | 'default'> = {
  weekly_focus: 'coral',
  product_launch: 'purple',
  sponsor_campaign: 'amber',
  event_promotion: 'blue',
  seasonal: 'green',
  evergreen: 'default',
  ad_hoc: 'grey',
}

const pillarVariant: Record<string, 'blue' | 'green' | 'amber' | 'purple' | 'coral'> = {
  coaching: 'blue',
  nutrition: 'green',
  strength_and_conditioning: 'amber',
  recovery: 'purple',
  le_metier: 'coral',
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const [campaign, assets, tasks, publications, activity] = await Promise.all([
    getCampaign(params.id),
    getAssetsByCampaign(params.id),
    getTasksByCampaign(params.id),
    getPublicationsByCampaign(params.id),
    getActivityByCampaign(params.id),
  ])

  // Fetch performance data in parallel (for the Performance tab)
  const performancePromise = getCampaignPerformance(params.id)
  const roiPromise = campaign?.sponsor_id ? getCampaignROI(params.id) : Promise.resolve(null)
  const comparisonsPromise = campaign ? compareCampaigns(params.id, campaign.type) : Promise.resolve([])

  const [performance, roi, comparisons] = await Promise.all([
    performancePromise,
    roiPromise,
    comparisonsPromise,
  ])

  if (!campaign) {
    notFound()
  }

  const meta = (campaign.metadata ?? {}) as Record<string, unknown>
  const goals = (meta.goals as string[]) ?? []
  const keyMessages = (meta.key_messages as string[]) ?? []
  const pillar = meta.pillar as string | undefined
  const notes = meta.notes as string | undefined
  const targetAudience = meta.target_audience as string | undefined
  const ctaUrl = meta.cta_url as string | undefined
  const ctaText = meta.cta_text as string | undefined
  const colour = meta.colour as string | undefined
  const typeLabel = CAMPAIGN_TYPES.find((t) => t.value === campaign.type)?.label ?? campaign.type
  const statusLabel = CAMPAIGN_STATUSES.find((s) => s.value === campaign.status)?.label ?? campaign.status
  const pillarLabel = pillar
    ? CONTENT_PILLARS.find((p) => p.value === pillar)?.label ?? pillar
    : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title={campaign.title}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/campaigns/${params.id}/edit`}>
              <Button variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />}>
                Edit
              </Button>
            </Link>
            <CampaignArchiveButton campaignId={params.id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={typeVariant[campaign.type] ?? 'default'} size="md">
              {typeLabel}
            </Badge>
            <Badge variant={statusVariant[campaign.status] ?? 'default'} size="md">
              {statusLabel}
            </Badge>
            {pillarLabel && (
              <Badge variant={pillarVariant[pillar!] ?? 'default'} size="md">
                {pillarLabel}
              </Badge>
            )}
            {campaign.start_date && campaign.end_date && (
              <span className="text-sm text-mid-grey">
                {format(parseISO(campaign.start_date), 'd MMM yyyy')}
                {' — '}
                {format(parseISO(campaign.end_date), 'd MMM yyyy')}
              </span>
            )}
          </div>

          {/* Description */}
          {campaign.description && (
            <div>
              <h3 className="font-heading text-sm uppercase text-mid-grey mb-1">
                Description
              </h3>
              <p className="text-off-white">{campaign.description}</p>
            </div>
          )}

          {/* Primary goal */}
          {campaign.goal && (
            <div>
              <h3 className="font-heading text-sm uppercase text-mid-grey mb-1">
                Primary Goal
              </h3>
              <p className="text-off-white">{campaign.goal}</p>
            </div>
          )}

          {/* Goals list (numbered) */}
          {goals.length > 0 && (
            <div>
              <h3 className="font-heading text-sm uppercase text-mid-grey mb-2">
                Goals
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-off-white">
                {goals.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Key messages */}
          {keyMessages.length > 0 && (
            <div>
              <h3 className="font-heading text-sm uppercase text-mid-grey mb-2">
                Key Messages
              </h3>
              <ul className="list-disc list-inside space-y-1 text-off-white">
                {keyMessages.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          {(ctaUrl || ctaText) && (
            <div>
              <h3 className="font-heading text-sm uppercase text-mid-grey mb-1">
                Call to Action
              </h3>
              <p className="text-off-white">
                {ctaText}
                {ctaUrl && (
                  <>
                    {' — '}
                    <a
                      href={ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral hover:underline"
                    >
                      {ctaUrl}
                    </a>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div>
              <h3 className="font-heading text-sm uppercase text-mid-grey mb-1">
                Notes
              </h3>
              <p className="text-off-white whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-mid-grey/20 bg-deep-purple/10 p-4 space-y-4">
            {/* Dates */}
            {campaign.start_date && (
              <div>
                <h4 className="text-xs uppercase text-mid-grey mb-0.5">Start Date</h4>
                <p className="text-sm text-off-white">
                  {format(parseISO(campaign.start_date), 'd MMM yyyy')}
                </p>
              </div>
            )}
            {campaign.end_date && (
              <div>
                <h4 className="text-xs uppercase text-mid-grey mb-0.5">End Date</h4>
                <p className="text-sm text-off-white">
                  {format(parseISO(campaign.end_date), 'd MMM yyyy')}
                </p>
              </div>
            )}

            {/* Owner */}
            {campaign.owner && (
              <div>
                <h4 className="text-xs uppercase text-mid-grey mb-0.5">Owner</h4>
                <p className="text-sm text-off-white">{campaign.owner.full_name}</p>
              </div>
            )}

            {/* Target Audience */}
            {targetAudience && (
              <div>
                <h4 className="text-xs uppercase text-mid-grey mb-0.5">Target Audience</h4>
                <p className="text-sm text-off-white">{targetAudience}</p>
              </div>
            )}

            {/* Sponsor link */}
            {campaign.sponsor_id && (
              <div>
                <h4 className="text-xs uppercase text-mid-grey mb-0.5">Sponsor</h4>
                <Link
                  href={`/sponsors/${campaign.sponsor_id}`}
                  className="text-sm text-coral hover:underline"
                >
                  View Sponsor
                </Link>
              </div>
            )}

            {/* Product link */}
            {campaign.product_id && (
              <div>
                <h4 className="text-xs uppercase text-mid-grey mb-0.5">Product</h4>
                <Link
                  href={`/products/${campaign.product_id}`}
                  className="text-sm text-coral hover:underline"
                >
                  View Product
                </Link>
              </div>
            )}

            {/* Colour swatch */}
            {colour && (
              <div>
                <h4 className="text-xs uppercase text-mid-grey mb-0.5">Colour</h4>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-5 w-5 rounded-md border border-mid-grey/20"
                    style={{ backgroundColor: colour }}
                  />
                  <span className="text-sm text-off-white">{colour}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <CampaignTabs
        campaignId={params.id}
        assets={assets}
        tasks={tasks}
        publications={publications}
        activity={activity}
        performance={performance}
        roi={roi}
        comparisons={comparisons}
      />
    </div>
  )
}
