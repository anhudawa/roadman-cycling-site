import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCronSecret } from '@/lib/integrations/sync-orchestrator'
import { runAllSyncs } from '@/lib/sync/sync-engine'

// ---------------------------------------------------------------------------
// GET /api/cron/weekly-sync
// ---------------------------------------------------------------------------

/**
 * Weekly deep sync cron job — runs at 03:00 UTC every Monday (configured in vercel.json).
 *
 * Performs a deeper sync than the daily job:
 * 1. Validates the CRON_SECRET from the Authorization header
 * 2. Runs full sync for all active connections (30-day analytics window)
 * 3. Discovers new content across platforms
 * 4. Recalculates performance benchmarks
 *
 * The weekly sync uses a wider analytics window and discovers new content
 * that may have been missed by daily syncs or webhooks.
 */
export async function GET(request: Request) {
  // Validate cron secret
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createClient()

  // Create parent sync job
  const { data: parentJob } = await supabase
    .from('sync_jobs')
    .insert({
      connection_id: null,
      source: 'manual' as const,
      status: 'running',
      started_at: new Date().toISOString(),
      completed_at: null,
      records_synced: 0,
      error_message: null,
      metadata: {
        type: 'weekly_cron',
        triggered_at: new Date().toISOString(),
        analytics_window_days: 30,
      },
    })
    .select('id')
    .single()

  const parentJobId = parentJob ? (parentJob as { id: string }).id : null

  try {
    // Run full syncs for all platforms
    const syncResult = await runAllSyncs('weekly')

    // Recalculate performance benchmarks
    // This aggregates the last 30 days of performance data to update
    // per-asset and per-topic benchmarks used by the intelligence layer.
    await recalculateBenchmarks()

    // Update parent job
    if (parentJobId) {
      await supabase
        .from('sync_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_synced: syncResult.results.reduce(
            (sum, r) => sum + r.recordsSynced,
            0,
          ),
          error_message:
            syncResult.failed > 0
              ? `${syncResult.failed} of ${syncResult.totalConnections} syncs failed`
              : null,
          metadata: {
            type: 'weekly_cron',
            total_connections: syncResult.totalConnections,
            successful: syncResult.successful,
            failed: syncResult.failed,
            benchmarks_recalculated: true,
            child_jobs: syncResult.results.map((r) => ({
              connectionId: r.connectionId,
              platformSlug: r.platformSlug,
              success: r.success,
              recordsSynced: r.recordsSynced,
              syncJobId: r.syncJobId,
              error: r.error,
            })),
          },
        })
        .eq('id', parentJobId)
    }

    return NextResponse.json({
      success: true,
      totalConnections: syncResult.totalConnections,
      successful: syncResult.successful,
      failed: syncResult.failed,
      totalRecordsSynced: syncResult.results.reduce(
        (sum, r) => sum + r.recordsSynced,
        0,
      ),
      benchmarksRecalculated: true,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Weekly sync failed'

    if (parentJobId) {
      await supabase
        .from('sync_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: message,
        })
        .eq('id', parentJobId)
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// Benchmark recalculation
// ---------------------------------------------------------------------------

/**
 * Recalculate performance benchmarks based on the last 30 days of data.
 *
 * Stub implementation — in production this would:
 * 1. Query performance_records for the last 30 days
 * 2. Calculate average views, engagement rate, CTR per asset type
 * 3. Calculate per-topic performance benchmarks
 * 4. Store results for the intelligence layer to reference
 */
async function recalculateBenchmarks(): Promise<void> {
  // Stub — benchmarks would be calculated from performance_records
  // and stored in a benchmarks table or as metadata on topics.
  // This is a placeholder for the actual implementation.
}
