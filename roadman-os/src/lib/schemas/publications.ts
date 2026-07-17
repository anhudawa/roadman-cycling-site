import { z } from 'zod'

export const publicationSchema = z.object({
  asset_id: z.string().min(1, 'Asset is required'),
  platform_id: z.string().min(1, 'Platform is required'),
  scheduled_at: z.string().optional().default(''),
  status: z.enum(['draft', 'scheduled', 'published', 'failed', 'removed']).optional().default('draft'),
  // Platform-specific content fields stored in platform_metadata
  platform_title: z.string().optional().default(''),
  platform_body: z.string().optional().default(''),
  hashtags: z.string().optional().default(''),
  mentions: z.string().optional().default(''),
})

export const bulkScheduleSchema = z.object({
  asset_id: z.string().min(1, 'Asset is required'),
  platforms: z.array(z.object({
    platform_id: z.string(),
    scheduled_at: z.string(),
    platform_title: z.string().optional(),
    platform_body: z.string().optional(),
  })).min(1, 'Select at least one platform'),
  same_time: z.boolean().optional().default(false),
  shared_time: z.string().optional().default(''),
})

export type PublicationFormValues = z.infer<typeof publicationSchema>
export type BulkScheduleFormValues = z.infer<typeof bulkScheduleSchema>
