import { createClient } from '@/lib/supabase/server'
import type { PerformanceRecord, Asset, MetricSource } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DateRange = {
  from: string // ISO date
  to: string   // ISO date
}

export type TrendDirection = 'up' | 'down' | 'flat'

export type TrendResult = {
  direction: TrendDirection
  percentage: number
}

export type Classification = 'Exceptional' | 'Strong' | 'Average' | 'Weak'

export type MetricOverview = {
  totalViews: number
  totalEngagement: number
  subscriberGrowth: number
  revenueCents: number
  viewsTrend: TrendResult
  engagementTrend: TrendResult
  subscriberTrend: TrendResult
  revenueTrend: TrendResult
}

export type PlatformMetrics = {
  source: MetricSource
  views: number
  engagement: number
  subscribers: number
  revenueCents: number
}

export type TopContent = {
  asset_id: string
  asset_title: string
  asset_type: string
  views: number
  engagement: number
  subscribers: number
  revenueCents: number
  classification: Classification
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate trend direction and percentage change between two values.
 */
export function calculateTrend(current: number, previous: number): TrendResult {
  if (previous === 0 && current === 0) {
    return { direction: 'flat', percentage: 0 }
  }
  if (previous === 0) {
    return { direction: 'up', percentage: 100 }
  }

  const percentage = ((current - previous) / previous) * 100
  const rounded = Math.round(percentage * 10) / 10

  if (Math.abs(rounded) < 1) {
    return { direction: 'flat', percentage: 0 }
  }

  return {
    direction: rounded > 0 ? 'up' : 'down',
    percentage: Math.abs(rounded),
  }
}

/**
 * Classify a value based on its position in a sorted array of values.
 * Exceptional = top 10%, Strong = top 25%, Average = middle 50%, Weak = bottom 25%
 */
export function calculateClassification(value: number, allValues: number[]): Classification {
  if (allValues.length === 0) return 'Average'

  const sorted = [...allValues].sort((a, b) => a - b)
  const rank = sorted.filter((v) => v <= value).length
  const percentile = rank / sorted.length

  if (percentile >= 0.9) return 'Exceptional'
  if (percentile >= 0.75) return 'Strong'
  if (percentile >= 0.25) return 'Average'
  return 'Weak'
}

/**
 * Compute the previous period date range of the same length.
 */
function getPreviousPeriod(range: DateRange): DateRange {
  const from = new Date(range.from)
  const to = new Date(range.to)
  const durationMs = to.getTime() - from.getTime()

  const prevTo = new Date(from.getTime() - 1) // day before current from
  const prevFrom = new Date(prevTo.getTime() - durationMs)

  return {
    from: prevFrom.toISOString().split('T')[0],
    to: prevTo.toISOString().split('T')[0],
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Aggregate performance across all platforms for the given date range.
 * Returns totals and trend compared to the previous period of equal length.
 */
export async function getPerformanceOverview(dateRange: DateRange): Promise<MetricOverview> {
  const supabase = await createClient()
  const prevRange = getPreviousPeriod(dateRange)

  const [currentRes, previousRes] = await Promise.all([
    supabase
      .from('performance_records')
      .select('views, likes, comments, shares, saves, subscribers_gained, revenue_cents, engagement_rate')
      .gte('recorded_at', dateRange.from)
      .lte('recorded_at', dateRange.to),
    supabase
      .from('performance_records')
      .select('views, likes, comments, shares, saves, subscribers_gained, revenue_cents, engagement_rate')
      .gte('recorded_at', prevRange.from)
      .lte('recorded_at', prevRange.to),
  ])

  const currentRecords = (currentRes.data ?? []) as PerformanceRecord[]
  const previousRecords = (previousRes.data ?? []) as PerformanceRecord[]

  const sumMetrics = (records: PerformanceRecord[]) => ({
    views: records.reduce((s, r) => s + (r.views ?? 0), 0),
    engagement: records.reduce((s, r) => s + (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0), 0),
    subscribers: records.reduce((s, r) => s + (r.subscribers_gained ?? 0), 0),
    revenue: records.reduce((s, r) => s + (r.revenue_cents ?? 0), 0),
  })

  const current = sumMetrics(currentRecords)
  const previous = sumMetrics(previousRecords)

  return {
    totalViews: current.views,
    totalEngagement: current.engagement,
    subscriberGrowth: current.subscribers,
    revenueCents: current.revenue,
    viewsTrend: calculateTrend(current.views, previous.views),
    engagementTrend: calculateTrend(current.engagement, previous.engagement),
    subscriberTrend: calculateTrend(current.subscribers, previous.subscribers),
    revenueTrend: calculateTrend(current.revenue, previous.revenue),
  }
}

/**
 * Per-platform totals for the given date range.
 */
export async function getPlatformComparison(dateRange: DateRange): Promise<PlatformMetrics[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('performance_records')
    .select('source, views, likes, comments, shares, saves, subscribers_gained, revenue_cents')
    .gte('recorded_at', dateRange.from)
    .lte('recorded_at', dateRange.to)

  if (error || !data) return []

  const records = data as PerformanceRecord[]
  const bySource = new Map<MetricSource, PlatformMetrics>()

  for (const r of records) {
    const existing = bySource.get(r.source) ?? {
      source: r.source,
      views: 0,
      engagement: 0,
      subscribers: 0,
      revenueCents: 0,
    }
    existing.views += r.views ?? 0
    existing.engagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
    existing.subscribers += r.subscribers_gained ?? 0
    existing.revenueCents += r.revenue_cents ?? 0
    bySource.set(r.source, existing)
  }

  return Array.from(bySource.values()).sort((a, b) => b.views - a.views)
}

/**
 * Top assets ranked by views, with classification badges.
 */
export async function getTopContent(dateRange: DateRange, limit = 10): Promise<TopContent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('performance_records')
    .select('asset_id, views, likes, comments, shares, saves, subscribers_gained, revenue_cents')
    .gte('recorded_at', dateRange.from)
    .lte('recorded_at', dateRange.to)
    .not('asset_id', 'is', null)

  if (error || !data) return []

  const records = data as PerformanceRecord[]

  // Aggregate by asset_id
  const byAsset = new Map<string, { views: number; engagement: number; subscribers: number; revenueCents: number }>()
  for (const r of records) {
    if (!r.asset_id) continue
    const existing = byAsset.get(r.asset_id) ?? { views: 0, engagement: 0, subscribers: 0, revenueCents: 0 }
    existing.views += r.views ?? 0
    existing.engagement += (r.likes ?? 0) + (r.comments ?? 0) + (r.shares ?? 0) + (r.saves ?? 0)
    existing.subscribers += r.subscribers_gained ?? 0
    existing.revenueCents += r.revenue_cents ?? 0
    byAsset.set(r.asset_id, existing)
  }

  // Fetch asset titles
  const assetIds = Array.from(byAsset.keys())
  if (assetIds.length === 0) return []

  const { data: assets } = await supabase
    .from('assets')
    .select('id, title, type')
    .in('id', assetIds)

  const assetMap = new Map<string, { title: string; type: string }>()
  for (const a of (assets ?? []) as Asset[]) {
    assetMap.set(a.id, { title: a.title, type: a.type })
  }

  // Calculate classifications based on all view values
  const allViews = Array.from(byAsset.values()).map((v) => v.views)

  const results: TopContent[] = Array.from(byAsset.entries())
    .map(([assetId, metrics]) => {
      const asset = assetMap.get(assetId)
      return {
        asset_id: assetId,
        asset_title: asset?.title ?? 'Unknown',
        asset_type: asset?.type ?? 'other',
        views: metrics.views,
        engagement: metrics.engagement,
        subscribers: metrics.subscribers,
        revenueCents: metrics.revenueCents,
        classification: calculateClassification(metrics.views, allViews),
      }
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)

  return results
}

/**
 * Helper: compute a DateRange from a period string like '7d', '30d', '90d'.
 */
export function parsePeriod(period: string): DateRange {
  const now = new Date()
  let days = 30

  if (period === '7d') days = 7
  else if (period === '30d') days = 30
  else if (period === '90d') days = 90

  const from = new Date(now)
  from.setDate(from.getDate() - days)

  return {
    from: from.toISOString().split('T')[0],
    to: now.toISOString().split('T')[0],
  }
}
