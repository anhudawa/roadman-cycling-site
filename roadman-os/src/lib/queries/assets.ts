import { createClient } from '@/lib/supabase/server'
import type { Asset, AssetTag, AssetTopic, AssetType, AssetStatus, ContentPillar, Publication, ActivityLog, Comment } from '@/types/database'

// ---------------------------------------------------------------------------
// Single asset with related entities
// ---------------------------------------------------------------------------
export async function getAsset(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assets')
    .select(`
      *,
      campaign:campaigns(id, title),
      creator:profiles!assets_creator_id_fkey(id, display_name, full_name, avatar_url),
      assignee:profiles!assets_assignee_id_fkey(id, display_name, full_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

// ---------------------------------------------------------------------------
// Filtered + paginated asset list
// ---------------------------------------------------------------------------
export type AssetFilters = {
  type?: string
  status?: string
  pillar?: string
  campaign_id?: string
  assignee_id?: string
  search?: string
}

export async function getAssets(
  filters?: AssetFilters,
  page = 1,
  perPage = 20,
): Promise<{ data: Asset[]; count: number }> {
  const supabase = await createClient()
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('assets')
    .select('*', { count: 'exact' })
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters?.type) {
    query = query.eq('type', filters.type as AssetType)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status as AssetStatus)
  }
  if (filters?.pillar) {
    query = query.eq('pillar', filters.pillar as ContentPillar)
  }
  if (filters?.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id)
  }
  if (filters?.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    )
  }

  const { data, count, error } = await query

  if (error) return { data: [], count: 0 }
  return { data: (data ?? []) as Asset[], count: count ?? 0 }
}

// ---------------------------------------------------------------------------
// Full-text search (ilike fallback)
// ---------------------------------------------------------------------------
export async function searchAssets(query: string): Promise<Asset[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .neq('status', 'archived')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return []
  return (data ?? []) as Asset[]
}

// ---------------------------------------------------------------------------
// Junction table lookups
// ---------------------------------------------------------------------------
export async function getAssetTopics(assetId: string): Promise<AssetTopic[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('asset_topics')
    .select('*')
    .eq('asset_id', assetId)

  if (error) return []
  return (data ?? []) as AssetTopic[]
}

export async function getAssetTags(assetId: string): Promise<AssetTag[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('asset_tags')
    .select('*')
    .eq('asset_id', assetId)

  if (error) return []
  return (data ?? []) as AssetTag[]
}

// ---------------------------------------------------------------------------
// Enriched junction lookups (include names for display)
// ---------------------------------------------------------------------------
export type AssetTopicWithName = AssetTopic & { topic: { id: string; name: string; pillar: string | null } }

export async function getAssetTopicsWithNames(assetId: string): Promise<AssetTopicWithName[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('asset_topics')
    .select('*, topic:topics(id, name, pillar)')
    .eq('asset_id', assetId)

  if (error) return []
  return (data ?? []) as AssetTopicWithName[]
}

export type AssetTagWithName = AssetTag & { tag: { id: string; name: string; colour: string | null } }

export async function getAssetTagsWithNames(assetId: string): Promise<AssetTagWithName[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('asset_tags')
    .select('*, tag:tags(id, name, colour)')
    .eq('asset_id', assetId)

  if (error) return []
  return (data ?? []) as AssetTagWithName[]
}

// ---------------------------------------------------------------------------
// Filtered + paginated asset list with joins (used by asset library page)
// ---------------------------------------------------------------------------
export type FilteredAssetParams = {
  search?: string
  type?: string
  status?: string
  pillar?: string
  campaign_id?: string
  assignee_id?: string
  date_from?: string
  date_to?: string
  page?: number
  perPage?: number
}

export type FilteredAsset = Asset & {
  campaign: { id: string; title: string } | null
  creator: { id: string; display_name: string | null; full_name: string; avatar_url: string | null } | null
  assignee: { id: string; display_name: string | null; full_name: string; avatar_url: string | null } | null
}

export async function getFilteredAssets(
  params: FilteredAssetParams = {},
): Promise<{ data: FilteredAsset[]; count: number }> {
  const supabase = await createClient()
  const page = params.page ?? 1
  const perPage = params.perPage ?? 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('assets')
    .select(
      `
      *,
      campaign:campaigns(id, title),
      creator:profiles!assets_creator_id_fkey(id, display_name, full_name, avatar_url),
      assignee:profiles!assets_assignee_id_fkey(id, display_name, full_name, avatar_url)
    `,
      { count: 'exact' },
    )
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%`,
    )
  }
  if (params.type) {
    query = query.eq('type', params.type as AssetType)
  }
  if (params.status) {
    query = query.eq('status', params.status as AssetStatus)
  } else {
    // Exclude archived by default when no status filter is active
    query = query.neq('status', 'archived')
  }
  if (params.pillar) {
    query = query.eq('pillar', params.pillar as ContentPillar)
  }
  if (params.campaign_id) {
    query = query.eq('campaign_id', params.campaign_id)
  }
  if (params.assignee_id) {
    query = query.eq('assignee_id', params.assignee_id)
  }
  if (params.date_from) {
    query = query.gte('updated_at', params.date_from)
  }
  if (params.date_to) {
    query = query.lte('updated_at', params.date_to)
  }

  const { data, count, error } = await query

  if (error) return { data: [], count: 0 }
  return { data: (data ?? []) as FilteredAsset[], count: count ?? 0 }
}

// ---------------------------------------------------------------------------
// Dropdown data helpers (used by create/edit pages)
// ---------------------------------------------------------------------------
export async function getDropdownData() {
  const supabase = await createClient()

  const [campaignsRes, profilesRes, topicsRes, tagsRes, assetsRes] =
    await Promise.all([
      supabase
        .from('campaigns')
        .select('id, title')
        .order('title', { ascending: true }),
      supabase
        .from('profiles')
        .select('id, display_name, full_name')
        .eq('is_active', true)
        .order('full_name', { ascending: true }),
      supabase
        .from('topics')
        .select('*')
        .order('pillar', { ascending: true })
        .order('sort_order', { ascending: true }),
      supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true }),
      supabase
        .from('assets')
        .select('id, title')
        .neq('status', 'archived')
        .order('title', { ascending: true }),
    ])

  return {
    campaigns: (campaignsRes.data ?? []) as { id: string; title: string }[],
    profiles: (profilesRes.data ?? []).map((p) => ({
      id: p.id,
      display_name: (p as Record<string, unknown>).display_name as string | null ?? (p as Record<string, unknown>).full_name as string,
    })),
    topics: topicsRes.data ?? [],
    tags: tagsRes.data ?? [],
    assets: (assetsRes.data ?? []) as { id: string; title: string }[],
  }
}

// ---------------------------------------------------------------------------
// Derivative tree — 2-level fetch (children + grandchildren)
// ---------------------------------------------------------------------------
export type DerivativeNode = {
  id: string
  title: string
  type: string
  status: string
  parent_asset_id: string | null
  children?: DerivativeNode[]
}

type AssetRow = { id: string; title: string; type: string; status: string; parent_asset_id: string | null }

export async function getDerivativeTree(assetId: string): Promise<DerivativeNode[]> {
  const supabase = await createClient()

  // Level 1: direct children
  const { data: rawChildren, error: childErr } = await supabase
    .from('assets')
    .select('id, title, type, status, parent_asset_id')
    .eq('parent_asset_id', assetId)
    .neq('status', 'archived')
    .order('created_at', { ascending: true })

  const children = (rawChildren ?? []) as AssetRow[]
  if (childErr || children.length === 0) return []

  const childIds = children.map((c) => c.id)

  // Level 2: grandchildren
  const { data: rawGrandchildren } = await supabase
    .from('assets')
    .select('id, title, type, status, parent_asset_id')
    .in('parent_asset_id', childIds)
    .neq('status', 'archived')
    .order('created_at', { ascending: true })

  const grandchildren = (rawGrandchildren ?? []) as AssetRow[]

  // Build tree structure
  const grandchildMap = new Map<string, DerivativeNode[]>()
  for (const gc of grandchildren) {
    const parentId = gc.parent_asset_id!
    if (!grandchildMap.has(parentId)) {
      grandchildMap.set(parentId, [])
    }
    grandchildMap.get(parentId)!.push({
      id: gc.id,
      title: gc.title,
      type: gc.type,
      status: gc.status,
      parent_asset_id: gc.parent_asset_id,
    })
  }

  return children.map((child) => ({
    id: child.id,
    title: child.title,
    type: child.type,
    status: child.status,
    parent_asset_id: child.parent_asset_id,
    children: grandchildMap.get(child.id) ?? [],
  }))
}

// ---------------------------------------------------------------------------
// Source chain — walk up parent_asset_id (max 3 levels)
// ---------------------------------------------------------------------------
export async function getSourceChain(assetId: string): Promise<Asset[]> {
  const supabase = await createClient()
  const chain: Asset[] = []
  let currentId: string | null = assetId

  for (let i = 0; i < 3; i++) {
    const { data: rawCurrent } = await supabase
      .from('assets')
      .select('*')
      .eq('id', currentId!)
      .single()

    const current = rawCurrent as Asset | null
    if (!current || !current.parent_asset_id) break

    const { data: rawParent } = await supabase
      .from('assets')
      .select('*')
      .eq('id', current.parent_asset_id)
      .single()

    const parent = rawParent as Asset | null
    if (!parent) break

    chain.push(parent)
    currentId = parent.id

    if (!parent.parent_asset_id) break
  }

  return chain.reverse()
}

// ---------------------------------------------------------------------------
// Siblings — other assets with the same parent
// ---------------------------------------------------------------------------
export async function getSiblings(assetId: string): Promise<Asset[]> {
  const supabase = await createClient()

  // Get the asset's parent
  const { data: rawAsset } = await supabase
    .from('assets')
    .select('parent_asset_id')
    .eq('id', assetId)
    .single()

  const assetRow = rawAsset as { parent_asset_id: string | null } | null
  if (!assetRow?.parent_asset_id) return []

  const { data: siblings, error } = await supabase
    .from('assets')
    .select('*')
    .eq('parent_asset_id', assetRow.parent_asset_id)
    .neq('id', assetId)
    .neq('status', 'archived')
    .order('created_at', { ascending: true })

  if (error) return []
  return (siblings ?? []) as Asset[]
}

// ---------------------------------------------------------------------------
// Publications for an asset
// ---------------------------------------------------------------------------
export async function getAssetPublications(assetId: string): Promise<(Publication & { platform?: { id: string; name: string; slug: string } })[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select(`
      *,
      platform:platforms(id, name, slug)
    `)
    .eq('asset_id', assetId)
    .order('scheduled_at', { ascending: false })

  if (error) return []
  return (data ?? []) as (Publication & { platform?: { id: string; name: string; slug: string } })[]
}

// ---------------------------------------------------------------------------
// Activity log for an asset
// ---------------------------------------------------------------------------
export async function getAssetActivity(assetId: string): Promise<(ActivityLog & { actor?: { id: string; display_name: string | null; full_name: string; avatar_url: string | null } })[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activity_log')
    .select(`
      *,
      actor:profiles(id, display_name, full_name, avatar_url)
    `)
    .eq('entity_type', 'asset')
    .eq('entity_id', assetId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return []
  return (data ?? []) as (ActivityLog & { actor?: { id: string; display_name: string | null; full_name: string; avatar_url: string | null } })[]
}

// ---------------------------------------------------------------------------
// Comments for an asset (with author profile)
// ---------------------------------------------------------------------------
export async function getAssetComments(assetId: string): Promise<(Comment & { author?: { id: string; display_name: string | null; full_name: string; avatar_url: string | null } })[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(id, display_name, full_name, avatar_url)
    `)
    .eq('asset_id', assetId)
    .order('created_at', { ascending: true })

  if (error) return []
  return (data ?? []) as (Comment & { author?: { id: string; display_name: string | null; full_name: string; avatar_url: string | null } })[]
}
