'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { skoolMetricsSchema } from '@/lib/schemas/integrations'
import type { PerformanceRecordInsert } from '@/types/database'

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

/** NDY monthly subscription price in dollars. */
const NDY_PRICE_DOLLARS = 195

/**
 * Save manually-entered Skool community metrics as a performance_record.
 *
 * For the "not_done_yet" tier the MRR is auto-calculated from member_count.
 */
export async function saveSkoolMetrics(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }

    const parsed = skoolMetricsSchema.safeParse(raw)
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    const isNDY = values.tier === 'not_done_yet'
    const mrrCents = isNDY ? values.member_count * NDY_PRICE_DOLLARS * 100 : undefined

    const customMetrics: Record<string, unknown> = {
      tier: values.tier,
      period: values.period,
      period_start: values.period_start,
      new_joins: values.new_joins,
      members_left: values.members_left,
      active_members: values.active_members,
      posts: values.posts,
      comments: values.comments,
    }

    if (mrrCents !== undefined) {
      customMetrics.mrr_cents = mrrCents
    }

    const insert: PerformanceRecordInsert = {
      asset_id: null,
      publication_id: null,
      source: 'skool',
      recorded_at: values.period_start,
      views: values.active_members,
      impressions: 0,
      clicks: 0,
      likes: 0,
      comments: values.comments,
      shares: 0,
      saves: 0,
      subscribers_gained: values.new_joins,
      watch_time_seconds: 0,
      avg_view_duration_seconds: 0,
      ctr: 0,
      engagement_rate: values.posts + values.comments,
      reach: values.member_count,
      revenue_cents: mrrCents ?? 0,
      custom_metrics: customMetrics,
    }

    const { data, error } = await supabase
      .from('performance_records')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'performance_record',
      entity_id: data.id,
      changes: {
        source: 'skool',
        tier: values.tier,
        period: values.period,
        period_start: values.period_start,
      },
    })

    revalidatePath('/settings/integrations/skool')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Fetch recent Skool performance_records filtered by community tier.
 */
export async function getSkoolHistory(
  tier: 'clubhouse' | 'not_done_yet',
  limit = 20,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('performance_records')
    .select('*')
    .eq('source', 'skool')
    .order('recorded_at', { ascending: false })
    .limit(limit)

  if (error) {
    return []
  }

  // Filter by tier stored inside custom_metrics
  return (data ?? []).filter(
    (record) =>
      record.custom_metrics &&
      typeof record.custom_metrics === 'object' &&
      (record.custom_metrics as Record<string, unknown>).tier === tier,
  )
}
