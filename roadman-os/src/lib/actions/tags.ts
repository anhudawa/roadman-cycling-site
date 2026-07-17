'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { tagSchema } from '@/lib/schemas/topics'
import type { TagInsert, TagUpdate } from '@/types/database'

type ActionResult = {
  success: boolean
  data?: { id: string; name: string }
  error?: string
}

/** Generate a URL-safe slug from a name. */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Create a new tag.
 */
export async function createTag(
  data: { name: string; colour?: string },
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const parsed = tagSchema.safeParse(data)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.name)

    const insert: TagInsert = {
      name: values.name,
      slug,
      colour: values.colour ?? null,
    }

    const { data: row, error } = await supabase
      .from('tags')
      .insert(insert)
      .select('id, name')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'tag',
      entity_id: row.id,
    })

    revalidatePath('/settings/topics')
    return { success: true, data: { id: row.id, name: row.name } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing tag.
 */
export async function updateTag(
  id: string,
  data: { name?: string; colour?: string },
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Tag not found' }
    }

    const update: TagUpdate = {}

    if (data.name !== undefined) {
      if (data.name.length === 0) {
        return { success: false, error: 'Name is required' }
      }
      update.name = data.name
      update.slug = generateSlug(data.name)
    }

    if (data.colour !== undefined) {
      update.colour = data.colour || null
    }

    const { error } = await supabase
      .from('tags')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    const changes: Record<string, unknown> = {}
    if (data.name !== undefined && existing.name !== data.name) {
      changes.name = { from: existing.name, to: data.name }
    }
    if (data.colour !== undefined && existing.colour !== data.colour) {
      changes.colour = { from: existing.colour, to: data.colour }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'tag',
      entity_id: id,
      changes,
    })

    revalidatePath('/settings/topics')
    return { success: true, data: { id, name: update.name ?? existing.name } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Delete a tag and remove all asset_tags junction rows.
 */
export async function deleteTag(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Remove junction rows first
    await supabase.from('asset_tags').delete().eq('tag_id', id)

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'archived',
      entity_type: 'tag',
      entity_id: id,
    })

    revalidatePath('/settings/topics')
    return { success: true, data: { id, name: '' } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Merge source tag into target tag.
 * Reassigns all asset_tags from source to target (avoiding duplicates),
 * then deletes the source tag.
 */
export async function mergeTags(
  sourceId: string,
  targetId: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    if (sourceId === targetId) {
      return { success: false, error: 'Cannot merge a tag into itself' }
    }

    // Fetch existing asset_tags for the target to avoid duplicates
    const { data: targetLinks } = await supabase
      .from('asset_tags')
      .select('asset_id')
      .eq('tag_id', targetId)

    const targetAssetIds = new Set(targetLinks?.map((l) => l.asset_id) ?? [])

    // Fetch all asset_tags for the source
    const { data: sourceLinks } = await supabase
      .from('asset_tags')
      .select('asset_id')
      .eq('tag_id', sourceId)

    if (sourceLinks && sourceLinks.length > 0) {
      // Insert non-duplicate links for the target
      const newLinks = sourceLinks
        .filter((l) => !targetAssetIds.has(l.asset_id))
        .map((l) => ({ asset_id: l.asset_id, tag_id: targetId }))

      if (newLinks.length > 0) {
        const { error: insertError } = await supabase
          .from('asset_tags')
          .insert(newLinks)

        if (insertError) {
          return { success: false, error: insertError.message }
        }
      }
    }

    // Delete source junction rows and then the source tag
    await supabase.from('asset_tags').delete().eq('tag_id', sourceId)

    const { error: deleteError } = await supabase
      .from('tags')
      .delete()
      .eq('id', sourceId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'tag',
      entity_id: targetId,
      changes: { merged_from: sourceId },
    })

    revalidatePath('/settings/topics')
    return { success: true, data: { id: targetId, name: '' } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Search tags by name (ilike), return top 20.
 */
export async function searchTags(
  query: string,
): Promise<{ id: string; name: string; colour: string | null }[]> {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tags')
      .select('id, name, colour')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20)

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
