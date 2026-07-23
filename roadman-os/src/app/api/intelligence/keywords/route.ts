import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// GET /api/intelligence/keywords
// ---------------------------------------------------------------------------

/**
 * Returns tracked keywords with their latest metrics and topic associations.
 *
 * Query params:
 *   topic_id  — optional UUID to filter by topic
 *   keyword   — optional search string (partial match)
 *   limit     — max rows (default 100)
 *   offset    — pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const topicId = searchParams.get('topic_id')
  const keywordSearch = searchParams.get('keyword')
  const limit = Math.min(Number(searchParams.get('limit') ?? 100), 500)
  const offset = Number(searchParams.get('offset') ?? 0)

  // Build query — select distinct keywords with their latest month's metrics
  let query = supabase
    .from('keyword_metrics')
    .select('*', { count: 'exact' })
    .order('month', { ascending: false })
    .order('keyword', { ascending: true })
    .range(offset, offset + limit - 1)

  if (topicId) {
    query = query.eq('topic_id', topicId)
  }

  if (keywordSearch) {
    query = query.ilike('keyword', `%${keywordSearch}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    keywords: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}

// ---------------------------------------------------------------------------
// POST /api/intelligence/keywords
// ---------------------------------------------------------------------------

const postBodySchema = z.object({
  action: z.enum(['add', 'remove', 'sync', 'seed_from_gsc']),
  keywords: z.array(z.string()).optional(),
  keyword_id: z.string().uuid().optional(),
  topic_id: z.string().uuid().optional(),
})

/**
 * Keyword management actions:
 *   add             — Insert keyword(s) into tracking, optionally linked to a topic
 *   remove          — Remove a keyword from tracking by keyword_id
 *   sync            — Trigger a volume/ranking refresh for tracked keywords (stubbed)
 *   seed_from_gsc   — Import top queries from search_console_daily as tracked keywords
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = postBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
      { status: 400 },
    )
  }

  const { action, keywords, keyword_id, topic_id } = parsed.data

  // -------------------------------------------------------------------------
  // ADD — insert keyword(s) into keyword_metrics
  // -------------------------------------------------------------------------
  if (action === 'add') {
    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'keywords array is required for add action' },
        { status: 400 },
      )
    }

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const rows = keywords.map((kw) => ({
      keyword: kw.toLowerCase().trim(),
      topic_id: topic_id ?? null,
      month: currentMonth,
      search_volume: null,
      cpc_cents: null,
      competition: null,
      provider: 'dataforseo',
    }))

    const { data: inserted, error: insertError } = await supabase
      .from('keyword_metrics')
      .upsert(rows, { onConflict: 'keyword,month' })
      .select()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ added: inserted?.length ?? 0, keywords: inserted })
  }

  // -------------------------------------------------------------------------
  // REMOVE — delete a keyword from tracking
  // -------------------------------------------------------------------------
  if (action === 'remove') {
    if (!keyword_id) {
      return NextResponse.json(
        { error: 'keyword_id is required for remove action' },
        { status: 400 },
      )
    }

    const { error: deleteError } = await supabase
      .from('keyword_metrics')
      .delete()
      .eq('id', keyword_id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ removed: true })
  }

  // -------------------------------------------------------------------------
  // SYNC — trigger a volume/ranking refresh (stubbed)
  // -------------------------------------------------------------------------
  if (action === 'sync') {
    // TODO: Trigger the /api/sync/keywords endpoint with the tracked keywords.
    // This would create a sync_job and call DataForSEO for fresh volume data.
    // For now, return a placeholder response.

    return NextResponse.json({
      message: 'Keyword sync queued',
      synced: 0,
    })
  }

  // -------------------------------------------------------------------------
  // SEED_FROM_GSC — import top queries from search_console_daily
  // -------------------------------------------------------------------------
  if (action === 'seed_from_gsc') {
    // Read top queries from search_console_daily, grouped by query,
    // ordered by total impressions descending
    const { data: topQueries, error: gscError } = await supabase
      .rpc('get_top_gsc_queries', { query_limit: 50 })

    // Fallback: if the RPC doesn't exist, query directly
    if (gscError) {
      const { data: rawQueries, error: rawError } = await supabase
        .from('search_console_daily')
        .select('query, topic_id, impressions')
        .order('impressions', { ascending: false })
        .limit(200)

      if (rawError) {
        return NextResponse.json({ error: rawError.message }, { status: 500 })
      }

      if (!rawQueries || rawQueries.length === 0) {
        return NextResponse.json({ seeded: 0, message: 'No GSC data found' })
      }

      // Aggregate by query to get top ones
      const queryMap = new Map<string, { impressions: number; topic_id: string | null }>()
      for (const row of rawQueries) {
        const existing = queryMap.get(row.query)
        if (existing) {
          existing.impressions += row.impressions
          // Prefer a topic_id if one exists
          if (!existing.topic_id && row.topic_id) {
            existing.topic_id = row.topic_id
          }
        } else {
          queryMap.set(row.query, {
            impressions: row.impressions,
            topic_id: row.topic_id,
          })
        }
      }

      // Sort by impressions and take the top 50
      const sorted = Array.from(queryMap.entries())
        .sort((a, b) => b[1].impressions - a[1].impressions)
        .slice(0, 50)

      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

      const rows = sorted.map(([query, info]) => ({
        keyword: query.toLowerCase().trim(),
        topic_id: info.topic_id,
        month: currentMonth,
        search_volume: null,
        cpc_cents: null,
        competition: null,
        provider: 'gsc_seed',
      }))

      const { data: seeded, error: seedError } = await supabase
        .from('keyword_metrics')
        .upsert(rows, { onConflict: 'keyword,month' })
        .select()

      if (seedError) {
        return NextResponse.json({ error: seedError.message }, { status: 500 })
      }

      return NextResponse.json({ seeded: seeded?.length ?? 0 })
    }

    // If the RPC succeeded, process its results
    const queries = topQueries as Array<{ query: string; topic_id: string | null; total_impressions: number }>

    if (!queries || queries.length === 0) {
      return NextResponse.json({ seeded: 0, message: 'No GSC data found' })
    }

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const rows = queries.map((q) => ({
      keyword: q.query.toLowerCase().trim(),
      topic_id: q.topic_id,
      month: currentMonth,
      search_volume: null,
      cpc_cents: null,
      competition: null,
      provider: 'gsc_seed',
    }))

    const { data: seeded, error: seedError } = await supabase
      .from('keyword_metrics')
      .upsert(rows, { onConflict: 'keyword,month' })
      .select()

    if (seedError) {
      return NextResponse.json({ error: seedError.message }, { status: 500 })
    }

    return NextResponse.json({ seeded: seeded?.length ?? 0 })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
