import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

// Demo profile for when Supabase isn't configured
const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  email: 'anthony@roadmancycling.com',
  full_name: 'Anthony Walsh',
  display_name: 'Anthony',
  role: 'admin',
  avatar_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export async function getCurrentUser() {
  if (isDemoMode()) return { id: 'demo-user', email: 'anthony@roadmancycling.com' }
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (isDemoMode()) return DEMO_PROFILE
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return null
  return profile as Profile
}

export async function requireAuth(): Promise<Profile> {
  if (isDemoMode()) return DEMO_PROFILE
  const profile = await getCurrentProfile()
  if (!profile) {
    throw new Error('Authentication required')
  }
  return profile
}

export async function signOut() {
  if (isDemoMode()) return
  const supabase = await createClient()
  if (!supabase) return
  await supabase.auth.signOut()
}
