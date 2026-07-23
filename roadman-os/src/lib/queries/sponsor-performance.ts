import { createClient } from '@/lib/supabase/server'
import type { Sponsor, Campaign, Asset, PerformanceRecord } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SponsorWithCampaigns = Sponsor & {
  campaigns: SponsorCampaignSummary[]
}

export type SponsorCampaignSummary = {
  id: string
  title: string
  status: string
  start_date: string | null
  end_date: string | null
  assetCount: number
}

export type SponsorPerformanceSummary = {
  totalViews: number
  totalEngagement: number
  totalImpressions: number
  totalReach: number
  revenueCents: number
}

export type SponsorDeliverable = {
  name: string
  description: string | null
  status: string
  dueDate: string | null
  completedDate: string | null
}

export type SponsorContentItem = {
  id: string
  title: string
  type: string
  status: string
  views: number
  engagement: number
  publishDate: string | null
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Get all sponsors with their active campaigns.
 */
export async function getSponsorsWithCampaigns(): Promise<SponsorWithCampaigns[]> {
  const supabase = await createClient()

  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('*')
    .order('name', { ascending: true })

  if (!sponsors) return []

  const sponsorList = sponsors as Sponsor[]
  const sponsorIds = sponsorList.map((s) => s.id)

  if (sponsorIds.length === 0) return sponsorList.map((s) => ({ ...s, campaigns: [] }))

  // Get campaigns for all sponsors
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, title, status, start_date, end_date, sponsor_id')
    .in('sponsor_id', sponsorIds)
    .order('start_date', { ascending: false })

  const campaignList = (campaigns ?? []) as (Campaign & { sponsor_id: string })[]

  // Get asset counts for campaigns
  const campaignIds = campaignList.map((c) => c.id)
  const assetCountMap = new Map<string, number>()

  if (campaignIds.length > 0) {
    const { data: assets } = await supabase
      .from('assets')
      .select('campaign_id')
      .in('campaign_id', campaignIds)

    for (const a of (assets ?? []) as { campaign_id: string }[]) {
      assetCountMap.set(a.campaign_id, (assetCountMap.get(a.campaign_id) ?? 0) + 1)
    }
  }

  return sponsorList.map((sponsor) => ({
    ...sponsor,
    campaigns: campaignList
      .filter((c) => c.sponsor_id === sponsor.id)
      .map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        start_date: c.start_date,
        end_date: c.end_date,
        assetCount: assetCountMap.get(c.id) ?? 0,
      })),
  }))
}

/**
 * Get a single sponsor with full details.
 */
export async function getSponsor(id: string): Promise<Sponsor | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Sponsor
}

/**
 * Get campaigns for a specific sponsor.
 */
export async function getSponsorCampaigns(sponsorId: string): Promise<Campaign[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('sponsor_id', sponsorId)
    .order('start_date', { ascending: false })

  if (error || !data) return []
  return data as Campaign[]
}

/**
 * Get deliverables for a sponsor, parsed from the sponsor's deliverables JSON.
 */
export function parseSponsorDeliverables(sponsor: Sponsor): SponsorDeliverable[] {
  const deliverables = sponsor.deliverables ?? []

  return deliverables.map((d) => {
    const item = d as Record<string, unknown>
    return {
      name: (item.name as string) ?? 'Untitled',
      description: (item.description as string) ?? null,
      status: (item.status as string) ?? 'pending',
      dueDate: (item.due_date as string) ?? null,
      completedDate: (item.completed_date as string) ?? null,
    }
  })
}

/**
 * Get performance summary across all sponsor campaigns.
 */
export async function getSponsorPerformance(sponsorId: string): Promise<SponsorPerformanceSummary> {
  const supabase = await createClient()

  // Get campaign IDs
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('sponsor_id', sponsorId)

  const campaignIds = (campaigns ?? []).map((c: { id: string }) => c.id)

  if (campaignIds.length === 0) {
    return { totalViews: 0, totalEngagement: 0, totalImpressions: 0, totalReach: 0, revenueCents: 0 }
  }

  // Get assets for those campaigns
  const { data: assets } = await supabase
    .from('assets')
    .select('id')
    .in('campaign_id', campaignIds)

  const assetIds = (assets ?? []).map((a: { id: string }) => a.id)

  if (assetIds.length === 0) {
    return { totalViews: 0, totalEngagement: 0, totalImpressions: 0, totalReach: 0, revenueCents: 0 }
  }

  const { data: records } = await supabase
    .from('performance_records')
    .select('views, impressions, reach, likes, comments, shares, saves, revenue_cents')
    .in('asset_id', assetIds)

  const perfRecords = (records ?? []) as PerformanceRecord[]

  let totalViews = 0
  let totalEngagement = 0
  let totalImpressions = 0
  let totalReach = 0
  let revenueCents = 0

  for (const r of perfRecords) {
    totalViews += r.views ?? 0
    totalEngagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
    totalImpressions += r.impressions ?? 0
    totalReach += r.reach ?? 0
    revenueCents += r.revenue_cents ?? 0
  }

  return { totalViews, totalEngagement, totalImpressions, totalReach, revenueCents }
}

/**
 * Get content items linked to sponsor campaigns, with per-asset performance.
 */
export async function getSponsorContent(sponsorId: string): Promise<SponsorContentItem[]> {
  const supabase = await createClient()

  // Get campaign IDs
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('sponsor_id', sponsorId)

  const campaignIds = (campaigns ?? []).map((c: { id: string }) => c.id)
  if (campaignIds.length === 0) return []

  // Get assets
  const { data: assets } = await supabase
    .from('assets')
    .select('id, title, type, status, publish_date')
    .in('campaign_id', campaignIds)
    .order('publish_date', { ascending: false })

  const assetList = (assets ?? []) as Asset[]
  if (assetList.length === 0) return []

  const assetIds = assetList.map((a) => a.id)

  // Get performance records
  const { data: records } = await supabase
    .from('performance_records')
    .select('asset_id, views, likes, comments, shares, saves')
    .in('asset_id', assetIds)

  const perfRecords = (records ?? []) as PerformanceRecord[]

  const metricsMap = new Map<string, { views: number; engagement: number }>()
  for (const r of perfRecords) {
    if (!r.asset_id) continue
    const existing = metricsMap.get(r.asset_id) ?? { views: 0, engagement: 0 }
    existing.views += r.views ?? 0
    existing.engagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
    metricsMap.set(r.asset_id, existing)
  }

  return assetList.map((a) => {
    const metrics = metricsMap.get(a.id) ?? { views: 0, engagement: 0 }
    return {
      id: a.id,
      title: a.title,
      type: a.type,
      status: a.status,
      views: metrics.views,
      engagement: metrics.engagement,
      publishDate: a.publish_date,
    }
  })
}
