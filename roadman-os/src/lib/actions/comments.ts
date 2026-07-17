'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'

type ActionResult = {
  success: boolean
  error?: string
}

/**
 * Create a new comment on an asset.
 * Validates body, inserts the comment, and logs the activity.
 */
export async function createComment(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const body = formData.get('body')?.toString().trim()
    const assetId = formData.get('asset_id')?.toString()
    const parentId = formData.get('parent_id')?.toString() || null

    if (!body) {
      return { success: false, error: 'Comment body is required' }
    }

    if (!assetId) {
      return { success: false, error: 'Asset ID is required' }
    }

    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        author_id: profile.id,
        asset_id: assetId,
        task_id: null,
        idea_id: null,
        parent_id: parentId,
        body,
        is_resolved: false,
      })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'commented',
      entity_type: 'asset',
      entity_id: assetId,
      changes: { body: body.slice(0, 100) },
    })

    revalidatePath(`/assets/${assetId}`)
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
