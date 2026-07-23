import { createClient } from '@/lib/supabase/server'
import type { PerformanceRecord, Asset, Campaign } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CampaignPerformanceSummary = {
  totalReach: number
  totalEngagement: number
  totalViews: number
  revenueCents: number
  platformBreakdown: PlatformBreakdown[]
  topAsset: TopCampaignAsset | null
}

export type PlatformBreakdown = {
  source: string
  views: number
  engagement: number
  reach: number
  revenueCents: number
}

export type TopCampaignAsset = {
  id: string
  title: string
  type: string
  views: number
  engagement: number
}

export type CampaignROI = {
  dealValueCents: number
  totalImpressions: number
  totalViews: number
  totalEngagement: number
  costPerImpression: number
  costPerView: number
  costPerEngagement: number
  deliverables: Record<string, unknown>[]
  deliveredCount: number
  totalCount: number
}

export type CampaignComparison = {
  id: string
  title: string
  views: number
  engagement: number
  reach: number
  revenueCents: number
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Get aggregated performance for a campaign by looking up all its assets'
 * performance records.
 */
export async function getCampaignPerformance(campaignId: string): Promise<CampaignPerformanceSummary> {
  const supabase = await createClient()

  // Get assets for campaign
  const { data: assets } = await supabase
    .from('assets')
    .select('id, title, type')
    .eq('campaign_id', campaignId)

  const assetList = (assets ?? []) as Asset[]
  const assetIds = assetList.map((a) => a.id)

  if (assetIds.length === 0) {
    return {
      totalReach: 0,
      totalEngagement: 0,
      totalViews: 0,
      revenueCents: 0,
      platformBreakdown: [],
      topAsset: null,
    }
  }

  // Get performance records for those assets
  const { data: records } = await supabase
    .from('performance_records')
    .select('*')
    .in('asset_id', assetIds)

  const perfRecords = (records ?? []) as PerformanceRecord[]

  // Aggregate totals
  let totalReach = 0
  let totalEngagement = 0
  let totalViews = 0
  let revenueCents = 0

  const byPlatform = new Map<string, PlatformBreakdown>()
  const byAsset = new Map<string, { views: number; engagement: number }>()

  for (const r of perfRecords) {
    totalReach += r.reach ?? 0
    totalEngagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
    totalViews += r.views ?? 0
    revenueCents += r.revenue_cents ?? 0

    // Platform breakdown
    const existing = byPlatform.get(r.source) ?? {
      source: r.source,
      views: 0,
      engagement: 0,
      reach: 0,
      revenueCents: 0,
    }
    existing.views += r.views ?? 0
    existing.engagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
    existing.reach += r.reach ?? 0
    existing.revenueCents += r.revenue_cents ?? 0
    byPlatform.set(r.source, existing)

    // Per-asset aggregation
    if (r.asset_id) {
      const assetMetrics = byAsset.get(r.asset_id) ?? { views: 0, engagement: 0 }
      assetMetrics.views += r.views ?? 0
      assetMetrics.engagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
      byAsset.set(r.asset_id, assetMetrics)
    }
  }

  // Find top performing asset
  let topAsset: TopCampaignAsset | null = null
  let maxViews = 0
  for (const [assetId, metrics] of byAsset.entries()) {
    if (metrics.views > maxViews) {
      maxViews = metrics.views
      const asset = assetList.find((a) => a.id === assetId)
      topAsset = {
        id: assetId,
        title: asset?.title ?? 'Unknown',
        type: asset?.type ?? 'other',
        views: metrics.views,
        engagement: metrics.engagement,
      }
    }
  }

  return {
    totalReach,
    totalEngagement,
    totalViews,
    revenueCents,
    platformBreakdown: Array.from(byPlatform.values()).sort((a, b) => b.views - a.views),
    topAsset,
  }
}

/**
 * Calculate ROI for a sponsored campaign.
 * Pulls deal value from the sponsor record linked via the campaign.
 */
export async function getCampaignROI(campaignId: string): Promise<CampaignROI | null> {
  const supabase = await createClient()

  // Get campaign with sponsor
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, sponsor:sponsors(*)')
    .eq('id', campaignId)
    .single()

  if (!campaign) return null

  const campaignRow = campaign as Campaign & { sponsor?: { deal_value_cents: number | null; deliverables: Record<string, unknown>[] } | null }
  const sponsor = campaignRow.sponsor

  if (!sponsor || !sponsor.deal_value_cents) return null

  const dealValueCents = sponsor.deal_value_cents

  // Get total impressions/views/engagement
  const { data: assets } = await supabase
    .from('assets')
    .select('id')
    .eq('campaign_id', campaignId)

  const assetIds = (assets ?? []).map((a: { id: string }) => a.id)

  if (assetIds.length === 0) {
    return {
      dealValueCents,
      totalImpressions: 0,
      totalViews: 0,
      totalEngagement: 0,
      costPerImpression: 0,
      costPerView: 0,
      costPerEngagement: 0,
      deliverables: sponsor.deliverables ?? [],
      deliveredCount: 0,
      totalCount: (sponsor.deliverables ?? []).length,
    }
  }

  const { data: records } = await supabase
    .from('performance_records')
    .select('impressions, views, likes, comments, shares, saves')
    .in('asset_id', assetIds)

  const perfRecords = (records ?? []) as PerformanceRecord[]

  let totalImpressions = 0
  let totalViews = 0
  let totalEngagement = 0

  for (const r of perfRecords) {
    totalImpressions += r.impressions ?? 0
    totalViews += r.views ?? 0
    totalEngagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
  }

  const dealValue = dealValueCents / 100

  // Count delivered items
  const deliverables = sponsor.deliverables ?? []
  const deliveredCount = deliverables.filter(
    (d) => (d as Record<string, unknown>).status === 'delivered' || (d as Record<string, unknown>).completed === true,
  ).length

  return {
    dealValueCents,
    totalImpressions,
    totalViews,
    totalEngagement,
    costPerImpression: totalImpressions > 0 ? dealValue / totalImpressions : 0,
    costPerView: totalViews > 0 ? dealValue / totalViews : 0,
    costPerEngagement: totalEngagement > 0 ? dealValue / totalEngagement : 0,
    deliverables,
    deliveredCount,
    totalCount: deliverables.length,
  }
}

/**
 * Compare a campaign with other campaigns of the same type.
 * Returns performance data for each campaign.
 */
export async function compareCampaigns(campaignId: string, campaignType: string): Promise<CampaignComparison[]> {
  const supabase = await createClient()

  // Get campaigns of the same type (limit to 5 most recent)
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, title')
    .eq('type', campaignType)
    .order('start_date', { ascending: false })
    .limit(5)

  if (!campaigns || campaigns.length === 0) return []

  const results: CampaignComparison[] = []

  for (const c of campaigns as Campaign[]) {
    // Get assets for this campaign
    const { data: assets } = await supabase
      .from('assets')
      .select('id')
      .eq('campaign_id', c.id)

    const assetIds = (assets ?? []).map((a: { id: string }) => a.id)

    let views = 0
    let engagement = 0
    let reach = 0
    let revenueCents = 0

    if (assetIds.length > 0) {
      const { data: records } = await supabase
        .from('performance_records')
        .select('views, likes, comments, shares, saves, reach, revenue_cents')
        .in('asset_id', assetIds)

      for (const r of (records ?? []) as PerformanceRecord[]) {
        views += r.views ?? 0
        engagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
        reach += r.reach ?? 0
        revenueCents += r.revenue_cents ?? 0
      }
    }

    results.push({
      id: c.id,
      title: c.title,
      views,
      engagement,
      reach,
      revenueCents,
    })
  }

  return results
}
