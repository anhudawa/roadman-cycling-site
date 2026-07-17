'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { publicationSchema, bulkScheduleSchema } from '@/lib/schemas/publications'
import type { PublicationInsert, PublicationUpdate } from '@/types/database'

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

/**
 * Schedule (or draft) a single publication.
 */
export async function schedulePublication(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }

    const parsed = publicationSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    // Build platform_metadata from content fields
    const platform_metadata: Record<string, unknown> = {}
    if (values.platform_title) platform_metadata.platform_title = values.platform_title
    if (values.platform_body) platform_metadata.platform_body = values.platform_body
    if (values.hashtags) platform_metadata.hashtags = values.hashtags
    if (values.mentions) platform_metadata.mentions = values.mentions

    const status = values.scheduled_at ? 'scheduled' : 'draft'

    const insert: PublicationInsert = {
      asset_id: values.asset_id,
      platform_id: values.platform_id,
      status,
      scheduled_at: values.scheduled_at || null,
      published_at: null,
      external_id: null,
      external_url: null,
      platform_metadata,
      error_message: null,
    }

    const { data, error } = await supabase
      .from('publications')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: status === 'scheduled' ? 'scheduled' : 'created',
      entity_type: 'publication',
      entity_id: data.id,
    })

    revalidatePath(`/assets/${values.asset_id}/publications`)
    revalidatePath('/calendar')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing publication.
 */
export async function updatePublication(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Fetch current publication
    const { data: existing } = await supabase
      .from('publications')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Publication not found' }
    }

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }

    const parsed = publicationSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    // Build platform_metadata from content fields, preserving existing metadata
    const existingMeta = (existing.platform_metadata ?? {}) as Record<string, unknown>
    const platform_metadata: Record<string, unknown> = { ...existingMeta }
    platform_metadata.platform_title = values.platform_title || undefined
    platform_metadata.platform_body = values.platform_body || undefined
    platform_metadata.hashtags = values.hashtags || undefined
    platform_metadata.mentions = values.mentions || undefined

    // Clean out undefined keys
    for (const key of Object.keys(platform_metadata)) {
      if (platform_metadata[key] === undefined) delete platform_metadata[key]
    }

    // Determine status: if scheduled_at is set and status is draft, upgrade to scheduled
    let status = values.status ?? existing.status
    if (values.scheduled_at && status === 'draft') {
      status = 'scheduled'
    }

    const update: PublicationUpdate = {
      asset_id: values.asset_id,
      platform_id: values.platform_id,
      status,
      scheduled_at: values.scheduled_at || null,
      platform_metadata,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('publications')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Build field-level change log
    const changes: Record<string, unknown> = {}
    const trackFields = ['status', 'scheduled_at', 'platform_id'] as const
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
      entity_type: 'publication',
      entity_id: id,
      changes,
    })

    revalidatePath(`/assets/${values.asset_id}/publications`)
    revalidatePath('/calendar')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Mark a publication as published (set status + published_at timestamp).
 */
export async function markPublished(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('publications')
      .select('asset_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Publication not found' }
    }

    const { error } = await supabase
      .from('publications')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'published',
      entity_type: 'publication',
      entity_id: id,
    })

    revalidatePath(`/assets/${existing.asset_id}/publications`)
    revalidatePath('/calendar')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Cancel a publication by setting status to 'removed'.
 */
export async function cancelPublication(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('publications')
      .select('asset_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Publication not found' }
    }

    const { error } = await supabase
      .from('publications')
      .update({
        status: 'removed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'archived',
      entity_type: 'publication',
      entity_id: id,
    })

    revalidatePath(`/assets/${existing.asset_id}/publications`)
    revalidatePath('/calendar')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Bulk-schedule multiple publications at once (one per platform).
 */
export async function bulkSchedulePublications(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Parse the JSON payload from formData
    const jsonPayload = formData.get('bulk_data')
    if (!jsonPayload || typeof jsonPayload !== 'string') {
      return { success: false, error: 'Missing bulk schedule data' }
    }

    let raw: unknown
    try {
      raw = JSON.parse(jsonPayload)
    } catch {
      return { success: false, error: 'Invalid bulk schedule data' }
    }

    const parsed = bulkScheduleSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    // Build inserts for each platform
    const inserts: PublicationInsert[] = values.platforms.map((p) => {
      const scheduled_at = values.same_time && values.shared_time
        ? values.shared_time
        : p.scheduled_at

      const platform_metadata: Record<string, unknown> = {}
      if (p.platform_title) platform_metadata.platform_title = p.platform_title
      if (p.platform_body) platform_metadata.platform_body = p.platform_body

      return {
        asset_id: values.asset_id,
        platform_id: p.platform_id,
        status: 'scheduled' as const,
        scheduled_at: scheduled_at || null,
        published_at: null,
        external_id: null,
        external_url: null,
        platform_metadata,
        error_message: null,
      }
    })

    const { data, error } = await supabase
      .from('publications')
      .insert(inserts)
      .select('id')

    if (error) {
      return { success: false, error: error.message }
    }

    // Log activity for each created publication
    const createdIds = (data ?? []) as { id: string }[]
    for (const record of createdIds) {
      await logActivity(supabase, {
        actor_id: profile.id,
        action: 'scheduled',
        entity_type: 'publication',
        entity_id: record.id,
      })
    }

    revalidatePath(`/assets/${values.asset_id}/publications`)
    revalidatePath('/calendar')
    return {
      success: true,
      data: { id: createdIds[0]?.id ?? '' },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
