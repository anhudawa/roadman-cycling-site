import { createClient } from '@/lib/supabase/server'
import type { Idea, IdeaStatus, ContentPillar, Profile } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IdeaWithCreator = Idea & {
  creator: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export type IdeaFilters = {
  status?: string
  pillar?: string
  created_by?: string
  search?: string
}

export type IdeaSort = 'newest' | 'most_votes' | 'pillar'

// ---------------------------------------------------------------------------
// Fetch a single idea by ID with creator joined
// ---------------------------------------------------------------------------

export async function getIdea(id: string): Promise<IdeaWithCreator | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ideas')
    .select('*, creator:profiles!ideas_created_by_fkey(id, full_name, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as IdeaWithCreator
}

// ---------------------------------------------------------------------------
// Fetch filtered + sorted list of ideas
// ---------------------------------------------------------------------------

export async function getIdeas(
  filters?: IdeaFilters,
  sort: IdeaSort = 'newest',
): Promise<IdeaWithCreator[]> {
  const supabase = await createClient()

  let query = supabase
    .from('ideas')
    .select('*, creator:profiles!ideas_created_by_fkey(id, full_name, avatar_url)')

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status as IdeaStatus)
  }

  if (filters?.pillar) {
    query = query.eq('pillar', filters.pillar as ContentPillar)
  }

  if (filters?.created_by) {
    query = query.eq('created_by', filters.created_by)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  // Apply sort
  switch (sort) {
    case 'most_votes':
      query = query.order('score', { ascending: false })
      break
    case 'pillar':
      query = query.order('pillar', { ascending: true, nullsFirst: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error } = await query

  if (error || !data) return []
  return data as unknown as IdeaWithCreator[]
}

// ---------------------------------------------------------------------------
// Fetch ideas filtered by pillar
// ---------------------------------------------------------------------------

export async function getIdeasByPillar(
  pillar: string,
): Promise<IdeaWithCreator[]> {
  return getIdeas({ pillar })
}

// ---------------------------------------------------------------------------
// Get vote count (score) for a single idea
// ---------------------------------------------------------------------------

export async function getIdeaVoteCount(ideaId: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ideas')
    .select('score')
    .eq('id', ideaId)
    .single()

  if (error || !data) return 0
  return (data as { score: number }).score
}
