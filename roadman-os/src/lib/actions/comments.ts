'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { createNotification } from '@/lib/actions/notifications'

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract @-mentioned usernames from comment body.
 * Matches patterns like @username or @"Full Name".
 */
function extractMentions(body: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const mentions: string[] = []
  let match: RegExpExecArray | null
  while ((match = mentionRegex.exec(body)) !== null) {
    mentions.push(match[1])
  }
  return [...new Set(mentions)]
}

/**
 * Resolve mention handles to profile IDs and notify them.
 */
async function notifyMentionedUsers(
  supabase: any,
  mentions: string[],
  authorId: string,
  authorName: string,
  entityType: string,
  entityId: string,
  bodyPreview: string,
) {
  if (mentions.length === 0) return

  // Look up profiles whose display_name matches the mention handles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, full_name')
    .or(mentions.map((m) => `display_name.ilike.${m}`).join(','))

  if (!profiles || profiles.length === 0) return

  for (const profile of profiles) {
    if (profile.id === authorId) continue // don't notify yourself
    await createNotification({
      recipient_id: profile.id,
      type: 'comment_mention',
      title: `${authorName} mentioned you in a comment`,
      body: bodyPreview.slice(0, 200),
      entity_type: entityType,
      entity_id: entityId,
    })
  }
}

/**
 * Determine the entity type and revalidate path from comment fields.
 */
function getEntityInfo(fields: {
  asset_id?: string | null
  task_id?: string | null
  idea_id?: string | null
}): { entityType: string; entityId: string; revalidatePath: string } | null {
  if (fields.asset_id) {
    return {
      entityType: 'asset',
      entityId: fields.asset_id,
      revalidatePath: `/assets/${fields.asset_id}`,
    }
  }
  if (fields.task_id) {
    return {
      entityType: 'task',
      entityId: fields.task_id,
      revalidatePath: '/tasks',
    }
  }
  if (fields.idea_id) {
    return {
      entityType: 'idea',
      entityId: fields.idea_id,
      revalidatePath: '/ideas',
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Create a new comment (addComment).
 * Validates body, inserts the comment, logs activity, and notifies @-mentioned users.
 * Supports asset_id, task_id, or idea_id.
 */
export async function createComment(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const body = formData.get('body')?.toString().trim()
    const assetId = formData.get('asset_id')?.toString() || null
    const taskId = formData.get('task_id')?.toString() || null
    const ideaId = formData.get('idea_id')?.toString() || null
    const parentId = formData.get('parent_id')?.toString() || null

    if (!body) {
      return { success: false, error: 'Comment body is required' }
    }

    if (!assetId && !taskId && !ideaId) {
      return { success: false, error: 'An entity ID (asset, task, or idea) is required' }
    }

    const { data: inserted, error: insertError } = await supabase
      .from('comments')
      .insert({
        author_id: profile.id,
        asset_id: assetId,
        task_id: taskId,
        idea_id: ideaId,
        parent_id: parentId,
        body,
        is_resolved: false,
      })
      .select('id')
      .single()

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    const entityInfo = getEntityInfo({ asset_id: assetId, task_id: taskId, idea_id: ideaId })
    if (entityInfo) {
      await logActivity(supabase, {
        actor_id: profile.id,
        action: 'commented',
        entity_type: entityInfo.entityType,
        entity_id: entityInfo.entityId,
        changes: { body: body.slice(0, 100) },
      })

      // Notify @-mentioned users
      const mentions = extractMentions(body)
      const authorName = profile.display_name || profile.full_name
      await notifyMentionedUsers(
        supabase,
        mentions,
        profile.id,
        authorName,
        entityInfo.entityType,
        entityInfo.entityId,
        body,
      )

      revalidatePath(entityInfo.revalidatePath)
    }

    return { success: true, data: { id: inserted?.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing comment's body.
 * Only the comment author may edit their own comment.
 */
export async function updateComment(
  commentId: string,
  newBody: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const trimmed = newBody.trim()
    if (!trimmed) {
      return { success: false, error: 'Comment body cannot be empty' }
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('comments')
      .select('author_id, asset_id, task_id, idea_id')
      .eq('id', commentId)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: 'Comment not found' }
    }

    if (existing.author_id !== profile.id) {
      return { success: false, error: 'You can only edit your own comments' }
    }

    const { error: updateError } = await supabase
      .from('comments')
      .update({
        body: trimmed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    const entityInfo = getEntityInfo(existing)
    if (entityInfo) {
      revalidatePath(entityInfo.revalidatePath)
    }

    return { success: true, data: { id: commentId } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Soft-delete a comment by marking it as resolved (is_resolved = true)
 * and clearing the body to "[deleted]".
 * Only the comment author may delete their own comment.
 */
export async function deleteComment(commentId: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('comments')
      .select('author_id, asset_id, task_id, idea_id')
      .eq('id', commentId)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: 'Comment not found' }
    }

    if (existing.author_id !== profile.id) {
      return { success: false, error: 'You can only delete your own comments' }
    }

    const { error: updateError } = await supabase
      .from('comments')
      .update({
        body: '[deleted]',
        is_resolved: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    const entityInfo = getEntityInfo(existing)
    if (entityInfo) {
      revalidatePath(entityInfo.revalidatePath)
    }

    return { success: true, data: { id: commentId } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
