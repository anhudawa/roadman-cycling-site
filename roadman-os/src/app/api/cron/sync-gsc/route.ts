import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PlatformConnection } from '@/types/database'

/**
 * GET /api/cron/sync-gsc
 * Vercel Cron trigger for daily Google Search Console sync.
 * Schedule: 05:00 UTC daily (after the derive-deltas cron at 04:00)
 *
 * Finds all active GSC connections, creates a sync_job for each,
 * and triggers an incremental sync (last 3 days only).
 *
 * For a full 16-month backfill, use the manual trigger at
 * POST /api/integrations/gsc with full_backfill: true.
 */
export async function GET(request: Request) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createClient()

  // -------------------------------------------------------------------------
  // 1. Find the GSC platform record
  // -------------------------------------------------------------------------
  const { data: platform } = await supabase
    .from('platforms')
    .select('id')
    .eq('slug', 'gsc')
    .single()

  if (!platform) {
    return NextResponse.json(
      { ok: false, error: 'GSC platform not found' },
      { status: 404 },
    )
  }

  // -------------------------------------------------------------------------
  // 2. Find all active GSC connections
  // -------------------------------------------------------------------------
  const { data: connections, error: connError } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('platform_id', platform.id)
    .eq('is_active', true)

  if (connError) {
    return NextResponse.json(
      { ok: false, error: connError.message },
      { status: 500 },
    )
  }

  const activeConnections = (connections ?? []) as unknown as PlatformConnection[]

  if (activeConnections.length === 0) {
    return NextResponse.json({
      ok: true,
      message: 'No active GSC connections',
      synced: 0,
      ran_at: new Date().toISOString(),
    })
  }

  // -------------------------------------------------------------------------
  // 3. Create sync jobs and trigger incremental syncs
  // -------------------------------------------------------------------------
  const results: Array<{
    connection_id: string
    status: string
    records_synced?: number
    error?: string
  }> = []

  for (const conn of activeConnections) {
    // Create a sync_job record
    const { data: syncJob, error: jobError } = await supabase
      .from('sync_jobs')
      .insert({
        connection_id: conn.id,
        source: 'website' as const, // MetricSource for GSC is 'website'
        status: 'pending',
        records_synced: 0,
        error_message: null,
        completed_at: null,
        started_at: null,
        metadata: { trigger: 'cron', incremental: true },
      })
      .select('id')
      .single()

    if (jobError || !syncJob) {
      results.push({
        connection_id: conn.id,
        status: 'failed',
        error: jobError?.message ?? 'Failed to create sync job',
      })
      continue
    }

    // Call the sync handler internally — incremental only (last 3 days)
    try {
      const origin = new URL(request.url).origin
      const syncResponse = await fetch(`${origin}/api/integrations/gsc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_id: conn.id,
          sync_job_id: syncJob.id,
          full_backfill: false, // cron always does incremental
        }),
      })

      const syncResult = (await syncResponse.json()) as {
        records_synced?: number
        error?: string
      }

      results.push({
        connection_id: conn.id,
        status: syncResponse.ok ? 'completed' : 'failed',
        records_synced: syncResult.records_synced,
        error: syncResult.error,
      })
    } catch (err) {
      results.push({
        connection_id: conn.id,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Internal sync call failed',
      })
    }
  }

  return NextResponse.json({
    ok: true,
    connections: activeConnections.length,
    results,
    ran_at: new Date().toISOString(),
  })
}
