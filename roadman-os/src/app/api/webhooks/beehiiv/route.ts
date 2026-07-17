import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import type { AssetInsert } from '@/types/database'

// ─── Webhook payload types ──────────────────────────────────────────────────

type BeehiivWebhookEvent =
  | BeehiivPostPublishedEvent
  | BeehiivSubscriberCreatedEvent
  | BeehiivSubscriberRemovedEvent

type BeehiivPostPublishedEvent = {
  type: 'post.published'
  created_at: number
  data: {
    id: string
    title: string
    subtitle: string | null
    slug: string
    web_url: string | null
    thumbnail_url: string | null
    publish_date: number | null
    content_tags: string[]
    authors: string[]
  }
}

type BeehiivSubscriberCreatedEvent = {
  type: 'subscriber.created'
  created_at: number
  data: {
    id: string
    email: string
    status: string
    created_at: number
    utm_source: string | null
    utm_medium: string | null
    utm_campaign: string | null
  }
}

type BeehiivSubscriberRemovedEvent = {
  type: 'subscriber.removed'
  created_at: number
  data: {
    id: string
    email: string
    status: string
    unsubscribed_at: number | null
  }
}

// ─── Signature verification ─────────────────────────────────────────────────

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || !signature) {
    // If no secret is configured, skip verification but log a warning
    return !secret
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  )
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handlePostPublished(
  event: BeehiivPostPublishedEvent,
): Promise<void> {
  const supabase = await createClient()
  const post = event.data

  // Check for existing asset with this external ID
  const { data: existing } = await supabase
    .from('assets')
    .select('id')
    .eq('external_id', post.id)
    .single()

  const publishDate = post.publish_date
    ? new Date(post.publish_date * 1000).toISOString()
    : new Date().toISOString()

  if (existing) {
    // Update the existing asset
    await supabase
      .from('assets')
      .update({
        title: post.title,
        status: 'published',
        external_url: post.web_url,
        thumbnail_url: post.thumbnail_url,
        publish_date: publishDate,
        metadata: {
          beehiiv_slug: post.slug,
          subtitle: post.subtitle,
          content_tags: post.content_tags,
          authors: post.authors,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    // Log the update
    await supabase.from('activity_log').insert({
      actor_id: null,
      action: 'updated' as const,
      entity_type: 'asset',
      entity_id: existing.id,
      changes: { source: 'beehiiv_webhook', event: 'post.published' },
      metadata: {},
    })
  } else {
    // Create a new asset
    const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const insert: AssetInsert = {
      title: post.title,
      slug,
      type: 'newsletter',
      status: 'published',
      pillar: null,
      description: post.subtitle,
      body: null,
      campaign_id: null,
      parent_asset_id: null,
      creator_id: null,
      assignee_id: null,
      publish_date: publishDate,
      due_date: null,
      external_id: post.id,
      external_url: post.web_url,
      thumbnail_url: post.thumbnail_url,
      duration_seconds: null,
      word_count: null,
      metadata: {
        beehiiv_slug: post.slug,
        subtitle: post.subtitle,
        content_tags: post.content_tags,
        authors: post.authors,
      },
    }

    const { data: newAsset } = await supabase
      .from('assets')
      .insert(insert)
      .select('id')
      .single()

    if (newAsset) {
      await supabase.from('activity_log').insert({
        actor_id: null,
        action: 'created' as const,
        entity_type: 'asset',
        entity_id: newAsset.id,
        changes: { source: 'beehiiv_webhook', event: 'post.published' },
        metadata: {},
      })
    }
  }
}

async function handleSubscriberCreated(
  event: BeehiivSubscriberCreatedEvent,
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('activity_log').insert({
    actor_id: null,
    action: 'created' as const,
    entity_type: 'subscriber',
    entity_id: event.data.id,
    changes: {
      source: 'beehiiv_webhook',
      event: 'subscriber.created',
      status: event.data.status,
      utm_source: event.data.utm_source,
      utm_medium: event.data.utm_medium,
      utm_campaign: event.data.utm_campaign,
    },
    metadata: {},
  })
}

async function handleSubscriberRemoved(
  event: BeehiivSubscriberRemovedEvent,
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('activity_log').insert({
    actor_id: null,
    action: 'updated' as const,
    entity_type: 'subscriber',
    entity_id: event.data.id,
    changes: {
      source: 'beehiiv_webhook',
      event: 'subscriber.removed',
      status: event.data.status,
    },
    metadata: {},
  })
}

// ─── Route handler ──────────────────────────────────────────────────────────

/**
 * POST /api/webhooks/beehiiv
 *
 * Receives webhook events from Beehiiv.
 * Handles: post.published, subscriber.created, subscriber.removed
 */
export async function POST(request: Request) {
  const rawBody = await request.text()

  // Verify signature if a webhook secret is configured
  const signature = request.headers.get('x-beehiiv-signature')
  const webhookSecret = process.env.BEEHIIV_WEBHOOK_SECRET

  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 },
    )
  }

  let event: BeehiivWebhookEvent
  try {
    event = JSON.parse(rawBody) as BeehiivWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'post.published':
        await handlePostPublished(event)
        break

      case 'subscriber.created':
        await handleSubscriberCreated(event)
        break

      case 'subscriber.removed':
        await handleSubscriberRemoved(event)
        break

      default: {
        // Unknown event type — acknowledge to avoid retries
        const unknownType = (event as { type: string }).type
        return NextResponse.json({
          received: true,
          skipped: true,
          event_type: unknownType,
        })
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing error'
    // Return 200 to prevent Beehiiv from retrying on internal errors.
    // The error is logged server-side.
    console.error(`[beehiiv webhook] Error processing ${event.type}:`, message)
    return NextResponse.json({ received: true, error: message })
  }

  return NextResponse.json({ received: true, event_type: event.type })
}
