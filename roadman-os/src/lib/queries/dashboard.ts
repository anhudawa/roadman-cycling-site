import { createClient } from '@/lib/supabase/server'
import type { Campaign, Profile, ActivityLog } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WeeklyFocusWithStats = Campaign & {
  owner: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  stats: {
    assets: number
    tasksRemaining: number
    publications: number
  }
}

export type ActivityLogWithActor = ActivityLog & {
  actor_name: string | null
}

// ---------------------------------------------------------------------------
// Weekly Focus — current week with stats
// ---------------------------------------------------------------------------

/**
 * Fetch the current weekly focus campaign with owner profile and
 * aggregate counts for assets, outstanding tasks, and publications.
 */
export async function getWeeklyFocusWithStats(): Promise<WeeklyFocusWithStats | null> {
  const supabase = await createClient()
  if (!supabase) return null
  const today = new Date().toISOString().split('T')[0]

  // 1. Get the active weekly_focus campaign where today is within its range
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*, owner:profiles!campaigns_owner_id_fkey(id, full_name, avatar_url)')
    .eq('type', 'weekly_focus')
    .eq('status', 'active')
    .lte('start_date', today)
    .gte('end_date', today)
    .limit(1)
    .single()

  if (campaignError || !campaign) return null

  const campaignId = (campaign as any).id as string

  // 2. Count assets linked to this campaign
  const { count: assetCount } = await supabase
    .from('assets')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)

  // 3. Count tasks remaining (status is NOT 'done')
  const { count: taskCount } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .neq('status', 'done')

  // 4. Count publications through assets
  //    publications.asset_id IN (SELECT id FROM assets WHERE campaign_id = X)
  const { data: assetIds } = await supabase
    .from('assets')
    .select('id')
    .eq('campaign_id', campaignId)

  let publicationCount = 0
  if (assetIds && assetIds.length > 0) {
    const ids = assetIds.map((a) => a.id)
    const { count } = await supabase
      .from('publications')
      .select('id', { count: 'exact', head: true })
      .in('asset_id', ids)
    publicationCount = count ?? 0
  }

  return {
    ...(campaign as unknown as Campaign & {
      owner: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
    }),
    stats: {
      assets: assetCount ?? 0,
      tasksRemaining: taskCount ?? 0,
      publications: publicationCount,
    },
  }
}

// ---------------------------------------------------------------------------
// Upcoming weekly focuses
// ---------------------------------------------------------------------------

/**
 * Fetch the next N upcoming weekly_focus campaigns (start_date > today),
 * ordered by start_date ascending (soonest first).
 */
export async function getUpcomingWeeklyFocuses(
  limit: number = 4,
): Promise<(Campaign & { owner: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null })[]> {
  const supabase = await createClient()
  if (!supabase) return []
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('campaigns')
    .select('*, owner:profiles!campaigns_owner_id_fkey(id, full_name, avatar_url)')
    .eq('type', 'weekly_focus')
    .gt('start_date', today)
    .order('start_date', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  return data as unknown as (Campaign & {
    owner: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  })[]
}

// ---------------------------------------------------------------------------
// Recent activity
// ---------------------------------------------------------------------------

/**
 * Fetch the latest N activity_log entries with the actor's display name
 * joined from profiles.
 */
export async function getRecentActivity(
  limit: number = 10,
): Promise<ActivityLogWithActor[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('activity_log')
    .select('*, actor:profiles!activity_log_actor_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((entry) => {
    const actor = (entry as any).actor as { full_name: string } | null
    return {
      ...(entry as unknown as ActivityLog),
      actor_name: actor?.full_name ?? null,
    }
  })
}
