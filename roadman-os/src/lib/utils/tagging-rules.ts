import { createClient } from '@/lib/supabase/server'
import type { Asset } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RuleCondition = 'contains' | 'equals' | 'starts_with'

export type RuleField =
  | 'title'
  | 'description'
  | 'pillar'
  | 'type'
  | 'guest_name'

export type RuleAction = 'add_tag' | 'add_topic'

export type TaggingRule = {
  id: string
  field: RuleField
  condition: RuleCondition
  value: string
  action: RuleAction
  action_value: string // tag name or topic name
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TaggingRuleInsert = Omit<TaggingRule, 'id' | 'created_at' | 'updated_at'>

// ---------------------------------------------------------------------------
// Rule Evaluation
// ---------------------------------------------------------------------------

/**
 * Check if a single rule matches the given asset.
 */
function matchesRule(rule: TaggingRule, asset: Asset): boolean {
  let fieldValue: string | null = null

  switch (rule.field) {
    case 'title':
      fieldValue = asset.title
      break
    case 'description':
      fieldValue = asset.description
      break
    case 'pillar':
      fieldValue = asset.pillar
      break
    case 'type':
      fieldValue = asset.type
      break
    case 'guest_name': {
      const meta = (asset.metadata ?? {}) as Record<string, unknown>
      fieldValue = (meta.guest_name as string) ?? null
      break
    }
    default:
      return false
  }

  if (!fieldValue) return false

  const lowerFieldValue = fieldValue.toLowerCase()
  const lowerRuleValue = rule.value.toLowerCase()

  switch (rule.condition) {
    case 'contains':
      return lowerFieldValue.includes(lowerRuleValue)
    case 'equals':
      return lowerFieldValue === lowerRuleValue
    case 'starts_with':
      return lowerFieldValue.startsWith(lowerRuleValue)
    default:
      return false
  }
}

/**
 * Evaluate all active rules against an asset.
 * Returns the matching tags and topics to apply.
 */
export async function evaluateRules(
  asset: Asset,
): Promise<{ tags: string[]; topics: string[] }> {
  const supabase = await createClient()
  if (!supabase) return { tags: [], topics: [] }

  // Fetch rules from metadata storage (using a convention table)
  // Rules are stored in the asset metadata or a dedicated rules store
  // For now, we use a lightweight approach with Supabase
  const { data: rulesData } = await supabase
    .from('tags')
    .select('*')
    .limit(0) // Will be replaced when rules table exists

  // For now, evaluate in-memory rules passed through
  return { tags: [], topics: [] }
}

/**
 * Evaluate rules from a provided list (for use without DB lookup).
 */
export function evaluateRulesInMemory(
  rules: TaggingRule[],
  asset: Asset,
): { tags: string[]; topics: string[] } {
  const tags: string[] = []
  const topics: string[] = []

  for (const rule of rules) {
    if (!rule.is_active) continue
    if (!matchesRule(rule, asset)) continue

    if (rule.action === 'add_tag') {
      tags.push(rule.action_value)
    } else if (rule.action === 'add_topic') {
      topics.push(rule.action_value)
    }
  }

  return {
    tags: [...new Set(tags)],
    topics: [...new Set(topics)],
  }
}

/**
 * Apply matching rules to an asset by inserting tag/topic associations.
 */
export async function applyRules(
  assetId: string,
  rules: TaggingRule[],
): Promise<{ tagsApplied: string[]; topicsApplied: string[] }> {
  const supabase = await createClient()
  if (!supabase) return { tagsApplied: [], topicsApplied: [] }

  // Fetch the asset
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .single()

  if (assetError || !asset) return { tagsApplied: [], topicsApplied: [] }

  const { tags, topics } = evaluateRulesInMemory(rules, asset as unknown as Asset)

  // Apply tags
  for (const tagName of tags) {
    // Find or skip the tag
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .single()

    if (tag) {
      await supabase
        .from('asset_tags')
        .upsert({ asset_id: assetId, tag_id: tag.id })
    }
  }

  // Apply topics
  for (const topicName of topics) {
    const { data: topic } = await supabase
      .from('topics')
      .select('id')
      .eq('name', topicName)
      .single()

    if (topic) {
      await supabase
        .from('asset_topics')
        .upsert({ asset_id: assetId, topic_id: topic.id })
    }
  }

  return { tagsApplied: tags, topicsApplied: topics }
}
