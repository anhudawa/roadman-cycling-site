import { z } from 'zod'

export const platformSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  platform_type: z.string().optional().default(''),
  account_handle: z.string().optional().default(''),
  base_url: z.string().optional().default(''),
  is_active: z.boolean().optional().default(true),
})

export type PlatformFormValues = z.infer<typeof platformSchema>
