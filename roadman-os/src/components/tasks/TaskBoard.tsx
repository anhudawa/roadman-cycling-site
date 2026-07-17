'use client'

import { useState, useEffect, useMemo, useCallback, useTransition } from 'react'
import { cn } from '@/lib/utils/cn'
import { updateTaskStatus } from '@/lib/actions/tasks'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskFilters, type ViewMode } from '@/components/tasks/TaskFilters'
import { TaskList } from '@/components/tasks/TaskList'
import type { TaskWithAssignee } from '@/lib/queries/tasks'
import type { Profile, Campaign } from '@/types/database'

/** Kanban columns in display order (excludes 'blocked' from main board) */
const KANBAN_COLUMNS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
] as const

export interface TaskBoardProps {
  tasks: TaskWithAssignee[]
  profiles: Pick<Profile, 'id' | 'full_name'>[]
  campaigns: Pick<Campaign, 'id' | 'title'>[]
}

/**
 * Kanban board with drag-and-drop using HTML5 Drag and Drop API.
 * Includes filter bar and toggleable list view.
 */
export function TaskBoard({ tasks, profiles, campaigns }: TaskBoardProps) {
  const [view, setView] = useState<ViewMode>('kanban')
  const [priority, setPriority] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Optimistic state for tasks during drag
  const [optimisticTasks, setOptimisticTasks] = useState<TaskWithAssignee[]>(tasks)

  // Keep optimistic state in sync with server data
  useEffect(() => {
    setOptimisticTasks(tasks)
  }, [tasks])

  // Apply client-side filters
  const filteredTasks = useMemo(() => {
    let result = optimisticTasks
    if (priority) {
      result = result.filter((t) => t.priority === priority)
    }
    if (assigneeId) {
      result = result.filter((t) => t.assignee_id === assigneeId)
    }
    if (campaignId) {
      result = result.filter((t) => t.campaign_id === campaignId)
    }
    return result
  }, [optimisticTasks, priority, assigneeId, campaignId])

  // Group tasks by status for columns
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, TaskWithAssignee[]> = {}
    for (const col of KANBAN_COLUMNS) {
      grouped[col.value] = []
    }
    for (const task of filteredTasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    }
    return grouped
  }, [filteredTasks])

  // --- Drag handlers ---
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
      e.dataTransfer.setData('text/plain', taskId)
      e.dataTransfer.effectAllowed = 'move'
      setDraggingTaskId(taskId)
    },
    [],
  )

  const handleDragEnd = useCallback(() => {
    setDraggingTaskId(null)
    setDragOverColumn(null)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, columnStatus: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverColumn(columnStatus)
    },
    [],
  )

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, columnStatus: string) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData('text/plain')
      setDragOverColumn(null)
      setDraggingTaskId(null)

      if (!taskId) return

      // Find the task and check if status actually changed
      const task = optimisticTasks.find((t) => t.id === taskId)
      if (!task || task.status === columnStatus) return

      // Optimistic update
      setOptimisticTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: columnStatus as TaskWithAssignee['status'] } : t,
        ),
      )

      // Server action
      startTransition(async () => {
        const result = await updateTaskStatus(taskId, columnStatus)
        if (!result.success) {
          // Revert optimistic update on failure
          setOptimisticTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, status: task.status } : t,
            ),
          )
        }
      })
    },
    [optimisticTasks],
  )

  return (
    <div>
      <TaskFilters
        view={view}
        onViewChange={setView}
        priority={priority}
        onPriorityChange={setPriority}
        assigneeId={assigneeId}
        onAssigneeChange={setAssigneeId}
        campaignId={campaignId}
        onCampaignChange={setCampaignId}
        profiles={profiles}
        campaigns={campaigns}
      />

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map((col) => {
            const columnTasks = tasksByStatus[col.value] ?? []
            const isDropTarget = dragOverColumn === col.value

            return (
              <div
                key={col.value}
                onDragOver={(e) => handleDragOver(e, col.value)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.value)}
                className={cn(
                  'rounded-xl border border-mid-grey/20 bg-deep-purple/20 p-3 min-h-[200px] transition-colors',
                  isDropTarget && 'border-coral/50 bg-coral/5',
                )}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-sm uppercase text-off-white tracking-wider">
                    {col.label}
                  </h3>
                  <span className="text-xs text-mid-grey bg-mid-grey/20 rounded-full px-2 py-0.5">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Task Cards */}
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <TaskList tasks={filteredTasks} />
      )}
    </div>
  )
}
