import { createClient } from '@/lib/supabase/server'
import type { Publication, Asset, Platform, PublicationStatus } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PublicationWithDetails = Publication & {
  asset: Pick<Asset, 'id' | 'title' | 'type' | 'status'> | null
  platform: Pick<Platform, 'id' | 'name' | 'slug'> | null
}

export type PublicationFilters = {
  status?: string
  platform_id?: string
  search?: string
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch publications for a given date range (ISO date strings).
 * Used by the calendar view to load publications for a week or month.
 */
export async function getPublicationsForDateRange(
  start: string,
  end: string,
): Promise<PublicationWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select(
      '*, asset:assets!publications_asset_id_fkey(id, title, type, status), platform:platforms!publications_platform_id_fkey(id, name, slug)',
    )
    .or(
      `and(scheduled_at.gte.${start},scheduled_at.lte.${end}),and(published_at.gte.${start},published_at.lte.${end})`,
    )
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (error || !data) return []
  return data as unknown as PublicationWithDetails[]
}

/**
 * Fetch publications with optional filters.
 */
export async function getPublications(
  filters?: PublicationFilters,
): Promise<PublicationWithDetails[]> {
  const supabase = await createClient()

  let query = supabase
    .from('publications')
    .select(
      '*, asset:assets!publications_asset_id_fkey(id, title, type, status), platform:platforms!publications_platform_id_fkey(id, name, slug)',
    )
    .order('scheduled_at', { ascending: false, nullsFirst: false })

  if (filters?.status) {
    query = query.eq('status', filters.status as PublicationStatus)
  }

  if (filters?.platform_id) {
    query = query.eq('platform_id', filters.platform_id)
  }

  const { data, error } = await query

  if (error || !data) return []
  return data as unknown as PublicationWithDetails[]
}

// ---------------------------------------------------------------------------
// Single publication with joins
// ---------------------------------------------------------------------------
export async function getPublication(
  id: string,
): Promise<PublicationWithDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select(
      '*, asset:assets!publications_asset_id_fkey(id, title, type, status), platform:platforms!publications_platform_id_fkey(id, name, slug)',
    )
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as PublicationWithDetails
}

// ---------------------------------------------------------------------------
// All publications for a specific asset
// ---------------------------------------------------------------------------
export async function getPublicationsByAsset(
  assetId: string,
): Promise<PublicationWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select(
      '*, asset:assets!publications_asset_id_fkey(id, title, type, status), platform:platforms!publications_platform_id_fkey(id, name, slug)',
    )
    .eq('asset_id', assetId)
    .order('scheduled_at', { ascending: false, nullsFirst: false })

  if (error || !data) return []
  return data as unknown as PublicationWithDetails[]
}

// ---------------------------------------------------------------------------
// All publications for a specific platform
// ---------------------------------------------------------------------------
export async function getPublicationsByPlatform(
  platformId: string,
): Promise<PublicationWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select(
      '*, asset:assets!publications_asset_id_fkey(id, title, type, status), platform:platforms!publications_platform_id_fkey(id, name, slug)',
    )
    .eq('platform_id', platformId)
    .order('scheduled_at', { ascending: false, nullsFirst: false })

  if (error || !data) return []
  return data as unknown as PublicationWithDetails[]
}

// ---------------------------------------------------------------------------
// Only scheduled publications, ordered by scheduled_at
// ---------------------------------------------------------------------------
export async function getScheduledPublications(): Promise<PublicationWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select(
      '*, asset:assets!publications_asset_id_fkey(id, title, type, status), platform:platforms!publications_platform_id_fkey(id, name, slug)',
    )
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (error || !data) return []
  return data as unknown as PublicationWithDetails[]
}
