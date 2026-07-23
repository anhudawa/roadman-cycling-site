import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { importYouTubeVideos } from '@/lib/import/youtube-import'
import type { YouTubeVideoPreview } from '@/lib/import/youtube-import'

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const videoSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  publishedAt: z.string(),
  views: z.number(),
  duration: z.string(),
  durationSeconds: z.number(),
  thumbnailUrl: z.string(),
  selected: z.boolean(),
})

const importBodySchema = z.object({
  channelSlug: z.string().min(1),
  videos: z.array(videoSchema).min(1),
})

// ---------------------------------------------------------------------------
// POST /api/import/youtube
// ---------------------------------------------------------------------------

/**
 * Triggers a YouTube bulk import.
 *
 * Creates a sync_job record, then runs the import in the background.
 * Returns the sync_job ID so the client can poll for progress.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = importBodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request body' },
        { status: 400 },
      )
    }

    const { channelSlug, videos } = parsed.data
    const supabase = await createClient()

    // Create a sync job to track progress
    const { data: syncJob, error: jobError } = await supabase
      .from('sync_jobs')
      .insert({
        connection_id: null,
        source: 'youtube' as const,
        status: 'running',
        started_at: new Date().toISOString(),
        completed_at: null,
        records_synced: 0,
        error_message: null,
        metadata: {
          type: 'youtube_import',
          channel_slug: channelSlug,
          total_videos: videos.length,
          current: 0,
          currentTitle: '',
        },
      })
      .select('id')
      .single()

    if (jobError || !syncJob) {
      return NextResponse.json(
        { error: 'Failed to create sync job' },
        { status: 500 },
      )
    }

    const jobId = (syncJob as { id: string }).id

    // Run import (in a real production app this would be a background job)
    // For now we run it inline but return the job ID immediately for polling
    const selectedVideos = videos.filter((v) => v.selected) as YouTubeVideoPreview[]

    // Fire-and-forget — the client polls /api/import/status/[jobId]
    importYouTubeVideos(channelSlug, selectedVideos, jobId).catch((err) => {
      console.error('[youtube-import] Unhandled error:', err)
    })

    return NextResponse.json({ jobId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
