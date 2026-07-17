import type { ActivityLog, ActivityAction } from '@/types/database'

/** Map action enum values to human-readable past-tense verbs. */
const ACTION_VERBS: Record<ActivityAction, string> = {
  created: 'created',
  updated: 'updated',
  status_changed: 'changed the status of',
  assigned: 'assigned',
  commented: 'commented on',
  published: 'published',
  archived: 'archived',
  restored: 'restored',
  file_uploaded: 'uploaded a file to',
  file_deleted: 'deleted a file from',
  highlight_added: 'added a highlight to',
  scheduled: 'scheduled',
  approved: 'approved',
  rejected: 'rejected',
}

/** Map entity_type slugs to human-readable labels. */
const ENTITY_LABELS: Record<string, string> = {
  campaign: 'campaign',
  asset: 'asset',
  task: 'task',
  idea: 'idea',
  publication: 'publication',
  transcript: 'transcript',
  file: 'file',
  comment: 'comment',
  topic: 'topic',
  tag: 'tag',
  cluster: 'cluster',
}

type ActivityEntryInput = ActivityLog & { actor_name?: string | null }

/**
 * Format an activity log entry into a human-readable sentence.
 *
 * Examples:
 * - "Anthony created campaign 'Week 29: Zone 2'"
 * - "Sarah updated asset 'Recovery Nutrition Guide'"
 * - "Matthew archived task 'Write Instagram captions'"
 */
export function formatActivityEntry(entry: ActivityEntryInput): string {
  const actor = entry.actor_name ?? 'Someone'
  const verb = ACTION_VERBS[entry.action] ?? entry.action
  const entityLabel = ENTITY_LABELS[entry.entity_type] ?? entry.entity_type

  // Try to extract a meaningful title from the changes object
  const changes = entry.changes as Record<string, unknown> | null
  const title =
    (changes?.title as string) ??
    (changes?.name as string) ??
    null

  if (title) {
    return `${actor} ${verb} ${entityLabel} '${title}'`
  }

  return `${actor} ${verb} ${entityLabel}`
}
