import { createClient } from '@/lib/supabase/server'
import type { Comment, Profile } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CommentWithAuthor = Comment & {
  author?: Pick<Profile, 'id' | 'display_name' | 'full_name' | 'avatar_url'> | null
}

export type EntityType = 'asset' | 'task' | 'idea' | 'campaign'

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch comments for a given entity, with author profile data joined.
 * Supports asset, task, idea, and campaign entities.
 */
export async function getComments(
  entityType: EntityType,
  entityId: string,
): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()
  if (!supabase) return []

  const columnMap: Record<EntityType, string> = {
    asset: 'asset_id',
    task: 'task_id',
    idea: 'idea_id',
    campaign: 'asset_id', // campaigns use asset_id with a metadata flag
  }

  const column = columnMap[entityType]
  if (!column) return []

  const { data, error } = await supabase
    .from('comments')
    .select('*, author:profiles!comments_author_id_fkey(id, display_name, full_name, avatar_url)')
    .eq(column, entityId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data as unknown as CommentWithAuthor[]
}

/**
 * Get the total comment count for an entity.
 */
export async function getCommentCount(
  entityType: EntityType,
  entityId: string,
): Promise<number> {
  const supabase = await createClient()
  if (!supabase) return 0

  const columnMap: Record<EntityType, string> = {
    asset: 'asset_id',
    task: 'task_id',
    idea: 'idea_id',
    campaign: 'asset_id',
  }

  const column = columnMap[entityType]
  if (!column) return 0

  const { count, error } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq(column, entityId)

  if (error || count === null) return 0
  return count
}
