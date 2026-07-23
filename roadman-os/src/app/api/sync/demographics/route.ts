import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/utils/oauth'
import {
  fetchYouTubeDemographics,
  fetchMetaDemographics,
  fetchGA4Demographics,
  toInsertRows,
} from '@/lib/integrations/demographics'
import type { PlatformConnection, AudienceDemographicInsert } from '@/types/database'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const syncBodySchema = z.object({
  connection_id: z.string().uuid(),
  sync_job_id: z.string().uuid(),
  sources: z
    .array(z.enum(['youtube', 'meta', 'ga4']))
    .optional(),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// POST /api/sync/demographics
// ---------------------------------------------------------------------------

/**
 * Sync handler for audience demographics.
 *
 * 1. Validates the request body (connection_id, sync_job_id, sources).
 * 2. Loads the connection and refreshes the access token.
 * 3. For each requested source, fetches demographics data.
 * 4. Upserts rows into `audience_demographics`.
 * 5. Updates the sync_job status and connection.last_synced_at.
 *
 * All API calls are stubbed with TODO markers.
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

    const { connection_id, sync_job_id, sources } = parsed.data
    syncJobId = sync_job_id

    // Default to all sources if none specified
    const requestedSources = sources ?? ['youtube', 'meta', 'ga4']

    // -----------------------------------------------------------------------
    // 2. Load connection & get valid token
    // -----------------------------------------------------------------------
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

    // Mark the sync job as running
    await updateSyncJob(supabase, syncJobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // -----------------------------------------------------------------------
    // 3. Fetch demographics per source
    // -----------------------------------------------------------------------
    const allInsertRows: AudienceDemographicInsert[] = []
    const sourceResults: Record<string, { ok: boolean; count: number; error?: string }> = {}

    for (const source of requestedSources) {
      // Get a valid token for this source
      const accessToken = await getValidToken(conn, source)

      if (!accessToken) {
        sourceResults[source] = {
          ok: false,
          count: 0,
          error: 'Unable to obtain a valid access token',
        }
        continue
      }

      // TODO: Extract source-specific identifiers from connection metadata
      const metadata = conn.metadata as Record<string, unknown>

      if (source === 'youtube') {
        const channelId = (metadata?.channel_id as string) ?? conn.account_id
        if (!channelId) {
          sourceResults[source] = { ok: false, count: 0, error: 'No channel ID available' }
          continue
        }

        const result = await fetchYouTubeDemographics(accessToken, channelId)
        if (result.ok) {
          const rows = toInsertRows(result.data)
          allInsertRows.push(...rows)
          sourceResults[source] = { ok: true, count: rows.length }
        } else {
          sourceResults[source] = { ok: false, count: 0, error: result.message }
        }
      } else if (source === 'meta') {
        const pageId = (metadata?.page_id as string) ?? conn.account_id
        if (!pageId) {
          sourceResults[source] = { ok: false, count: 0, error: 'No page ID available' }
          continue
        }

        const result = await fetchMetaDemographics(accessToken, pageId)
        if (result.ok) {
          const rows = toInsertRows(result.data)
          allInsertRows.push(...rows)
          sourceResults[source] = { ok: true, count: rows.length }
        } else {
          sourceResults[source] = { ok: false, count: 0, error: result.message }
        }
      } else if (source === 'ga4') {
        const propertyId = (metadata?.property_id as string) ?? conn.account_id
        if (!propertyId) {
          sourceResults[source] = { ok: false, count: 0, error: 'No property ID available' }
          continue
        }

        const result = await fetchGA4Demographics(accessToken, propertyId)
        if (result.ok) {
          const rows = toInsertRows(result.data)
          allInsertRows.push(...rows)
          sourceResults[source] = { ok: true, count: rows.length }
        } else {
          sourceResults[source] = { ok: false, count: 0, error: result.message }
        }
      }
    }

    // -----------------------------------------------------------------------
    // 4. Upsert demographic records
    // -----------------------------------------------------------------------
    let recordsSynced = 0

    if (allInsertRows.length > 0) {
      // Insert in batches of 100
      for (let i = 0; i < allInsertRows.length; i += 100) {
        const batch = allInsertRows.slice(i, i + 100)
        const { error: insertError } = await supabase
          .from('audience_demographics')
          .insert(batch)

        if (!insertError) {
          recordsSynced += batch.length
        }
      }
    }

    // -----------------------------------------------------------------------
    // 5. Finalise sync job & connection
    // -----------------------------------------------------------------------
    await updateSyncJob(supabase, syncJobId, {
      status: 'completed',
      records_synced: recordsSynced,
      completed_at: new Date().toISOString(),
      metadata: {
        sources: sourceResults,
        total_rows: allInsertRows.length,
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
      synced: recordsSynced,
      sources: sourceResults,
    })
  } catch (err) {
    // -----------------------------------------------------------------------
    // Error handler — update sync job if possible
    // -----------------------------------------------------------------------
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'

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
