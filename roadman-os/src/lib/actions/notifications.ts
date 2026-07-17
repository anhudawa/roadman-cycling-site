'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

/**
 * Create a notification for a user.
 * Utility called by other server actions, not a form action.
 */
export async function createNotification(data: {
  recipient_id: string
  type: string
  title: string
  body?: string
  entity_type?: string
  entity_id?: string
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: inserted, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: data.recipient_id,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        entity_type: data.entity_type ?? null,
        entity_id: data.entity_id ?? null,
        is_read: false,
        metadata: {},
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: { id: inserted.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(id: string): Promise<ActionResult> {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllAsRead(): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', profile.id)
      .eq('is_read', false)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Get the count of unread notifications for the current user.
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', profile.id)
      .eq('is_read', false)

    if (error || count === null) return 0
    return count
  } catch {
    return 0
  }
}
