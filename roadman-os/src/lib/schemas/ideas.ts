import { z } from 'zod'

/**
 * Quick-capture schema — minimal validation for fast idea entry.
 */
export const ideaCaptureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  pillar: z
    .enum([
      'coaching',
      'nutrition',
      'strength_and_conditioning',
      'recovery',
      'le_metier',
    ])
    .optional(),
  source: z.string().optional(),
})

export type IdeaCaptureFormValues = z.infer<typeof ideaCaptureSchema>

/**
 * Full idea schema — used when editing or developing an idea further.
 */
export const ideaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  status: z
    .enum(['captured', 'developing', 'ready', 'used', 'discarded'])
    .optional()
    .default('captured'),
  pillar: z
    .enum([
      'coaching',
      'nutrition',
      'strength_and_conditioning',
      'recovery',
      'le_metier',
    ])
    .optional(),
  suggested_type: z
    .enum([
      'podcast_episode',
      'youtube_video',
      'blog_post',
      'social_post',
      'newsletter',
      'course_module',
      'quote_card',
      'infographic',
      'reel',
      'short',
      'clip',
      'story',
      'carousel',
      'thread',
      'pdf',
      'live_stream',
      'webinar',
      'other',
    ])
    .optional(),
  source: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
})

export type IdeaFormValues = z.infer<typeof ideaSchema>
