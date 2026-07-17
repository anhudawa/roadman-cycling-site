import type { ActivityAction } from '@/types/database'

/**
 * Insert an activity log entry.
 * Re-usable across all server actions so every data mutation is auditable.
 */
export async function logActivity(
  supabase: { from: (table: string) => any },
  data: {
    actor_id: string
    action: ActivityAction
    entity_type: string
    entity_id: string
    changes?: Record<string, unknown>
  },
) {
  await supabase.from('activity_log').insert({
    actor_id: data.actor_id,
    action: data.action,
    entity_type: data.entity_type,
    entity_id: data.entity_id,
    changes: data.changes ?? {},
    metadata: {},
  })
}
