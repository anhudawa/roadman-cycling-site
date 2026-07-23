import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCronSecret } from '@/lib/integrations/sync-orchestrator'

// ---------------------------------------------------------------------------
// GET /api/cron/sync-youtube-clips
// ---------------------------------------------------------------------------

/**
 * Cron handler for YouTube Clips channel syncs.
 *
 * Finds all active YouTube connections that have a `clips_channel_id` in their
 * metadata, creates a sync job for each, and triggers the sync endpoint.
 *
 * Schedule: every 6 hours (matching youtube-clips syncIntervalMinutes).
 *
 * TODO: Wire up real YouTube API credentials once available.
 */
export async function GET(request: Request) {
  // -------------------------------------------------------------------------
  // 1. Validate cron secret
  // -------------------------------------------------------------------------

  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    // -----------------------------------------------------------------------
    // 2. Find YouTube connections with clips_channel_id in metadata
    // -----------------------------------------------------------------------

    // Look up the youtube-clips platform
    const { data: platform } = await supabase
      .from('platforms')
      .select('id')
      .eq('slug', 'youtube-clips')
      .single()

    if (!platform) {
      return NextResponse.json({
        ok: true,
        message: 'No youtube-clips platform found — skipping',
        syncs_triggered: 0,
        ran_at: new Date().toISOString(),
      })
    }

    // Fetch active connections for this platform
    const { data: connections, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('platform_id', platform.id)
      .eq('is_active', true)

    if (connError || !connections || connections.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No active youtube-clips connections found',
        syncs_triggered: 0,
        ran_at: new Date().toISOString(),
      })
    }

    // Filter to connections with clips_channel_id set
    const eligibleConnections = connections.filter((conn) => {
      const metadata = conn.metadata as Record<string, unknown> | null
      return metadata?.clips_channel_id
    })

    if (eligibleConnections.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No connections with clips_channel_id configured',
        syncs_triggered: 0,
        ran_at: new Date().toISOString(),
      })
    }

    // -----------------------------------------------------------------------
    // 3. Create sync jobs and trigger syncs
    // -----------------------------------------------------------------------

    const results: Array<{ connection_id: string; sync_job_id: string; status: string }> = []

    for (const conn of eligibleConnections) {
      // Create a sync job
      const { data: syncJob, error: jobError } = await supabase
        .from('sync_jobs')
        .insert({
          connection_id: conn.id,
          source: 'youtube' as const,
          status: 'pending',
        })
        .select('id')
        .single()

      if (jobError || !syncJob) {
        results.push({
          connection_id: conn.id,
          sync_job_id: '',
          status: 'failed_to_create_job',
        })
        continue
      }

      // Trigger the sync endpoint
      // TODO: Replace with proper internal URL once deployment is configured
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

      try {
        const syncResponse = await fetch(`${baseUrl}/api/integrations/youtube-clips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection_id: conn.id,
            sync_job_id: syncJob.id,
          }),
        })

        results.push({
          connection_id: conn.id,
          sync_job_id: syncJob.id,
          status: syncResponse.ok ? 'triggered' : `error_${syncResponse.status}`,
        })
      } catch (fetchErr) {
        results.push({
          connection_id: conn.id,
          sync_job_id: syncJob.id,
          status: 'fetch_error',
        })
      }
    }

    return NextResponse.json({
      ok: true,
      syncs_triggered: results.filter((r) => r.status === 'triggered').length,
      results,
      ran_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown cron error'
    console.error('[cron/sync-youtube-clips] Error:', message)

    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
