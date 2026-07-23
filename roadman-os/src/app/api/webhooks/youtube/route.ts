import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateHubSignature,
  logWebhookFailure,
} from '@/lib/webhooks/webhook-utils'
import type { AssetInsert } from '@/types/database'

// ---------------------------------------------------------------------------
// Atom XML parsing helpers
// ---------------------------------------------------------------------------

/**
 * Extract a value between XML tags.
 * Simple regex-based extraction — sufficient for the well-defined
 * YouTube PubSubHubbub Atom feed format.
 */
function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`)
  const match = xml.match(regex)
  return match?.[1] ?? null
}

/**
 * Extract an attribute value from an XML tag.
 */
function extractAttribute(
  xml: string,
  tag: string,
  attr: string,
): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`)
  const match = xml.match(regex)
  return match?.[1] ?? null
}

/**
 * Parse a YouTube PubSubHubbub Atom notification.
 *
 * YouTube sends notifications in Atom format when a channel publishes
 * a new video or updates an existing one. The payload contains:
 * - yt:videoId
 * - yt:channelId
 * - title
 * - link[rel="alternate"]/@href
 * - published
 * - updated
 */
function parseAtomNotification(xml: string): {
  videoId: string | null
  channelId: string | null
  title: string | null
  videoUrl: string | null
  published: string | null
  updated: string | null
} {
  return {
    videoId: extractTag(xml, 'yt:videoId'),
    channelId: extractTag(xml, 'yt:channelId'),
    title: extractTag(xml, 'title'),
    videoUrl: extractAttribute(xml, 'link', 'href'),
    published: extractTag(xml, 'published'),
    updated: extractTag(xml, 'updated'),
  }
}

// ---------------------------------------------------------------------------
// GET /api/webhooks/youtube
// ---------------------------------------------------------------------------

/**
 * Hub verification — responds to PubSubHubbub hub.challenge.
 *
 * When subscribing to a topic, the hub sends a GET request with:
 * - hub.mode: 'subscribe' or 'unsubscribe'
 * - hub.topic: the topic URL
 * - hub.challenge: a string to echo back
 * - hub.lease_seconds: how long the subscription lasts
 *
 * We must respond with 200 and the hub.challenge value as the body.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const topic = searchParams.get('hub.topic')
  const challenge = searchParams.get('hub.challenge')
  const leaseSeconds = searchParams.get('hub.lease_seconds')

  if (!challenge) {
    return NextResponse.json(
      { error: 'Missing hub.challenge parameter' },
      { status: 400 },
    )
  }

  // Log the subscription event
  console.log(
    `[youtube-webhook] Hub verification: mode=${mode}, topic=${topic}, lease=${leaseSeconds}`,
  )

  // Echo the challenge to confirm the subscription
  return new NextResponse(challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/youtube
// ---------------------------------------------------------------------------

/**
 * Receive YouTube PubSubHubbub notification.
 *
 * When a channel publishes a new video or updates one, the hub sends
 * a POST with an Atom XML body. We:
 * 1. Validate the HMAC-SHA1 signature
 * 2. Parse the Atom XML
 * 3. Create or update an asset record
 * 4. Create a publication record
 */
export async function POST(request: Request) {
  const rawBody = await request.text()

  // Validate HMAC-SHA1 signature
  const signature = request.headers.get('x-hub-signature')
  const hubSecret = process.env.YOUTUBE_HUB_SECRET

  if (!validateHubSignature(rawBody, signature, hubSecret)) {
    await logWebhookFailure('youtube', 'Invalid hub signature', rawBody)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 },
    )
  }

  // Parse the Atom notification
  const notification = parseAtomNotification(rawBody)

  if (!notification.videoId) {
    await logWebhookFailure(
      'youtube',
      'Missing videoId in notification',
      rawBody,
    )
    return NextResponse.json(
      { error: 'Missing videoId' },
      { status: 400 },
    )
  }

  const supabase = await createClient()

  try {
    // Check for existing asset
    const { data: existing } = await supabase
      .from('assets')
      .select('id')
      .eq('external_id', notification.videoId)
      .single()

    if (existing) {
      // Update existing asset
      await supabase
        .from('assets')
        .update({
          title: notification.title ?? undefined,
          external_url:
            notification.videoUrl ??
            `https://www.youtube.com/watch?v=${notification.videoId}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (existing as { id: string }).id)

      await supabase.from('activity_log').insert({
        actor_id: null,
        action: 'updated' as const,
        entity_type: 'asset',
        entity_id: (existing as { id: string }).id,
        changes: {
          source: 'youtube_webhook',
          video_id: notification.videoId,
        },
        metadata: {},
      })
    } else {
      // Create new asset
      const title = notification.title ?? `YouTube Video ${notification.videoId}`
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 100)

      const insert: AssetInsert = {
        title,
        slug,
        type: 'youtube_video',
        status: 'published',
        pillar: null,
        description: null,
        body: null,
        campaign_id: null,
        parent_asset_id: null,
        creator_id: null,
        assignee_id: null,
        publish_date: notification.published ?? new Date().toISOString(),
        due_date: null,
        external_id: notification.videoId,
        external_url:
          notification.videoUrl ??
          `https://www.youtube.com/watch?v=${notification.videoId}`,
        thumbnail_url: `https://img.youtube.com/vi/${notification.videoId}/maxresdefault.jpg`,
        duration_seconds: null,
        word_count: null,
        metadata: {
          source: 'youtube_webhook',
          channel_id: notification.channelId,
        },
      }

      const { data: newAsset } = await supabase
        .from('assets')
        .insert(insert)
        .select('id')
        .single()

      if (newAsset) {
        const assetId = (newAsset as { id: string }).id

        // Create publication record
        const { data: platform } = await supabase
          .from('platforms')
          .select('id')
          .eq('slug', 'youtube')
          .single()

        if (platform) {
          await supabase.from('publications').insert({
            asset_id: assetId,
            platform_id: (platform as { id: string }).id,
            status: 'published' as const,
            scheduled_at: null,
            published_at: notification.published ?? new Date().toISOString(),
            external_id: notification.videoId,
            external_url:
              notification.videoUrl ??
              `https://www.youtube.com/watch?v=${notification.videoId}`,
            platform_metadata: { channel_id: notification.channelId },
            error_message: null,
          })
        }

        await supabase.from('activity_log').insert({
          actor_id: null,
          action: 'created' as const,
          entity_type: 'asset',
          entity_id: assetId,
          changes: {
            source: 'youtube_webhook',
            video_id: notification.videoId,
          },
          metadata: {},
        })
      }
    }

    return NextResponse.json({
      received: true,
      videoId: notification.videoId,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Webhook processing error'
    console.error('[youtube-webhook] Error:', message)
    await logWebhookFailure('youtube', message, rawBody)

    // Return 200 to prevent hub retries on internal errors
    return NextResponse.json({ received: true, error: message })
  }
}
