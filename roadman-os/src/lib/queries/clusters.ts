import { createClient } from '@/lib/supabase/server'
import type { ContentCluster, ContentPillar, AssetType, AssetStatus } from '@/types/database'

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

/** The seven core format types used for coverage scoring. */
const CORE_ASSET_TYPES: AssetType[] = [
  'blog_post',
  'youtube_video',
  'podcast_episode',
  'social_post',
  'newsletter',
  'infographic',
  'clip',
]

// -------------------------------------------------------------------------
// Query return types
// -------------------------------------------------------------------------

export type ClusterWithHubAsset = ContentCluster & {
  hub_asset: { id: string; title: string } | null
}

export type ClusterAssetRow = {
  asset_id: string
  sort_order: number
  asset: {
    id: string
    title: string
    type: AssetType
    status: AssetStatus
    pillar: ContentPillar | null
  }
}

export type ClusterListItem = {
  id: string
  name: string
  slug: string
  pillar: ContentPillar | null
  status: string
  hub_asset_title: string | null
  asset_count: number
  coverage_covered: number
  coverage_total: number
  coverage_percentage: number
}

export type CoverageScore = {
  covered: number
  total: number
  percentage: number
}

// -------------------------------------------------------------------------
// Single cluster
// -------------------------------------------------------------------------

/**
 * Fetch a single cluster by ID with the hub asset title joined.
 */
export async function getCluster(id: string): Promise<ClusterWithHubAsset | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_clusters')
    .select('*, hub_asset:assets!content_clusters_hub_asset_id_fkey(id, title)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as ClusterWithHubAsset
}

// -------------------------------------------------------------------------
// Cluster list
// -------------------------------------------------------------------------

/**
 * Fetch all non-archived clusters, ordered by name. Optionally filter by pillar.
 */
export async function getClusters(
  filters?: { pillar?: string; status?: string },
): Promise<ContentCluster[]> {
  const supabase = await createClient()

  let query = supabase
    .from('content_clusters')
    .select('*')
    .is('archived_at', null)
    .order('name')

  if (filters?.pillar) {
    query = query.eq('pillar', filters.pillar as ContentPillar)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data as ContentCluster[]
}

/**
 * Fetch clusters enriched with asset count and format coverage for the list page.
 */
export async function getClustersWithStats(
  filters?: { pillar?: string },
): Promise<ClusterListItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('content_clusters')
    .select(`
      id, name, slug, pillar, status,
      hub_asset:assets!content_clusters_hub_asset_id_fkey(title),
      content_cluster_assets(assets(type))
    `)
    .is('archived_at', null)
    .order('name')

  if (filters?.pillar) {
    query = query.eq('pillar', filters.pillar as ContentPillar)
  }

  const { data, error } = await query

  if (error || !data) return []

  return (data as unknown as any[]).map((cluster) => {
    const clusterAssets = cluster.content_cluster_assets || []
    const types = new Set(
      clusterAssets
        .map((a: any) => a.assets?.type)
        .filter(Boolean),
    )
    const covered = CORE_ASSET_TYPES.filter((t) => types.has(t)).length

    return {
      id: cluster.id as string,
      name: cluster.name as string,
      slug: cluster.slug as string,
      pillar: cluster.pillar as ContentPillar | null,
      status: (cluster.status as string) || 'planned',
      hub_asset_title: (cluster.hub_asset?.title as string) || null,
      asset_count: clusterAssets.length,
      coverage_covered: covered,
      coverage_total: CORE_ASSET_TYPES.length,
      coverage_percentage:
        CORE_ASSET_TYPES.length > 0
          ? Math.round((covered / CORE_ASSET_TYPES.length) * 100)
          : 0,
    }
  })
}

// -------------------------------------------------------------------------
// Cluster assets
// -------------------------------------------------------------------------

/**
 * Fetch all assets in a cluster via the junction table, ordered by sort_order.
 */
export async function getClusterAssets(
  clusterId: string,
): Promise<ClusterAssetRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('content_cluster_assets')
    .select('asset_id, sort_order, assets(id, title, type, status, pillar)')
    .eq('cluster_id', clusterId)
    .order('sort_order')

  if (error || !data) return []

  return (data as unknown as any[]).map((row) => ({
    asset_id: row.asset_id,
    sort_order: row.sort_order,
    asset: row.assets,
  }))
}

// -------------------------------------------------------------------------
// Coverage score
// -------------------------------------------------------------------------

/**
 * Count distinct core asset types present in the cluster and return
 * covered / total / percentage.
 */
export async function calculateCoverageScore(
  clusterId: string,
): Promise<CoverageScore> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('content_cluster_assets')
    .select('assets(type)')
    .eq('cluster_id', clusterId)

  if (!data || data.length === 0) {
    return { covered: 0, total: CORE_ASSET_TYPES.length, percentage: 0 }
  }

  const types = new Set(
    (data as unknown as any[])
      .map((d) => d.assets?.type)
      .filter(Boolean),
  )

  const covered = CORE_ASSET_TYPES.filter((t) => types.has(t)).length

  return {
    covered,
    total: CORE_ASSET_TYPES.length,
    percentage: Math.round((covered / CORE_ASSET_TYPES.length) * 100),
  }
}

// -------------------------------------------------------------------------
// Dropdown helpers
// -------------------------------------------------------------------------

/**
 * Fetch all non-archived assets as id+title pairs for use in select dropdowns.
 */
export async function getAllAssetOptions(): Promise<
  { id: string; title: string }[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assets')
    .select('id, title')
    .neq('status', 'archived')
    .order('title')

  if (error || !data) return []
  return data as { id: string; title: string }[]
}
