import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MetricSource } from '@/types/database'

/**
 * GET /api/intelligence/ops
 * Comprehensive operational health data for the Intelligence Ops dashboard.
 * Returns sync coverage heatmap, taxonomy health, stale indices,
 * dark source alerts, sync job history, quality checks, and pipeline stats.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const ALL_SOURCES: MetricSource[] = [
    'youtube', 'spotify', 'apple_podcasts', 'instagram', 'facebook',
    'tiktok', 'twitter_x', 'linkedin', 'website', 'beehiiv',
    'ga4', 'skool', 'manual',
  ]

  const now = new Date()
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 86400000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 86400000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000)

  // -----------------------------------------------------------------------
  // 1. Sync coverage heatmap — performance_daily rows per source per week
  // -----------------------------------------------------------------------
  const { data: heatmapRows } = await supabase
    .from('performance_daily')
    .select('source, date')
    .gte('date', twelveWeeksAgo.toISOString().slice(0, 10))

  // Generate week boundaries for last 12 weeks
  const weeks: { week_start: string; week_end: string }[] = []
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getTime() - (i + 1) * 7 * 86400000)
    const end = new Date(start.getTime() + 7 * 86400000 - 1)
    // Align to Monday
    const dayOfWeek = start.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + mondayOffset)
    weeks.push({
      week_start: start.toISOString().slice(0, 10),
      week_end: new Date(start.getTime() + 6 * 86400000).toISOString().slice(0, 10),
    })
  }

  const sync_coverage_heatmap = ALL_SOURCES.map((source) => ({
    source,
    weeks: weeks.map((w) => ({
      week_start: w.week_start,
      row_count: (heatmapRows || []).filter(
        (r) =>
          r.source === source &&
          r.date >= w.week_start &&
          r.date <= w.week_end,
      ).length,
    })),
  }))

  // -----------------------------------------------------------------------
  // 2. Topic taxonomy health
  // -----------------------------------------------------------------------
  const [
    { count: totalTracked },
    { data: publishedAssets },
    { data: taggedAssetIds },
    { count: totalAliases },
    { data: topicsWithAliases },
    { data: trackedTopics },
  ] = await Promise.all([
    supabase
      .from('topics')
      .select('id', { count: 'exact', head: true })
      .eq('is_trend_tracked', true),
    supabase
      .from('assets')
      .select('id')
      .eq('status', 'published'),
    supabase
      .from('asset_topics')
      .select('asset_id'),
    supabase
      .from('topic_aliases')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('topic_aliases')
      .select('topic_id'),
    supabase
      .from('topics')
      .select('id, commercial_category')
      .eq('is_trend_tracked', true),
  ])

  const publishedSet = new Set((publishedAssets || []).map((a) => a.id))
  const taggedSet = new Set((taggedAssetIds || []).map((at) => at.asset_id))
  const untaggedCount = [...publishedSet].filter((id) => !taggedSet.has(id)).length
  const untaggedAssetPct = publishedSet.size > 0
    ? Math.round((untaggedCount / publishedSet.size) * 100)
    : 0

  const topicsWithAliasSet = new Set((topicsWithAliases || []).map((ta) => ta.topic_id))
  const trackedTotal = totalTracked || 0
  const topicsWithAliasCount = [...topicsWithAliasSet].filter((id) =>
    (trackedTopics || []).some((t) => t.id === id),
  ).length

  const categorised = (trackedTopics || []).filter(
    (t) => t.commercial_category && t.commercial_category !== null,
  ).length

  const topic_taxonomy_health = {
    total_tracked_topics: trackedTotal,
    untagged_asset_pct: untaggedAssetPct,
    alias_coverage: {
      total_aliases: totalAliases || 0,
      topics_with_aliases: topicsWithAliasCount,
      topics_without_aliases: trackedTotal - topicsWithAliasCount,
    },
    commercial_category_coverage: {
      categorised,
      uncategorised: trackedTotal - categorised,
    },
  }

  // -----------------------------------------------------------------------
  // 3. Stale index warnings — seasonal_indices computed >14 days ago
  // -----------------------------------------------------------------------
  const { data: staleIndices } = await supabase
    .from('seasonal_indices')
    .select('topic_id, computed_at')
    .lt('computed_at', fourteenDaysAgo.toISOString())

  // Group by topic_id, taking the most recent computed_at per topic
  const staleByTopic = new Map<string, string>()
  for (const row of staleIndices || []) {
    const existing = staleByTopic.get(row.topic_id)
    if (!existing || row.computed_at > existing) {
      staleByTopic.set(row.topic_id, row.computed_at)
    }
  }

  // Only include topics where ALL indices are stale (most recent < 14 days ago)
  const { data: freshIndices } = await supabase
    .from('seasonal_indices')
    .select('topic_id')
    .gte('computed_at', fourteenDaysAgo.toISOString())

  const freshTopicIds = new Set((freshIndices || []).map((r) => r.topic_id))

  // Fetch topic names for stale warnings
  const staleTopicIds = [...staleByTopic.keys()].filter((id) => !freshTopicIds.has(id))
  let staleTopicNames: Record<string, string> = {}
  if (staleTopicIds.length > 0) {
    const { data: topicRows } = await supabase
      .from('topics')
      .select('id, name')
      .in('id', staleTopicIds)
    staleTopicNames = Object.fromEntries(
      (topicRows || []).map((t) => [t.id, t.name]),
    )
  }

  const stale_index_warnings = staleTopicIds.map((id) => ({
    topic_id: id,
    topic_name: staleTopicNames[id] || 'Unknown',
    latest_computed_at: staleByTopic.get(id) || null,
  }))

  // -----------------------------------------------------------------------
  // 4. Dark sources — latest performance_daily date >3 days ago
  // -----------------------------------------------------------------------
  const { data: latestBySource } = await supabase
    .from('performance_daily')
    .select('source, date')
    .order('date', { ascending: false })

  const latestDateBySource = new Map<string, string>()
  for (const row of latestBySource || []) {
    if (!latestDateBySource.has(row.source)) {
      latestDateBySource.set(row.source, row.date)
    }
  }

  const dark_sources = ALL_SOURCES
    .filter((s) => s !== 'manual')
    .map((source) => {
      const latestDate = latestDateBySource.get(source)
      if (!latestDate) {
        return { source, latest_date: null, days_dark: null }
      }
      const daysDark = Math.floor(
        (now.getTime() - new Date(latestDate).getTime()) / 86400000,
      )
      return { source, latest_date: latestDate, days_dark: daysDark }
    })
    .filter((s) => s.latest_date === null || (s.days_dark !== null && s.days_dark > 3))

  // -----------------------------------------------------------------------
  // 5. Sync job status — last 5 per source
  // -----------------------------------------------------------------------
  const { data: syncJobs } = await supabase
    .from('sync_jobs')
    .select('id, source, status, started_at, completed_at, records_synced, error_message')
    .order('started_at', { ascending: false })
    .limit(200)

  const syncJobsBySource: Record<string, typeof syncJobs> = {}
  for (const job of syncJobs || []) {
    if (!syncJobsBySource[job.source]) {
      syncJobsBySource[job.source] = []
    }
    if (syncJobsBySource[job.source]!.length < 5) {
      syncJobsBySource[job.source]!.push(job)
    }
  }

  const sync_job_status = Object.entries(syncJobsBySource).map(
    ([source, jobs]) => ({ source, jobs }),
  )

  // -----------------------------------------------------------------------
  // 6. Quality checks — last 30 days
  // -----------------------------------------------------------------------
  const { data: qualityChecks } = await supabase
    .from('data_quality_log')
    .select('*')
    .gte('checked_at', thirtyDaysAgo.toISOString())
    .order('checked_at', { ascending: false })

  // -----------------------------------------------------------------------
  // 7. Pipeline stats — total row counts
  // -----------------------------------------------------------------------
  const [
    { count: totalDailyRows },
    { count: totalGscRows },
    { count: totalTdmRows },
    { count: totalSeasonalRows },
    { count: totalInsights },
    { count: totalAnomalies },
  ] = await Promise.all([
    supabase.from('performance_daily').select('id', { count: 'exact', head: true }),
    supabase.from('search_console_daily').select('date', { count: 'exact', head: true }),
    supabase.from('topic_daily_metrics').select('id', { count: 'exact', head: true }),
    supabase.from('seasonal_indices').select('id', { count: 'exact', head: true }),
    supabase.from('insights').select('id', { count: 'exact', head: true }),
    supabase.from('anomalies').select('id', { count: 'exact', head: true }),
  ])

  const pipeline_stats = {
    total_daily_rows: totalDailyRows || 0,
    total_gsc_rows: totalGscRows || 0,
    total_tdm_rows: totalTdmRows || 0,
    total_seasonal_rows: totalSeasonalRows || 0,
    total_insights: totalInsights || 0,
    total_anomalies: totalAnomalies || 0,
  }

  return NextResponse.json({
    sync_coverage_heatmap,
    topic_taxonomy_health,
    stale_index_warnings,
    dark_sources,
    sync_job_status,
    quality_checks: qualityChecks || [],
    pipeline_stats,
  })
}
