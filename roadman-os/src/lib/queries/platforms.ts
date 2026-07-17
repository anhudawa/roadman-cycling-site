import { createClient } from '@/lib/supabase/server'
import type { Platform, PlatformReusePolicy } from '@/types/database'

/**
 * Fetch all platforms ordered by name.
 */
export async function getPlatforms(): Promise<Platform[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .order('name')

  if (error || !data) return []
  return data as unknown as Platform[]
}

/**
 * Fetch a single platform by ID.
 */
export async function getPlatform(id: string): Promise<Platform | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as unknown as Platform
}

/**
 * Fetch only active platforms, ordered by name.
 */
export async function getActivePlatforms(): Promise<Platform[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error || !data) return []
  return data as unknown as Platform[]
}

/**
 * Fetch reuse policies for a given platform.
 */
export async function getReusePolicies(platformId: string): Promise<PlatformReusePolicy[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_reuse_policies')
    .select('*')
    .eq('platform_id', platformId)
    .order('asset_type')

  if (error || !data) return []
  return data as unknown as PlatformReusePolicy[]
}
