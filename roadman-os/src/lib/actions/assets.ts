'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { baseAssetSchema } from '@/lib/schemas/assets'
import type { Asset, AssetType, ContentPillar } from '@/types/database'

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------
type ActionResult = {
  success: boolean
  data?: Asset
  error?: string
}

// ---------------------------------------------------------------------------
// Slug generator
// ---------------------------------------------------------------------------
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ---------------------------------------------------------------------------
// Metadata key sets per asset type
// ---------------------------------------------------------------------------
const PODCAST_METADATA_KEYS = [
  'episode_number',
  'season_number',
  'duration_seconds',
  'youtube_id',
  'spotify_url',
  'guest_name',
  'guest_credential',
  'recording_date',
] as const

const BLOG_METADATA_KEYS = [
  'seo_title',
  'seo_description',
  'keywords',
  'answer_capsule',
  'canonical_url',
] as const

const YOUTUBE_METADATA_KEYS = [
  'youtube_id',
  'duration_seconds',
] as const

const SOCIAL_METADATA_KEYS = [
  'platform_char_count',
] as const

function getMetadataKeysForType(type: string): readonly string[] {
  switch (type) {
    case 'podcast_episode':
      return PODCAST_METADATA_KEYS
    case 'blog_post':
      return BLOG_METADATA_KEYS
    case 'youtube_video':
      return YOUTUBE_METADATA_KEYS
    case 'social_post':
      return SOCIAL_METADATA_KEYS
    default:
      return []
  }
}

// ---------------------------------------------------------------------------
// Extract metadata from form data
// ---------------------------------------------------------------------------
function extractMetadata(
  formData: FormData,
  type: string,
): Record<string, unknown> {
  const keys = getMetadataKeysForType(type)
  const metadata: Record<string, unknown> = {}

  for (const key of keys) {
    const value = formData.get(key)
    if (value !== null && value !== '') {
      if (key === 'keywords') {
        // Parse comma-separated keywords into an array
        metadata[key] = String(value)
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      } else if (
        key === 'episode_number' ||
        key === 'season_number' ||
        key === 'duration_seconds' ||
        key === 'platform_char_count'
      ) {
        const num = Number(value)
        if (!Number.isNaN(num)) metadata[key] = num
      } else {
        metadata[key] = String(value)
      }
    }
  }

  return metadata
}

// ---------------------------------------------------------------------------
// Parse topic and tag IDs from form data
// ---------------------------------------------------------------------------
function parseIds(formData: FormData, key: string): string[] {
  const raw = formData.getAll(key)
  return raw
    .map((v) => String(v).trim())
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------
export async function createAsset(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Parse base fields
    const raw = Object.fromEntries(formData.entries())
    const parsed = baseAssetSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const { title, type, status, pillar, description, body, campaign_id, parent_asset_id, assignee_id, due_date } = parsed.data
    const slug = generateSlug(title)
    const metadata = extractMetadata(formData, type)

    // Insert the asset
    const { data: asset, error: insertError } = await supabase
      .from('assets')
      .insert({
        title,
        slug,
        type: type as AssetType,
        status,
        pillar: (pillar || null) as ContentPillar | null,
        description: description || null,
        body: body || null,
        campaign_id: campaign_id || null,
        parent_asset_id: parent_asset_id || null,
        creator_id: profile.id,
        assignee_id: assignee_id || null,
        publish_date: null,
        due_date: due_date || null,
        external_id: null,
        external_url: null,
        thumbnail_url: null,
        duration_seconds: null,
        word_count: null,
        metadata,
      })
      .select()
      .single()

    if (insertError || !asset) {
      return { success: false, error: insertError?.message ?? 'Failed to create asset' }
    }

    // Insert topic junctions
    const topicIds = parseIds(formData, 'topic_ids')
    if (topicIds.length > 0) {
      await supabase.from('asset_topics').insert(
        topicIds.map((topic_id) => ({ asset_id: asset.id, topic_id })),
      )
    }

    // Insert tag junctions
    const tagIds = parseIds(formData, 'tag_ids')
    if (tagIds.length > 0) {
      await supabase.from('asset_tags').insert(
        tagIds.map((tag_id) => ({ asset_id: asset.id, tag_id })),
      )
    }

    // Log activity
    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'asset',
      entity_id: asset.id,
      changes: { title, type, status },
    })

    revalidatePath('/assets')
    return { success: true, data: asset as Asset }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------
export async function updateAsset(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    // Parse base fields
    const raw = Object.fromEntries(formData.entries())
    const parsed = baseAssetSchema.safeParse(raw)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const { title, type, status, pillar, description, body, campaign_id, parent_asset_id, assignee_id, due_date } = parsed.data
    const slug = generateSlug(title)
    const metadata = extractMetadata(formData, type)

    // Update the asset
    const { data: asset, error: updateError } = await supabase
      .from('assets')
      .update({
        title,
        slug,
        type: type as AssetType,
        status,
        pillar: (pillar || null) as ContentPillar | null,
        description: description || null,
        body: body || null,
        campaign_id: campaign_id || null,
        parent_asset_id: parent_asset_id || null,
        assignee_id: assignee_id || null,
        due_date: due_date || null,
        metadata,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError || !asset) {
      return { success: false, error: updateError?.message ?? 'Failed to update asset' }
    }

    // Replace topic junctions (delete all, then re-insert)
    await supabase.from('asset_topics').delete().eq('asset_id', id)
    const topicIds = parseIds(formData, 'topic_ids')
    if (topicIds.length > 0) {
      await supabase.from('asset_topics').insert(
        topicIds.map((topic_id) => ({ asset_id: id, topic_id })),
      )
    }

    // Replace tag junctions
    await supabase.from('asset_tags').delete().eq('asset_id', id)
    const tagIds = parseIds(formData, 'tag_ids')
    if (tagIds.length > 0) {
      await supabase.from('asset_tags').insert(
        tagIds.map((tag_id) => ({ asset_id: id, tag_id })),
      )
    }

    // Log activity
    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'asset',
      entity_id: id,
      changes: { title, type, status },
    })

    revalidatePath('/assets')
    revalidatePath(`/assets/${id}`)
    return { success: true, data: asset as Asset }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}

// ---------------------------------------------------------------------------
// Archive (soft delete)
// ---------------------------------------------------------------------------
export async function archiveAsset(id: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: asset, error } = await supabase
      .from('assets')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single()

    if (error || !asset) {
      return { success: false, error: error?.message ?? 'Failed to archive asset' }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'archived',
      entity_type: 'asset',
      entity_id: id,
    })

    revalidatePath('/assets')
    return { success: true, data: asset as Asset }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred' }
  }
}
