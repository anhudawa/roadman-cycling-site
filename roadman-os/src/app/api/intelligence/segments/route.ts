import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/segments?active=true
 * List audience segments with member counts.
 *
 * POST /api/intelligence/segments
 * Create a new audience segment.
 *
 * PATCH /api/intelligence/segments
 * Update a segment (name, description, topic affinities, active status).
 *
 * DELETE /api/intelligence/segments?id=...
 * Deactivate a segment (soft delete via is_active = false).
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const activeOnly = url.searchParams.get('active') !== 'false'
  const segmentId = url.searchParams.get('id')

  if (segmentId) {
    // Fetch single segment with members
    const { data: segment, error } = await supabase
      .from('audience_segments')
      .select('*')
      .eq('id', segmentId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Fetch member count by source
    const { data: members } = await supabase
      .from('segment_members')
      .select('member_source, affinity')
      .eq('segment_id', segmentId)

    const sourceCounts: Record<string, number> = {}
    const affinityDistribution = { high: 0, medium: 0, low: 0 }

    for (const m of members || []) {
      sourceCounts[m.member_source] = (sourceCounts[m.member_source] || 0) + 1
      if (m.affinity >= 0.7) affinityDistribution.high += 1
      else if (m.affinity >= 0.4) affinityDistribution.medium += 1
      else affinityDistribution.low += 1
    }

    return NextResponse.json({
      segment,
      member_count: members?.length ?? 0,
      source_breakdown: sourceCounts,
      affinity_distribution: affinityDistribution,
    })
  }

  // List all segments
  let query = supabase
    .from('audience_segments')
    .select('*')
    .order('member_count', { ascending: false })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ segments: data || [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, discovery_method, topic_affinities, seasonal_profile } = body as {
    name: string
    description?: string
    discovery_method?: string
    topic_affinities?: Record<string, number>
    seasonal_profile?: Record<string, unknown>
  }

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('audience_segments')
    .insert({
      name,
      description: description || null,
      discovery_method: discovery_method || 'manual',
      topic_affinities: topic_affinities || {},
      seasonal_profile: seasonal_profile || {},
      member_count: 0,
      is_active: true,
      revenue_rate: null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ segment: data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { id, ...updates } = body as {
    id: string
    name?: string
    description?: string
    topic_affinities?: Record<string, number>
    seasonal_profile?: Record<string, unknown>
    is_active?: boolean
    revenue_rate?: number | null
  }

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('audience_segments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ segment: data })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  // Soft delete — deactivate
  const { error } = await supabase
    .from('audience_segments')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
