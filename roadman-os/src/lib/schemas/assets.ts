import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enum value arrays (kept in sync with database.ts types)
// ---------------------------------------------------------------------------
const ASSET_TYPE_VALUES = [
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
] as const

const ASSET_STATUS_VALUES = [
  'idea',
  'brief_written',
  'in_production',
  'in_review',
  'approved',
  'scheduled',
  'published',
  'repurposed',
  'archived',
] as const

const CONTENT_PILLAR_VALUES = [
  'coaching',
  'nutrition',
  'strength_and_conditioning',
  'recovery',
  'le_metier',
] as const

// ---------------------------------------------------------------------------
// Base asset schema — common fields shared by every asset type
// ---------------------------------------------------------------------------
export const baseAssetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(ASSET_TYPE_VALUES, { required_error: 'Type is required' }),
  status: z.enum(ASSET_STATUS_VALUES).default('idea'),
  pillar: z.enum(CONTENT_PILLAR_VALUES).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  body: z.string().optional().or(z.literal('')),
  campaign_id: z.string().uuid().optional().or(z.literal('')),
  parent_asset_id: z.string().uuid().optional().or(z.literal('')),
  assignee_id: z.string().uuid().optional().or(z.literal('')),
  due_date: z.string().optional().or(z.literal('')),
})

// ---------------------------------------------------------------------------
// Type-specific field schemas — stored in the `metadata` JSON column
// ---------------------------------------------------------------------------
export const podcastEpisodeFields = z.object({
  episode_number: z.coerce.number().int().positive().optional(),
  season_number: z.coerce.number().int().positive().optional(),
  duration_seconds: z.coerce.number().int().nonnegative().optional(),
  youtube_id: z.string().optional().or(z.literal('')),
  spotify_url: z.string().url().optional().or(z.literal('')),
  guest_name: z.string().optional().or(z.literal('')),
  guest_credential: z.string().optional().or(z.literal('')),
  recording_date: z.string().optional().or(z.literal('')),
})

export const blogPostFields = z.object({
  seo_title: z.string().max(60, 'SEO title must be 60 characters or fewer').optional().or(z.literal('')),
  seo_description: z.string().max(160, 'SEO description must be 160 characters or fewer').optional().or(z.literal('')),
  keywords: z.array(z.string()).optional().default([]),
  answer_capsule: z.string().optional().or(z.literal('')),
  canonical_url: z.string().url().optional().or(z.literal('')),
})

export const youtubeVideoFields = z.object({
  youtube_id: z.string().optional().or(z.literal('')),
  duration_seconds: z.coerce.number().int().nonnegative().optional(),
})

export const socialPostFields = z.object({
  platform_char_count: z.coerce.number().int().nonnegative().optional(),
})

// ---------------------------------------------------------------------------
// Combined asset schema — base fields + all possible metadata fields
// Validation is flexible: metadata fields are optional, type-specific
// enforcement happens in the form UI rather than hard-blocking at schema level.
// ---------------------------------------------------------------------------
export const assetSchema = baseAssetSchema.extend({
  // Podcast episode metadata
  episode_number: z.coerce.number().int().positive().optional().or(z.literal('')),
  season_number: z.coerce.number().int().positive().optional().or(z.literal('')),
  duration_seconds: z.coerce.number().int().nonnegative().optional().or(z.literal('')),
  youtube_id: z.string().optional().or(z.literal('')),
  spotify_url: z.string().optional().or(z.literal('')),
  guest_name: z.string().optional().or(z.literal('')),
  guest_credential: z.string().optional().or(z.literal('')),
  recording_date: z.string().optional().or(z.literal('')),
  // Blog post metadata
  seo_title: z.string().max(60, 'SEO title must be 60 characters or fewer').optional().or(z.literal('')),
  seo_description: z.string().max(160, 'SEO description must be 160 characters or fewer').optional().or(z.literal('')),
  keywords: z.string().optional().or(z.literal('')), // comma-separated in formData, parsed on submit
  answer_capsule: z.string().optional().or(z.literal('')),
  canonical_url: z.string().optional().or(z.literal('')),
  // Social post metadata
  platform_char_count: z.coerce.number().int().nonnegative().optional().or(z.literal('')),
})

export type AssetFormValues = z.infer<typeof assetSchema>
