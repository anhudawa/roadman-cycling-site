import type { AssetStatus, AssetType, ContentPillar } from '@/types/database'

// ---------------------------------------------------------------------------
// Status → Badge variant mapping
// ---------------------------------------------------------------------------
export function getStatusBadgeVariant(
  status: AssetStatus,
): 'grey' | 'blue' | 'amber' | 'purple' | 'green' | 'coral' | 'default' {
  const map: Record<AssetStatus, 'grey' | 'blue' | 'amber' | 'purple' | 'green' | 'coral'> = {
    idea: 'grey',
    brief_written: 'blue',
    in_production: 'amber',
    in_review: 'purple',
    approved: 'green',
    scheduled: 'blue',
    published: 'green',
    repurposed: 'coral',
    archived: 'grey',
  }
  return map[status] || 'default'
}

// ---------------------------------------------------------------------------
// Asset type → Badge variant mapping
// ---------------------------------------------------------------------------
export function getTypeBadgeVariant(
  type: AssetType,
): 'coral' | 'red' | 'blue' | 'purple' | 'amber' | 'green' | 'grey' | 'default' {
  const map: Record<AssetType, 'coral' | 'red' | 'blue' | 'purple' | 'amber' | 'green' | 'grey'> = {
    podcast_episode: 'coral',
    youtube_video: 'red',
    blog_post: 'blue',
    social_post: 'purple',
    newsletter: 'amber',
    course_module: 'green',
    quote_card: 'grey',
    infographic: 'blue',
    reel: 'purple',
    short: 'red',
    clip: 'coral',
    story: 'amber',
    carousel: 'purple',
    thread: 'blue',
    pdf: 'grey',
    live_stream: 'red',
    webinar: 'green',
    other: 'grey',
  }
  return map[type] || 'default'
}

// ---------------------------------------------------------------------------
// Content pillar → Badge variant mapping
// ---------------------------------------------------------------------------
export function getPillarBadgeVariant(
  pillar: ContentPillar,
): 'blue' | 'green' | 'amber' | 'purple' | 'coral' | 'default' {
  const map: Record<ContentPillar, 'blue' | 'green' | 'amber' | 'purple' | 'coral'> = {
    coaching: 'blue',
    nutrition: 'green',
    strength_and_conditioning: 'amber',
    recovery: 'purple',
    le_metier: 'coral',
  }
  return map[pillar] || 'default'
}
