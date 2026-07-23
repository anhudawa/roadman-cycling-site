import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/utils/oauth'
import {
  searchAnalytics,
  getDateRange,
  matchQueryToTopic,
  matchUrlToAsset,
} from '@/lib/integrations/gsc'
import type { PlatformConnection, SearchConsoleDailyInsert, TopicAlias } from '@/types/database'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const syncBodySchema = z.object({
  connection_id: z.string().uuid(),
  sync_job_id: z.string().uuid(),
  mode: z.enum(['daily', 'backfill']).optional().default('daily'),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Date as YYYY-MM-DD. */
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

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

/**
 * Generate month-by-month date ranges for backfill.
 * Covers the full 16-month GSC retention window.
 */
function getBackfillRanges(): Array<{ startDate: string; endDate: string }> {
  const { startDate, endDate } = getDateRange()
  const ranges: Array<{ startDate: string; endDate: string }> = []

  const cursor = new Date(startDate)
  const end = new Date(endDate)

  while (cursor < end) {
    const rangeStart = toDateString(cursor)
    cursor.setMonth(cursor.getMonth() + 1)
    const rangeEnd = cursor < end ? toDateString(cursor) : toDateString(end)
    ranges.push({ startDate: rangeStart, endDate: rangeEnd })
  }

  return ranges
}

// ---------------------------------------------------------------------------
// POST /api/sync/gsc
// ---------------------------------------------------------------------------

/**
 * Sync handler for Google Search Console.
 *
 * 1. Validates the request body (connection_id, sync_job_id, mode).
 * 2. Loads the connection and refreshes the access token.
 * 3. Fetches search analytics data (daily or backfill).
 * 4. Matches URLs to assets and queries to topics.
 * 5. Upserts into search_console_daily.
 * 6. Updates the sync_job status and connection.last_synced_at.
 *
 * TODO: Enable when GSC API credentials are configured
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

    const { connection_id, sync_job_id, mode } = parsed.data
    syncJobId = sync_job_id

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

    const accessToken = await getValidToken(conn, 'gsc')
    if (!accessToken) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Unable to obtain a valid access token',
      })
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 })
    }

    // -----------------------------------------------------------------------
    // 3. Resolve site URL from connection metadata
    // -----------------------------------------------------------------------
    const siteUrl = (conn.metadata as Record<string, unknown>)?.site_url as string | undefined

    if (!siteUrl) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'No site_url found in connection metadata',
      })
      return NextResponse.json({ error: 'Missing site_url' }, { status: 400 })
    }

    // Mark the sync job as running
    await updateSyncJob(supabase, syncJobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // -----------------------------------------------------------------------
    // 4. Load topic aliases for query matching
    // -----------------------------------------------------------------------
    const { data: topicAliases } = await supabase
      .from('topic_aliases')
      .select('alias, topic_id')

    const aliases: Array<{ alias: string; topic_id: string }> = (
      topicAliases as unknown as TopicAlias[] | null
    )?.map((ta) => ({ alias: ta.alias, topic_id: ta.topic_id })) ?? []

    // -----------------------------------------------------------------------
    // 5. Fetch search analytics data
    // -----------------------------------------------------------------------
    // TODO: Enable when GSC API credentials are configured
    // The stub searchAnalytics() returns empty rows, so the loop below
    // will be a no-op until real API calls are enabled.

    const dateRanges =
      mode === 'backfill'
        ? getBackfillRanges()
        : (() => {
            // Daily mode: fetch data for the date accounting for 3-day lag
            const lagDate = new Date()
            lagDate.setDate(lagDate.getDate() - 3)
            const dateStr = toDateString(lagDate)
            return [{ startDate: dateStr, endDate: dateStr }]
          })()

    const records: SearchConsoleDailyInsert[] = []
    const unmatchedQueries: string[] = []

    for (const range of dateRanges) {
      const result = await searchAnalytics(
        accessToken,
        siteUrl,
        range.startDate,
        range.endDate,
        {
          dimensions: ['query', 'page', 'date'],
          rowLimit: 25000,
        },
      )

      if (!result.ok) {
        // Log the error but continue with other ranges
        console.error(
          `[sync/gsc] Search analytics failed for ${range.startDate}–${range.endDate}: ${result.message}`,
        )
        continue
      }

      for (const row of result.data.rows ?? []) {
        const [query, pageUrl, date] = row.keys

        // Match URL to asset
        const slug = matchUrlToAsset(pageUrl, siteUrl)
        let assetId: string | null = null

        if (slug) {
          const { data: matchedAsset } = await supabase
            .from('assets')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

          assetId = (matchedAsset as { id: string } | null)?.id ?? null
        }

        // Match query to topic
        const topicMatch = matchQueryToTopic(query, aliases)
        const topicId = topicMatch?.topic_id ?? null

        if (!topicMatch) {
          unmatchedQueries.push(query)
        }

        records.push({
          date,
          page_url: pageUrl,
          query,
          asset_id: assetId,
          topic_id: topicId,
          clicks: row.clicks,
          impressions: row.impressions,
          position: row.position ?? null,
        })
      }
    }

    // -----------------------------------------------------------------------
    // 6. Upsert search_console_daily records
    // -----------------------------------------------------------------------
    let recordsSynced = 0

    if (records.length > 0) {
      // Insert in batches of 100
      for (let i = 0; i < records.length; i += 100) {
        const batch = records.slice(i, i + 100)
        const { error: insertError } = await supabase
          .from('search_console_daily')
          .upsert(batch, { onConflict: 'date,page_url,query' })

        if (!insertError) {
          recordsSynced += batch.length
        }
      }
    }

    // -----------------------------------------------------------------------
    // 7. Finalise sync job & connection
    // -----------------------------------------------------------------------
    const uniqueUnmatched = [...new Set(unmatchedQueries)]

    await updateSyncJob(supabase, syncJobId, {
      status: 'completed',
      records_synced: recordsSynced,
      completed_at: new Date().toISOString(),
      metadata: {
        mode,
        date_ranges: dateRanges.length,
        unmatched_queries: uniqueUnmatched.length,
        unmatched_sample: uniqueUnmatched.slice(0, 20),
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
      mode,
      date_ranges: dateRanges.length,
      unmatched_queries: uniqueUnmatched.length,
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
