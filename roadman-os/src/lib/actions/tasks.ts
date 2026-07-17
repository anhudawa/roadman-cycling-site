'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { taskSchema } from '@/lib/schemas/tasks'
import type { TaskInsert, TaskUpdate as TaskUpdateType } from '@/types/database'

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

/** Extract form data including JSON arrays that were serialised by the client. */
function parseFormData(formData: FormData) {
  const raw: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    raw[key] = value
  }

  // Parse JSON array fields sent from the client form
  try {
    raw.labels = formData.get('labels')
      ? JSON.parse(formData.get('labels') as string)
      : []
  } catch {
    raw.labels = []
  }

  // Parse estimated_minutes as number if present
  if (raw.estimated_minutes === '' || raw.estimated_minutes === undefined) {
    delete raw.estimated_minutes
  }

  return raw
}

/**
 * Create a new task.
 */
export async function createTask(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw = parseFormData(formData)
    const parsed = taskSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    // Build metadata from metadata-only fields
    const metadata: Record<string, unknown> = {}
    if (values.estimated_minutes) metadata.estimated_minutes = values.estimated_minutes
    if (values.parent_task_id) metadata.parent_task_id = values.parent_task_id

    const insert: TaskInsert = {
      title: values.title,
      description: values.description || null,
      status: values.status ?? 'backlog',
      priority: values.priority ?? 'medium',
      asset_id: values.asset_id || null,
      campaign_id: values.campaign_id || null,
      assignee_id: values.assignee_id || null,
      created_by: profile.id,
      due_date: values.due_date || null,
      completed_at: null,
      sort_order: 0,
      labels: (values.labels ?? []).filter((l) => l.trim() !== ''),
      metadata,
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'task',
      entity_id: data.id,
    })

    revalidatePath('/tasks')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update an existing task.
 */
export async function updateTask(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Fetch current task for change tracking
    const { data: existing } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Task not found' }
    }

    const raw = parseFormData(formData)
    const parsed = taskSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    // Build metadata, preserving existing metadata fields we do not manage here
    const existingMeta = (existing.metadata ?? {}) as Record<string, unknown>
    const metadata: Record<string, unknown> = { ...existingMeta }
    metadata.estimated_minutes = values.estimated_minutes || undefined
    metadata.parent_task_id = values.parent_task_id || undefined

    // Clean out undefined keys
    for (const key of Object.keys(metadata)) {
      if (metadata[key] === undefined) delete metadata[key]
    }

    // Set completed_at if status changed to done
    let completedAt = existing.completed_at
    if (values.status === 'done' && existing.status !== 'done') {
      completedAt = new Date().toISOString()
    } else if (values.status !== 'done') {
      completedAt = null
    }

    const update: TaskUpdateType = {
      title: values.title,
      description: values.description || null,
      status: values.status ?? 'backlog',
      priority: values.priority ?? 'medium',
      asset_id: values.asset_id || null,
      campaign_id: values.campaign_id || null,
      assignee_id: values.assignee_id || null,
      due_date: values.due_date || null,
      completed_at: completedAt,
      labels: (values.labels ?? []).filter((l) => l.trim() !== ''),
      metadata,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('tasks')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Build field-level change log
    const changes: Record<string, unknown> = {}
    const trackFields = ['title', 'status', 'priority', 'description', 'assignee_id', 'due_date'] as const
    for (const field of trackFields) {
      const oldVal = existing[field]
      const newVal = update[field]
      if (oldVal !== newVal) {
        changes[field] = { from: oldVal, to: newVal }
      }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'task',
      entity_id: id,
      changes,
    })

    revalidatePath('/tasks')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Update only the status field of a task (used by kanban drag-and-drop).
 */
export async function updateTaskStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Task not found' }
    }

    const update: TaskUpdateType = {
      status: status as TaskInsert['status'],
      updated_at: new Date().toISOString(),
    }

    // Set completed_at if moving to done
    if (status === 'done') {
      update.completed_at = new Date().toISOString()
    } else if (existing.status === 'done' && status !== 'done') {
      update.completed_at = null
    }

    const { error } = await supabase
      .from('tasks')
      .update(update)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'status_changed',
      entity_type: 'task',
      entity_id: id,
      changes: { status: { from: existing.status, to: status } },
    })

    revalidatePath('/tasks')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Assign a task to a user (or unassign by passing null).
 */
export async function assignTask(
  id: string,
  assigneeId: string | null,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('tasks')
      .select('assignee_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Task not found' }
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        assignee_id: assigneeId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'assigned',
      entity_type: 'task',
      entity_id: id,
      changes: { assignee_id: { from: existing.assignee_id, to: assigneeId } },
    })

    revalidatePath('/tasks')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Archive a task by setting metadata.archived_at.
 */
export async function archiveTask(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('tasks')
      .select('metadata')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, error: 'Task not found' }
    }

    const existingMeta = (existing.metadata ?? {}) as Record<string, unknown>
    const metadata = {
      ...existingMeta,
      archived_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('tasks')
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'archived',
      entity_type: 'task',
      entity_id: id,
    })

    revalidatePath('/tasks')
    return { success: true, data: { id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
