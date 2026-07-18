import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/trends?topic_id=...&metric=views&source=
 * Trend Explorer — returns seasonal indices and daily metrics for a topic.
 * Powers the trend chart and almanac views.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const topicId = url.searchParams.get('topic_id')
  const metric = url.searchParams.get('metric') || 'views'
  const source = url.searchParams.get('source') || null
  const period = url.searchParams.get('period') || '365' // days

  if (!topicId) {
    return NextResponse.json({ error: 'topic_id required' }, { status: 400 })
  }

  // Fetch seasonal indices for this topic
  let seasonalQuery = supabase
    .from('seasonal_indices')
    .select('*')
    .eq('topic_id', topicId)
    .eq('metric', metric)
    .order('iso_week', { ascending: true })

  if (source) {
    seasonalQuery = seasonalQuery.eq('source', source)
  } else {
    seasonalQuery = seasonalQuery.is('source', null)
  }

  const { data: indices, error: indicesError } = await seasonalQuery

  // Fetch daily metrics for the chart
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - parseInt(period))

  let dailyQuery = supabase
    .from('topic_daily_metrics')
    .select('date, views, engagement, search_impressions, relative_interest')
    .eq('topic_id', topicId)
    .gte('date', fromDate.toISOString().slice(0, 10))
    .order('date', { ascending: true })

  if (source) {
    dailyQuery = dailyQuery.eq('source', source)
  } else {
    dailyQuery = dailyQuery.is('source', null)
  }

  const { data: daily, error: dailyError } = await dailyQuery

  if (indicesError || dailyError) {
    return NextResponse.json(
      { error: indicesError?.message || dailyError?.message },
      { status: 500 }
    )
  }

  // Fetch any active forecasts
  let forecastQuery = supabase
    .from('forecasts')
    .select('target_week, forecast_value, lower_bound, upper_bound, actual_value, abs_pct_error')
    .eq('topic_id', topicId)
    .eq('metric', metric)
    .gte('target_week', new Date().toISOString().slice(0, 10))
    .order('target_week', { ascending: true })

  if (source) {
    forecastQuery = forecastQuery.eq('source', source)
  } else {
    forecastQuery = forecastQuery.is('source', null)
  }

  const { data: forecasts } = await forecastQuery

  return NextResponse.json({
    topic_id: topicId,
    metric,
    source,
    seasonal_indices: indices || [],
    daily_metrics: daily || [],
    forecasts: forecasts || [],
  })
}
