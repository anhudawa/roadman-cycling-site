'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { clusterSchema } from '@/lib/schemas/clusters'
import type { ContentPillar } from '@/types/database'

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

/** Generate a URL-safe slug from a name. */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Extract form data including JSON arrays serialised by the client. */
function parseFormData(formData: FormData) {
  const raw: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    raw[key] = value
  }

  try {
    raw.related_queries = formData.get('related_queries')
      ? JSON.parse(formData.get('related_queries') as string)
      : []
  } catch {
    raw.related_queries = []
  }

  return raw
}

/**
 * Create a new content cluster.
 */
export async function createCluster(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw = parseFormData(formData)
    const parsed = clusterSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.name)

    const insert = {
      name: values.name,
      slug,
      description: values.description || null,
      pillar: (values.pillar || null) as ContentPillar | null,
      hub_asset_id: values.hub_asset_id || null,
      target_query: values.target_query || null,
      related_queries: values.related_queries || [],
      status: values.status || 'planned',
      archived_at: null,
    }

    const { data, error } = await supabase
      .from('content_clusters')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'content_cluster',
      entity_id: data.id,
    })

    revalidatePath('/settings/clusters')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing content cluster.
 */
export async function updateCluster(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('content_clusters')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Cluster not found' }
    }

    const raw = parseFormData(formData)
    const parsed = clusterSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.name)

    const update = {
      name: values.name,
      slug,
      description: values.description || null,
      pillar: (values.pillar || null) as ContentPillar | null,
      hub_asset_id: values.hub_asset_id || null,
      target_query: values.target_query || null,
      related_queries: values.related_queries || [],
      status: values.status || 'planned',
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('content_clusters')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Build field-level change log
    const changes: Record<string, unknown> = {}
    const trackFields = ['name', 'description', 'pillar', 'hub_asset_id', 'status'] as const
    for (const field of trackFields) {
      const oldVal = existing[field]
      const newVal = update[field]
      if (oldVal !== newVal) {
        changes[field] = { from: oldVal, to: newVal }
      }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'content_cluster',
      entity_id: id,
      changes,
    })

    revalidatePath('/settings/clusters')
    revalidatePath(`/settings/clusters/${id}`)
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Add an asset to a cluster via the junction table.
 */
export async function addAssetToCluster(
  clusterId: string,
  assetId: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Determine the next sort_order value
    const { data: existing } = await supabase
      .from('content_cluster_assets')
      .select('sort_order')
      .eq('cluster_id', clusterId)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextOrder =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

    const { error } = await supabase
      .from('content_cluster_assets')
      .insert({
        cluster_id: clusterId,
        asset_id: assetId,
        sort_order: nextOrder,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'content_cluster',
      entity_id: clusterId,
      changes: { added_asset: assetId },
    })

    revalidatePath(`/settings/clusters/${clusterId}`)
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Remove an asset from a cluster.
 */
export async function removeAssetFromCluster(
  clusterId: string,
  assetId: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { error } = await supabase
      .from('content_cluster_assets')
      .delete()
      .eq('cluster_id', clusterId)
      .eq('asset_id', assetId)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'content_cluster',
      entity_id: clusterId,
      changes: { removed_asset: assetId },
    })

    revalidatePath(`/settings/clusters/${clusterId}`)
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Archive a cluster by setting archived_at.
 */
export async function archiveCluster(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { error } = await supabase
      .from('content_clusters')
      .update({
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'archived',
      entity_type: 'content_cluster',
      entity_id: id,
    })

    revalidatePath('/settings/clusters')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
