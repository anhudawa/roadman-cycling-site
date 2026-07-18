import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/segments/members?segment_id=...&limit=100
 * List members of a segment (hashed keys only — privacy-preserving).
 *
 * POST /api/intelligence/segments/members
 * Add members to a segment (bulk insert).
 *
 * DELETE /api/intelligence/segments/members?segment_id=...
 * Remove all members from a segment (for recomputation).
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const segmentId = url.searchParams.get('segment_id')
  const limit = parseInt(url.searchParams.get('limit') || '100')
  const source = url.searchParams.get('source')

  if (!segmentId) {
    return NextResponse.json({ error: 'segment_id is required' }, { status: 400 })
  }

  let query = supabase
    .from('segment_members')
    .select('*')
    .eq('segment_id', segmentId)
    .order('affinity', { ascending: false })
    .limit(limit)

  if (source) {
    query = query.eq('member_source', source)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get total count
  const { count } = await supabase
    .from('segment_members')
    .select('*', { count: 'exact', head: true })
    .eq('segment_id', segmentId)

  return NextResponse.json({
    members: data || [],
    total_count: count ?? 0,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { segment_id, members } = body as {
    segment_id: string
    members: { member_key: string; member_source: string; affinity: number }[]
  }

  if (!segment_id || !members || members.length === 0) {
    return NextResponse.json({ error: 'segment_id and members[] required' }, { status: 400 })
  }

  // Validate all members have required fields
  for (const m of members) {
    if (!m.member_key || !m.member_source || typeof m.affinity !== 'number') {
      return NextResponse.json(
        { error: 'Each member needs member_key, member_source, and affinity' },
        { status: 400 },
      )
    }
  }

  // Bulk upsert members
  const { data, error } = await supabase
    .from('segment_members')
    .upsert(
      members.map((m) => ({
        segment_id,
        member_key: m.member_key,
        member_source: m.member_source,
        affinity: m.affinity,
      })),
      { onConflict: 'segment_id,member_key' },
    )
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update member count on the segment
  const { count } = await supabase
    .from('segment_members')
    .select('*', { count: 'exact', head: true })
    .eq('segment_id', segment_id)

  await supabase
    .from('audience_segments')
    .update({ member_count: count ?? 0 })
    .eq('id', segment_id)

  return NextResponse.json({
    ok: true,
    members_upserted: data?.length ?? 0,
    total_members: count ?? 0,
  })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const segmentId = url.searchParams.get('segment_id')

  if (!segmentId) {
    return NextResponse.json({ error: 'segment_id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('segment_members')
    .delete()
    .eq('segment_id', segmentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Reset member count
  await supabase
    .from('audience_segments')
    .update({ member_count: 0 })
    .eq('id', segmentId)

  return NextResponse.json({ ok: true })
}
