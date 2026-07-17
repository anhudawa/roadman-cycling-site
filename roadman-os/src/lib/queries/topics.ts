import { createClient } from '@/lib/supabase/server'
import type { Topic, ContentPillar } from '@/types/database'

/**
 * Fetch all topics, optionally filtered by pillar.
 * Ordered by pillar then sort_order.
 */
export async function getTopics(pillar?: ContentPillar): Promise<Topic[]> {
  const supabase = await createClient()

  let query = supabase
    .from('topics')
    .select('*')
    .order('pillar')
    .order('sort_order')

  if (pillar) {
    query = query.eq('pillar', pillar)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data as Topic[]
}

/**
 * Fetch a single topic by ID.
 */
export async function getTopic(id: string): Promise<Topic | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Topic
}

/**
 * Fetch all topics grouped by pillar.
 * Topics without a pillar are excluded.
 */
export async function getTopicsByPillar(): Promise<Record<ContentPillar, Topic[]>> {
  const topics = await getTopics()

  const grouped: Record<ContentPillar, Topic[]> = {
    coaching: [],
    nutrition: [],
    strength_and_conditioning: [],
    recovery: [],
    le_metier: [],
  }

  for (const topic of topics) {
    if (topic.pillar) {
      grouped[topic.pillar].push(topic)
    }
  }

  return grouped
}
