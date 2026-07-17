'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { campaignSchema } from '@/lib/schemas/campaigns'
import type { CampaignInsert, CampaignUpdate } from '@/types/database'

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

/** Generate a URL-safe slug from a title. */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Extract form data including JSON arrays that were serialised by the client. */
function parseFormData(formData: FormData) {
  const raw: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    raw[key] = value
  }

  // Parse JSON array fields sent from the client form
  try {
    raw.goals = formData.get('goals')
      ? JSON.parse(formData.get('goals') as string)
      : []
  } catch {
    raw.goals = []
  }

  try {
    raw.key_messages = formData.get('key_messages')
      ? JSON.parse(formData.get('key_messages') as string)
      : []
  } catch {
    raw.key_messages = []
  }

  return raw
}

/**
 * Create a new campaign.
 */
export async function createCampaign(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw = parseFormData(formData)
    const parsed = campaignSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.title)

    // Separate core table fields from metadata fields
    const metadata: Record<string, unknown> = {}
    if (values.pillar) metadata.pillar = values.pillar
    if (values.goals.length > 0) metadata.goals = values.goals
    if (values.key_messages.length > 0) metadata.key_messages = values.key_messages
    if (values.target_audience) metadata.target_audience = values.target_audience
    if (values.cta_url) metadata.cta_url = values.cta_url
    if (values.cta_text) metadata.cta_text = values.cta_text
    if (values.colour) metadata.colour = values.colour
    if (values.notes) metadata.notes = values.notes

    const insert: CampaignInsert = {
      title: values.title,
      slug,
      type: values.type ?? 'weekly_focus',
      status: values.status ?? 'draft',
      description: values.description || null,
      goal: values.goal || null,
      start_date: values.start_date,
      end_date: values.end_date,
      owner_id: values.owner_id || null,
      sponsor_id: values.sponsor_id || null,
      product_id: values.product_id || null,
      metadata,
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'campaign',
      entity_id: data.id,
    })

    revalidatePath('/campaigns')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing campaign.
 */
export async function updateCampaign(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Fetch current campaign for change tracking
    const { data: existing } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Campaign not found' }
    }

    const raw = parseFormData(formData)
    const parsed = campaignSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data
    const slug = generateSlug(values.title)

    // Build metadata, preserving existing metadata fields we do not manage here
    const existingMeta = (existing.metadata ?? {}) as Record<string, unknown>
    const metadata: Record<string, unknown> = { ...existingMeta }
    metadata.pillar = values.pillar || undefined
    metadata.goals = values.goals.length > 0 ? values.goals : undefined
    metadata.key_messages = values.key_messages.length > 0 ? values.key_messages : undefined
    metadata.target_audience = values.target_audience || undefined
    metadata.cta_url = values.cta_url || undefined
    metadata.cta_text = values.cta_text || undefined
    metadata.colour = values.colour || undefined
    metadata.notes = values.notes || undefined

    // Clean out undefined keys
    for (const key of Object.keys(metadata)) {
      if (metadata[key] === undefined) delete metadata[key]
    }

    const update: CampaignUpdate = {
      title: values.title,
      slug,
      type: values.type ?? 'weekly_focus',
      status: values.status ?? 'draft',
      description: values.description || null,
      goal: values.goal || null,
      start_date: values.start_date,
      end_date: values.end_date,
      owner_id: values.owner_id || null,
      sponsor_id: values.sponsor_id || null,
      product_id: values.product_id || null,
      metadata,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('campaigns')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Build field-level change log
    const changes: Record<string, unknown> = {}
    const trackFields = ['title', 'type', 'status', 'description', 'goal', 'start_date', 'end_date', 'owner_id'] as const
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
      entity_type: 'campaign',
      entity_id: id,
      changes,
    })

    revalidatePath('/campaigns')
    revalidatePath(`/campaigns/${id}`)
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Archive a campaign by setting metadata.archived_at.
 */
export async function archiveCampaign(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('campaigns')
      .select('metadata')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Campaign not found' }
    }

    const existingMeta = (existing.metadata ?? {}) as Record<string, unknown>
    const metadata = {
      ...existingMeta,
      archived_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('campaigns')
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'archived',
      entity_type: 'campaign',
      entity_id: id,
    })

    revalidatePath('/campaigns')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
