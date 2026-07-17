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

const statusConfig: Record<string, { label: string; variant: 'grey' | 'blue' | 'amber' | 'purple' | 'green' | 'red' }> = {
  backlog: { label: 'Backlog', variant: 'grey' },
  todo: { label: 'To Do', variant: 'blue' },
  in_progress: { label: 'In Progress', variant: 'amber' },
  in_review: { label: 'In Review', variant: 'purple' },
  done: { label: 'Done', variant: 'green' },
  blocked: { label: 'Blocked', variant: 'red' },
}

export interface TaskListProps {
  tasks: TaskWithAssignee[]
}

/**
 * List view of tasks displayed as rows.
 */
export function TaskList({ tasks }: TaskListProps) {
  const today = new Date().toISOString().split('T')[0]

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-mid-grey">
        No tasks match the current filters.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-mid-grey/20 text-left">
            <th className="py-3 px-3 font-heading text-xs uppercase text-mid-grey tracking-wider">
              Title
            </th>
            <th className="py-3 px-3 font-heading text-xs uppercase text-mid-grey tracking-wider">
              Status
            </th>
            <th className="py-3 px-3 font-heading text-xs uppercase text-mid-grey tracking-wider">
              Priority
            </th>
            <th className="py-3 px-3 font-heading text-xs uppercase text-mid-grey tracking-wider">
              Assignee
            </th>
            <th className="py-3 px-3 font-heading text-xs uppercase text-mid-grey tracking-wider">
              Due Date
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const priority = priorityConfig[task.priority] ?? priorityConfig.medium
            const status = statusConfig[task.status] ?? statusConfig.backlog
            const isOverdue = task.due_date && task.due_date < today && task.status !== 'done'

            return (
              <tr
                key={task.id}
                className="border-b border-mid-grey/10 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-3 text-off-white font-medium">
                  {task.title}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={status.variant} size="sm">
                    {status.label}
                  </Badge>
                </td>
                <td className="py-3 px-3">
                  <Badge variant={priority.variant} size="sm">
                    {priority.label}
                  </Badge>
                </td>
                <td className="py-3 px-3">
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5 text-off-white/80">
                      {task.assignee.avatar_url ? (
                        <img
                          src={task.assignee.avatar_url}
                          alt={task.assignee.full_name}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-3.5 w-3.5 text-mid-grey" />
                      )}
                      <span className="truncate max-w-[120px]">
                        {task.assignee.full_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-mid-grey/50">Unassigned</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  {task.due_date ? (
                    <div
                      className={cn(
                        'flex items-center gap-1',
                        isOverdue ? 'text-red-400' : 'text-mid-grey',
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(task.due_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-mid-grey/50">-</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
