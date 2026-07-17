import { z } from 'zod'

// ---------------------------------------------------------------------------
// Brief form schema — covers all sections of the content brief
// ---------------------------------------------------------------------------

export const briefSchema = z.object({
  // Targeting section
  primary_query: z.string().optional().default(''),
  secondary_queries: z.string().optional().default(''), // comma-separated
  search_intent: z.string().optional().default(''),
  target_persona: z.string().optional().default(''),
  pillar: z.string().optional().default(''),

  // Angle section
  unique_angle: z.string().optional().default(''),
  competitor_gaps: z.string().optional().default(''),
  original_sources: z.string().optional().default(''),
  answer_capsule: z.string().optional().default(''),
  decision_framework: z.string().optional().default(''),

  // Internal Linking section
  pillar_page: z.string().optional().default(''),
  related_episodes: z.string().optional().default(''),
  tools_mentioned: z.string().optional().default(''),
  cta: z.string().optional().default(''),

  // Cannibalisation Check
  existing_pages: z.string().optional().default(''),
  cannibalisation_decision: z
    .enum(['proceed', 'merge', 'redirect', 'differentiate', ''])
    .optional()
    .default(''),
  cannibalisation_rationale: z.string().optional().default(''),

  // Standard brief fields (mapped to content_briefs columns)
  objective: z.string().optional().default(''),
  target_audience: z.string().optional().default(''),
  tone: z.string().optional().default(''),
  seo_keywords: z.string().optional().default(''), // comma-separated
  notes: z.string().optional().default(''),
})

export type BriefFormValues = z.infer<typeof briefSchema>

// ---------------------------------------------------------------------------
// Brief status type (stored in distribution_plan.status)
// ---------------------------------------------------------------------------

export type BriefStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

// ---------------------------------------------------------------------------
// Search intent options for the select dropdown
// ---------------------------------------------------------------------------

export const SEARCH_INTENT_OPTIONS = [
  { value: 'informational', label: 'Informational' },
  { value: 'navigational', label: 'Navigational' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'commercial', label: 'Commercial' },
] as const

// ---------------------------------------------------------------------------
// Cannibalisation decision options
// ---------------------------------------------------------------------------

export const CANNIBALISATION_OPTIONS = [
  { value: 'proceed', label: 'Proceed' },
  { value: 'merge', label: 'Merge' },
  { value: 'redirect', label: 'Redirect' },
  { value: 'differentiate', label: 'Differentiate' },
] as const
