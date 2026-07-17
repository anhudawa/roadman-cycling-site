'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { ideaCaptureSchema, ideaSchema } from '@/lib/schemas/ideas'
import type { IdeaInsert, IdeaUpdate, AssetType, ContentPillar } from '@/types/database'

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

// ---------------------------------------------------------------------------
// Slug generator
// ---------------------------------------------------------------------------

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ---------------------------------------------------------------------------
// Quick capture — minimal validation, inserts with status='captured'
// ---------------------------------------------------------------------------

export async function captureIdea(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }

    const parsed = ideaCaptureSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    const insert: IdeaInsert = {
      title: values.title,
      description: null,
      status: 'captured',
      pillar: (values.pillar as ContentPillar) || null,
      suggested_type: null,
      source: values.source || null,
      created_by: profile.id,
      asset_id: null,
      score: 0,
      tags: [],
      metadata: {},
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'idea',
      entity_id: data.id,
    })

    revalidatePath('/ideas')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

// ---------------------------------------------------------------------------
// Update — full validation
// ---------------------------------------------------------------------------

export async function updateIdea(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Fetch existing idea for change tracking
    const { data: existing } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Idea not found' }
    }

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }

    // Parse JSON array fields
    try {
      raw.tags = formData.get('tags')
        ? JSON.parse(formData.get('tags') as string)
        : []
    } catch {
      raw.tags = []
    }

    const parsed = ideaSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    const update: IdeaUpdate = {
      title: values.title,
      description: values.description || null,
      status: values.status ?? 'captured',
      pillar: (values.pillar as ContentPillar) || null,
      suggested_type: (values.suggested_type as AssetType) || null,
      source: values.source || null,
      tags: values.tags ?? [],
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('ideas')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Build field-level change log
    const changes: Record<string, unknown> = {}
    const trackFields = ['title', 'status', 'pillar', 'description', 'suggested_type', 'source'] as const
    for (const field of trackFields) {
      const oldVal = (existing as Record<string, unknown>)[field]
      const newVal = (update as Record<string, unknown>)[field]
      if (oldVal !== newVal) {
        changes[field] = { from: oldVal, to: newVal }
      }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'idea',
      entity_id: id,
      changes,
    })

    revalidatePath('/ideas')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

// ---------------------------------------------------------------------------
// Vote — increment score by 1
// ---------------------------------------------------------------------------

export async function voteIdea(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Check if user already voted by looking in activity_log
    const { data: existingVote } = await supabase
      .from('activity_log')
      .select('id')
      .eq('actor_id', profile.id)
      .eq('entity_type', 'idea')
      .eq('entity_id', id)
      .eq('action', 'updated')
      .contains('changes', { vote: true })
      .limit(1)

    if (existingVote && existingVote.length > 0) {
      return { success: false, error: 'You have already voted on this idea' }
    }

    // Read current score
    const { data: existing } = await supabase
      .from('ideas')
      .select('score')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Idea not found' }
    }

    const newScore = ((existing as { score: number }).score ?? 0) + 1

    const { error } = await supabase
      .from('ideas')
      .update({ score: newScore, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'idea',
      entity_id: id,
      changes: { vote: true, score: { from: newScore - 1, to: newScore } },
    })

    revalidatePath('/ideas')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

// ---------------------------------------------------------------------------
// Promote — create an asset from the idea
// ---------------------------------------------------------------------------

export async function promoteIdea(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Fetch the idea
    const { data: idea } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single()

    if (!idea) {
      return { success: false, error: 'Idea not found' }
    }

    const ideaData = idea as Record<string, unknown>

    // Create an asset pre-filled from the idea
    const slug = generateSlug(ideaData.title as string)

    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert({
        title: ideaData.title as string,
        slug,
        type: (ideaData.suggested_type as AssetType) || 'other',
        status: 'idea',
        pillar: (ideaData.pillar as ContentPillar) || null,
        description: (ideaData.description as string) || null,
        body: null,
        campaign_id: null,
        parent_asset_id: null,
        creator_id: profile.id,
        assignee_id: null,
        publish_date: null,
        due_date: null,
        external_id: null,
        external_url: null,
        thumbnail_url: null,
        duration_seconds: null,
        word_count: null,
        metadata: { promoted_from_idea: id },
      })
      .select('id')
      .single()

    if (assetError || !asset) {
      return { success: false, error: assetError?.message ?? 'Failed to create asset' }
    }

    // Update the idea: set status to 'used' and link the asset
    const { error: updateError } = await supabase
      .from('ideas')
      .update({
        status: 'used',
        asset_id: asset.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Log activity for the idea
    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'idea',
      entity_id: id,
      changes: { promoted_to_asset: asset.id, status: { from: ideaData.status, to: 'used' } },
    })

    // Log activity for the new asset
    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'asset',
      entity_id: asset.id,
      changes: { promoted_from_idea: id },
    })

    revalidatePath('/ideas')
    revalidatePath('/assets')
    return { success: true, data: { id: asset.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

// ---------------------------------------------------------------------------
// Discard — set status to 'discarded'
// ---------------------------------------------------------------------------

export async function discardIdea(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('ideas')
      .select('status')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Idea not found' }
    }

    const { error } = await supabase
      .from('ideas')
      .update({ status: 'discarded', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'idea',
      entity_id: id,
      changes: { status: { from: (existing as { status: string }).status, to: 'discarded' } },
    })

    revalidatePath('/ideas')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
