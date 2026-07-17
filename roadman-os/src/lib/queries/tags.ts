import { createClient } from '@/lib/supabase/server'
import type { Tag } from '@/types/database'

export type TagWithCount = Tag & { usage_count: number }

/**
 * Fetch all tags, optionally filtered by name search.
 * Ordered alphabetically by name.
 */
export async function getTags(search?: string): Promise<Tag[]> {
  const supabase = await createClient()

  let query = supabase
    .from('tags')
    .select('*')
    .order('name')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data as Tag[]
}

/**
 * Fetch a single tag by ID.
 */
export async function getTag(id: string): Promise<Tag | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Tag
}

/**
 * Fetch tags ordered by usage count (most-used first).
 * Usage is derived from the asset_tags junction table.
 */
export async function getPopularTags(limit: number = 20): Promise<TagWithCount[]> {
  const supabase = await createClient()

  // Fetch tags with a relationship count from asset_tags
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*, asset_tags(count)')
    .order('name')

  if (tagsError || !tags) return []

  const tagsWithCounts: TagWithCount[] = tags.map((tag) => {
    const countArr = (tag as any).asset_tags as { count: number }[]
    const usage_count = countArr?.[0]?.count ?? 0
    const { asset_tags: _, ...rest } = tag as any
    return { ...(rest as Tag), usage_count }
  })

  // Sort by usage descending, then name ascending
  tagsWithCounts.sort((a, b) => {
    if (b.usage_count !== a.usage_count) return b.usage_count - a.usage_count
    return a.name.localeCompare(b.name)
  })

  return tagsWithCounts.slice(0, limit)
}

/**
 * Fetch all tags with their usage counts.
 * Used on the settings page to display counts next to each tag.
 */
export async function getTagsWithCounts(): Promise<TagWithCount[]> {
  const supabase = await createClient()

  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*, asset_tags(count)')
    .order('name')

  if (tagsError || !tags) return []

  return tags.map((tag) => {
    const countArr = (tag as any).asset_tags as { count: number }[]
    const usage_count = countArr?.[0]?.count ?? 0
    const { asset_tags: _, ...rest } = tag as any
    return { ...(rest as Tag), usage_count }
  })
}
