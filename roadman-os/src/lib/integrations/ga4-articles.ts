/**
 * Article-level GA4 sync service.
 *
 * Re-uses the shared GA4 Data API client from `@/lib/integrations/ga4` to
 * fetch page-level analytics filtered to article pages only (matched by a
 * configurable URL path prefix). Each matched article page is mapped to an
 * existing asset via `external_url` matching, and per-article
 * PerformanceRecordInserts are produced with `custom_metrics.record_type =
 * 'article_level'`.
 *
 * API credentials are NOT yet available — all GA4 API calls go through the
 * existing ga4.ts helpers which will be wired up once credentials are ready.
 */

import { createClient } from '@/lib/supabase/server'
import {
  getPageViews,
  getDefaultDateRange,
  parseReportRows,
} from '@/lib/integrations/ga4'
import type { GA4ParsedRow } from '@/lib/integrations/ga4'
import type { PerformanceRecordInsert } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ArticleMetric = {
  pagePath: string
  assetId: string
  publicationId: string | null
  views: number
  sessions: number
  users: number
  engagementRate: number
  bounceRate: number
  avgSessionDuration: number
}

export type FetchArticleMetricsResult = {
  records: PerformanceRecordInsert[]
  articlesFound: number
  articlesMatched: number
}

// ---------------------------------------------------------------------------
// Core fetch function
// ---------------------------------------------------------------------------

/**
 * Fetch article-level metrics from GA4, filtering to pages that match
 * the given `articlePathPrefix` (e.g. `/blog/`).
 *
 * Returns PerformanceRecordInserts ready for batch insert, with
 * `custom_metrics.record_type = 'article_level'`.
 *
 * TODO: Wire up real GA4 API credentials once available.
 */
export async function fetchArticleMetrics(
  apiKey: string,
  propertyId: string,
  startDate: string,
  endDate: string,
  articlePathPrefix: string,
): Promise<FetchArticleMetricsResult> {
  // 1. Fetch page views report from GA4
  const pageViewsResult = await getPageViews(apiKey, propertyId, startDate, endDate)

  if (!pageViewsResult.ok) {
    throw new Error(`GA4 article metrics failed: ${pageViewsResult.message}`)
  }

  const allRows = parseReportRows(pageViewsResult.data)

  // 2. Filter to only article pages matching the prefix
  const normalisedPrefix = articlePathPrefix.replace(/\/$/, '')
  const articleRows = allRows.filter((row) => {
    const pagePath = row.dimensions.pagePath
    if (!pagePath) return false
    return pagePath.startsWith(normalisedPrefix)
  })

  if (articleRows.length === 0) {
    return { records: [], articlesFound: 0, articlesMatched: 0 }
  }

  // 3. Match article pages to assets via external_url
  const supabase = await createClient()

  const { data: assets } = await supabase
    .from('assets')
    .select('id, external_url')
    .not('external_url', 'is', null)

  const urlToAssetId = new Map<string, string>()
  if (assets) {
    for (const asset of assets) {
      if (!asset.external_url) continue
      try {
        const parsed = new URL(asset.external_url)
        const normPath = parsed.pathname.replace(/\/$/, '') || '/'
        urlToAssetId.set(normPath, asset.id)
      } catch {
        // external_url might already be a bare path
        const normPath = asset.external_url.replace(/\/$/, '') || '/'
        urlToAssetId.set(normPath, asset.id)
      }
    }
  }

  // 4. Resolve publication_id for matched assets
  const matchedAssetIds = [
    ...new Set(
      articleRows
        .map((row) => {
          const pagePath = row.dimensions.pagePath
          if (!pagePath) return undefined
          const norm = pagePath.replace(/\/$/, '') || '/'
          return urlToAssetId.get(norm)
        })
        .filter((id): id is string => !!id),
    ),
  ]

  const pubMap = new Map<string, string>()
  if (matchedAssetIds.length > 0) {
    const { data: publications } = await supabase
      .from('publications')
      .select('id, asset_id')
      .in('asset_id', matchedAssetIds)

    if (publications) {
      for (const pub of publications) {
        if (!pubMap.has(pub.asset_id)) {
          pubMap.set(pub.asset_id, pub.id)
        }
      }
    }
  }

  // 5. Build performance records
  const now = new Date().toISOString()
  const records = buildArticlePerformanceRecords(
    articleRows,
    urlToAssetId,
    pubMap,
    now,
  )

  return {
    records,
    articlesFound: articleRows.length,
    articlesMatched: records.length,
  }
}

// ---------------------------------------------------------------------------
// Convenience wrapper using default date range
// ---------------------------------------------------------------------------

/**
 * Fetch article metrics for the default 30-day lookback.
 */
export async function fetchArticleMetricsDefault(
  apiKey: string,
  propertyId: string,
  articlePathPrefix: string,
): Promise<FetchArticleMetricsResult> {
  const { startDate, endDate } = getDefaultDateRange(30)
  return fetchArticleMetrics(apiKey, propertyId, startDate, endDate, articlePathPrefix)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build PerformanceRecordInserts for matched article pages.
 * Each record carries `custom_metrics.record_type = 'article_level'`
 * to distinguish from site-level GA4 records.
 */
function buildArticlePerformanceRecords(
  articleRows: GA4ParsedRow[],
  urlToAssetId: Map<string, string>,
  pubMap: Map<string, string>,
  recordedAt: string,
): PerformanceRecordInsert[] {
  const records: PerformanceRecordInsert[] = []

  for (const row of articleRows) {
    const pagePath = row.dimensions.pagePath
    if (!pagePath) continue

    const normPath = pagePath.replace(/\/$/, '') || '/'
    const assetId = urlToAssetId.get(normPath)
    if (!assetId) continue

    const publicationId = pubMap.get(assetId) ?? null

    records.push({
      asset_id: assetId,
      publication_id: publicationId,
      source: 'ga4',
      recorded_at: recordedAt,
      views: row.metrics.screenPageViews ?? 0,
      impressions: row.metrics.sessions ?? 0,
      clicks: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      subscribers_gained: 0,
      watch_time_seconds: 0,
      avg_view_duration_seconds: row.metrics.averageSessionDuration ?? 0,
      ctr: 0,
      engagement_rate: row.metrics.engagementRate ?? 0,
      reach: row.metrics.totalUsers ?? 0,
      revenue_cents: 0,
      custom_metrics: {
        record_type: 'article_level',
        page_path: pagePath,
        bounce_rate: row.metrics.bounceRate ?? 0,
        sessions: row.metrics.sessions ?? 0,
        users: row.metrics.totalUsers ?? 0,
      },
    })
  }

  return records
}

/**
 * Count how many assets match the article path prefix.
 * Useful for the settings page to show "X articles matched".
 */
export async function countMatchedArticles(
  articlePathPrefix: string,
): Promise<number> {
  const supabase = await createClient()

  const normalisedPrefix = articlePathPrefix.replace(/\/$/, '')

  const { data: assets } = await supabase
    .from('assets')
    .select('id, external_url')
    .not('external_url', 'is', null)

  if (!assets) return 0

  let count = 0
  for (const asset of assets) {
    if (!asset.external_url) continue
    try {
      const parsed = new URL(asset.external_url)
      const normPath = parsed.pathname.replace(/\/$/, '') || '/'
      if (normPath.startsWith(normalisedPrefix)) {
        count++
      }
    } catch {
      const normPath = asset.external_url.replace(/\/$/, '') || '/'
      if (normPath.startsWith(normalisedPrefix)) {
        count++
      }
    }
  }

  return count
}
