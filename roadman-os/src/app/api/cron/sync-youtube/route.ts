import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/cron/sync-youtube
 * Vercel Cron trigger for syncing all active YouTube connections.
 * Creates a sync_job for each connection and triggers the sync endpoint.
 * Schedule: every 6 hours
 */
export async function GET(request: Request) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    // ---- Find the YouTube platform ----------------------------------------
    const { data: platform, error: platformError } = await supabase
      .from('platforms')
      .select('id')
      .eq('slug', 'youtube')
      .single()

    if (platformError || !platform) {
      return NextResponse.json(
        { error: 'YouTube platform not found in platforms table' },
        { status: 404 },
      )
    }

    // ---- Find all active YouTube connections -------------------------------
    const { data: connections, error: connError } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('platform_id', platform.id)
      .eq('is_active', true)

    if (connError) {
      console.error('[cron/sync-youtube] Error fetching connections:', connError.message)
      return NextResponse.json({ error: connError.message }, { status: 500 })
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No active YouTube connections to sync',
        synced: 0,
        ran_at: new Date().toISOString(),
      })
    }

    // ---- Create sync jobs and trigger syncs in parallel --------------------
    const origin = new URL(request.url).origin

    const settled = await Promise.allSettled(
      connections.map(async (conn) => {
        // Create a sync_job record
        const { data: syncJob, error: jobError } = await supabase
          .from('sync_jobs')
          .insert({
            connection_id: conn.id,
            source: 'youtube' as const,
            status: 'pending',
            records_synced: 0,
            metadata: { triggered_by: 'cron' },
          })
          .select('id')
          .single()

        if (jobError || !syncJob) {
          throw new Error(jobError?.message ?? 'Failed to create sync job')
        }

        // Trigger the sync endpoint
        const syncResponse = await fetch(`${origin}/api/sync/youtube`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection_id: conn.id,
            sync_job_id: syncJob.id,
          }),
        })

        if (!syncResponse.ok) {
          throw new Error(`Sync endpoint returned ${syncResponse.status}`)
        }

        return {
          connection_id: conn.id,
          sync_job_id: syncJob.id,
          status: 'triggered' as const,
        }
      }),
    )

    // ---- Build results summary --------------------------------------------
    const results = settled.map((outcome, idx) => {
      if (outcome.status === 'fulfilled') {
        return outcome.value
      }
      return {
        connection_id: connections[idx].id,
        sync_job_id: '',
        status: 'failed' as const,
        error: outcome.reason instanceof Error ? outcome.reason.message : 'Unknown error',
      }
    })

    return NextResponse.json({
      ok: true,
      connections_found: connections.length,
      results,
      ran_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown cron error'
    console.error('[cron/sync-youtube] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
