import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/intelligence/format-effectiveness?topic_id=...
 * Returns per-topic format comparison data: engagement per piece by asset type.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const topicId = url.searchParams.get('topic_id')

  // Get tracked topics
  let topicsQuery = supabase
    .from('topics')
    .select('id, name, commercial_category')
    .eq('is_trend_tracked', true)
    .order('name')

  if (topicId) {
    topicsQuery = topicsQuery.eq('id', topicId)
  }

  const { data: topics, error: topicErr } = await topicsQuery
  if (topicErr) {
    return NextResponse.json({ error: topicErr.message }, { status: 500 })
  }

  // Get all published assets with topic associations
  const { data: assets } = await supabase
    .from('assets')
    .select(`
      id, type, title,
      asset_topics (topic_id)
    `)
    .eq('status', 'published')

  // Get publications
  const { data: publications } = await supabase
    .from('publications')
    .select('id, asset_id')

  const pubByAsset = new Map<string, string[]>()
  for (const pub of publications || []) {
    if (!pubByAsset.has(pub.asset_id)) pubByAsset.set(pub.asset_id, [])
    pubByAsset.get(pub.asset_id)!.push(pub.id)
  }

  // Get total performance per publication
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

  // Build per-topic breakdown
  const topicIds = new Set((topics || []).map((t) => t.id))

  type FormatBreakdown = {
    asset_type: string
    pieces: number
    total_views: number
    total_engagement: number
    avg_views: number
    avg_engagement: number
  }

  type TopicResult = {
    topic_id: string
    topic_name: string
    commercial_category: string | null
    formats: FormatBreakdown[]
  }

  const results = new Map<string, Map<string, { pieces: number; views: number; engagement: number }>>()

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
      if (!topicIds.has(at.topic_id)) continue
      if (!results.has(at.topic_id)) results.set(at.topic_id, new Map())
      const formatMap = results.get(at.topic_id)!

      const existing = formatMap.get(asset.type) || { pieces: 0, views: 0, engagement: 0 }
      existing.pieces += 1
      existing.views += totalViews
      existing.engagement += totalEngagement
      formatMap.set(asset.type, existing)
    }
  }

  // Format response
  const topicResults: TopicResult[] = (topics || [])
    .map((t) => {
      const formatMap = results.get(t.id) || new Map()
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
        commercial_category: t.commercial_category,
        formats,
      }
    })
    .filter((r) => r.formats.length > 0)

  // Also return format_effectiveness insights
  let insightQuery = supabase
    .from('insights')
    .select('*')
    .eq('type', 'format_effectiveness')
    .in('status', ['candidate', 'validated'])
    .order('confidence_score', { ascending: false })
    .limit(50)

  if (topicId) {
    insightQuery = insightQuery.eq('topic_id', topicId)
  }

  const { data: formatInsights } = await insightQuery

  return NextResponse.json({
    topics: topicResults,
    insights: formatInsights || [],
  })
}
