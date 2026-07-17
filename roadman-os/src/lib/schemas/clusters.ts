import { z } from 'zod'

export const clusterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  pillar: z.string().optional().default(''),
  hub_asset_id: z.string().optional().default(''),
  target_query: z.string().optional().default(''),
  related_queries: z.array(z.string()).optional().default([]),
  status: z
    .enum(['planned', 'building', 'complete', 'needs_update'])
    .optional()
    .default('planned'),
})

export type ClusterFormValues = z.infer<typeof clusterSchema>

export const CLUSTER_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'building', label: 'Building' },
  { value: 'complete', label: 'Complete' },
  { value: 'needs_update', label: 'Needs Update' },
] as const
