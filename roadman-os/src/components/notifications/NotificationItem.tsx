'use client'

import {
  CheckSquare,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  BellRing,
} from 'lucide-react'
import type { Notification } from '@/types/database'

const typeIcons: Record<string, typeof CheckSquare> = {
  task_assigned: CheckSquare,
  brief_approved: ThumbsUp,
  brief_rejected: ThumbsDown,
  comment_mention: MessageSquare,
  publication_scheduled: Calendar,
}

const typeColors: Record<string, string> = {
  task_assigned: 'text-blue-400',
  brief_approved: 'text-green-400',
  brief_rejected: 'text-red-400',
  comment_mention: 'text-yellow-400',
  publication_scheduled: 'text-purple-400',
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  )
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

type NotificationItemProps = {
  notification: Notification
  onRead: (id: string) => void
  onNavigate: (notification: Notification) => void
}

export function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: NotificationItemProps) {
  const Icon = typeIcons[notification.type] ?? BellRing
  const iconColor = typeColors[notification.type] ?? 'text-mid-grey'

  function handleClick() {
    if (!notification.is_read) {
      onRead(notification.id)
    }
    onNavigate(notification)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
        notification.is_read ? 'bg-transparent' : 'bg-deep-purple/20'
      }`}
    >
      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`font-body text-sm leading-tight ${
            notification.is_read
              ? 'font-normal text-mid-grey'
              : 'font-semibold text-off-white'
          }`}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 truncate font-body text-xs text-mid-grey/70">
            {notification.body}
          </p>
        )}
        <p className="mt-1 font-body text-xs text-mid-grey/50">
          {timeAgo(notification.created_at)}
        </p>
      </div>
      {!notification.is_read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" />
      )}
    </button>
  )
}
