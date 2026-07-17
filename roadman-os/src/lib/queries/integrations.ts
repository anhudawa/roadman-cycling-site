import { createClient } from '@/lib/supabase/server'
import type { PlatformConnection, SyncJob } from '@/types/database'

/**
 * Fetch all platform connections for the current user.
 */
export async function getConnections(): Promise<PlatformConnection[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as unknown as PlatformConnection[]
}

/**
 * Fetch a single platform connection by ID.
 */
export async function getConnection(id: string): Promise<PlatformConnection | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as PlatformConnection
}

/**
 * Fetch a connection by platform slug.
 */
export async function getConnectionByPlatform(
  platformSlug: string,
): Promise<PlatformConnection | null> {
  const supabase = await createClient()

  // First find the platform by slug
  const { data: platform } = await supabase
    .from('platforms')
    .select('id')
    .eq('slug', platformSlug)
    .single()

  if (!platform) return null

  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('platform_id', platform.id)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as unknown as PlatformConnection
}

/**
 * Determine the connection status for display purposes.
 */
export function getConnectionStatus(
  connection: PlatformConnection | null,
): 'connected' | 'disconnected' | 'error' | 'expired' {
  if (!connection || !connection.is_active) return 'disconnected'

  // Check if token is expired
  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at)
    if (expiresAt.getTime() < Date.now()) {
      // Expired but has refresh token — show as connected (auto-refresh)
      if (connection.refresh_token) return 'connected'
      return 'expired'
    }
  }

  // Check metadata for error state
  const meta = connection.metadata as Record<string, unknown>
  if (meta?.last_error) return 'error'

  return 'connected'
}

/**
 * Determine sync freshness status based on last_synced_at.
 */
export function getSyncFreshness(
  lastSyncedAt: string | null,
): 'fresh' | 'stale' | 'critical' | 'never' {
  if (!lastSyncedAt) return 'never'

  const syncedAt = new Date(lastSyncedAt)
  const hoursAgo = (Date.now() - syncedAt.getTime()) / (1000 * 60 * 60)

  if (hoursAgo < 24) return 'fresh'
  if (hoursAgo < 72) return 'stale'
  return 'critical'
}

/**
 * Fetch recent sync jobs for a connection.
 */
export async function getRecentSyncJobs(
  connectionId: string,
  limit = 5,
): Promise<SyncJob[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sync_jobs')
    .select('*')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return data as unknown as SyncJob[]
}
