'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { briefSchema } from '@/lib/schemas/briefs'

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

// ---------------------------------------------------------------------------
// Extended fields stored in distribution_plan JSON
// ---------------------------------------------------------------------------

const EXTENDED_FIELD_KEYS = [
  'primary_query',
  'secondary_queries',
  'search_intent',
  'target_persona',
  'pillar',
  'unique_angle',
  'competitor_gaps',
  'original_sources',
  'answer_capsule',
  'decision_framework',
  'pillar_page',
  'related_episodes',
  'tools_mentioned',
  'cta',
  'existing_pages',
  'cannibalisation_decision',
  'cannibalisation_rationale',
] as const

// ---------------------------------------------------------------------------
// Create brief
// ---------------------------------------------------------------------------

export async function createBrief(
  assetId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Parse and validate form fields
    const raw = Object.fromEntries(formData.entries())
    const parsed = briefSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    // Build the distribution_plan JSON with extended fields + status
    const distributionPlan: Record<string, unknown> = { status: 'draft' }
    for (const key of EXTENDED_FIELD_KEYS) {
      if (values[key]) {
        distributionPlan[key] = values[key]
      }
    }

    // Split comma-separated seo_keywords into array
    const seoKeywords = values.seo_keywords
      ? values.seo_keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : null

    const { data: brief, error: insertError } = await supabase
      .from('content_briefs')
      .insert({
        asset_id: assetId,
        created_by: profile.id,
        objective: values.objective || null,
        target_audience: values.target_audience || null,
        key_messages: null,
        tone: values.tone || null,
        references: [],
        seo_keywords: seoKeywords,
        distribution_plan: distributionPlan,
        notes: values.notes || null,
      })
      .select('id')
      .single()

    if (insertError || !brief) {
      return { success: false, error: insertError?.message ?? 'Failed to create brief' }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'content_brief',
      entity_id: brief.id,
      changes: { asset_id: assetId },
    })

    revalidatePath(`/assets/${assetId}`)
    revalidatePath(`/assets/${assetId}/brief`)
    return { success: true, data: { id: brief.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// Update brief
// ---------------------------------------------------------------------------

export async function updateBrief(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Parse and validate
    const raw = Object.fromEntries(formData.entries())
    const parsed = briefSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    // Fetch existing brief to preserve distribution_plan metadata (status, approver, etc.)
    const { data: existing } = await supabase
      .from('content_briefs')
      .select('asset_id, distribution_plan')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Brief not found' }
    }

    const existingPlan = (existing.distribution_plan ?? {}) as Record<string, unknown>

    // Build updated distribution_plan — preserve status and approval metadata
    const distributionPlan: Record<string, unknown> = {
      status: existingPlan.status ?? 'draft',
      approved_by: existingPlan.approved_by,
      approved_at: existingPlan.approved_at,
      rejected_by: existingPlan.rejected_by,
      rejected_at: existingPlan.rejected_at,
      rejection_reason: existingPlan.rejection_reason,
    }

    for (const key of EXTENDED_FIELD_KEYS) {
      distributionPlan[key] = values[key] || undefined
    }

    // Clean undefined values
    for (const key of Object.keys(distributionPlan)) {
      if (distributionPlan[key] === undefined) {
        delete distributionPlan[key]
      }
    }

    const seoKeywords = values.seo_keywords
      ? values.seo_keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : null

    const { error: updateError } = await supabase
      .from('content_briefs')
      .update({
        objective: values.objective || null,
        target_audience: values.target_audience || null,
        tone: values.tone || null,
        seo_keywords: seoKeywords,
        distribution_plan: distributionPlan,
        notes: values.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'content_brief',
      entity_id: id,
    })

    const assetId = existing.asset_id as string
    revalidatePath(`/assets/${assetId}`)
    revalidatePath(`/assets/${assetId}/brief`)
    return { success: true, data: { id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// Submit brief for review
// ---------------------------------------------------------------------------

export async function submitBrief(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Fetch existing brief
    const { data: existing } = await supabase
      .from('content_briefs')
      .select('asset_id, distribution_plan')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Brief not found' }
    }

    const plan = (existing.distribution_plan ?? {}) as Record<string, unknown>
    plan.status = 'submitted'

    const { error: updateError } = await supabase
      .from('content_briefs')
      .update({
        distribution_plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'status_changed',
      entity_type: 'content_brief',
      entity_id: id,
      changes: { status: 'submitted' },
    })

    const assetId = existing.asset_id as string
    revalidatePath(`/assets/${assetId}`)
    revalidatePath(`/assets/${assetId}/brief`)
    return { success: true, data: { id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// Approve brief
// ---------------------------------------------------------------------------

export async function approveBrief(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()

    // Check role — only admin or leadership can approve
    if (profile.role !== 'admin' && profile.role !== 'leadership') {
      return { success: false, error: 'Only admin or leadership can approve briefs' }
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('content_briefs')
      .select('asset_id, distribution_plan')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Brief not found' }
    }

    const plan = (existing.distribution_plan ?? {}) as Record<string, unknown>
    plan.status = 'approved'
    plan.approved_by = profile.id
    plan.approved_at = new Date().toISOString()

    // Update the brief
    const { error: briefError } = await supabase
      .from('content_briefs')
      .update({
        distribution_plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (briefError) {
      return { success: false, error: briefError.message }
    }

    // Update the asset status to 'brief_written'
    const assetId = existing.asset_id as string
    await supabase
      .from('assets')
      .update({ status: 'brief_written' })
      .eq('id', assetId)

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'approved',
      entity_type: 'content_brief',
      entity_id: id,
      changes: { asset_id: assetId },
    })

    revalidatePath(`/assets/${assetId}`)
    revalidatePath(`/assets/${assetId}/brief`)
    revalidatePath('/assets')
    return { success: true, data: { id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// Reject brief
// ---------------------------------------------------------------------------

export async function rejectBrief(
  id: string,
  reason: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()

    // Check role — only admin or leadership can reject
    if (profile.role !== 'admin' && profile.role !== 'leadership') {
      return { success: false, error: 'Only admin or leadership can reject briefs' }
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('content_briefs')
      .select('asset_id, distribution_plan')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Brief not found' }
    }

    const plan = (existing.distribution_plan ?? {}) as Record<string, unknown>
    plan.status = 'rejected'
    plan.rejected_by = profile.id
    plan.rejected_at = new Date().toISOString()
    plan.rejection_reason = reason

    const { error: updateError } = await supabase
      .from('content_briefs')
      .update({
        distribution_plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'rejected',
      entity_type: 'content_brief',
      entity_id: id,
      changes: { reason, asset_id: existing.asset_id },
    })

    const assetId = existing.asset_id as string
    revalidatePath(`/assets/${assetId}`)
    revalidatePath(`/assets/${assetId}/brief`)
    return { success: true, data: { id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}
