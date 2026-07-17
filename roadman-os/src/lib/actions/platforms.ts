'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { platformSchema } from '@/lib/schemas/platforms'
import type { PlatformInsert, PlatformUpdate, PlatformReusePolicyInsert } from '@/types/database'

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
 * Create a new platform.
 */
export async function createPlatform(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }
    // Parse is_active from string to boolean
    raw.is_active = raw.is_active === 'true' || raw.is_active === true

    const parsed = platformSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.name)

    const insert: PlatformInsert = {
      name: values.name,
      slug,
      icon_url: null,
      base_url: values.base_url || null,
      supported_types: [],
      is_active: values.is_active ?? true,
    }

    const { data, error } = await supabase
      .from('platforms')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'platform',
      entity_id: data.id,
    })

    revalidatePath('/settings/platforms')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing platform.
 */
export async function updatePlatform(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Fetch current platform for change tracking
    const { data: existing } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Platform not found' }
    }

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }
    raw.is_active = raw.is_active === 'true' || raw.is_active === true

    const parsed = platformSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.name)

    const update: PlatformUpdate = {
      name: values.name,
      slug,
      base_url: values.base_url || null,
      is_active: values.is_active ?? true,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('platforms')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Build field-level change log
    const changes: Record<string, unknown> = {}
    const trackFields = ['name', 'base_url', 'is_active'] as const
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
      entity_type: 'platform',
      entity_id: id,
      changes,
    })

    revalidatePath('/settings/platforms')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Toggle a platform's is_active status.
 */
export async function togglePlatformActive(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('platforms')
      .select('id, is_active')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Platform not found' }
    }

    const newActive = !existing.is_active

    const { error } = await supabase
      .from('platforms')
      .update({ is_active: newActive, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'platform',
      entity_id: id,
      changes: { is_active: { from: existing.is_active, to: newActive } },
    })

    revalidatePath('/settings/platforms')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Create or update a platform reuse policy.
 */
export async function updateReusePolicy(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const platformId = formData.get('platform_id') as string
    const assetType = formData.get('asset_type') as string
    const minGapDays = parseInt(formData.get('min_gap_days') as string, 10) || 0
    const maxReusesRaw = formData.get('max_reuses') as string
    const maxReuses = maxReusesRaw ? parseInt(maxReusesRaw, 10) : null
    const requireEdit = formData.get('require_edit') === 'true'
    const notes = (formData.get('notes') as string) || null

    if (!platformId || !assetType) {
      return { success: false, error: 'Platform and asset type are required' }
    }

    const insert: PlatformReusePolicyInsert = {
      platform_id: platformId,
      asset_type: assetType as PlatformReusePolicyInsert['asset_type'],
      min_gap_days: minGapDays,
      max_reuses: maxReuses,
      require_edit: requireEdit,
      notes,
    }

    const { data, error } = await supabase
      .from('platform_reuse_policies')
      .upsert(insert, { onConflict: 'platform_id,asset_type' })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'platform_reuse_policy',
      entity_id: data.id,
    })

    revalidatePath('/settings/platforms')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
