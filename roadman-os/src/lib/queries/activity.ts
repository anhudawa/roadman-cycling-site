import { createClient } from '@/lib/supabase/server'
import type { ActivityLog, ActivityAction, Profile } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityLogWithActor = ActivityLog & {
  actor_name: string | null
  actor_avatar_url: string | null
}

export type ActivityFilters = {
  entity_type?: string
  action?: ActivityAction
  actor_id?: string
  date_from?: string
  date_to?: string
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated activity feed with optional filters.
 * Returns entries newest-first with actor profile data joined.
 */
export async function getActivityFeed(
  filters: ActivityFilters = {},
  page: number = 1,
  perPage: number = 20,
): Promise<{ entries: ActivityLogWithActor[]; total: number }> {
  const supabase = await createClient()
  if (!supabase) return { entries: [], total: 0 }

  let query = supabase
    .from('activity_log')
    .select('*, actor:profiles!activity_log_actor_id_fkey(full_name, display_name, avatar_url)', {
      count: 'exact',
    })

  // Apply filters
  if (filters.entity_type) {
    query = query.eq('entity_type', filters.entity_type)
  }
  if (filters.action) {
    query = query.eq('action', filters.action)
  }
  if (filters.actor_id) {
    query = query.eq('actor_id', filters.actor_id)
  }
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }
  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  const from = (page - 1) * perPage
  const to = from + perPage - 1

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error || !data) return { entries: [], total: 0 }

  const entries: ActivityLogWithActor[] = data.map((entry: any) => {
    const actor = entry.actor as {
      full_name: string
      display_name: string | null
      avatar_url: string | null
    } | null
    return {
      ...(entry as unknown as ActivityLog),
      actor_name: actor?.display_name || actor?.full_name || null,
      actor_avatar_url: actor?.avatar_url || null,
    }
  })

  return { entries, total: count ?? 0 }
}

/**
 * Fetch the most recent N activity entries (convenience wrapper).
 */
export async function getRecentActivityFeed(
  limit: number = 10,
): Promise<ActivityLogWithActor[]> {
  const { entries } = await getActivityFeed({}, 1, limit)
  return entries
}

/**
 * Fetch all team members for filter dropdowns.
 */
export async function getActivityActors(): Promise<Pick<Profile, 'id' | 'full_name' | 'display_name'>[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, display_name')
    .eq('is_active', true)
    .order('full_name')

  if (error || !data) return []
  return data as Pick<Profile, 'id' | 'full_name' | 'display_name'>[]
}
