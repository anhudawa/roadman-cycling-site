import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  getSearchVolume,
  getRankingsForDomain,
} from '@/lib/integrations/dataforseo'
import type { DataForSEOCredentials, KeywordVolumeResult, SerpPosition } from '@/lib/integrations/dataforseo'
import type { KeywordMetricInsert } from '@/types/database'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const syncBodySchema = z.object({
  sync_job_id: z.string().uuid(),
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
// POST /api/sync/keywords
// ---------------------------------------------------------------------------

/**
 * Keyword sync handler.
 *
 * 1. Validates the request body (sync_job_id).
 * 2. Reads all tracked keywords from the keyword_metrics table.
 * 3. Calls DataForSEO getSearchVolume in batches of 100.
 * 4. Upserts results into keyword_metrics.
 * 5. Optionally checks rankings for roadmancycling.com.
 * 6. Updates the sync_job status.
 *
 * ALL DataForSEO API calls are currently STUBBED — see TODO comments.
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

    syncJobId = parsed.data.sync_job_id

    // Mark the sync job as running
    await updateSyncJob(supabase, syncJobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // -----------------------------------------------------------------------
    // 2. Read all tracked keywords (distinct by keyword)
    // -----------------------------------------------------------------------
    const { data: existingMetrics, error: fetchError } = await supabase
      .from('keyword_metrics')
      .select('keyword, topic_id')
      .order('keyword', { ascending: true })

    if (fetchError) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: `Failed to fetch tracked keywords: ${fetchError.message}`,
      })
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Deduplicate keywords
    const keywordMap = new Map<string, string | null>()
    for (const row of existingMetrics ?? []) {
      if (!keywordMap.has(row.keyword)) {
        keywordMap.set(row.keyword, row.topic_id)
      }
    }

    const allKeywords = Array.from(keywordMap.keys())

    if (allKeywords.length === 0) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'completed',
        records_synced: 0,
        completed_at: new Date().toISOString(),
        metadata: { message: 'No keywords to sync' },
      })
      return NextResponse.json({ synced: 0 })
    }

    // -----------------------------------------------------------------------
    // 3. Fetch DataForSEO credentials
    // -----------------------------------------------------------------------
    // TODO: Load DataForSEO credentials from platform_connections or environment
    // For now, use placeholder credentials that will be swapped in when
    // the DataForSEO integration is fully wired up.
    const credentials: DataForSEOCredentials = {
      login: process.env.DATAFORSEO_LOGIN ?? '',
      password: process.env.DATAFORSEO_PASSWORD ?? '',
    }

    // -----------------------------------------------------------------------
    // 4. Call DataForSEO getSearchVolume in batches of 100
    // -----------------------------------------------------------------------
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const volumeResults: KeywordVolumeResult[] = []

    for (let i = 0; i < allKeywords.length; i += 100) {
      const batch = allKeywords.slice(i, i + 100)

      // TODO: This call is stubbed — returns empty data
      const result = await getSearchVolume(credentials, batch)

      if (result.ok) {
        volumeResults.push(...result.data)
      }
    }

    // -----------------------------------------------------------------------
    // 5. Upsert search volume results into keyword_metrics
    // -----------------------------------------------------------------------
    let recordsSynced = 0

    if (volumeResults.length > 0) {
      const rows: KeywordMetricInsert[] = volumeResults.map((v) => ({
        keyword: v.keyword,
        topic_id: keywordMap.get(v.keyword) ?? null,
        month: currentMonth,
        search_volume: v.search_volume,
        cpc_cents: v.cpc,
        competition: v.competition,
        provider: 'dataforseo',
      }))

      // Upsert in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100)
        const { error: upsertError } = await supabase
          .from('keyword_metrics')
          .upsert(batch, { onConflict: 'keyword,month' })

        if (!upsertError) {
          recordsSynced += batch.length
        }
      }
    }

    // -----------------------------------------------------------------------
    // 6. Optionally check rankings for roadmancycling.com
    // -----------------------------------------------------------------------
    const rankingResults: SerpPosition[] = []

    // TODO: This call is stubbed — returns empty data
    const rankResult = await getRankingsForDomain(
      credentials,
      'roadmancycling.com',
      allKeywords.slice(0, 20), // Limit to first 20 to control API costs
    )

    if (rankResult.ok) {
      rankingResults.push(...rankResult.data)
    }

    // TODO: Store ranking results in a dedicated rankings table or
    // add position data to keyword_metrics when the schema supports it

    // -----------------------------------------------------------------------
    // 7. Finalise sync job
    // -----------------------------------------------------------------------
    await updateSyncJob(supabase, syncJobId, {
      status: 'completed',
      records_synced: recordsSynced,
      completed_at: new Date().toISOString(),
      metadata: {
        keywords_total: allKeywords.length,
        volume_results: volumeResults.length,
        ranking_results: rankingResults.length,
      },
    })

    return NextResponse.json({
      synced: recordsSynced,
      keywords_total: allKeywords.length,
      volume_results: volumeResults.length,
      ranking_results: rankingResults.length,
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
