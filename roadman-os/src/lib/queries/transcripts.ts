import { createClient } from '@/lib/supabase/server'
import type { Transcript, TranscriptHighlight, Asset } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TranscriptWithAsset = Transcript & {
  asset: Pick<Asset, 'id' | 'title' | 'type' | 'status' | 'publish_date' | 'duration_seconds' | 'metadata'> | null
  highlightCount: number
}

export type TranscriptDetail = Transcript & {
  asset: Pick<Asset, 'id' | 'title' | 'type' | 'status' | 'publish_date' | 'duration_seconds' | 'metadata'> | null
  highlights: TranscriptHighlight[]
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Get all transcripts with their associated asset details.
 * Optionally filter by search query (searches asset title and transcript text).
 */
export async function getTranscriptsWithAssets(
  search?: string,
): Promise<TranscriptWithAsset[]> {
  const supabase = await createClient()

  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select(`
      *,
      asset:assets!transcripts_asset_id_fkey(id, title, type, status, publish_date, duration_seconds, metadata)
    `)
    .order('created_at', { ascending: false })

  if (error || !transcripts) return []

  const transcriptList = transcripts as (Transcript & { asset: Pick<Asset, 'id' | 'title' | 'type' | 'status' | 'publish_date' | 'duration_seconds' | 'metadata'> | null })[]

  // Get highlight counts
  const transcriptIds = transcriptList.map((t) => t.id)
  const highlightCounts = new Map<string, number>()

  if (transcriptIds.length > 0) {
    const { data: highlights } = await supabase
      .from('transcript_highlights')
      .select('transcript_id')
      .in('transcript_id', transcriptIds)

    for (const h of (highlights ?? []) as { transcript_id: string }[]) {
      highlightCounts.set(h.transcript_id, (highlightCounts.get(h.transcript_id) ?? 0) + 1)
    }
  }

  let results = transcriptList.map((t) => ({
    ...t,
    highlightCount: highlightCounts.get(t.id) ?? 0,
  }))

  // Client-side search filter
  if (search) {
    const lower = search.toLowerCase()
    results = results.filter(
      (t) =>
        t.asset?.title?.toLowerCase().includes(lower) ||
        t.full_text?.toLowerCase().includes(lower),
    )
  }

  return results
}

/**
 * Get a single transcript by ID, including asset details and all highlights.
 */
export async function getTranscript(id: string): Promise<TranscriptDetail | null> {
  const supabase = await createClient()

  const { data: transcript, error } = await supabase
    .from('transcripts')
    .select(`
      *,
      asset:assets!transcripts_asset_id_fkey(id, title, type, status, publish_date, duration_seconds, metadata)
    `)
    .eq('id', id)
    .single()

  if (error || !transcript) return null

  const transcriptRow = transcript as Transcript & { asset: Pick<Asset, 'id' | 'title' | 'type' | 'status' | 'publish_date' | 'duration_seconds' | 'metadata'> | null }

  // Get highlights
  const { data: highlights } = await supabase
    .from('transcript_highlights')
    .select('*')
    .eq('transcript_id', id)
    .order('start_ms', { ascending: true })

  return {
    ...transcriptRow,
    highlights: (highlights ?? []) as TranscriptHighlight[],
  }
}

/**
 * Get highlights for a specific transcript.
 */
export async function getHighlights(transcriptId: string): Promise<TranscriptHighlight[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transcript_highlights')
    .select('*')
    .eq('transcript_id', transcriptId)
    .order('start_ms', { ascending: true })

  if (error || !data) return []
  return data as TranscriptHighlight[]
}
