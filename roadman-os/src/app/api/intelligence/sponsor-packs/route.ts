import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/sponsor-packs?category=supplements
 * Returns a comprehensive sponsor evidence pack for a given commercial_category.
 *
 * GET /api/intelligence/sponsor-packs (no category)
 * Returns available categories with topic counts.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const category = url.searchParams.get('category')

  // -----------------------------------------------------------------------
  // No category — return available categories with topic counts
  // -----------------------------------------------------------------------
  if (!category) {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('commercial_category')
      .not('commercial_category', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const counts = new Map<string, number>()
    for (const t of topics || []) {
      if (t.commercial_category) {
        counts.set(t.commercial_category, (counts.get(t.commercial_category) || 0) + 1)
      }
    }

    const categories = Array.from(counts.entries())
      .map(([name, topic_count]) => ({ name, topic_count }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ categories })
  }

  // -----------------------------------------------------------------------
  // With category — build the full evidence pack
  // -----------------------------------------------------------------------

  // 1. Topics in this category
  const { data: topics, error: topicErr } = await supabase
    .from('topics')
    .select('id, name, slug')
    .eq('commercial_category', category)
    .order('name')

  if (topicErr) {
    return NextResponse.json({ error: topicErr.message }, { status: 500 })
  }

  if (!topics || topics.length === 0) {
    return NextResponse.json(
      { error: `No topics found for category "${category}"` },
      { status: 404 },
    )
  }

  const topicIds = topics.map((t) => t.id)

  // 2. Audience demographics (channel-level, grouped by age_bracket + gender)
  const { data: demoRows } = await supabase
    .from('audience_demographics')
    .select('age_bracket, gender, share_pct, period_start, period_end')
    .eq('scope', 'channel')

  type DemoKey = string
  const demoAgg = new Map<DemoKey, { total: number; count: number }>()
  let demoPeriodStart: string | null = null
  let demoPeriodEnd: string | null = null

  for (const row of demoRows || []) {
    const key = `${row.age_bracket}|${row.gender}`
    const existing = demoAgg.get(key) || { total: 0, count: 0 }
    existing.total += Number(row.share_pct)
    existing.count += 1
    demoAgg.set(key, existing)

    if (!demoPeriodStart || row.period_start < demoPeriodStart) {
      demoPeriodStart = row.period_start
    }
    if (!demoPeriodEnd || row.period_end > demoPeriodEnd) {
      demoPeriodEnd = row.period_end
    }
  }

  const audience = Array.from(demoAgg.entries()).map(([key, agg]) => {
    const [age_bracket, gender] = key.split('|')
    return {
      age_bracket,
      gender,
      share_pct: Math.round((agg.total / agg.count) * 100) / 100,
      sample_size: agg.count,
    }
  }).sort((a, b) => a.age_bracket.localeCompare(b.age_bracket))

  // 3. Community size — latest snapshot for free + ndy
  const { data: freeSnap } = await supabase
    .from('community_snapshots')
    .select('total_members, week_start')
    .eq('community', 'free')
    .order('week_start', { ascending: false })
    .limit(1)

  const { data: ndySnap } = await supabase
    .from('community_snapshots')
    .select('total_members, week_start')
    .eq('community', 'ndy')
    .order('week_start', { ascending: false })
    .limit(1)

  const freeMembers = freeSnap?.[0]?.total_members ?? 0
  const ndyMembers = ndySnap?.[0]?.total_members ?? 0
  const communityAsOf = freeSnap?.[0]?.week_start || ndySnap?.[0]?.week_start || null

  const community_size = {
    free: freeMembers,
    ndy: ndyMembers,
    total: freeMembers + ndyMembers,
    as_of: communityAsOf,
  }

  // 4. Seasonal curve — seasonal_indices for topics in this category, metric=search_impressions
  const { data: seasonalRows } = await supabase
    .from('seasonal_indices')
    .select('topic_id, iso_week, index_value, years_observed, confidence, confidence_score')
    .in('topic_id', topicIds)
    .eq('metric', 'search_impressions')
    .order('iso_week')

  // Group by week — average index_value across topics, also keep per-topic breakdown
  const weekMap = new Map<number, { values: number[]; topicBreakdown: { topic_id: string; index_value: number }[] }>()
  let totalYearsObserved = 0
  let seasonalSampleCount = 0

  for (const row of seasonalRows || []) {
    if (!weekMap.has(row.iso_week)) {
      weekMap.set(row.iso_week, { values: [], topicBreakdown: [] })
    }
    const entry = weekMap.get(row.iso_week)!
    entry.values.push(Number(row.index_value))
    entry.topicBreakdown.push({
      topic_id: row.topic_id,
      index_value: Number(row.index_value),
    })
    totalYearsObserved = Math.max(totalYearsObserved, row.years_observed)
    seasonalSampleCount += 1
  }

  const seasonal_curve = Array.from(weekMap.entries())
    .map(([iso_week, data]) => ({
      iso_week,
      avg_index: Math.round((data.values.reduce((s, v) => s + v, 0) / data.values.length) * 100) / 100,
      topics_in_week: data.values.length,
      per_topic: data.topicBreakdown,
    }))
    .sort((a, b) => a.iso_week - b.iso_week)

  // 5. Insights — sponsor_safe + validated/actioned for topics in this category
  const { data: insights } = await supabase
    .from('insights')
    .select(`
      id, type, status, statement, topic_id, commercial_category,
      confidence_score, confidence, sponsor_safe, valid_from, valid_until,
      evidence, created_at,
      topics:topic_id (name, slug)
    `)
    .eq('sponsor_safe', true)
    .in('status', ['validated', 'actioned'])
    .in('topic_id', topicIds)
    .order('confidence_score', { ascending: false })

  // 6. Format effectiveness — replicate the format-effectiveness route logic per topic
  const { data: assets } = await supabase
    .from('assets')
    .select(`
      id, type, title,
      asset_topics (topic_id)
    `)
    .eq('status', 'published')

  const { data: publications } = await supabase
    .from('publications')
    .select('id, asset_id')

  const pubByAsset = new Map<string, string[]>()
  for (const pub of publications || []) {
    if (!pubByAsset.has(pub.asset_id)) pubByAsset.set(pub.asset_id, [])
    pubByAsset.get(pub.asset_id)!.push(pub.id)
  }

  const { data: perfData } = await supabase
    .from('performance_daily')
    .select('publication_id, views, likes, comments, shares, saves')

  const perfByPub = new Map<string, { views: number; engagement: number }>()
  for (const row of perfData || []) {
    const existing = perfByPub.get(row.publication_id) || { views: 0, engagement: 0 }
    existing.views += Number(row.views)
    existing.engagement += Number(row.likes) + Number(row.comments) + Number(row.shares) + Number(row.saves)
    perfByPub.set(row.publication_id, existing)
  }

  const topicIdSet = new Set(topicIds)
  const formatResults = new Map<string, Map<string, { pieces: number; views: number; engagement: number }>>()

  for (const asset of assets || []) {
    const assetTopics = (asset.asset_topics as unknown as { topic_id: string }[]) || []
    const pubs = pubByAsset.get(asset.id) || []

    let totalViews = 0
    let totalEngagement = 0
    for (const pubId of pubs) {
      const perf = perfByPub.get(pubId)
      if (perf) {
        totalViews += perf.views
        totalEngagement += perf.engagement
      }
    }

    for (const at of assetTopics) {
      if (!topicIdSet.has(at.topic_id)) continue
      if (!formatResults.has(at.topic_id)) formatResults.set(at.topic_id, new Map())
      const formatMap = formatResults.get(at.topic_id)!

      const existing = formatMap.get(asset.type) || { pieces: 0, views: 0, engagement: 0 }
      existing.pieces += 1
      existing.views += totalViews
      existing.engagement += totalEngagement
      formatMap.set(asset.type, existing)
    }
  }

  type FormatBreakdown = {
    asset_type: string
    pieces: number
    total_views: number
    total_engagement: number
    avg_views: number
    avg_engagement: number
  }

  const format_effectiveness = (topics || [])
    .map((t) => {
      const formatMap = formatResults.get(t.id) || new Map()
      const formats: FormatBreakdown[] = Array.from(formatMap.entries())
        .map(([assetType, stats]) => ({
          asset_type: assetType,
          pieces: stats.pieces,
          total_views: stats.views,
          total_engagement: stats.engagement,
          avg_views: stats.pieces > 0 ? Math.round(stats.views / stats.pieces) : 0,
          avg_engagement: stats.pieces > 0 ? Math.round(stats.engagement / stats.pieces) : 0,
        }))
        .sort((a, b) => b.avg_engagement - a.avg_engagement)

      return {
        topic_id: t.id,
        topic_name: t.name,
        formats,
      }
    })
    .filter((r) => r.formats.length > 0)

  return NextResponse.json({
    category,
    topics,
    audience: {
      demographics: audience,
      period_start: demoPeriodStart,
      period_end: demoPeriodEnd,
      sample_rows: demoRows?.length ?? 0,
    },
    community_size,
    seasonal_curve: {
      metric: 'search_impressions',
      weeks: seasonal_curve,
      years_observed: totalYearsObserved,
      data_points: seasonalSampleCount,
    },
    insights: insights || [],
    format_effectiveness,
    generated_at: new Date().toISOString(),
  })
}
