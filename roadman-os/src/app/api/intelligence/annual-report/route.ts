import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/annual-report?year=2025
 * "State of the Masters Cyclist" annual report data.
 * Aggregates seasonal almanac, rising/falling topics, demographic shifts,
 * community themes, headline stats, notable anomalies, and top insights.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const yearParam = url.searchParams.get('year')
  if (!yearParam || !/^\d{4}$/.test(yearParam)) {
    return NextResponse.json({ error: 'year query parameter required (e.g. ?year=2025)' }, { status: 400 })
  }

  const year = parseInt(yearParam)
  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`
  const h1Start = `${year}-01-01`
  const h1End = `${year}-06-30`
  const h2Start = `${year}-07-01`
  const h2End = `${year}-12-31`
  const q1Start = `${year}-01-01`
  const q1End = `${year}-03-31`
  const q4Start = `${year}-10-01`
  const q4End = `${year}-12-31`
  const prevYearStart = `${year - 1}-01-01`
  const prevYearEnd = `${year - 1}-12-31`

  try {
    // -----------------------------------------------------------------------
    // 1. Seasonal Almanac
    // -----------------------------------------------------------------------
    const { data: trackedTopics } = await supabase
      .from('topics')
      .select('id, name, slug')
      .eq('is_trend_tracked', true)

    const topics = trackedTopics || []
    const topicIds = topics.map((t) => t.id)

    const { data: seasonalRaw } = await supabase
      .from('seasonal_indices')
      .select('topic_id, iso_week, index_value, confidence_score, confidence')
      .in('topic_id', topicIds.length > 0 ? topicIds : ['__none__'])
      .eq('metric', 'search_impressions')

    // Average index_value across sources per topic+week
    const seasonalMap = new Map<string, Map<number, { sum: number; count: number; confidence_score: number; confidence: string }>>()
    for (const row of seasonalRaw || []) {
      if (!seasonalMap.has(row.topic_id)) {
        seasonalMap.set(row.topic_id, new Map())
      }
      const weekMap = seasonalMap.get(row.topic_id)!
      const existing = weekMap.get(row.iso_week)
      if (existing) {
        existing.sum += row.index_value
        existing.count += 1
        if (row.confidence_score > existing.confidence_score) {
          existing.confidence_score = row.confidence_score
          existing.confidence = row.confidence
        }
      } else {
        weekMap.set(row.iso_week, {
          sum: row.index_value,
          count: 1,
          confidence_score: row.confidence_score,
          confidence: row.confidence,
        })
      }
    }

    const seasonal_almanac = topics.map((topic) => {
      const weekMap = seasonalMap.get(topic.id)
      const weeks = Array.from({ length: 53 }, (_, i) => {
        const week = i + 1
        const entry = weekMap?.get(week)
        return {
          iso_week: week,
          index_value: entry ? entry.sum / entry.count : 0,
          confidence_score: entry?.confidence_score ?? 0,
          confidence: entry?.confidence ?? 'noise',
        }
      })

      const peak = weeks.reduce((best, w) => (w.index_value > best.index_value ? w : best), weeks[0])

      return {
        topic_id: topic.id,
        topic_name: topic.name,
        topic_slug: topic.slug,
        weeks,
        peak_week: peak.iso_week,
        peak_index: peak.index_value,
        confidence: peak.confidence,
      }
    })

    // -----------------------------------------------------------------------
    // 2. Rising & Falling Topics (rollup rows: source IS NULL)
    // -----------------------------------------------------------------------
    const { data: h1Metrics } = await supabase
      .from('topic_daily_metrics')
      .select('topic_id, engagement')
      .is('source', null)
      .gte('date', h1Start)
      .lte('date', h1End)
      .in('topic_id', topicIds.length > 0 ? topicIds : ['__none__'])

    const { data: h2Metrics } = await supabase
      .from('topic_daily_metrics')
      .select('topic_id, engagement')
      .is('source', null)
      .gte('date', h2Start)
      .lte('date', h2End)
      .in('topic_id', topicIds.length > 0 ? topicIds : ['__none__'])

    const h1Totals = new Map<string, number>()
    const h2Totals = new Map<string, number>()
    for (const row of h1Metrics || []) {
      h1Totals.set(row.topic_id, (h1Totals.get(row.topic_id) || 0) + row.engagement)
    }
    for (const row of h2Metrics || []) {
      h2Totals.set(row.topic_id, (h2Totals.get(row.topic_id) || 0) + row.engagement)
    }

    const topicNameMap = new Map(topics.map((t) => [t.id, t.name]))

    const rising_topics: { topic_id: string; topic_name: string; growth_pct: number }[] = []
    const falling_topics: { topic_id: string; topic_name: string; decline_pct: number }[] = []

    for (const topicId of topicIds) {
      const h1 = h1Totals.get(topicId) || 0
      const h2 = h2Totals.get(topicId) || 0
      if (h1 <= 0) continue

      const changePct = ((h2 - h1) / h1) * 100
      if (changePct > 20) {
        rising_topics.push({
          topic_id: topicId,
          topic_name: topicNameMap.get(topicId) || '',
          growth_pct: Math.round(changePct * 10) / 10,
        })
      } else if (changePct < -20) {
        falling_topics.push({
          topic_id: topicId,
          topic_name: topicNameMap.get(topicId) || '',
          decline_pct: Math.round(Math.abs(changePct) * 10) / 10,
        })
      }
    }

    rising_topics.sort((a, b) => b.growth_pct - a.growth_pct)
    falling_topics.sort((a, b) => b.decline_pct - a.decline_pct)

    // -----------------------------------------------------------------------
    // 3. Demographic Shifts — Q1 vs Q4
    // -----------------------------------------------------------------------
    const { data: q1Demographics } = await supabase
      .from('audience_demographics')
      .select('age_bracket, gender, share_pct')
      .gte('period_start', q1Start)
      .lte('period_end', q1End)

    const { data: q4Demographics } = await supabase
      .from('audience_demographics')
      .select('age_bracket, gender, share_pct')
      .gte('period_start', q4Start)
      .lte('period_end', q4End)

    // Average share_pct by age_bracket+gender within each quarter
    function aggregateDemographics(rows: { age_bracket: string; gender: string; share_pct: number }[] | null) {
      const map = new Map<string, { sum: number; count: number }>()
      for (const row of rows || []) {
        const key = `${row.age_bracket}|${row.gender}`
        const existing = map.get(key)
        if (existing) {
          existing.sum += row.share_pct
          existing.count += 1
        } else {
          map.set(key, { sum: row.share_pct, count: 1 })
        }
      }
      const result: { age_bracket: string; gender: string; avg_share_pct: number }[] = []
      map.forEach((val, key) => {
        const [age_bracket, gender] = key.split('|')
        result.push({ age_bracket, gender, avg_share_pct: val.sum / val.count })
      })
      return result
    }

    const q1Agg = aggregateDemographics(q1Demographics)
    const q4Agg = aggregateDemographics(q4Demographics)

    const q1Map = new Map(q1Agg.map((d) => [`${d.age_bracket}|${d.gender}`, d.avg_share_pct]))
    const q4Map = new Map(q4Agg.map((d) => [`${d.age_bracket}|${d.gender}`, d.avg_share_pct]))

    const allKeys = new Set([...q1Map.keys(), ...q4Map.keys()])
    const demographic_shifts = Array.from(allKeys).map((key) => {
      const [age_bracket, gender] = key.split('|')
      const q1Share = q1Map.get(key) || 0
      const q4Share = q4Map.get(key) || 0
      return {
        age_bracket,
        gender,
        q1_share_pct: Math.round(q1Share * 100) / 100,
        q4_share_pct: Math.round(q4Share * 100) / 100,
        change_pct: Math.round((q4Share - q1Share) * 100) / 100,
      }
    }).sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))

    // -----------------------------------------------------------------------
    // 4. Community Themes — top 10 by community_posts volume
    // -----------------------------------------------------------------------
    const { data: communityMetrics } = await supabase
      .from('topic_daily_metrics')
      .select('topic_id, community_posts')
      .is('source', null)
      .gte('date', yearStart)
      .lte('date', yearEnd)
      .in('topic_id', topicIds.length > 0 ? topicIds : ['__none__'])

    const communityTotals = new Map<string, number>()
    for (const row of communityMetrics || []) {
      communityTotals.set(row.topic_id, (communityTotals.get(row.topic_id) || 0) + row.community_posts)
    }

    const community_themes = Array.from(communityTotals.entries())
      .map(([topic_id, total_posts]) => ({
        topic_id,
        topic_name: topicNameMap.get(topic_id) || '',
        total_posts,
      }))
      .sort((a, b) => b.total_posts - a.total_posts)
      .slice(0, 10)

    // -----------------------------------------------------------------------
    // 5. Headline Stats
    // -----------------------------------------------------------------------
    const { data: yearMetrics } = await supabase
      .from('topic_daily_metrics')
      .select('views, engagement, search_impressions, revenue_cents')
      .is('source', null)
      .gte('date', yearStart)
      .lte('date', yearEnd)
      .in('topic_id', topicIds.length > 0 ? topicIds : ['__none__'])

    let totalViews = 0
    let totalEngagement = 0
    let totalSearchImpressions = 0
    let totalRevenueCents = 0

    for (const row of yearMetrics || []) {
      totalViews += row.views
      totalEngagement += row.engagement
      totalSearchImpressions += row.search_impressions
      totalRevenueCents += row.revenue_cents
    }

    // Prior year for YoY comparison
    const { data: prevYearMetrics } = await supabase
      .from('topic_daily_metrics')
      .select('views, engagement, search_impressions, revenue_cents')
      .is('source', null)
      .gte('date', prevYearStart)
      .lte('date', prevYearEnd)
      .in('topic_id', topicIds.length > 0 ? topicIds : ['__none__'])

    let prevViews = 0
    let prevEngagement = 0
    let prevSearchImpressions = 0
    let prevRevenueCents = 0
    const hasPriorYear = (prevYearMetrics || []).length > 0

    for (const row of prevYearMetrics || []) {
      prevViews += row.views
      prevEngagement += row.engagement
      prevSearchImpressions += row.search_impressions
      prevRevenueCents += row.revenue_cents
    }

    function yoyChange(current: number, previous: number): number | null {
      if (!hasPriorYear || previous <= 0) return null
      return Math.round(((current - previous) / previous) * 1000) / 10
    }

    const headline_stats = {
      total_views: totalViews,
      total_engagement: totalEngagement,
      total_search_impressions: totalSearchImpressions,
      total_revenue_cents: totalRevenueCents,
      yoy_views_pct: yoyChange(totalViews, prevViews),
      yoy_engagement_pct: yoyChange(totalEngagement, prevEngagement),
      yoy_search_impressions_pct: yoyChange(totalSearchImpressions, prevSearchImpressions),
      yoy_revenue_pct: yoyChange(totalRevenueCents, prevRevenueCents),
    }

    // -----------------------------------------------------------------------
    // 6. Notable Anomalies — top 10 by |z_score|
    // -----------------------------------------------------------------------
    const { data: anomaliesRaw } = await supabase
      .from('anomalies')
      .select(`
        *,
        topics:topic_id (name, slug)
      `)
      .gte('detected_on', yearStart)
      .lte('detected_on', yearEnd)
      .order('z_score', { ascending: false })
      .limit(100)

    const sortedAnomalies = (anomaliesRaw || [])
      .sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        topic_id: a.topic_id,
        topic_name: (a.topics as { name: string; slug: string } | null)?.name ?? null,
        detected_on: a.detected_on,
        metric: a.metric,
        expected_value: a.expected_value,
        actual_value: a.actual_value,
        z_score: a.z_score,
        direction: a.direction,
      }))

    // -----------------------------------------------------------------------
    // 7. Top Insights — validated or actioned, by confidence desc
    // -----------------------------------------------------------------------
    const { data: insightsRaw } = await supabase
      .from('insights')
      .select(`
        id, type, status, statement, topic_id, confidence_score, confidence, sponsor_safe, created_at,
        topics:topic_id (name, slug)
      `)
      .in('status', ['validated', 'actioned'])
      .gte('created_at', yearStart)
      .lte('created_at', yearEnd + 'T23:59:59Z')
      .order('confidence_score', { ascending: false })
      .limit(20)

    const top_insights = (insightsRaw || []).map((i) => ({
      id: i.id,
      type: i.type,
      status: i.status,
      statement: i.statement,
      topic_id: i.topic_id,
      topic_name: (i.topics as { name: string; slug: string } | null)?.name ?? null,
      confidence_score: i.confidence_score,
      confidence: i.confidence,
      sponsor_safe: i.sponsor_safe,
      created_at: i.created_at,
    }))

    // -----------------------------------------------------------------------
    // Response
    // -----------------------------------------------------------------------
    return NextResponse.json({
      year,
      generated_at: new Date().toISOString(),
      seasonal_almanac,
      rising_topics,
      falling_topics,
      demographic_shifts,
      community_themes,
      headline_stats,
      notable_anomalies: sortedAnomalies,
      top_insights,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
