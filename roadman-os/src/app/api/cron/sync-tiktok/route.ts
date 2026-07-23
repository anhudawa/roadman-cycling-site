import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/cron/sync-tiktok
 * Vercel Cron trigger for syncing all active TikTok connections.
 * Creates a sync_job for each connection and triggers the sync endpoint.
 * Schedule: every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
 */
export async function GET(request: Request) {
  // Validate cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    // ---- Find all active TikTok connections ------------------------------
    const { data: platform } = await supabase
      .from('platforms')
      .select('id')
      .eq('slug', 'tiktok')
      .single()

    if (!platform) {
      return NextResponse.json(
        { error: 'TikTok platform not found in database' },
        { status: 404 },
      )
    }

    const { data: connections, error: connError } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('platform_id', platform.id)
      .eq('is_active', true)

    if (connError) {
      console.error('[cron/sync-tiktok] Error loading connections:', connError.message)
      return NextResponse.json(
        { error: connError.message },
        { status: 500 },
      )
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No active TikTok connections',
        synced: 0,
        ran_at: new Date().toISOString(),
      })
    }

    // ---- Create sync jobs and trigger syncs for each connection ----------
    const results: Array<{
      connection_id: string
      sync_job_id: string
      status: 'triggered' | 'failed'
      error?: string
    }> = []

    for (const connection of connections) {
      // Create a sync job
      const { data: syncJob, error: jobError } = await supabase
        .from('sync_jobs')
        .insert({
          connection_id: connection.id,
          source: 'tiktok' as const,
          status: 'pending',
          records_synced: 0,
          metadata: { triggered_by: 'cron' },
        })
        .select('id')
        .single()

      if (jobError || !syncJob) {
        results.push({
          connection_id: connection.id,
          sync_job_id: '',
          status: 'failed',
          error: jobError?.message ?? 'Failed to create sync job',
        })
        continue
      }

      // Trigger the sync endpoint
      // TODO: Replace with internal function call or queue once available
      try {
        const syncUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/integrations/tiktok`

        await fetch(syncUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection_id: connection.id,
            sync_job_id: syncJob.id,
          }),
        })

        results.push({
          connection_id: connection.id,
          sync_job_id: syncJob.id,
          status: 'triggered',
        })
      } catch (triggerError) {
        const errorMessage =
          triggerError instanceof Error
            ? triggerError.message
            : 'Failed to trigger sync'

        // Mark the sync job as failed
        await supabase
          .from('sync_jobs')
          .update({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString(),
          })
          .eq('id', syncJob.id)

        results.push({
          connection_id: connection.id,
          sync_job_id: syncJob.id,
          status: 'failed',
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      ok: true,
      connections_found: connections.length,
      results,
      ran_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown cron error'
    console.error('[cron/sync-tiktok] Error:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
