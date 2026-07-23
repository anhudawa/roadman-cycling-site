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

/**
 * Augment a PerformanceRecordInsert with clips channel metadata.
 * Adds `channel_type: 'clips'` to custom_metrics to distinguish from
 * main channel records.
 */
function tagAsClipsChannel(record: PerformanceRecordInsert): PerformanceRecordInsert {
  return {
    ...record,
    custom_metrics: {
      ...(record.custom_metrics as Record<string, unknown>),
      channel_type: 'clips',
    },
  }
}

// ---------------------------------------------------------------------------
// POST /api/integrations/youtube-clips
// ---------------------------------------------------------------------------

/**
 * Sync handler for the YouTube Clips channel (second channel).
 *
 * Reuses the existing YouTube sync logic from `@/lib/integrations/youtube`
 * but targets a different channel ID stored in metadata.clips_channel_id.
 * Performance records carry `custom_metrics.channel_type = 'clips'` to
 * distinguish from main channel data.
 *
 * TODO: Wire up real YouTube API credentials once available.
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

    // Use the same YouTube OAuth flow — the token works for both channels
    const accessToken = await getValidToken(conn, 'youtube')
    if (!accessToken) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'Unable to obtain a valid access token',
      })
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 })
    }

    // -----------------------------------------------------------------------
    // 3. Resolve clips channel ID from metadata
    // -----------------------------------------------------------------------

    const connMetadata = conn.metadata as Record<string, unknown>
    const clipsChannelId = connMetadata?.clips_channel_id as string | undefined

    if (!clipsChannelId) {
      await updateSyncJob(supabase, syncJobId, {
        status: 'failed',
        error_message: 'No clips_channel_id in connection metadata',
      })
      return NextResponse.json(
        { error: 'No clips_channel_id configured' },
        { status: 400 },
      )
    }

    // Mark the sync job as running
    await updateSyncJob(supabase, syncJobId, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // -----------------------------------------------------------------------
    // 4. List clips channel videos (paginated)
    // -----------------------------------------------------------------------

    resetQuotaTracker()

    const videoIds: string[] = []
    let pageToken: string | undefined

    // Fetch up to 3 pages (150 videos) to stay within quota
    for (let page = 0; page < 3; page++) {
      const listResult = await listChannelVideos(accessToken, clipsChannelId, pageToken)

      if (!listResult.ok) {
        if (listResult.quotaExceeded) {
          break
        }
        await updateSyncJob(supabase, syncJobId, {
          status: 'failed',
          error_message: `Failed to list clips videos: ${listResult.message}`,
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
        metadata: { quota: getQuotaState(), channel_type: 'clips' },
      })
      await supabase
        .from('platform_connections')
        .update({
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection_id)

      return NextResponse.json({ synced: 0, channel_type: 'clips' })
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
    // 6. Match videos to assets by external_id
    // -----------------------------------------------------------------------

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
        // Skip videos without a matching asset in Roadman OS
        continue
      }

      const quota = getQuotaState()
      if (quota.remaining < 1) {
        quotaBreak = true
        break
      }

      const analyticsResult = await getVideoAnalytics(
        accessToken,
        clipsChannelId,
        videoId,
        startDate,
        endDate,
      )

      if (analyticsResult.ok) {
        const rows = parseAnalyticsRows(analyticsResult.data)
        if (rows.length > 0) {
          performanceRecords.push(
            tagAsClipsChannel(
              mapYouTubeAnalyticsToPerformance(
                rows[0],
                mapping.assetId,
                mapping.publicationId,
                recordedAt,
              ),
            ),
          )
        } else {
          performanceRecords.push(
            tagAsClipsChannel(
              emptyPerformanceRecord(mapping.assetId, mapping.publicationId, recordedAt),
            ),
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
    // 9. Finalise sync job & connection
    // -----------------------------------------------------------------------

    const finalQuota = getQuotaState()

    await updateSyncJob(supabase, syncJobId, {
      status: 'completed',
      records_synced: recordsSynced,
      completed_at: new Date().toISOString(),
      metadata: {
        channel_type: 'clips',
        clips_channel_id: clipsChannelId,
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
      channel_type: 'clips',
      videos_found: videoIds.length,
      videos_matched: assetByExternalId.size,
      quota: finalQuota,
    })
  } catch (err) {
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
