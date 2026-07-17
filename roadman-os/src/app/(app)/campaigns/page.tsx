import Link from 'next/link'
import { Plus, Megaphone } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { getCampaigns, getAssetCountsByCampaigns } from '@/lib/queries/campaigns'
import { CampaignFiltersBar } from '@/components/campaigns/CampaignFiltersBar'
import { CampaignCard } from '@/components/campaigns/CampaignCard'
import type { CampaignCardData } from '@/components/campaigns/CampaignCard'

export const metadata = {
  title: 'Campaigns — Roadman OS',
}

interface CampaignsPageProps {
  searchParams: { type?: string; status?: string; search?: string; pillar?: string }
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const campaigns = await getCampaigns({
    type: searchParams.type,
    status: searchParams.status,
    search: searchParams.search,
    pillar: searchParams.pillar,
  })

  // Fetch asset counts for all campaigns in one query
  const campaignIds = campaigns.map((c) => c.id)
  const assetCounts = await getAssetCountsByCampaigns(campaignIds)

  // Map to card data
  const cards: CampaignCardData[] = campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    type: campaign.type,
    status: campaign.status,
    start_date: campaign.start_date,
    end_date: campaign.end_date,
    metadata: campaign.metadata ?? {},
    owner_name: campaign.owner?.full_name ?? null,
    asset_count: assetCounts[campaign.id] ?? 0,
  }))

  const hasFilters = searchParams.type || searchParams.status || searchParams.search || searchParams.pillar

  return (
    <div>
      <PageHeader
        title="All Campaigns"
        description="Manage your content campaigns and weekly focuses."
        actions={
          <Link href="/campaigns/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              New Campaign
            </Button>
          </Link>
        }
      />

      <CampaignFiltersBar />

      {cards.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-12 h-12" />}
          title={hasFilters ? 'No campaigns match your filters' : 'No campaigns yet'}
          description={
            hasFilters
              ? 'Try adjusting your filters or search term.'
              : 'Create your first campaign to start organising your content.'
          }
          action={
            !hasFilters ? (
              <Link href="/campaigns/new">
                <Button icon={<Plus className="h-4 w-4" />}>
                  New Campaign
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <CampaignCard key={card.id} campaign={card} />
          ))}
        </div>
      )}
    </div>
  )
}
