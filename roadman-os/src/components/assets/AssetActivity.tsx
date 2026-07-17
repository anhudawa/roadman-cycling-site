'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  Plus,
  Pencil,
  ArrowRightLeft,
  UserCheck,
  MessageSquare,
  Globe,
  Archive,
  RotateCcw,
  Upload,
  Trash2,
  Highlighter,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatActivityEntry } from '@/lib/utils/format-activity'
import type { ActivityAction, ActivityLog } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActivityAuthor = {
  id: string
  display_name: string | null
  full_name: string
  avatar_url: string | null
}

type ActivityEntry = ActivityLog & {
  actor?: ActivityAuthor
}

interface AssetActivityProps {
  entries: ActivityEntry[]
}

// ---------------------------------------------------------------------------
// Action icon mapping
// ---------------------------------------------------------------------------

const ACTION_ICONS: Record<ActivityAction, React.ElementType> = {
  created: Plus,
  updated: Pencil,
  status_changed: ArrowRightLeft,
  assigned: UserCheck,
  commented: MessageSquare,
  published: Globe,
  archived: Archive,
  restored: RotateCcw,
  file_uploaded: Upload,
  file_deleted: Trash2,
  highlight_added: Highlighter,
  scheduled: CalendarClock,
  approved: CheckCircle2,
  rejected: XCircle,
}

const ACTION_COLOURS: Record<ActivityAction, string> = {
  created: 'text-emerald-400',
  updated: 'text-blue-400',
  status_changed: 'text-amber-400',
  assigned: 'text-purple',
  commented: 'text-mid-grey',
  published: 'text-emerald-400',
  archived: 'text-mid-grey',
  restored: 'text-blue-400',
  file_uploaded: 'text-coral',
  file_deleted: 'text-red-400',
  highlight_added: 'text-amber-400',
  scheduled: 'text-blue-400',
  approved: 'text-emerald-400',
  rejected: 'text-red-400',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssetActivity({ entries }: AssetActivityProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="w-10 h-10" />}
        title="No activity yet"
        description="Actions on this asset will appear here."
      />
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-0">
      {entries.map((entry) => {
        const IconComponent = ACTION_ICONS[entry.action] ?? Activity
        const iconColour = ACTION_COLOURS[entry.action] ?? 'text-mid-grey'
        const actorName = entry.actor?.display_name || entry.actor?.full_name || 'Someone'

        const description = formatActivityEntry({
          ...entry,
          actor_name: actorName,
        })

        return (
          <div
            key={entry.id}
            className="flex items-start gap-3 py-2.5 border-b border-mid-grey/10 last:border-b-0"
          >
            {/* Icon */}
            <div className={cn('shrink-0 mt-0.5', iconColour)}>
              <IconComponent className="w-4 h-4" />
            </div>

            {/* Description + timestamp */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-off-white/80 leading-snug">
                {description}
              </p>
              <p className="text-xs text-mid-grey mt-0.5">
                {formatDistanceToNow(new Date(entry.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
