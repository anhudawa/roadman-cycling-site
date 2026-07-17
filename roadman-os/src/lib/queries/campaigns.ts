import { createClient } from '@/lib/supabase/server'
import type { Campaign, CampaignType, CampaignStatus, Profile } from '@/types/database'

export type CampaignWithOwner = Campaign & {
  owner: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export type CampaignFilters = {
  type?: string
  status?: string
  pillar?: string
  search?: string
}

/**
 * Fetch a single campaign by ID with the owner profile joined.
 */
export async function getCampaign(id: string): Promise<CampaignWithOwner | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select('*, owner:profiles!campaigns_owner_id_fkey(id, full_name, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as CampaignWithOwner
}

/**
 * Fetch a filtered list of campaigns, excluding archived ones.
 * Ordered by start_date descending (newest first).
 */
export async function getCampaigns(
  filters?: CampaignFilters,
): Promise<CampaignWithOwner[]> {
  const supabase = await createClient()

  let query = supabase
    .from('campaigns')
    .select('*, owner:profiles!campaigns_owner_id_fkey(id, full_name, avatar_url)')
    .order('start_date', { ascending: false, nullsFirst: false })

  // Exclude archived campaigns (archived_at stored in metadata)
  query = query.or('metadata->archived_at.is.null,metadata.not.cs.{"archived_at":true}')

  if (filters?.type) {
    query = query.eq('type', filters.type as CampaignType)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status as CampaignStatus)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  // Pillar is stored in metadata so we filter client-side after fetch
  const { data, error } = await query

  if (error || !data) return []

  let campaigns = data as unknown as CampaignWithOwner[]

  // Client-side pillar filter (stored in metadata)
  if (filters?.pillar) {
    campaigns = campaigns.filter(
      (c) => (c.metadata as Record<string, unknown>)?.pillar === filters.pillar,
    )
  }

  return campaigns
}

/**
 * Fetch all non-archived campaigns (any status).
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('start_date', { ascending: false, nullsFirst: false })

  if (error || !data) return []

  // Exclude archived
  return (data as Campaign[]).filter(
    (c) => !(c.metadata as Record<string, unknown>)?.archived_at,
  )
}

/**
 * Get the current weekly focus campaign — active, type = weekly_focus,
 * where today falls within start_date..end_date.
 */
export async function getCurrentWeeklyFocus(): Promise<Campaign | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('type', 'weekly_focus')
    .eq('status', 'active')
    .lte('start_date', today)
    .gte('end_date', today)
    .limit(1)
    .single()

  if (error || !data) return null
  return data as Campaign
}

/**
 * Fetch all active profiles for use in owner dropdowns.
 */
export async function getProfiles(): Promise<Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .eq('is_active', true)
    .order('full_name')

  if (error || !data) return []
  return data
}

/**
 * Fetch asset counts grouped by campaign_id.
 * Returns a map of campaignId → count.
 */
export async function getAssetCountsByCampaigns(
  campaignIds: string[],
): Promise<Record<string, number>> {
  if (campaignIds.length === 0) return {}

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assets')
    .select('campaign_id')
    .in('campaign_id', campaignIds)

  if (error || !data) return {}

  const counts: Record<string, number> = {}
  for (const row of data) {
    const cid = row.campaign_id as string
    counts[cid] = (counts[cid] ?? 0) + 1
  }
  return counts
}

// -------------------------------------------------------------------------
// Campaign detail queries (Ticket 9)
// -------------------------------------------------------------------------

export type CampaignAsset = {
  id: string
  title: string
  type: string
  status: string
  assignee: Pick<Profile, 'id' | 'full_name'> | null
}

/**
 * Fetch assets linked to a campaign.
 */
export async function getAssetsByCampaign(campaignId: string): Promise<CampaignAsset[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assets')
    .select('id, title, type, status, assignee:profiles!assets_assignee_id_fkey(id, full_name)')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as unknown as CampaignAsset[]
}

export type CampaignTask = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  assignee: Pick<Profile, 'id' | 'full_name'> | null
}

/**
 * Fetch tasks linked to a campaign.
 */
export async function getTasksByCampaign(campaignId: string): Promise<CampaignTask[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, assignee:profiles!tasks_assignee_id_fkey(id, full_name)')
    .eq('campaign_id', campaignId)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data as unknown as CampaignTask[]
}

export type CampaignPublication = {
  id: string
  asset_title: string
  platform_name: string
  scheduled_at: string | null
  published_at: string | null
  status: string
}

/**
 * Fetch publications linked to a campaign via assets.
 * Publications don't reference campaign_id directly — they link through assets.
 */
export async function getPublicationsByCampaign(campaignId: string): Promise<CampaignPublication[]> {
  const supabase = await createClient()

  // First get asset IDs for this campaign
  const { data: assets, error: assetsError } = await supabase
    .from('assets')
    .select('id')
    .eq('campaign_id', campaignId)

  if (assetsError || !assets || assets.length === 0) return []

  const assetIds = assets.map((a) => a.id)

  const { data, error } = await supabase
    .from('publications')
    .select('id, status, scheduled_at, published_at, asset:assets!publications_asset_id_fkey(title), platform:platforms!publications_platform_id_fkey(name)')
    .in('asset_id', assetIds)
    .order('scheduled_at', { ascending: false, nullsFirst: false })

  if (error || !data) return []

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    asset_title: (row.asset as Record<string, unknown>)?.title as string ?? 'Untitled',
    platform_name: (row.platform as Record<string, unknown>)?.name as string ?? 'Unknown',
    scheduled_at: row.scheduled_at as string | null,
    published_at: row.published_at as string | null,
    status: row.status as string,
  }))
}

export type CampaignActivity = {
  id: string
  action: string
  actor_name: string | null
  created_at: string
  changes: Record<string, unknown>
}

/**
 * Fetch recent activity log entries for a campaign.
 */
export async function getActivityByCampaign(campaignId: string): Promise<CampaignActivity[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activity_log')
    .select('id, action, created_at, changes, actor:profiles!activity_log_actor_id_fkey(full_name)')
    .eq('entity_type', 'campaign')
    .eq('entity_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    action: row.action as string,
    actor_name: (row.actor as Record<string, unknown>)?.full_name as string | null,
    created_at: row.created_at as string,
    changes: (row.changes as Record<string, unknown>) ?? {},
  }))
}
