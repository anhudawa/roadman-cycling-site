import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/intelligence/classify
 * Triggers the topic auto-classification function (T56).
 * Classifies untagged GSC queries and community posts using alias matching
 * and pgvector cosine similarity.
 *
 * GET /api/intelligence/classify?days=7&limit=50
 * Returns recent classifications for human review.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const lookbackDays = (body as Record<string, unknown>).lookback_days ?? 7
  const similarityThreshold = (body as Record<string, unknown>).similarity_threshold ?? 0.72
  const autoAliasThreshold = (body as Record<string, unknown>).auto_alias_threshold ?? 0.85

  const { data, error } = await supabase.rpc('classify_topics', {
    p_lookback_days: lookbackDays as number,
    p_similarity_threshold: similarityThreshold as number,
    p_auto_alias_threshold: autoAliasThreshold as number,
  })

  if (error) {
    console.error('[intelligence/classify] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    result: data,
    ran_at: new Date().toISOString(),
  })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const days = parseInt(url.searchParams.get('days') || '7')
  const limit = parseInt(url.searchParams.get('limit') || '50')

  const { data, error } = await supabase.rpc('review_classifications', {
    p_lookback_days: days,
    p_limit: limit,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ classifications: data || [] })
}
