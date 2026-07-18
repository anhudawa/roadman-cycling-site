import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/health
 * Data quality and coverage dashboard.
 * Returns sync freshness, topic coverage, alias stats, and quality log.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // 1. Data freshness: latest date in each key table
  const [perfDaily, gsc, tdm, seasonal] = await Promise.all([
    supabase
      .from('performance_daily')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('search_console_daily')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('topic_daily_metrics')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('seasonal_indices')
      .select('computed_at')
      .order('computed_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  // 2. Topic coverage: tracked topics with/without data
  const { count: trackedTopics } = await supabase
    .from('topics')
    .select('id', { count: 'exact', head: true })
    .eq('is_trend_tracked', true)

  const { data: topicsWithData } = await supabase
    .from('topic_daily_metrics')
    .select('topic_id')
    .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))

  const uniqueTopicsWithData = new Set((topicsWithData || []).map(t => t.topic_id)).size

  // 3. Alias coverage
  const { count: aliasCount } = await supabase
    .from('topic_aliases')
    .select('id', { count: 'exact', head: true })

  // 4. Confidence distribution
  const { data: confidenceDist } = await supabase
    .from('seasonal_indices')
    .select('confidence')

  const distribution = (confidenceDist || []).reduce(
    (acc, row) => {
      acc[row.confidence] = (acc[row.confidence] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 5. Recent quality checks
  const { data: recentChecks } = await supabase
    .from('data_quality_log')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(20)

  // 6. Unacknowledged anomalies count
  const { count: unackedAnomalies } = await supabase
    .from('anomalies')
    .select('id', { count: 'exact', head: true })
    .eq('is_acknowledged', false)

  return NextResponse.json({
    freshness: {
      performance_daily: perfDaily.data?.date || null,
      search_console: gsc.data?.date || null,
      topic_daily_metrics: tdm.data?.date || null,
      seasonal_indices: seasonal.data?.computed_at || null,
    },
    coverage: {
      tracked_topics: trackedTopics || 0,
      topics_with_recent_data: uniqueTopicsWithData,
      coverage_pct: trackedTopics
        ? Math.round((uniqueTopicsWithData / trackedTopics) * 100)
        : 0,
      alias_count: aliasCount || 0,
    },
    confidence_distribution: distribution,
    unacknowledged_anomalies: unackedAnomalies || 0,
    recent_quality_checks: recentChecks || [],
  })
}
