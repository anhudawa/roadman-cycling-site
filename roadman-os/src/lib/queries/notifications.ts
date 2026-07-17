import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import type { Notification } from '@/types/database'

/**
 * Fetch notifications for the current user, ordered by most recent first.
 */
export async function getNotifications(
  limit: number = 20,
): Promise<Notification[]> {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data as unknown as Notification[]
}

/**
 * Fetch only unread notifications for the current user.
 */
export async function getUnreadNotifications(): Promise<Notification[]> {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', profile.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as unknown as Notification[]
}

/**
 * Get the count of unread notifications for the current user.
 */
export async function getNotificationCount(): Promise<number> {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', profile.id)
    .eq('is_read', false)

  if (error || count === null) return 0
  return count
}
