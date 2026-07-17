import { createClient } from '@/lib/supabase/server'
import type { ContentBrief, Profile } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BriefWithCreator = ContentBrief & {
  creator: Pick<Profile, 'id' | 'full_name'> | null
}

export type BriefWithAssetAndCreator = ContentBrief & {
  creator: Pick<Profile, 'id' | 'full_name'> | null
  asset: { id: string; title: string; type: string; status: string } | null
}

// ---------------------------------------------------------------------------
// Single brief by ID
// ---------------------------------------------------------------------------

export async function getBrief(id: string): Promise<BriefWithCreator | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_briefs')
    .select(`
      *,
      creator:profiles!content_briefs_created_by_fkey(id, full_name)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as BriefWithCreator
}

// ---------------------------------------------------------------------------
// Brief for a specific asset (at most one)
// ---------------------------------------------------------------------------

export async function getBriefByAsset(
  assetId: string,
): Promise<BriefWithCreator | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_briefs')
    .select(`
      *,
      creator:profiles!content_briefs_created_by_fkey(id, full_name)
    `)
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data as unknown as BriefWithCreator
}

// ---------------------------------------------------------------------------
// All briefs with optional status filter
// ---------------------------------------------------------------------------

export async function getBriefs(filters?: {
  status?: string
}): Promise<BriefWithAssetAndCreator[]> {
  const supabase = await createClient()

  let query = supabase
    .from('content_briefs')
    .select(`
      *,
      creator:profiles!content_briefs_created_by_fkey(id, full_name),
      asset:assets!content_briefs_asset_id_fkey(id, title, type, status)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    // Filter by status stored in distribution_plan JSONB
    query = query.eq('distribution_plan->>status', filters.status)
  }

  const { data, error } = await query

  if (error) return []
  return (data ?? []) as unknown as BriefWithAssetAndCreator[]
}
