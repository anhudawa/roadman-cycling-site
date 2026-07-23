'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

// ---------------------------------------------------------------------------
// Dismiss a duplicate pair — stores the pair key in activity_log
// so it can be filtered out in future scans
// ---------------------------------------------------------------------------

export async function dismissDuplicate(
  pairKey: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Log the dismissal in activity_log so we can exclude dismissed pairs
    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'duplicate_pair',
      entity_id: pairKey,
      changes: { action: 'dismissed', dismissed_at: new Date().toISOString() },
    })

    revalidatePath('/intelligence/duplicates')
    return { success: true, data: { id: pairKey } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

// ---------------------------------------------------------------------------
// Merge assets — keeps one, archives the other
// ---------------------------------------------------------------------------

export async function mergeAssets(
  keepId: string,
  archiveId: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Verify both assets exist
    const { data: keepAsset } = await supabase
      .from('assets')
      .select('id, title')
      .eq('id', keepId)
      .single()

    const { data: archiveAsset } = await supabase
      .from('assets')
      .select('id, title')
      .eq('id', archiveId)
      .single()

    if (!keepAsset || !archiveAsset) {
      return { success: false, error: 'One or both assets not found' }
    }

    // Re-parent children of the archived asset to the kept asset
    await supabase
      .from('assets')
      .update({ parent_asset_id: keepId })
      .eq('parent_asset_id', archiveId)

    // Move publications from archived asset to kept asset
    await supabase
      .from('publications')
      .update({ asset_id: keepId })
      .eq('asset_id', archiveId)

    // Move files from archived asset to kept asset
    await supabase
      .from('files')
      .update({ asset_id: keepId })
      .eq('asset_id', archiveId)

    // Move topic associations (avoid duplicates by deleting shared ones first)
    const { data: keepTopics } = await supabase
      .from('asset_topics')
      .select('topic_id')
      .eq('asset_id', keepId)

    const keepTopicIds = new Set(
      (keepTopics ?? []).map((t: { topic_id: string }) => t.topic_id),
    )

    const { data: archiveTopics } = await supabase
      .from('asset_topics')
      .select('topic_id')
      .eq('asset_id', archiveId)

    // Delete all archive asset topics first
    await supabase.from('asset_topics').delete().eq('asset_id', archiveId)

    // Add non-duplicate topics to kept asset
    const newTopics = (archiveTopics ?? [])
      .filter((t: { topic_id: string }) => !keepTopicIds.has(t.topic_id))
      .map((t: { topic_id: string }) => ({
        asset_id: keepId,
        topic_id: t.topic_id,
      }))

    if (newTopics.length > 0) {
      await supabase.from('asset_topics').insert(newTopics)
    }

    // Archive the duplicate asset
    const { error: archiveErr } = await supabase
      .from('assets')
      .update({
        status: 'archived',
        metadata: {
          merged_into: keepId,
          merged_at: new Date().toISOString(),
          merged_by: profile.id,
        },
      })
      .eq('id', archiveId)

    if (archiveErr) {
      return { success: false, error: archiveErr.message }
    }

    // Remove embeddings for the archived asset
    await supabase
      .from('content_embeddings')
      .delete()
      .eq('entity_type', 'asset')
      .eq('entity_id', archiveId)

    // Log activity
    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'asset',
      entity_id: keepId,
      changes: {
        action: 'merged',
        merged_asset_id: archiveId,
        merged_asset_title: (archiveAsset as { title: string }).title,
      },
    })

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'archived',
      entity_type: 'asset',
      entity_id: archiveId,
      changes: {
        reason: 'merged',
        merged_into: keepId,
      },
    })

    revalidatePath('/assets')
    revalidatePath('/intelligence/duplicates')
    return { success: true, data: { id: keepId } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
