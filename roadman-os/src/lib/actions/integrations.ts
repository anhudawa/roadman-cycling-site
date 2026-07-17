'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/utils/auth'
import { logActivity } from '@/lib/utils/activity'
import { apiKeyConnectionSchema } from '@/lib/schemas/integrations'
import type { PlatformConnectionInsert } from '@/types/database'

type ActionResult = {
  success: boolean
  data?: { id: string }
  error?: string
}

/**
 * Save an API key connection (for Beehiiv, GA4, etc.).
 */
export async function saveApiKeyConnection(formData: FormData): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const raw: Record<string, unknown> = {}
    for (const [key, value] of formData.entries()) {
      raw[key] = value
    }

    const parsed = apiKeyConnectionSchema.safeParse(raw)
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const values = parsed.data

    // Find or create the platform
    const { data: platform } = await supabase
      .from('platforms')
      .select('id')
      .eq('slug', values.platform_slug)
      .single()

    if (!platform) {
      return { success: false, error: 'Platform not found' }
    }

    // Check for existing connection
    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id')
      .eq('platform_id', platform.id)
      .eq('profile_id', profile.id)
      .single()

    if (existing) {
      // Update existing connection
      const { error } = await supabase
        .from('platform_connections')
        .update({
          access_token: values.api_key,
          account_name: values.account_name || null,
          is_active: true,
          metadata: {
            publication_id: values.publication_id || null,
            property_id: values.property_id || null,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) {
        return { success: false, error: error.message }
      }

      await logActivity(supabase, {
        actor_id: profile.id,
        action: 'updated',
        entity_type: 'platform_connection',
        entity_id: existing.id,
        changes: { api_key: { from: '***', to: '***' } },
      })

      revalidatePath('/settings/integrations')
      return { success: true, data: { id: existing.id } }
    }

    // Create new connection
    const insert: PlatformConnectionInsert = {
      platform_id: platform.id,
      profile_id: profile.id,
      access_token: values.api_key,
      refresh_token: null,
      token_expires_at: null,
      account_id: null,
      account_name: values.account_name || null,
      scopes: null,
      is_active: true,
      last_synced_at: null,
      metadata: {
        publication_id: values.publication_id || null,
        property_id: values.property_id || null,
      },
    }

    const { data, error } = await supabase
      .from('platform_connections')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'platform_connection',
      entity_id: data.id,
    })

    revalidatePath('/settings/integrations')
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Disconnect a platform connection (soft delete — sets is_active = false).
 */
export async function disconnectPlatform(connectionId: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('platform_connections')
      .select('id, is_active')
      .eq('id', connectionId)
      .single()

    if (!existing) {
      return { success: false, error: 'Connection not found' }
    }

    const { error } = await supabase
      .from('platform_connections')
      .update({
        is_active: false,
        access_token: null,
        refresh_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId)

    if (error) {
      return { success: false, error: error.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'updated',
      entity_type: 'platform_connection',
      entity_id: connectionId,
      changes: { is_active: { from: true, to: false } },
    })

    revalidatePath('/settings/integrations')
    return { success: true, data: { id: connectionId } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Trigger a manual sync for a platform connection.
 */
export async function triggerSync(connectionId: string): Promise<ActionResult> {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const { data: connection } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (!connection) {
      return { success: false, error: 'Connection not found' }
    }

    if (!connection.is_active) {
      return { success: false, error: 'Connection is not active' }
    }

    // Find the platform slug for routing
    const { data: platform } = await supabase
      .from('platforms')
      .select('slug')
      .eq('id', connection.platform_id)
      .single()

    if (!platform) {
      return { success: false, error: 'Platform not found' }
    }

    // Create a sync job record
    const { data: syncJob, error: syncError } = await supabase
      .from('sync_jobs')
      .insert({
        connection_id: connectionId,
        source: platform.slug as 'youtube' | 'instagram' | 'facebook' | 'linkedin' | 'spotify' | 'beehiiv' | 'ga4' | 'skool' | 'manual' | 'apple_podcasts' | 'tiktok' | 'twitter_x' | 'website',
        status: 'pending',
        started_at: null,
        completed_at: null,
        records_synced: 0,
        error_message: null,
        metadata: {},
      })
      .select('id')
      .single()

    if (syncError) {
      return { success: false, error: syncError.message }
    }

    await logActivity(supabase, {
      actor_id: profile.id,
      action: 'created',
      entity_type: 'sync_job',
      entity_id: syncJob.id,
    })

    // Trigger the sync endpoint (fire-and-forget)
    const syncUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/sync/${platform.slug}`
    fetch(syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connection_id: connectionId,
        sync_job_id: syncJob.id,
      }),
    }).catch(() => {
      // Fire-and-forget — errors handled by the sync endpoint
    })

    revalidatePath('/settings/integrations')
    return { success: true, data: { id: syncJob.id } }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    }
  }
}
