import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/utils/oauth'
import {
  fetchSearchAnalytics,
  mapToSearchConsoleDaily,
  getDateRange,
  getIncrementalDateRange,
  splitIntoMonthlyChunks,
  GSCApiError,
} from '@/lib/integrations/gsc'
import type { PlatformConnection, SearchConsoleDailyInsert } from '@/types/database'

// ==========================================================================
// Request validation
// ==========================================================================

const syncBodySchema = z.object({
  connection_id: z.string().uuid('Invalid connection ID'),
  sync_job_id: z.string().uuid('Invalid sync job ID'),
  /** When true, fetch the full 16-month rolling window instead of just 3 days. */
  full_backfill: z.boolean().optional().default(false),
})

// ==========================================================================
// Constants
// ==========================================================================

/** Batch size for Supabase inserts */
const INSERT_BATCH_SIZE = 500

// ==========================================================================
// Types
// ==========================================================================

type ConnectionMetadata = {
  site_url?: string
  [key: string]: unknown
}

// ==========================================================================
// Helpers
// ==========================================================================

/** Update sync_job status + optional error in Supabase. */
async function updateSyncJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  syncJobId: string,
  fields: {
    status: string
    records_synced?: number
    error_message?: string | null
    completed_at?: string | null
    started_at?: string | null
    metadata?: Record<string, unknown>
  },
) {
  await supabase
    .from('sync_jobs')
    .update({
      status: fields.status,
      records_synced: fields.records_synced ?? 0,
      error_message: fields.error_message ?? null,
      completed_at: fields.completed_at ?? null,
      started_at: fields.started_at ?? null,
      metadata: fields.metadata ?? {},
    })
    .eq('id', syncJobId)
}

// ==========================================================================
// POST /api/integrations/gsc
// ==========================================================================

/**
 * Sync Google Search Console search analytics data.
 *
 * POST /api/integrations/gsc
 * Body: {
 *   connection_id: string (uuid),
 *   sync_job_id: string (uuid),
 *   full_backfill?: boolean (defaults to false — 3-day incremental)
 * }
 *
 * Writes to `search_console_daily` table (not performance_records).
 * MetricSource for GSC is 'website'.
 *
 * For full backfill: fetches 16 months of data in 1-month chunks.
 * For incremental: fetches last 3 days only.
 *
 * Uses delete-then-insert strategy to avoid duplicates — deletes existing
 * rows for the date range being synced, then inserts fresh data.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  let syncJobId: string | undefined

  try {
    // ---- Parse & validate body -------------------------------------------
    const rawBody: unknown = await request.json()
    const parsed = syncBodySchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
        { status: 400 },
      )
    }

    const { connection_id, sync_job_id, full_backfill } = parsed.data
    syncJobId = sync_job_id

    // ---- Load connection -------------------------------------------------
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connection_id)
      .single()

    if (connError || !connection) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Connection not found',
      })
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    const conn = connection as unknown as PlatformConnection

    if (!conn.is_active) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Connection is inactive',
      })
      return NextResponse.json({ error: 'Connection is inactive' }, { status: 400 })
    }

    // ---- Extract site_url from connection metadata ----------------------
    const metadata = conn.metadata as ConnectionMetadata
    const siteUrl = metadata.site_url
    if (!siteUrl) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'No site_url in connection metadata',
      })
      return NextResponse.json(
        { error: 'No site_url in connection metadata' },
        { status: 400 },
      )
    }

    // ---- Get valid access token ------------------------------------------
    const accessToken = await getValidToken(conn, 'gsc')
    if (!accessToken) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Unable to obtain a valid GSC access token',
      })
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 })
    }

    // ---- Mark sync job as running ----------------------------------------
    await updateSyncJob(supabase, syncJobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // ---- Determine date range --------------------------------------------
    const { startDate, endDate } = full_backfill
      ? getDateRange() // full 16-month window
      : getIncrementalDateRange() // last 3 days

    // ---- Fetch data in monthly chunks ------------------------------------
    const chunks = splitIntoMonthlyChunks(startDate, endDate)
    const allRecords: SearchConsoleDailyInsert[] = []
    let chunksProcessed = 0

    for (const chunk of chunks) {
      const result = await fetchSearchAnalytics(
        accessToken,
        siteUrl,
        chunk.startDate,
        chunk.endDate,
        ['date', 'page', 'query'],
      )

      if (!result.ok) {
        console.error(
          `[gsc] Chunk ${chunk.startDate}–${chunk.endDate} failed:`,
          result.message,
        )
        // Continue with other chunks rather than failing the entire sync
        continue
      }

      const rows = result.data.rows ?? []
      const records = mapToSearchConsoleDaily(rows, siteUrl)
      allRecords.push(...records)
      chunksProcessed++
    }

    // ---- Delete existing rows for the synced date range ------------------
    // This avoids duplicate entries when re-syncing the same period
    const { error: deleteError } = await supabase
      .from('search_console_daily')
      .delete()
      .gte('date', startDate)
      .lte('date', endDate)

    if (deleteError) {
      console.error('[gsc] Failed to delete existing rows:', deleteError.message)
    }

    // ---- Insert new records in batches -----------------------------------
    let recordsSynced = 0

    for (let i = 0; i < allRecords.length; i += INSERT_BATCH_SIZE) {
      const batch = allRecords.slice(i, i + INSERT_BATCH_SIZE)
      const { error: insertError } = await supabase
        .from('search_console_daily')
        .insert(batch)

      if (!insertError) {
        recordsSynced += batch.length
      } else {
        console.error(
          `[gsc] Batch insert failed at offset ${i}:`,
          insertError.message,
        )
      }
    }

    // ---- Finalise sync job & connection ----------------------------------
    await updateSyncJob(supabase, syncJobId, {
      status: 'completed',
      records_synced: recordsSynced,
      completed_at: new Date().toISOString(),
      metadata: {
        date_range: { startDate, endDate },
        full_backfill,
        chunks_total: chunks.length,
        chunks_processed: chunksProcessed,
        rows_fetched: allRecords.length,
        rows_inserted: recordsSynced,
      },
    })

    await supabase
      .from('platform_connections')
      .update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection_id)

    return NextResponse.json({
      success: true,
      records_synced: recordsSynced,
      date_range: { startDate, endDate },
      full_backfill,
      chunks_processed: chunksProcessed,
    })
  } catch (err) {
    // ---- Mark sync failed ------------------------------------------------
    const message =
      err instanceof GSCApiError
        ? `GSC API error (${err.status}): ${err.message}`
        : err instanceof Error
          ? err.message
          : 'Unknown error during GSC sync'

    if (syncJobId) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: message,
        completed_at: new Date().toISOString(),
      }).catch(() => {
        // Best-effort — don't mask the original error
      })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
