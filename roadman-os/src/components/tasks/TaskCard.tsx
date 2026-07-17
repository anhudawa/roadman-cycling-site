'use client'

import { Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'
import type { TaskWithAssignee } from '@/lib/queries/tasks'

const priorityConfig: Record<string, { label: string; variant: 'red' | 'amber' | 'grey' }> = {
  urgent: { label: 'Urgent', variant: 'red' },
  high: { label: 'High', variant: 'amber' },
  medium: { label: 'Medium', variant: 'amber' },
  low: { label: 'Low', variant: 'grey' },
}

export interface TaskCardProps {
  task: TaskWithAssignee
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void
}

/**
 * Individual task card used in the kanban board.
 * Draggable with priority badge, assignee, and due date display.
 */
export function TaskCard({ task, onDragStart, onDragEnd }: TaskCardProps) {
  const priority = priorityConfig[task.priority] ?? priorityConfig.medium
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done'

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={cn(
        'rounded-lg border border-mid-grey/20 bg-charcoal p-3 cursor-grab active:cursor-grabbing',
        'hover:border-mid-grey/40 transition-colors',
        'select-none',
      )}
    >
      {/* Title */}
      <p className="text-sm font-medium text-off-white mb-2 line-clamp-2">
        {task.title}
      </p>

      {/* Priority badge */}
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={priority.variant} size="sm">
          {priority.label}
        </Badge>
        {task.labels.length > 0 && (
          <Badge variant="purple" size="sm">
            {task.labels[0]}
            {task.labels.length > 1 && ` +${task.labels.length - 1}`}
          </Badge>
        )}
      </div>

      {/* Footer: assignee + due date */}
      <div className="flex items-center justify-between text-xs text-mid-grey">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <>
              {task.assignee.avatar_url ? (
                <img
                  src={task.assignee.avatar_url}
                  alt={task.assignee.full_name}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
              <span className="truncate max-w-[100px]">
                {task.assignee.full_name}
              </span>
            </>
          ) : (
            <span className="text-mid-grey/50">Unassigned</span>
          )}
        </div>

        {task.due_date && (
          <div className={cn('flex items-center gap-1', isOverdue && 'text-red-400')}>
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(task.due_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
