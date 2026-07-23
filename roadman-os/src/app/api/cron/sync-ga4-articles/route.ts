import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCronSecret } from '@/lib/integrations/sync-orchestrator'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ConnectionMetadata = {
  property_id?: string
  article_path_prefix?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// GET /api/cron/sync-ga4-articles
// ---------------------------------------------------------------------------

/**
 * Cron handler for article-level GA4 syncs.
 *
 * Finds all active GA4 connections that have an `article_path_prefix` in their
 * metadata, creates a sync job for each, and triggers the sync endpoint.
 *
 * Schedule: every 6 hours (matching ga4-articles syncIntervalMinutes).
 *
 * TODO: Wire up real GA4 API credentials once available.
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
    // 2. Find GA4 connections with article_path_prefix in metadata
    // -----------------------------------------------------------------------

    // Look up the ga4-articles platform
    const { data: platform } = await supabase
      .from('platforms')
      .select('id')
      .eq('slug', 'ga4-articles')
      .single()

    if (!platform) {
      return NextResponse.json({
        ok: true,
        message: 'No ga4-articles platform found — skipping',
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
        message: 'No active ga4-articles connections found',
        syncs_triggered: 0,
        ran_at: new Date().toISOString(),
      })
    }

    // Filter to connections with article_path_prefix set
    const eligibleConnections = connections.filter((conn) => {
      const metadata = conn.metadata as ConnectionMetadata | null
      return metadata?.article_path_prefix && metadata?.property_id
    })

    if (eligibleConnections.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No connections with article_path_prefix configured',
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
          source: 'ga4' as const,
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
        const syncResponse = await fetch(`${baseUrl}/api/integrations/ga4-articles`, {
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
    console.error('[cron/sync-ga4-articles] Error:', message)

    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
