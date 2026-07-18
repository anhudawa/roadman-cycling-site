import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/topics
 * Returns topics marked as trend-tracked (is_trend_tracked = true).
 * Used by the Trend Explorer topic selector dropdown.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('topics')
    .select('id, name, slug, pillar, commercial_category')
    .eq('is_trend_tracked', true)
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ topics: data || [] })
}
