import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { exchangeCodeForTokens, getOAuthConfig } from '@/lib/utils/oauth'
import type { PlatformConnectionInsert } from '@/types/database'

/**
 * OAuth2 callback handler.
 * GET /api/auth/[platform]/callback?code=...&state=...
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  // Handle OAuth errors
  if (errorParam) {
    const desc = searchParams.get('error_description') || errorParam
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${encodeURIComponent(desc)}`,
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${encodeURIComponent('Missing code or state')}`,
    )
  }

  // Validate CSRF state
  const cookieStore = await cookies()
  const storedState = cookieStore.get(`oauth_state_${platform}`)?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${encodeURIComponent('Invalid state parameter')}`,
    )
  }

  // Clear the state cookie
  cookieStore.set(`oauth_state_${platform}`, '', { maxAge: 0, path: '/' })

  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(platform, code)
  if (!tokens) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${encodeURIComponent('Token exchange failed')}`,
    )
  }

  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    )
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${encodeURIComponent('Profile not found')}`,
    )
  }

  // Find the platform
  const { data: platformRecord } = await supabase
    .from('platforms')
    .select('id')
    .eq('slug', platform)
    .single()

  if (!platformRecord) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=${encodeURIComponent('Platform not configured')}`,
    )
  }

  const config = getOAuthConfig(platform)
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null

  // Check for existing connection
  const { data: existing } = await supabase
    .from('platform_connections')
    .select('id')
    .eq('platform_id', platformRecord.id)
    .eq('profile_id', profile.id)
    .single()

  if (existing) {
    // Update existing connection
    await supabase
      .from('platform_connections')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        scopes: config?.scopes ?? null,
        is_active: true,
        metadata: {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    // Create new connection
    const insert: PlatformConnectionInsert = {
      platform_id: platformRecord.id,
      profile_id: profile.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
      account_id: null,
      account_name: null,
      scopes: config?.scopes ?? null,
      is_active: true,
      last_synced_at: null,
      metadata: {},
    }

    await supabase.from('platform_connections').insert(insert)
  }

  // Log activity
  await supabase.from('activity_log').insert({
    actor_id: profile.id,
    action: 'created' as const,
    entity_type: 'platform_connection',
    entity_id: existing?.id ?? platformRecord.id,
    changes: {},
    metadata: { platform },
  })

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?connected=${platform}`,
  )
}
