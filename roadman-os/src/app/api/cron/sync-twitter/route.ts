import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/cron/sync-twitter
 * Vercel Cron trigger for syncing X / Twitter data.
 * Finds all active Twitter connections, creates sync_jobs, and triggers sync.
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
    // ---- Find the Twitter platform ------------------------------------
    const { data: platform, error: platformError } = await supabase
      .from('platforms')
      .select('id')
      .eq('slug', 'twitter')
      .single()

    if (platformError || !platform) {
      return NextResponse.json(
        { error: 'Twitter platform not found in platforms table' },
        { status: 404 },
      )
    }

    // ---- Find all active Twitter connections ---------------------------
    const { data: connections, error: connError } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('platform_id', platform.id)
      .eq('is_active', true)

    if (connError) {
      console.error('[cron/sync-twitter] Error fetching connections:', connError.message)
      return NextResponse.json(
        { error: connError.message },
        { status: 500 },
      )
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No active Twitter connections to sync',
        synced: 0,
        ran_at: new Date().toISOString(),
      })
    }

    // ---- Create sync jobs and trigger sync for each connection ---------
    const results: Array<{ connection_id: string; status: string }> = []

    for (const conn of connections) {
      // Create a sync job
      const { data: syncJob, error: jobError } = await supabase
        .from('sync_jobs')
        .insert({
          connection_id: conn.id,
          source: 'twitter_x' as const,
          status: 'pending',
          records_synced: 0,
          error_message: null,
          metadata: {},
        })
        .select('id')
        .single()

      if (jobError || !syncJob) {
        console.error(
          `[cron/sync-twitter] Failed to create sync job for connection ${conn.id}:`,
          jobError?.message,
        )
        results.push({ connection_id: conn.id, status: 'job_creation_failed' })
        continue
      }

      // Trigger the sync via the integration API route
      // TODO: Update URL when deployed — use NEXT_PUBLIC_APP_URL or VERCEL_URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ?? (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000')

      try {
        const syncResponse = await fetch(`${baseUrl}/api/integrations/twitter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection_id: conn.id,
            sync_job_id: syncJob.id,
          }),
        })

        results.push({
          connection_id: conn.id,
          status: syncResponse.ok ? 'triggered' : `error_${syncResponse.status}`,
        })
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        console.error(
          `[cron/sync-twitter] Failed to trigger sync for connection ${conn.id}:`,
          message,
        )
        results.push({ connection_id: conn.id, status: 'trigger_failed' })
      }
    }

    return NextResponse.json({
      ok: true,
      connections_found: connections.length,
      results,
      ran_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[cron/sync-twitter] Unhandled error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
