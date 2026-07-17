'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { markAsRead, markAllAsRead } from '@/lib/actions/notifications'
import { NotificationItem } from './NotificationItem'
import type { Notification } from '@/types/database'

const POLL_INTERVAL_MS = 30_000
const NOTIFICATIONS_LIMIT = 20

/** Map notification type + entity to a route. */
function getNotificationHref(notification: Notification): string {
  const { type, entity_type, entity_id } = notification

  switch (type) {
    case 'task_assigned':
      return '/tasks'
    case 'brief_approved':
    case 'brief_rejected':
      return entity_id ? `/assets/${entity_id}/brief` : '/assets'
    case 'comment_mention':
      if (entity_type === 'task') return '/tasks'
      if (entity_type === 'idea') return '/ideas'
      return entity_id ? `/assets/${entity_id}` : '/assets'
    case 'publication_scheduled':
      return '/calendar'
    default:
      return '/'
  }
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  /** Fetch notifications from Supabase (client-side). */
  const fetchNotifications = useCallback(async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(NOTIFICATIONS_LIMIT)

      if (!error && data) {
        const typed = data as unknown as Notification[]
        setNotifications(typed)
        setUnreadCount(typed.filter((n) => !n.is_read).length)
      }
    } catch {
      // Silently fail on polling errors
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleMarkAsRead(id: string) {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    await markAsRead(id)
  }

  async function handleMarkAllAsRead() {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
    await markAllAsRead()
  }

  function handleNavigate(notification: Notification) {
    setOpen(false)
    router.push(getNotificationHref(notification))
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-mid-grey transition-colors hover:bg-white/5 hover:text-off-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-coral px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-mid-grey/20 bg-charcoal shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-mid-grey/20 px-4 py-3">
            <h3 className="font-body text-sm font-semibold text-off-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="font-body text-xs text-coral transition-colors hover:text-coral/80"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-mid-grey/30" />
                <p className="font-body text-sm text-mid-grey/50">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-mid-grey/10">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={handleMarkAsRead}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
