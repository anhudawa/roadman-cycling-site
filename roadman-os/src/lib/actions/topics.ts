'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { topicSchema } from '@/lib/schemas/topics'
import type { TopicInsert, TopicUpdate } from '@/types/database'

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

/**
 * Create a new topic.
 */
export async function createTopic(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }

    // Convert sort_order to number if present
    if (raw.sort_order) {
      raw.sort_order = Number(raw.sort_order)
    }

    // Clear empty optional fields so zod treats them as undefined
    if (!raw.pillar) delete raw.pillar
    if (!raw.parent_id) delete raw.parent_id

    const parsed = topicSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.name)

    const insert: TopicInsert = {
      name: values.name,
      slug,
      pillar: values.pillar ?? null,
      description: values.description || null,
      parent_id: values.parent_id ?? null,
      sort_order: values.sort_order ?? 0,
    }

    const { data, error } = await supabase
      .from('topics')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'topic',
      entity_id: data.id,
    })

    revalidatePath('/settings/topics')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing topic.
 */
export async function updateTopic(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Topic not found' }
    }

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }

    if (raw.sort_order) {
      raw.sort_order = Number(raw.sort_order)
    }

    if (!raw.pillar) delete raw.pillar
    if (!raw.parent_id) delete raw.parent_id

    const parsed = topicSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.name)

    const update: TopicUpdate = {
      name: values.name,
      slug,
      pillar: values.pillar ?? null,
      description: values.description || null,
      parent_id: values.parent_id ?? null,
      sort_order: values.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('topics')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    const changes: Record<string, unknown> = {}
    const trackFields = ['name', 'pillar', 'description', 'parent_id', 'sort_order'] as const
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
      entity_type: 'topic',
      entity_id: id,
      changes,
    })

    revalidatePath('/settings/topics')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Delete a topic.
 * Also removes any asset_topics junction rows referencing it.
 */
export async function deleteTopic(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Remove junction rows first
    await supabase.from('asset_topics').delete().eq('topic_id', id)

    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'archived',
      entity_type: 'topic',
      entity_id: id,
    })

    revalidatePath('/settings/topics')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Batch-update sort_order for multiple topics.
 */
export async function reorderTopics(
  updates: { id: string; sort_order: number }[],
): Promise<ActionResult> {
  try {
    await requireAuth()
    const supabase = await createClient()

    // Update each topic's sort_order
    for (const { id, sort_order } of updates) {
      const { error } = await supabase
        .from('topics')
        .update({ sort_order, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    revalidatePath('/settings/topics')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
