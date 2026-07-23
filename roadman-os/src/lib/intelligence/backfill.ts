/**
 * T55 — Historical Backfill Programme
 *
 * Orchestrator for backfilling performance_daily data from YouTube Analytics,
 * Beehiiv, and GA4. All actual API calls are stubbed with TODO markers.
 * Backfills are resumable via sync_jobs metadata checkpointing.
 */

import type { PerformanceDailyInsert, MetricSource } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BackfillSource = 'youtube' | 'beehiiv' | 'ga4'

export type BackfillConfig = {
  source: BackfillSource
  connection_id: string
  start_date: string     // earliest date to backfill from
  end_date: string       // latest date (usually today)
  batch_size_days: number // days per batch (30 for YouTube, 90 for GA4)
}

export type BackfillProgress = {
  source: BackfillSource
  total_batches: number
  completed_batches: number
  records_written: number
  current_batch_start: string | null
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  error_message: string | null
  started_at: string | null
  completed_at: string | null
}

type BatchWindow = {
  start: string
  end: string
}

type BackfillMetadata = {
  backfill: 'true'
  source: BackfillSource
  connection_id: string
  start_date: string
  end_date: string
  batch_size_days: number
  total_batches: number
  completed_batches: number
  records_written: number
  batch_windows: BatchWindow[]
  current_batch_index: number
}

// Supabase client type — matches what createClient() returns
type SupabaseClient = Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Date as YYYY-MM-DD. */
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Parse a YYYY-MM-DD string into a Date. */
function parseDate(s: string): Date {
  return new Date(s + 'T00:00:00Z')
}

// ---------------------------------------------------------------------------
// createBackfillPlan
// ---------------------------------------------------------------------------

/**
 * Calculates batch windows for a backfill operation.
 * Splits the date range into chunks of `batch_size_days`.
 */
export function createBackfillPlan(config: BackfillConfig): BatchWindow[] {
  const windows: BatchWindow[] = []
  const start = parseDate(config.start_date)
  const end = parseDate(config.end_date)

  let cursor = new Date(start)

  while (cursor < end) {
    const batchEnd = new Date(cursor)
    batchEnd.setUTCDate(batchEnd.getUTCDate() + config.batch_size_days - 1)

    // Don't overshoot the end date
    const actualEnd = batchEnd > end ? end : batchEnd

    windows.push({
      start: toDateStr(cursor),
      end: toDateStr(actualEnd),
    })

    // Move cursor to day after this batch ended
    cursor = new Date(actualEnd)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return windows
}

// ---------------------------------------------------------------------------
// runBackfillBatch
// ---------------------------------------------------------------------------

/**
 * Processes a single batch for a given source.
 * Fetches historical data and writes to performance_daily.
 *
 * ALL actual API calls are stubbed — returns empty arrays with TODO markers.
 */
export async function runBackfillBatch(
  supabase: SupabaseClient,
  source: BackfillSource,
  connectionId: string,
  startDate: string,
  endDate: string,
  syncJobId: string,
): Promise<{ records_written: number; error: string | null }> {
  let records: PerformanceDailyInsert[] = []

  try {
    switch (source) {
      case 'youtube':
        records = await fetchYouTubeHistorical(connectionId, startDate, endDate)
        break
      case 'beehiiv':
        records = await fetchBeehiivHistorical(connectionId, startDate, endDate)
        break
      case 'ga4':
        records = await fetchGA4Historical(connectionId, startDate, endDate)
        break
      default:
        return { records_written: 0, error: `Unsupported source: ${source}` }
    }

    // Write records to performance_daily in batches of 100
    let totalWritten = 0

    for (let i = 0; i < records.length; i += 100) {
      const batch = records.slice(i, i + 100)
      const { error: insertError } = await supabase
        .from('performance_daily')
        .upsert(batch, { onConflict: 'publication_id,source,date' })

      if (insertError) {
        return {
          records_written: totalWritten,
          error: `Insert error at offset ${i}: ${insertError.message}`,
        }
      }
      totalWritten += batch.length
    }

    return { records_written: totalWritten, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during batch processing'
    return { records_written: 0, error: message }
  }
}

// ---------------------------------------------------------------------------
// Source-specific fetchers (ALL STUBBED)
// ---------------------------------------------------------------------------

/**
 * Fetch YouTube Analytics historical data for a date range.
 * Calls the YouTube Analytics API for day-by-day data per video.
 *
 * TODO: Implement actual YouTube Analytics API calls:
 * 1. Load connection to get access token
 * 2. Resolve channel ID from connection metadata
 * 3. List all videos published in or before the date range
 * 4. For each video, call youtubeAnalytics.reports.query with:
 *    - ids: channel==MINE
 *    - startDate / endDate
 *    - metrics: views,estimatedMinutesWatched,likes,comments,shares,
 *               subscribersGained,averageViewDuration
 *    - dimensions: day,video
 *    - filters: video==VIDEO_ID
 * 5. Map each row to a PerformanceDailyInsert with is_measured = true
 */
async function fetchYouTubeHistorical(
  _connectionId: string,
  _startDate: string,
  _endDate: string,
): Promise<PerformanceDailyInsert[]> {
  // TODO: Replace with actual YouTube Analytics API calls
  // See docstring above for implementation details
  return []
}

/**
 * Fetch Beehiiv historical post statistics for a date range.
 * Calls the Beehiiv API for historical post performance.
 *
 * TODO: Implement actual Beehiiv API calls:
 * 1. Load connection to get API key
 * 2. List all posts with GET /publications/{pub_id}/posts
 *    filtered by publish_date within range
 * 3. For each post, fetch stats with GET /publications/{pub_id}/posts/{post_id}/stats
 * 4. Map opens, clicks, unsubscribes to PerformanceDailyInsert
 *    with is_measured = true
 */
async function fetchBeehiivHistorical(
  _connectionId: string,
  _startDate: string,
  _endDate: string,
): Promise<PerformanceDailyInsert[]> {
  // TODO: Replace with actual Beehiiv API calls
  // See docstring above for implementation details
  return []
}

/**
 * Fetch GA4 historical page view data for a date range.
 * Calls the GA4 Data API (v1beta) for daily page views per URL.
 *
 * TODO: Implement actual GA4 Data API calls:
 * 1. Load connection to get access token and property ID
 * 2. Call analyticsdata.properties.runReport with:
 *    - dateRanges: [{ startDate, endDate }]
 *    - dimensions: [{ name: 'date' }, { name: 'pagePath' }]
 *    - metrics: [{ name: 'screenPageViews' }, { name: 'sessions' },
 *                { name: 'activeUsers' }, { name: 'engagementRate' }]
 * 3. Match pagePath to existing publications via external_url
 * 4. Map each row to a PerformanceDailyInsert with is_measured = true
 */
async function fetchGA4Historical(
  _connectionId: string,
  _startDate: string,
  _endDate: string,
): Promise<PerformanceDailyInsert[]> {
  // TODO: Replace with actual GA4 Data API calls
  // See docstring above for implementation details
  return []
}

// ---------------------------------------------------------------------------
// getBackfillProgress
// ---------------------------------------------------------------------------

/**
 * Reads sync_jobs where metadata->>'backfill' = 'true' to compute
 * backfill progress for one or all sources.
 */
export async function getBackfillProgress(
  supabase: SupabaseClient,
  source?: BackfillSource,
): Promise<BackfillProgress[]> {
  let query = supabase
    .from('sync_jobs')
    .select('*')
    .eq('metadata->>backfill', 'true')
    .order('created_at', { ascending: false })

  if (source) {
    query = query.eq('source', source)
  }

  const { data: jobs, error } = await query

  if (error || !jobs) {
    return []
  }

  // Group by source — take the latest job per source
  const latestBySource = new Map<BackfillSource, typeof jobs[0]>()

  for (const job of jobs as Array<typeof jobs[0]>) {
    const jobSource = (job as any).source as BackfillSource
    if (!latestBySource.has(jobSource)) {
      latestBySource.set(jobSource, job)
    }
  }

  const progress: BackfillProgress[] = []

  for (const [src, job] of latestBySource) {
    const meta = (job as any).metadata as Partial<BackfillMetadata> | null

    progress.push({
      source: src,
      total_batches: meta?.total_batches ?? 0,
      completed_batches: meta?.completed_batches ?? 0,
      records_written: meta?.records_written ?? (job as any).records_synced ?? 0,
      current_batch_start: meta?.batch_windows?.[meta?.current_batch_index ?? 0]?.start ?? null,
      status: mapJobStatus((job as any).status),
      error_message: (job as any).error_message ?? null,
      started_at: (job as any).started_at ?? null,
      completed_at: (job as any).completed_at ?? null,
    })
  }

  // Ensure all three sources are represented
  const allSources: BackfillSource[] = ['youtube', 'beehiiv', 'ga4']
  for (const src of allSources) {
    if (source && source !== src) continue
    if (!progress.find((p) => p.source === src)) {
      progress.push({
        source: src,
        total_batches: 0,
        completed_batches: 0,
        records_written: 0,
        current_batch_start: null,
        status: 'pending',
        error_message: null,
        started_at: null,
        completed_at: null,
      })
    }
  }

  return progress
}

/** Map sync_job status strings to BackfillProgress statuses. */
function mapJobStatus(status: string): BackfillProgress['status'] {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'running':
      return 'running'
    case 'paused':
      return 'paused'
    case 'completed':
      return 'completed'
    case 'failed':
      return 'failed'
    case 'cancelled':
      return 'paused'
    default:
      return 'pending'
  }
}

// ---------------------------------------------------------------------------
// resumeBackfill
// ---------------------------------------------------------------------------

/**
 * Finds the last completed batch from sync_job metadata and continues
 * the backfill from the next batch.
 */
export async function resumeBackfill(
  supabase: SupabaseClient,
  syncJobId: string,
): Promise<{ success: boolean; error: string | null }> {
  // Load the sync job
  const { data: job, error: jobError } = await supabase
    .from('sync_jobs')
    .select('*')
    .eq('id', syncJobId)
    .single()

  if (jobError || !job) {
    return { success: false, error: 'Sync job not found' }
  }

  const meta = (job as any).metadata as Partial<BackfillMetadata> | null
  if (!meta?.backfill) {
    return { success: false, error: 'Not a backfill job' }
  }

  const batchWindows = meta.batch_windows ?? []
  const completedBatches = meta.completed_batches ?? 0
  const connectionId = meta.connection_id ?? (job as any).connection_id

  if (completedBatches >= batchWindows.length) {
    return { success: false, error: 'Backfill already completed' }
  }

  // Mark as running
  await supabase
    .from('sync_jobs')
    .update({
      status: 'running',
      error_message: null,
      metadata: { ...meta, status: 'running' },
    })
    .eq('id', syncJobId)

  let totalRecords = meta.records_written ?? 0

  // Process remaining batches
  for (let i = completedBatches; i < batchWindows.length; i++) {
    const window = batchWindows[i]

    const result = await runBackfillBatch(
      supabase,
      meta.source!,
      connectionId,
      window.start,
      window.end,
      syncJobId,
    )

    totalRecords += result.records_written

    if (result.error) {
      // Checkpoint progress before failing
      await supabase
        .from('sync_jobs')
        .update({
          status: 'failed',
          error_message: result.error,
          records_synced: totalRecords,
          metadata: {
            ...meta,
            completed_batches: i,
            records_written: totalRecords,
            current_batch_index: i,
          },
        })
        .eq('id', syncJobId)

      return { success: false, error: result.error }
    }

    // Checkpoint progress after each successful batch
    await supabase
      .from('sync_jobs')
      .update({
        status: 'running',
        records_synced: totalRecords,
        metadata: {
          ...meta,
          completed_batches: i + 1,
          records_written: totalRecords,
          current_batch_index: i + 1,
        },
      })
      .eq('id', syncJobId)
  }

  // Mark as completed
  await supabase
    .from('sync_jobs')
    .update({
      status: 'completed',
      records_synced: totalRecords,
      completed_at: new Date().toISOString(),
      metadata: {
        ...meta,
        completed_batches: batchWindows.length,
        records_written: totalRecords,
        current_batch_index: batchWindows.length,
      },
    })
    .eq('id', syncJobId)

  return { success: true, error: null }
}

// ---------------------------------------------------------------------------
// estimateBackfillSize
// ---------------------------------------------------------------------------

/**
 * Rough estimate of the number of rows that will be written for a backfill.
 * Based on typical content volumes per source.
 */
export function estimateBackfillSize(
  source: BackfillSource,
  startDate: string,
  endDate: string,
): { estimated_rows: number; estimated_duration_minutes: number } {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))

  // Rough estimates based on typical Roadman Cycling content volumes
  switch (source) {
    case 'youtube': {
      // ~200 videos, daily data per video
      const estimatedVideos = 200
      const rows = days * estimatedVideos
      const durationMinutes = Math.ceil(rows / 500) // ~500 rows/min with API rate limits
      return { estimated_rows: rows, estimated_duration_minutes: durationMinutes }
    }
    case 'beehiiv': {
      // ~2 newsletters per week, daily stats
      const estimatedPosts = Math.ceil(days / 3.5)
      const rows = estimatedPosts * days
      const durationMinutes = Math.ceil(rows / 1000)
      return { estimated_rows: rows, estimated_duration_minutes: durationMinutes }
    }
    case 'ga4': {
      // ~50 unique pages, daily data
      const estimatedPages = 50
      const rows = days * estimatedPages
      const durationMinutes = Math.ceil(rows / 2000) // GA4 is faster
      return { estimated_rows: rows, estimated_duration_minutes: durationMinutes }
    }
    default:
      return { estimated_rows: 0, estimated_duration_minutes: 0 }
  }
}
