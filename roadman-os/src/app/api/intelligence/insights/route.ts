import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { InsightStatus } from '@/types/database'

/**
 * GET /api/intelligence/insights?status=candidate&type=seasonal_peak&topic_id=...&limit=50
 * Returns insights with optional filters.
 *
 * PATCH /api/intelligence/insights
 * Update insight: validate, dismiss, edit, toggle sponsor_safe.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')
  const topicId = url.searchParams.get('topic_id')
  const sponsorSafe = url.searchParams.get('sponsor_safe')
  const limit = parseInt(url.searchParams.get('limit') || '50')

  let query = supabase
    .from('insights')
    .select(`
      *,
      topics:topic_id (name, slug, pillar, commercial_category)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }
  if (type) {
    query = query.eq('type', type)
  }
  if (topicId) {
    query = query.eq('topic_id', topicId)
  }
  if (sponsorSafe === 'true') {
    query = query.eq('sponsor_safe', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ insights: data || [] })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { id, action, reason, statement, sponsor_safe } = body as {
    id: string
    action: 'validate' | 'dismiss' | 'archive' | 'edit' | 'toggle_sponsor_safe'
    reason?: string
    statement?: string
    sponsor_safe?: boolean
  }

  if (!id || !action) {
    return NextResponse.json({ error: 'id and action required' }, { status: 400 })
  }

  const userId = session.user.id

  switch (action) {
    case 'validate': {
      const { error } = await supabase
        .from('insights')
        .update({
          status: 'validated' as InsightStatus,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    case 'dismiss': {
      // Merge dismiss_reason into existing evidence rather than overwriting
      if (reason) {
        const { data: current } = await supabase
          .from('insights')
          .select('evidence')
          .eq('id', id)
          .single()

        const mergedEvidence = {
          ...(current?.evidence as Record<string, unknown> ?? {}),
          dismiss_reason: reason,
        }

        const { error } = await supabase
          .from('insights')
          .update({
            status: 'dismissed' as InsightStatus,
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
            evidence: mergedEvidence,
          })
          .eq('id', id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      } else {
        const { error } = await supabase
          .from('insights')
          .update({
            status: 'dismissed' as InsightStatus,
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    case 'archive': {
      const { error } = await supabase
        .from('insights')
        .update({
          status: 'archived' as InsightStatus,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    case 'edit': {
      if (!statement) {
        return NextResponse.json({ error: 'statement required for edit' }, { status: 400 })
      }
      const { error } = await supabase
        .from('insights')
        .update({ statement })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    case 'toggle_sponsor_safe': {
      if (typeof sponsor_safe !== 'boolean') {
        return NextResponse.json({ error: 'sponsor_safe boolean required' }, { status: 400 })
      }
      const { error } = await supabase
        .from('insights')
        .update({ sponsor_safe })
        .eq('id', id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

/**
 * POST /api/intelligence/insights/generate
 * Manual trigger for insight generation (admin only).
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Import and run generators
  const { runAllGenerators } = await import('@/lib/insights/generators')
  const results = await runAllGenerators()

  return NextResponse.json({
    ok: true,
    results,
    ran_at: new Date().toISOString(),
  })
}
