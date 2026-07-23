'use server'

import { createClient } from '@/lib/supabase/server'
import { embedAsset, embedTranscript, embedIdea } from '@/lib/embeddings/embed-assets'
import type { SyncJobInsert } from '@/types/database'

const BATCH_SIZE = 20
const RATE_LIMIT_DELAY_MS = 200

// ---------------------------------------------------------------------------
// Progress tracker
// ---------------------------------------------------------------------------

type BulkEmbedProgress = {
  total: number
  processed: number
  succeeded: number
  failed: number
  errors: { entityType: string; entityId: string; error: string }[]
}

// ---------------------------------------------------------------------------
// Bulk embed all content without embeddings
// ---------------------------------------------------------------------------

export async function bulkEmbedAll(): Promise<{
  success: boolean
  progress: BulkEmbedProgress
  syncJobId?: string
  error?: string
}> {
  const progress: BulkEmbedProgress = {
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
  }

  try {
    const supabase = await createClient()

    // Create a sync job to track progress
    const syncJobRow: SyncJobInsert = {
      connection_id: null,
      source: 'manual',
      status: 'running',
      started_at: new Date().toISOString(),
      completed_at: null,
      records_synced: 0,
      error_message: null,
      metadata: { type: 'bulk_embedding' },
    }

    const { data: syncJob } = await supabase
      .from('sync_jobs')
      .insert(syncJobRow)
      .select('id')
      .single()

    const syncJobId = syncJob?.id

    // -----------------------------------------------------------------------
    // 1. Find assets without embeddings
    // -----------------------------------------------------------------------
    const { data: allAssets } = await supabase
      .from('assets')
      .select('id')
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    const { data: embeddedAssets } = await supabase
      .from('content_embeddings')
      .select('entity_id')
      .eq('entity_type', 'asset')

    const embeddedAssetIds = new Set(
      (embeddedAssets ?? []).map((e: { entity_id: string }) => e.entity_id),
    )
    const unembeddedAssets = (allAssets ?? [])
      .filter((a: { id: string }) => !embeddedAssetIds.has(a.id))
      .map((a: { id: string }) => a.id)

    // -----------------------------------------------------------------------
    // 2. Find transcripts without embeddings
    // -----------------------------------------------------------------------
    const { data: allTranscripts } = await supabase
      .from('transcripts')
      .select('id')
      .order('created_at', { ascending: false })

    const { data: embeddedTranscripts } = await supabase
      .from('content_embeddings')
      .select('entity_id')
      .eq('entity_type', 'transcript')

    const embeddedTranscriptIds = new Set(
      (embeddedTranscripts ?? []).map((e: { entity_id: string }) => e.entity_id),
    )
    const unembeddedTranscripts = (allTranscripts ?? [])
      .filter((t: { id: string }) => !embeddedTranscriptIds.has(t.id))
      .map((t: { id: string }) => t.id)

    // -----------------------------------------------------------------------
    // 3. Find ideas without embeddings
    // -----------------------------------------------------------------------
    const { data: allIdeas } = await supabase
      .from('ideas')
      .select('id')
      .neq('status', 'discarded')
      .order('created_at', { ascending: false })

    const { data: embeddedIdeas } = await supabase
      .from('content_embeddings')
      .select('entity_id')
      .eq('entity_type', 'idea')

    const embeddedIdeaIds = new Set(
      (embeddedIdeas ?? []).map((e: { entity_id: string }) => e.entity_id),
    )
    const unembeddedIdeas = (allIdeas ?? [])
      .filter((i: { id: string }) => !embeddedIdeaIds.has(i.id))
      .map((i: { id: string }) => i.id)

    // -----------------------------------------------------------------------
    // Total items to process
    // -----------------------------------------------------------------------
    progress.total =
      unembeddedAssets.length +
      unembeddedTranscripts.length +
      unembeddedIdeas.length

    // -----------------------------------------------------------------------
    // Process in batches
    // -----------------------------------------------------------------------
    const processBatch = async (
      ids: string[],
      entityType: string,
      embedFn: (id: string) => Promise<{ success: boolean; error?: string }>,
    ) => {
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE)

        for (const id of batch) {
          const result = await embedFn(id)
          progress.processed++

          if (result.success) {
            progress.succeeded++
          } else {
            progress.failed++
            progress.errors.push({
              entityType,
              entityId: id,
              error: result.error ?? 'Unknown error',
            })
          }
        }

        // Rate limiting between batches
        if (i + BATCH_SIZE < ids.length) {
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
        }

        // Update sync job progress
        if (syncJobId) {
          await supabase
            .from('sync_jobs')
            .update({
              records_synced: progress.succeeded,
              metadata: {
                type: 'bulk_embedding',
                processed: progress.processed,
                total: progress.total,
                failed: progress.failed,
              },
            })
            .eq('id', syncJobId)
        }
      }
    }

    await processBatch(unembeddedAssets, 'asset', embedAsset)
    await processBatch(unembeddedTranscripts, 'transcript', embedTranscript)
    await processBatch(unembeddedIdeas, 'idea', embedIdea)

    // -----------------------------------------------------------------------
    // Mark sync job complete
    // -----------------------------------------------------------------------
    if (syncJobId) {
      await supabase
        .from('sync_jobs')
        .update({
          status: progress.failed > 0 ? 'completed_with_errors' : 'completed',
          completed_at: new Date().toISOString(),
          records_synced: progress.succeeded,
          error_message:
            progress.failed > 0
              ? `${progress.failed} items failed to embed`
              : null,
          metadata: {
            type: 'bulk_embedding',
            processed: progress.processed,
            total: progress.total,
            failed: progress.failed,
          },
        })
        .eq('id', syncJobId)
    }

    return { success: true, progress, syncJobId }
  } catch (err) {
    return {
      success: false,
      progress,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}
