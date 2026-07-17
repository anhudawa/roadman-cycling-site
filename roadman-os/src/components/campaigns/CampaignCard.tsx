import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/Badge'
import { CAMPAIGN_TYPES, CAMPAIGN_STATUSES, CONTENT_PILLARS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Badge variant maps
// ---------------------------------------------------------------------------

const statusVariant: Record<string, 'green' | 'blue' | 'amber' | 'grey' | 'red' | 'purple' | 'default'> = {
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

const pillarVariant: Record<string, 'blue' | 'green' | 'amber' | 'purple' | 'coral' | 'default'> = {
  coaching: 'blue',
  nutrition: 'green',
  strength_and_conditioning: 'amber',
  recovery: 'purple',
  le_metier: 'coral',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CampaignCardData {
  id: string
  title: string
  type: string
  status: string
  start_date: string | null
  end_date: string | null
  metadata: Record<string, unknown>
  owner_name: string | null
  asset_count: number
}

interface CampaignCardProps {
  campaign: CampaignCardData
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CampaignCard({ campaign }: CampaignCardProps) {
  const meta = campaign.metadata ?? {}
  const colour = meta.colour as string | undefined
  const pillar = meta.pillar as string | undefined

  const typeLabel = CAMPAIGN_TYPES.find((t) => t.value === campaign.type)?.label ?? campaign.type
  const statusLabel = CAMPAIGN_STATUSES.find((s) => s.value === campaign.status)?.label ?? campaign.status
  const pillarLabel = pillar
    ? CONTENT_PILLARS.find((p) => p.value === pillar)?.label ?? pillar
    : null

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group block rounded-xl border border-mid-grey/20 bg-charcoal overflow-hidden hover:border-coral/30 transition-colors"
    >
      {/* Colour stripe */}
      {colour && (
        <div className="h-1.5 w-full" style={{ backgroundColor: colour }} />
      )}

      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="font-heading text-lg uppercase text-off-white group-hover:text-coral transition-colors truncate">
          {campaign.title}
        </h3>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={typeVariant[campaign.type] ?? 'default'} size="sm">
            {typeLabel}
          </Badge>
          <Badge variant={statusVariant[campaign.status] ?? 'default'} size="sm">
            {statusLabel}
          </Badge>
          {pillarLabel && (
            <Badge variant={pillarVariant[pillar!] ?? 'default'} size="sm">
              {pillarLabel}
            </Badge>
          )}
        </div>

        {/* Date range */}
        {campaign.start_date && campaign.end_date && (
          <p className="text-xs text-mid-grey">
            {format(parseISO(campaign.start_date), 'd MMM yyyy')}
            {' — '}
            {format(parseISO(campaign.end_date), 'd MMM yyyy')}
          </p>
        )}

        {/* Footer: owner + asset count */}
        <div className="flex items-center justify-between text-xs text-mid-grey pt-1">
          <span>{campaign.owner_name ?? 'Unassigned'}</span>
          <span>
            {campaign.asset_count} {campaign.asset_count === 1 ? 'asset' : 'assets'}
          </span>
        </div>
      </div>
    </Link>
  )
}
