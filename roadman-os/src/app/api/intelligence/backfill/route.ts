import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  createBackfillPlan,
  runBackfillBatch,
  resumeBackfill,
  getBackfillProgress,
  estimateBackfillSize,
  type BackfillSource,
} from '@/lib/intelligence/backfill'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const backfillBodySchema = z.object({
  action: z.enum(['start', 'resume', 'cancel']),
  source: z.enum(['youtube', 'beehiiv', 'ga4']),
  connection_id: z.string().uuid().optional(),
})

// ---------------------------------------------------------------------------
// Default batch sizes per source
// ---------------------------------------------------------------------------

const DEFAULT_BATCH_SIZE: Record<BackfillSource, number> = {
  youtube: 30,
  beehiiv: 60,
  ga4: 90,
}

// ---------------------------------------------------------------------------
// POST /api/intelligence/backfill
// ---------------------------------------------------------------------------

/**
 * T55 — Historical Backfill Programme API.
 *
 * POST body: { action, source, connection_id? }
 * - start:  creates sync_job with backfill metadata, runs first batch
 * - resume: finds paused/failed backfill job, continues from checkpoint
 * - cancel: marks sync_job as cancelled
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = backfillBodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
      { status: 400 },
    )
  }

  const { action, source, connection_id } = parsed.data

  // ---------------------------------------------------------------------------
  // START
  // ---------------------------------------------------------------------------
  if (action === 'start') {
    if (!connection_id) {
      return NextResponse.json(
        { error: 'connection_id is required for start action' },
        { status: 400 },
      )
    }

    // Verify connection exists
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('id, is_active')
      .eq('id', connection_id)
      .single()

    if (connError || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    if (!(connection as any).is_active) {
      return NextResponse.json({ error: 'Connection is inactive' }, { status: 400 })
    }

    // Check for existing running backfill for this source
    const existingProgress = await getBackfillProgress(supabase, source)
    const running = existingProgress.find((p) => p.status === 'running')
    if (running) {
      return NextResponse.json(
        { error: `A backfill is already running for ${source}` },
        { status: 409 },
      )
    }

    // Calculate backfill plan
    // Default: backfill from 2 years ago to today
    const endDate = new Date().toISOString().slice(0, 10)
    const startDateObj = new Date()
    startDateObj.setFullYear(startDateObj.getFullYear() - 2)
    const startDate = startDateObj.toISOString().slice(0, 10)

    const batchSizeDays = DEFAULT_BATCH_SIZE[source]
    const batchWindows = createBackfillPlan({
      source,
      connection_id,
      start_date: startDate,
      end_date: endDate,
      batch_size_days: batchSizeDays,
    })

    const estimate = estimateBackfillSize(source, startDate, endDate)

    // Create sync_job with backfill metadata
    const { data: syncJob, error: jobError } = await supabase
      .from('sync_jobs')
      .insert({
        connection_id,
        source,
        status: 'running',
        started_at: new Date().toISOString(),
        records_synced: 0,
        metadata: {
          backfill: 'true',
          source,
          connection_id,
          start_date: startDate,
          end_date: endDate,
          batch_size_days: batchSizeDays,
          total_batches: batchWindows.length,
          completed_batches: 0,
          records_written: 0,
          batch_windows: batchWindows,
          current_batch_index: 0,
          estimated_rows: estimate.estimated_rows,
          estimated_duration_minutes: estimate.estimated_duration_minutes,
        },
      })
      .select('id')
      .single()

    if (jobError || !syncJob) {
      return NextResponse.json(
        { error: 'Failed to create sync job' },
        { status: 500 },
      )
    }

    const syncJobId = (syncJob as any).id as string

    // Run the first batch
    if (batchWindows.length > 0) {
      const firstBatch = batchWindows[0]
      const result = await runBackfillBatch(
        supabase,
        source,
        connection_id,
        firstBatch.start,
        firstBatch.end,
        syncJobId,
      )

      // Update sync_job with first batch result
      const newStatus = result.error ? 'failed' : (batchWindows.length === 1 ? 'completed' : 'running')
      await supabase
        .from('sync_jobs')
        .update({
          status: newStatus,
          records_synced: result.records_written,
          error_message: result.error,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
          metadata: {
            backfill: 'true',
            source,
            connection_id,
            start_date: startDate,
            end_date: endDate,
            batch_size_days: batchSizeDays,
            total_batches: batchWindows.length,
            completed_batches: result.error ? 0 : 1,
            records_written: result.records_written,
            batch_windows: batchWindows,
            current_batch_index: result.error ? 0 : 1,
          },
        })
        .eq('id', syncJobId)
    }

    return NextResponse.json({
      sync_job_id: syncJobId,
      total_batches: batchWindows.length,
      source,
      start_date: startDate,
      end_date: endDate,
      estimate,
    })
  }

  // ---------------------------------------------------------------------------
  // RESUME
  // ---------------------------------------------------------------------------
  if (action === 'resume') {
    // Find the latest paused or failed backfill job for this source
    const { data: jobs } = await supabase
      .from('sync_jobs')
      .select('*')
      .eq('source', source)
      .eq('metadata->>backfill', 'true')
      .in('status', ['paused', 'failed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: `No paused or failed backfill found for ${source}` },
        { status: 404 },
      )
    }

    const syncJobId = (jobs[0] as any).id as string
    const result = await resumeBackfill(supabase, syncJobId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 },
      )
    }

    return NextResponse.json({
      sync_job_id: syncJobId,
      resumed: true,
      source,
    })
  }

  // ---------------------------------------------------------------------------
  // CANCEL
  // ---------------------------------------------------------------------------
  if (action === 'cancel') {
    // Find the latest running backfill job for this source
    const { data: jobs } = await supabase
      .from('sync_jobs')
      .select('*')
      .eq('source', source)
      .eq('metadata->>backfill', 'true')
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      .limit(1)

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: `No running backfill found for ${source}` },
        { status: 404 },
      )
    }

    const syncJobId = (jobs[0] as any).id as string
    const meta = (jobs[0] as any).metadata ?? {}

    await supabase
      .from('sync_jobs')
      .update({
        status: 'cancelled',
        error_message: 'Cancelled by user',
        metadata: { ...meta, status: 'cancelled' },
      })
      .eq('id', syncJobId)

    return NextResponse.json({
      sync_job_id: syncJobId,
      cancelled: true,
      source,
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// ---------------------------------------------------------------------------
// GET /api/intelligence/backfill
// ---------------------------------------------------------------------------

/**
 * Returns backfill progress for all sources (or a specific source).
 * Query params: ?source=youtube (optional)
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const source = url.searchParams.get('source') as BackfillSource | null

  const progress = await getBackfillProgress(
    supabase,
    source ?? undefined,
  )

  // Calculate overall summary
  const totalRecords = progress.reduce((sum, p) => sum + p.records_written, 0)
  const allCompleted = progress.every((p) => p.status === 'completed')
  const anyRunning = progress.some((p) => p.status === 'running')
  const anyFailed = progress.some((p) => p.status === 'failed')

  return NextResponse.json({
    progress,
    summary: {
      total_records_backfilled: totalRecords,
      all_completed: allCompleted,
      any_running: anyRunning,
      any_failed: anyFailed,
      sources_completed: progress.filter((p) => p.status === 'completed').length,
      sources_total: progress.length,
    },
  })
}
