import { z } from 'zod'

export const apiKeyConnectionSchema = z.object({
  platform_slug: z.string().min(1, 'Platform is required'),
  api_key: z.string().min(1, 'API key is required'),
  account_name: z.string().optional().default(''),
  publication_id: z.string().optional().default(''),
  property_id: z.string().optional().default(''),
})

export type ApiKeyConnectionFormValues = z.infer<typeof apiKeyConnectionSchema>

export const oauthInitSchema = z.object({
  platform: z.enum(['youtube', 'meta', 'linkedin', 'spotify']),
})

export type OAuthInitValues = z.infer<typeof oauthInitSchema>

export const syncRequestSchema = z.object({
  connection_id: z.string().uuid('Invalid connection ID'),
  full_sync: z.boolean().optional().default(false),
})

export type SyncRequestValues = z.infer<typeof syncRequestSchema>

export const skoolMetricsSchema = z.object({
  period: z.enum(['weekly', 'monthly']),
  period_start: z.string().min(1, 'Period start date is required'),
  tier: z.enum(['clubhouse', 'not_done_yet']),
  member_count: z.coerce.number().int().min(0),
  new_joins: z.coerce.number().int().min(0),
  members_left: z.coerce.number().int().min(0),
  active_members: z.coerce.number().int().min(0),
  posts: z.coerce.number().int().min(0),
  comments: z.coerce.number().int().min(0),
})

export type SkoolMetricsFormValues = z.infer<typeof skoolMetricsSchema>
