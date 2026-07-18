import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/forecasts?topic_id=...&weeks=4
 * Returns forecasts for a topic, including self-grading data for past forecasts.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const topicId = url.searchParams.get('topic_id')
  const weeks = parseInt(url.searchParams.get('weeks') || '8')

  // If no topic_id, return summary of all upcoming forecasts
  if (!topicId) {
    const { data, error } = await supabase
      .from('forecasts')
      .select(`
        *,
        topics:topic_id (name, slug)
      `)
      .gte('target_week', new Date().toISOString().slice(0, 10))
      .is('source', null)
      .eq('metric', 'views')
      .order('target_week', { ascending: true })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ forecasts: data || [] })
  }

  // Topic-specific: include historical forecasts for accuracy assessment
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - (weeks * 7))

  const { data, error } = await supabase
    .from('forecasts')
    .select('*')
    .eq('topic_id', topicId)
    .is('source', null)
    .gte('target_week', fromDate.toISOString().slice(0, 10))
    .order('target_week', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Compute aggregate accuracy (MAPE) for graded forecasts
  const graded = (data || []).filter(f => f.abs_pct_error !== null)
  const mape = graded.length > 0
    ? graded.reduce((sum, f) => sum + (f.abs_pct_error || 0), 0) / graded.length
    : null

  return NextResponse.json({
    topic_id: topicId,
    forecasts: data || [],
    accuracy: {
      graded_count: graded.length,
      mape: mape !== null ? Math.round(mape * 1000) / 10 : null, // percentage
    },
  })
}
