import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/intelligence/community-snapshots
 * Inserts a weekly Skool community snapshot (T57 — Monday ritual).
 *
 * GET /api/intelligence/community-snapshots?community=free&limit=12
 * Returns recent snapshots for display.
 */

const snapshotSchema = z.object({
  community: z.enum(['free', 'ndy']),
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  total_members: z.number().int().min(0),
  new_members: z.number().int().min(0).default(0),
  churned_members: z.number().int().min(0).default(0),
  active_members: z.number().int().min(0).nullable().default(null),
  posts_count: z.number().int().min(0).default(0),
  comments_count: z.number().int().min(0).default(0),
  notes: z.string().max(1000).nullable().default(null),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = snapshotSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
      { status: 400 },
    )
  }

  // Validate week_start is a Monday
  const weekStart = new Date(parsed.data.week_start)
  if (weekStart.getUTCDay() !== 1) {
    return NextResponse.json(
      { error: 'week_start must be a Monday' },
      { status: 400 },
    )
  }

  // Look up profile ID for entered_by
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', session.user.id)
    .single()

  const { data, error } = await supabase
    .from('community_snapshots')
    .insert({
      ...parsed.data,
      entered_by: profile?.id ?? null,
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation (duplicate week)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: `Snapshot already exists for ${parsed.data.community} on ${parsed.data.week_start}. Use PATCH to update.` },
        { status: 409 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ snapshot: data }, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const community = url.searchParams.get('community')
  const limit = parseInt(url.searchParams.get('limit') || '12')

  let query = supabase
    .from('community_snapshots')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(limit)

  if (community && (community === 'free' || community === 'ndy')) {
    query = query.eq('community', community)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ snapshots: data || [] })
}
