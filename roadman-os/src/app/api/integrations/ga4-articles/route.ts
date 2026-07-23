import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { fetchArticleMetrics } from '@/lib/integrations/ga4-articles'
import { getDefaultDateRange } from '@/lib/integrations/ga4'
import type { PlatformConnection } from '@/types/database'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const syncBodySchema = z.object({
  connection_id: z.string().uuid(),
  sync_job_id: z.string().uuid(),
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ConnectionMetadata = {
  property_id?: string
  article_path_prefix?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Update a sync_job row in Supabase. */
async function updateSyncJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  syncJobId: string,
  data: {
    status?: string
    started_at?: string
    completed_at?: string
    records_synced?: number
    error_message?: string | null
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  await supabase.from('sync_jobs').update(data).eq('id', syncJobId)
}

// ---------------------------------------------------------------------------
// POST /api/integrations/ga4-articles
// ---------------------------------------------------------------------------

/**
 * Sync handler for article-level GA4 metrics.
 *
 * 1. Validates the request body (connection_id, sync_job_id).
 * 2. Loads the connection and extracts property_id + article_path_prefix.
 * 3. Calls fetchArticleMetrics to get per-article performance records.
 * 4. Batch inserts performance records.
 * 5. Updates sync_job and connection.last_synced_at.
 *
 * TODO: Wire up real GA4 API credentials once available.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  let syncJobId: string | undefined

  try {
    // -----------------------------------------------------------------------
    // 1. Parse & validate body
    // -----------------------------------------------------------------------

    const body: unknown = await request.json()
    const parsed = syncBodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
        { status: 400 },
      )
    }

    const { connection_id, sync_job_id } = parsed.data
    syncJobId = sync_job_id

    // -----------------------------------------------------------------------
    // 2. Load the platform connection
    // -----------------------------------------------------------------------

    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connection_id)
      .single()

    if (connError || !connection) {
      await updateSyncJob(supabase, sync_job_id, {
        status: 'failed',
        error_message: 'Connection not found',
      })
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const conn = connection as PlatformConnection
    const apiKey = conn.access_token

    if (!apiKey) {
      await updateSyncJob(supabase, sync_job_id, {
        status: 'failed',
        error_message: 'No API key (access_token) on connection',
      })
      return NextResponse.json(
        { error: 'No API key on connection' },
        { status: 400 },
      )
    }

    const metadata = conn.metadata as ConnectionMetadata
    const propertyId = metadata.property_id

    if (!propertyId) {
      await updateSyncJob(supabase, sync_job_id, {
        status: 'failed',
        error_message: 'No property_id in connection metadata',
      })
      return NextResponse.json(
        { error: 'No property_id in connection metadata' },
        { status: 400 },
      )
    }

    const articlePathPrefix = metadata.article_path_prefix
    if (!articlePathPrefix) {
      await updateSyncJob(supabase, sync_job_id, {
        status: 'failed',
        error_message: 'No article_path_prefix in connection metadata',
      })
      return NextResponse.json(
        { error: 'No article_path_prefix in connection metadata' },
        { status: 400 },
      )
    }

    // -----------------------------------------------------------------------
    // 3. Mark sync job as running
    // -----------------------------------------------------------------------

    await updateSyncJob(supabase, sync_job_id, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // -----------------------------------------------------------------------
    // 4. Fetch article-level metrics
    // -----------------------------------------------------------------------

    const { startDate, endDate } = getDefaultDateRange(30)

    const result = await fetchArticleMetrics(
      apiKey,
      propertyId,
      startDate,
      endDate,
      articlePathPrefix,
    )

    // -----------------------------------------------------------------------
    // 5. Batch insert performance records
    // -----------------------------------------------------------------------

    let recordsCreated = 0

    for (let i = 0; i < result.records.length; i += 100) {
      const batch = result.records.slice(i, i + 100)
      const { error: insertError } = await supabase
        .from('performance_records')
        .insert(batch)

      if (!insertError) {
        recordsCreated += batch.length
      }
    }

    // -----------------------------------------------------------------------
    // 6. Update sync job and connection
    // -----------------------------------------------------------------------

    await updateSyncJob(supabase, sync_job_id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      records_synced: recordsCreated,
      metadata: {
        date_range: { startDate, endDate },
        article_path_prefix: articlePathPrefix,
        articles_found: result.articlesFound,
        articles_matched: result.articlesMatched,
      },
    })

    await supabase
      .from('platform_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection_id)

    return NextResponse.json({
      success: true,
      records_synced: recordsCreated,
      articles_found: result.articlesFound,
      articles_matched: result.articlesMatched,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    if (syncJobId) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: message,
      }).catch(() => {
        // Best-effort — don't mask the original error
      })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
