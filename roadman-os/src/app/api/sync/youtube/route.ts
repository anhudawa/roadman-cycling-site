import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/utils/oauth'
import {
  listChannelVideos,
  getVideoDetails,
  getVideoAnalytics,
  parseAnalyticsRows,
  extractVideoId,
  resetQuotaTracker,
  getQuotaState,
} from '@/lib/integrations/youtube'
import {
  mapYouTubeAnalyticsToPerformance,
  emptyPerformanceRecord,
} from '@/lib/integrations/youtube-mapper'
import type { PlatformConnection, PerformanceRecordInsert } from '@/types/database'

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Date as YYYY-MM-DD for the Analytics API. */
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

// ---------------------------------------------------------------------------
// POST /api/sync/youtube
// ---------------------------------------------------------------------------

/**
 * Sync handler for YouTube.
 *
 * 1. Validates the request body (connection_id, sync_job_id).
 * 2. Loads the connection and refreshes the access token.
 * 3. Lists all channel videos (paginated).
 * 4. Fetches analytics per-video over the last 28 days.
 * 5. Upserts performance_records.
 * 6. Updates the sync_job status and connection.last_synced_at.
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

    const accessToken = await getValidToken(conn, 'youtube')
    if (!accessToken) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Unable to obtain a valid access token',
      })
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 })
    }

    // Mark the sync job as running
    await updateSyncJob(supabase, syncJobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // -----------------------------------------------------------------------
    // 3. Resolve channelId
    // -----------------------------------------------------------------------
    // The channel ID may be stored on the connection metadata, or we can
    // use "mine" via the channels endpoint. We need the actual channel ID
    // for the Analytics API.
    let channelId = (conn.metadata as Record<string, unknown>)?.channel_id as string | undefined

    if (!channelId) {
      // Fetch "my channel" via the Data API
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      if (!channelRes.ok) {
        await updateSyncJob(supabase, syncJobId, {
          status: 'failed',
          error_message: 'Failed to resolve YouTube channel ID',
        })
        return NextResponse.json({ error: 'Channel lookup failed' }, { status: 502 })
      }

      const channelData = (await channelRes.json()) as { items?: Array<{ id: string }> }
      channelId = channelData.items?.[0]?.id

      if (!channelId) {
        await updateSyncJob(supabase, syncJobId, {
          status: 'failed',
          error_message: 'No YouTube channel found for this account',
        })
        return NextResponse.json({ error: 'No channel found' }, { status: 404 })
      }

      // Persist channel_id for next time
      await supabase
        .from('platform_connections')
        .update({
          account_id: channelId,
          metadata: { ...(conn.metadata as Record<string, unknown>), channel_id: channelId },
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection_id)
    }

    // -----------------------------------------------------------------------
    // 4. List channel videos (paginated)
    // -----------------------------------------------------------------------
    resetQuotaTracker()

    const videoIds: string[] = []
    let pageToken: string | undefined

    // Fetch up to 3 pages (150 videos) to stay within quota
    for (let page = 0; page < 3; page++) {
      const listResult = await listChannelVideos(accessToken, channelId, pageToken)

      if (!listResult.ok) {
        if (listResult.quotaExceeded) {
          // Quota exceeded — stop but don't fail if we have some data
          break
        }
        await updateSyncJob(supabase, syncJobId, {
          status: 'failed',
          error_message: `Failed to list videos: ${listResult.message}`,
        })
        return NextResponse.json({ error: listResult.message }, { status: listResult.status })
      }

      for (const item of listResult.data.items) {
        videoIds.push(extractVideoId(item))
      }

      pageToken = listResult.data.nextPageToken
      if (!pageToken) break
    }

    if (videoIds.length === 0) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'completed',
        records_synced: 0,
        completed_at: new Date().toISOString(),
        metadata: { quota: getQuotaState() },
      })
      await supabase
        .from('platform_connections')
        .update({
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection_id)

      return NextResponse.json({ synced: 0 })
    }

    // -----------------------------------------------------------------------
    // 5. Get video details (batched in chunks of 50)
    // -----------------------------------------------------------------------
    const videoDetailsMap = new Map<
      string,
      { title: string; publishedAt: string; externalUrl: string }
    >()

    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50)
      const detailsResult = await getVideoDetails(accessToken, chunk)

      if (detailsResult.ok) {
        for (const item of detailsResult.data.items) {
          const vid = extractVideoId(item)
          videoDetailsMap.set(vid, {
            title: item.snippet.title,
            publishedAt: item.snippet.publishedAt,
            externalUrl: `https://www.youtube.com/watch?v=${vid}`,
          })
        }
      }
    }

    // -----------------------------------------------------------------------
    // 6. Match videos to assets or create them
    // -----------------------------------------------------------------------
    // Look up existing assets by external_id (YouTube video ID)
    const { data: existingAssets } = await supabase
      .from('assets')
      .select('id, external_id, publication_id:publications(id)')
      .in('external_id', videoIds)

    const assetByExternalId = new Map<
      string,
      { assetId: string; publicationId: string | null }
    >()

    if (existingAssets) {
      for (const asset of existingAssets) {
        const a = asset as unknown as {
          id: string
          external_id: string
          publication_id: Array<{ id: string }> | null
        }
        if (a.external_id) {
          assetByExternalId.set(a.external_id, {
            assetId: a.id,
            publicationId: a.publication_id?.[0]?.id ?? null,
          })
        }
      }
    }

    // -----------------------------------------------------------------------
    // 7. Fetch analytics per video & build performance records
    // -----------------------------------------------------------------------
    const now = new Date()
    const endDate = toDateString(now)
    const startDate = toDateString(new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000))
    const recordedAt = now.toISOString()

    const performanceRecords: PerformanceRecordInsert[] = []
    let quotaBreak = false

    for (const videoId of videoIds) {
      const mapping = assetByExternalId.get(videoId)
      if (!mapping) {
        // Skip videos that don't have a matching asset in Roadman OS.
        // They can be imported separately via the asset creation flow.
        continue
      }

      // Check remaining quota before each API call
      const quota = getQuotaState()
      if (quota.remaining < 1) {
        quotaBreak = true
        break
      }

      const analyticsResult = await getVideoAnalytics(
        accessToken,
        channelId,
        videoId,
        startDate,
        endDate,
      )

      if (analyticsResult.ok) {
        const rows = parseAnalyticsRows(analyticsResult.data)
        if (rows.length > 0) {
          performanceRecords.push(
            mapYouTubeAnalyticsToPerformance(
              rows[0],
              mapping.assetId,
              mapping.publicationId,
              recordedAt,
            ),
          )
        } else {
          performanceRecords.push(
            emptyPerformanceRecord(mapping.assetId, mapping.publicationId, recordedAt),
          )
        }
      } else if (analyticsResult.quotaExceeded) {
        quotaBreak = true
        break
      }
      // If a single video analytics call fails (non-quota), skip that video
    }

    // -----------------------------------------------------------------------
    // 8. Upsert performance records
    // -----------------------------------------------------------------------
    let recordsSynced = 0

    if (performanceRecords.length > 0) {
      // Insert in batches of 100
      for (let i = 0; i < performanceRecords.length; i += 100) {
        const batch = performanceRecords.slice(i, i + 100)
        const { error: insertError } = await supabase
          .from('performance_records')
          .insert(batch)

        if (!insertError) {
          recordsSynced += batch.length
        }
      }
    }

    // -----------------------------------------------------------------------
    // 9. Finalize sync job & connection
    // -----------------------------------------------------------------------
    const finalQuota = getQuotaState()

    await updateSyncJob(supabase, syncJobId, {
      status: 'completed',
      records_synced: recordsSynced,
      completed_at: new Date().toISOString(),
      metadata: {
        quota: finalQuota,
        videos_found: videoIds.length,
        videos_matched: assetByExternalId.size,
        quota_warning: quotaBreak
          ? 'Sync stopped early due to quota limits'
          : undefined,
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
      videos_found: videoIds.length,
      videos_matched: assetByExternalId.size,
      quota: finalQuota,
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
