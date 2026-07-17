import { z } from 'zod'

export const campaignSchema = z.object({
  // Required fields
  title: z.string().min(1, 'Title is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),

  // Optional core fields (stored directly on the campaigns table)
  description: z.string().optional().default(''),
  type: z.enum([
    'weekly_focus',
    'product_launch',
    'event_promotion',
    'sponsor_campaign',
    'seasonal',
    'evergreen',
    'ad_hoc',
  ]).optional().default('weekly_focus'),
  status: z.enum([
    'draft',
    'planned',
    'active',
    'completed',
    'cancelled',
  ]).optional().default('draft'),
  goal: z.string().optional().default(''),
  owner_id: z.string().optional().default(''),
  sponsor_id: z.string().optional().default(''),
  product_id: z.string().optional().default(''),

  // Optional metadata fields (stored in the metadata JSON column)
  pillar: z.string().optional().default(''),
  goals: z.array(z.string()).optional().default([]),
  key_messages: z.array(z.string()).optional().default([]),
  target_audience: z.string().optional().default(''),
  cta_url: z.string().optional().default(''),
  cta_text: z.string().optional().default(''),
  colour: z.string().optional().default(''),
  notes: z.string().optional().default(''),
})

export type CampaignFormValues = z.infer<typeof campaignSchema>
