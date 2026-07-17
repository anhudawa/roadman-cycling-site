import { z } from 'zod'

export const topicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  pillar: z
    .enum([
      'coaching',
      'nutrition',
      'strength_and_conditioning',
      'recovery',
      'le_metier',
    ])
    .optional(),
  description: z.string().optional().default(''),
  parent_id: z.string().uuid('Invalid parent topic').optional(),
  sort_order: z.number().int().optional().default(0),
})

export type TopicFormValues = z.infer<typeof topicSchema>

export const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  colour: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex colour')
    .optional(),
})

export type TagFormValues = z.infer<typeof tagSchema>
