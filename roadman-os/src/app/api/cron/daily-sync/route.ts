import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCronSecret } from '@/lib/integrations/sync-orchestrator'
import { runAllSyncs } from '@/lib/sync/sync-engine'

// ---------------------------------------------------------------------------
// GET /api/cron/daily-sync
// ---------------------------------------------------------------------------

/**
 * Daily sync cron job — runs at 06:00 UTC every day (configured in vercel.json).
 *
 * 1. Validates the CRON_SECRET from the Authorization header
 * 2. Creates a parent sync_job for tracking
 * 3. Runs a sync for all active platform connections
 * 4. Per-platform error isolation — one failure does not block others
 */
export async function GET(request: Request) {
  // Validate cron secret
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createClient()

  // Create parent sync job to track the overall daily run
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
        type: 'daily_cron',
        triggered_at: new Date().toISOString(),
      },
    })
    .select('id')
    .single()

  const parentJobId = parentJob ? (parentJob as { id: string }).id : null

  try {
    const result = await runAllSyncs('daily')

    // Update parent job
    if (parentJobId) {
      await supabase
        .from('sync_jobs')
        .update({
          status: result.failed > 0 ? 'completed' : 'completed',
          completed_at: new Date().toISOString(),
          records_synced: result.results.reduce(
            (sum, r) => sum + r.recordsSynced,
            0,
          ),
          error_message:
            result.failed > 0
              ? `${result.failed} of ${result.totalConnections} syncs failed`
              : null,
          metadata: {
            type: 'daily_cron',
            total_connections: result.totalConnections,
            successful: result.successful,
            failed: result.failed,
            child_jobs: result.results.map((r) => ({
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
      totalConnections: result.totalConnections,
      successful: result.successful,
      failed: result.failed,
      totalRecordsSynced: result.results.reduce(
        (sum, r) => sum + r.recordsSynced,
        0,
      ),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Daily sync failed'

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
