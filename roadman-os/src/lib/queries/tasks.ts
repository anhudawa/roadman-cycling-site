import { createClient } from '@/lib/supabase/server'
import type { Task, TaskStatus, TaskPriority, Profile } from '@/types/database'

export type TaskWithAssignee = Task & {
  assignee: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export type TaskFilters = {
  status?: string
  priority?: string
  assignee_id?: string
  campaign_id?: string
  due_date_from?: string
  due_date_to?: string
  search?: string
}

/**
 * Fetch a filtered list of tasks, excluding archived ones.
 * Joins the assignee profile. Ordered by sort_order then created_at.
 */
export async function getTasks(
  filters?: TaskFilters,
): Promise<TaskWithAssignee[]> {
  const supabase = await createClient()

  let query = supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Exclude archived tasks (archived_at stored in metadata)
  query = query.or('metadata->archived_at.is.null,metadata.not.cs.{"archived_at":true}')

  if (filters?.status) {
    query = query.eq('status', filters.status as TaskStatus)
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority as TaskPriority)
  }

  if (filters?.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }

  if (filters?.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id)
  }

  if (filters?.due_date_from) {
    query = query.gte('due_date', filters.due_date_from)
  }

  if (filters?.due_date_to) {
    query = query.lte('due_date', filters.due_date_to)
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error || !data) return []
  return data as unknown as TaskWithAssignee[]
}

/**
 * Fetch tasks filtered by a specific status with assignee joined.
 */
export async function getTasksByStatus(
  status: string,
): Promise<TaskWithAssignee[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
    .eq('status', status as TaskStatus)
    .or('metadata->archived_at.is.null,metadata.not.cs.{"archived_at":true}')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as unknown as TaskWithAssignee[]
}

/**
 * Fetch tasks linked to a specific campaign.
 */
export async function getTasksByCampaign(
  campaignId: string,
): Promise<TaskWithAssignee[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
    .eq('campaign_id', campaignId)
    .or('metadata->archived_at.is.null,metadata.not.cs.{"archived_at":true}')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as unknown as TaskWithAssignee[]
}

/**
 * Fetch sub-tasks for a given parent task.
 * parent_task_id is stored in metadata.
 */
export async function getSubTasks(
  parentTaskId: string,
): Promise<TaskWithAssignee[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
    .contains('metadata', { parent_task_id: parentTaskId })
    .or('metadata->archived_at.is.null,metadata.not.cs.{"archived_at":true}')
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data as unknown as TaskWithAssignee[]
}

/**
 * Get task counts grouped by status for kanban column headers.
 * Returns a map of status -> count.
 */
export async function getTaskCountsByStatus(): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('status')
    .or('metadata->archived_at.is.null,metadata.not.cs.{"archived_at":true}')

  if (error || !data) return {}

  const counts: Record<string, number> = {}
  for (const row of data) {
    const status = row.status as string
    counts[status] = (counts[status] ?? 0) + 1
  }
  return counts
}

/**
 * Fetch a single task by ID with assignee joined.
 */
export async function getTask(id: string): Promise<TaskWithAssignee | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as TaskWithAssignee
}
