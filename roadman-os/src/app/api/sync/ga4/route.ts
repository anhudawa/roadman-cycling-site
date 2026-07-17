import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getPageViews,
  getTrafficSources,
  getDeviceBreakdown,
  getEngagementMetrics,
  parseReportRows,
  extractAggregateMetrics,
  getDefaultDateRange,
} from '@/lib/integrations/ga4'
import type { GA4ParsedRow } from '@/lib/integrations/ga4'
import type {
  PlatformConnection,
  PerformanceRecordInsert,
} from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SyncRequestBody = {
  connection_id: string
  sync_job_id: string
}

type ConnectionMetadata = {
  property_id?: string
  [key: string]: unknown
}

type TrafficSourceEntry = {
  source: string
  medium: string
  sessions: number
  users: number
  engagement_rate: number
  bounce_rate: number
}

type DeviceEntry = {
  category: string
  sessions: number
  users: number
  engagement_rate: number
  bounce_rate: number
}

// ---------------------------------------------------------------------------
// Helpers — sync job updates
// ---------------------------------------------------------------------------

/** Update a sync_job row in Supabase. */
async function updateSyncJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  syncJobId: string,
  data: {
    status?: string
    started_at?: string
    completed_at?: string
    records_synced?: number
    error_message?: string | null
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  await supabase.from('sync_jobs').update(data).eq('id', syncJobId)
}

// ---------------------------------------------------------------------------
// POST /api/sync/ga4
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const supabase = await createClient()

  let body: SyncRequestBody
  try {
    body = (await request.json()) as SyncRequestBody
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { connection_id, sync_job_id } = body

  if (!connection_id || !sync_job_id) {
    return NextResponse.json(
      { error: 'connection_id and sync_job_id are required' },
      { status: 400 },
    )
  }

  // -------------------------------------------------------------------------
  // 1. Mark sync job as running
  // -------------------------------------------------------------------------

  await updateSyncJob(supabase, sync_job_id, {
    status: 'running',
    started_at: new Date().toISOString(),
  })

  try {
    // -----------------------------------------------------------------------
    // 2. Load the platform connection
    // -----------------------------------------------------------------------

    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connection_id)
      .single()

    if (connError || !connection) {
      throw new Error(`Connection not found: ${connection_id}`)
    }

    const conn = connection as PlatformConnection
    const apiKey = conn.access_token
    if (!apiKey) {
      throw new Error('No API key (access_token) on connection')
    }

    const metadata = conn.metadata as ConnectionMetadata
    const propertyId = metadata.property_id
    if (!propertyId) {
      throw new Error('No property_id in connection metadata')
    }

    // -----------------------------------------------------------------------
    // 3. Fetch GA4 page views report (last 30 days)
    // -----------------------------------------------------------------------

    const { startDate, endDate } = getDefaultDateRange(30)

    const pageViewsResult = await getPageViews(apiKey, propertyId, startDate, endDate)
    if (!pageViewsResult.ok) {
      throw new Error(`GA4 page views failed: ${pageViewsResult.message}`)
    }

    const pageRows = parseReportRows(pageViewsResult.data)

    // -----------------------------------------------------------------------
    // 4. Match page paths to assets by external_url
    // -----------------------------------------------------------------------

    // Collect all page paths from the report
    const pagePaths = pageRows
      .map((row) => row.dimensions.pagePath)
      .filter((p): p is string => !!p)

    // Load assets that have an external_url set
    const { data: assets } = await supabase
      .from('assets')
      .select('id, external_url')
      .not('external_url', 'is', null)

    // Build a lookup: normalised path -> asset_id
    const urlToAssetId = new Map<string, string>()
    if (assets) {
      for (const asset of assets) {
        if (!asset.external_url) continue
        try {
          const parsed = new URL(asset.external_url)
          // Normalise: strip trailing slash for consistent matching
          const normPath = parsed.pathname.replace(/\/$/, '') || '/'
          urlToAssetId.set(normPath, asset.id)
        } catch {
          // external_url might already be a bare path
          const normPath = asset.external_url.replace(/\/$/, '') || '/'
          urlToAssetId.set(normPath, asset.id)
        }
      }
    }

    // Find the publication for each matched asset (if any) so we can set
    // publication_id on the performance record
    const matchedAssetIds = [...new Set(
      pagePaths
        .map((p) => {
          const norm = p.replace(/\/$/, '') || '/'
          return urlToAssetId.get(norm)
        })
        .filter((id): id is string => !!id),
    )]

    const pubMap = new Map<string, string>()
    if (matchedAssetIds.length > 0) {
      const { data: publications } = await supabase
        .from('publications')
        .select('id, asset_id')
        .in('asset_id', matchedAssetIds)

      if (publications) {
        for (const pub of publications) {
          // Use the first publication found per asset
          if (!pubMap.has(pub.asset_id)) {
            pubMap.set(pub.asset_id, pub.id)
          }
        }
      }
    }

    // -----------------------------------------------------------------------
    // 5. Fetch traffic sources and engagement for custom_metrics
    // -----------------------------------------------------------------------

    const [trafficResult, deviceResult, engagementResult] = await Promise.all([
      getTrafficSources(apiKey, propertyId, startDate, endDate),
      getDeviceBreakdown(apiKey, propertyId, startDate, endDate),
      getEngagementMetrics(apiKey, propertyId, startDate, endDate),
    ])

    // Parse traffic sources
    const trafficSources: TrafficSourceEntry[] = []
    if (trafficResult.ok) {
      const trafficRows = parseReportRows(trafficResult.data)
      for (const row of trafficRows) {
        trafficSources.push({
          source: row.dimensions.sessionSource ?? '(not set)',
          medium: row.dimensions.sessionMedium ?? '(not set)',
          sessions: row.metrics.sessions ?? 0,
          users: row.metrics.totalUsers ?? 0,
          engagement_rate: row.metrics.engagementRate ?? 0,
          bounce_rate: row.metrics.bounceRate ?? 0,
        })
      }
    }

    // Parse device breakdown
    const deviceBreakdown: DeviceEntry[] = []
    if (deviceResult.ok) {
      const deviceRows = parseReportRows(deviceResult.data)
      for (const row of deviceRows) {
        deviceBreakdown.push({
          category: row.dimensions.deviceCategory ?? 'unknown',
          sessions: row.metrics.sessions ?? 0,
          users: row.metrics.totalUsers ?? 0,
          engagement_rate: row.metrics.engagementRate ?? 0,
          bounce_rate: row.metrics.bounceRate ?? 0,
        })
      }
    }

    // Parse site-wide engagement
    const siteEngagement = engagementResult.ok
      ? extractAggregateMetrics(engagementResult.data)
      : {}

    // -----------------------------------------------------------------------
    // 6. Build performance records for matched pages
    // -----------------------------------------------------------------------

    const now = new Date().toISOString()
    let recordsCreated = 0

    const performanceRecords: PerformanceRecordInsert[] = buildPerformanceRecords(
      pageRows,
      urlToAssetId,
      pubMap,
      now,
      trafficSources,
      deviceBreakdown,
      siteEngagement,
    )

    // Insert in batches of 100
    for (let i = 0; i < performanceRecords.length; i += 100) {
      const batch = performanceRecords.slice(i, i + 100)
      const { error: insertError } = await supabase
        .from('performance_records')
        .insert(batch)

      if (!insertError) {
        recordsCreated += batch.length
      }
    }

    // -----------------------------------------------------------------------
    // 7. Update sync job and connection
    // -----------------------------------------------------------------------

    await updateSyncJob(supabase, sync_job_id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      records_synced: recordsCreated,
      metadata: {
        date_range: { startDate, endDate },
        pages_found: pageRows.length,
        pages_matched: performanceRecords.length,
        traffic_sources_count: trafficSources.length,
        device_categories: deviceBreakdown.length,
      },
    })

    await supabase
      .from('platform_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection_id)

    return NextResponse.json({
      success: true,
      records_synced: recordsCreated,
      pages_found: pageRows.length,
      pages_matched: performanceRecords.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    await updateSyncJob(supabase, sync_job_id, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: message,
    })

    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPerformanceRecords(
  pageRows: GA4ParsedRow[],
  urlToAssetId: Map<string, string>,
  pubMap: Map<string, string>,
  recordedAt: string,
  trafficSources: TrafficSourceEntry[],
  deviceBreakdown: DeviceEntry[],
  siteEngagement: Record<string, number>,
): PerformanceRecordInsert[] {
  const records: PerformanceRecordInsert[] = []

  for (const row of pageRows) {
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
        page_path: pagePath,
        bounce_rate: row.metrics.bounceRate ?? 0,
        traffic_sources: trafficSources,
        device_breakdown: deviceBreakdown,
        site_engagement: siteEngagement,
      },
    })
  }

  return records
}
