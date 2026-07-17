import { z } from 'zod'

export const taskSchema = z.object({
  // Required fields
  title: z.string().min(1, 'Title is required'),

  // Optional core fields (stored directly on the tasks table)
  description: z.string().optional().default(''),
  status: z.enum([
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'done',
    'blocked',
  ]).optional().default('backlog'),
  priority: z.enum([
    'low',
    'medium',
    'high',
    'urgent',
  ]).optional().default('medium'),
  asset_id: z.string().optional().default(''),
  campaign_id: z.string().optional().default(''),
  assignee_id: z.string().optional().default(''),
  due_date: z.string().optional().default(''),
  labels: z.array(z.string()).optional().default([]),

  // Optional metadata fields (stored in the metadata JSON column)
  estimated_minutes: z.coerce.number().optional(),
  parent_task_id: z.string().optional().default(''),
})

export type TaskFormValues = z.infer<typeof taskSchema>
