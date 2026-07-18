import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/timing?topic_id=...&weeks=12
 * Returns timing recommendations: upcoming seasonal peaks with
 * publish-by windows per format, based on seasonal indices.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const topicId = url.searchParams.get('topic_id')
  const weeks = parseInt(url.searchParams.get('weeks') || '12')

  // Get current ISO week
  const now = new Date()
  const jan4 = new Date(now.getFullYear(), 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const currentWeek = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 +
      new Date(now.getFullYear(), 0, 1).getDay() +
      1 -
      dayOfWeek) /
      7,
  )

  const targetWeeks = Array.from({ length: weeks }, (_, i) =>
    ((currentWeek + i) % 52) + 1,
  )

  let query = supabase
    .from('seasonal_indices')
    .select(`
      topic_id, iso_week, index_value, metric,
      confidence_score, confidence, years_observed, per_year_values,
      topics:topic_id (name, slug, commercial_category)
    `)
    .gte('index_value', 1.3)
    .in('confidence', ['emerging', 'probable', 'established'])
    .is('source', null)
    .in('iso_week', targetWeeks)
    .order('index_value', { ascending: false })

  if (topicId) {
    query = query.eq('topic_id', topicId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also fetch timing_recommendation insights that are validated
  let insightQuery = supabase
    .from('insights')
    .select('*')
    .eq('type', 'timing_recommendation')
    .in('status', ['candidate', 'validated'])
    .order('confidence_score', { ascending: false })
    .limit(50)

  if (topicId) {
    insightQuery = insightQuery.eq('topic_id', topicId)
  }

  const { data: timingInsights } = await insightQuery

  return NextResponse.json({
    upcoming_peaks: data || [],
    timing_insights: timingInsights || [],
    current_week: currentWeek,
  })
}
