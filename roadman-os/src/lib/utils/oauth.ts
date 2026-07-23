import { createClient } from '@/lib/supabase/server'
import type { PlatformConnection } from '@/types/database'

/** Platform-specific OAuth2 configuration. */
type OAuthConfig = {
  clientId: string
  clientSecret: string
  tokenUrl: string
  authUrl: string
  scopes: string[]
}

const PLATFORM_OAUTH_CONFIG: Record<string, () => OAuthConfig> = {
  youtube: () => ({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    tokenUrl: 'https://oauth2.googleapis.com/token',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
    ],
  }),
  meta: () => ({
    clientId: process.env.META_APP_ID!,
    clientSecret: process.env.META_APP_SECRET!,
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    scopes: [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_read_engagement',
      'pages_show_list',
      'read_insights',
    ],
  }),
  linkedin: () => ({
    clientId: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: ['r_organization_social', 'rw_organization_admin'],
  }),
  spotify: () => ({
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    tokenUrl: 'https://accounts.spotify.com/api/token',
    authUrl: 'https://accounts.spotify.com/authorize',
    scopes: ['user-read-playback-position', 'user-read-email'],
  }),
  // TODO: Add GSC OAuth config when credentials are available
  // gsc: () => ({
  //   clientId: process.env.GOOGLE_CLIENT_ID!,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   tokenUrl: 'https://oauth2.googleapis.com/token',
  //   authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  //   scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  // }),
}

/**
 * Get OAuth configuration for a platform.
 */
export function getOAuthConfig(platform: string): OAuthConfig | null {
  const factory = PLATFORM_OAUTH_CONFIG[platform]
  if (!factory) return null
  return factory()
}

/**
 * Build the OAuth2 authorization URL for a platform.
 */
export function buildAuthUrl(platform: string, state: string): string | null {
  const config = getOAuthConfig(platform)
  if (!config) return null

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${platform}/callback`

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${config.authUrl}?${params.toString()}`
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCodeForTokens(
  platform: string,
  code: string,
): Promise<{
  access_token: string
  refresh_token: string | null
  expires_in: number | null
} | null> {
  const config = getOAuthConfig(platform)
  if (!config) return null

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${platform}/callback`

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) return null

  const data = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? null,
    expires_in: data.expires_in ?? null,
  }
}

/**
 * Refresh an expired access token using the refresh token.
 */
export async function refreshAccessToken(
  platform: string,
  refreshToken: string,
): Promise<{
  access_token: string
  refresh_token: string | null
  expires_in: number | null
} | null> {
  const config = getOAuthConfig(platform)
  if (!config) return null

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) return null

  const data = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_in: data.expires_in ?? null,
  }
}

/**
 * Get a valid access token for a platform connection, refreshing if needed.
 */
export async function getValidToken(
  connection: PlatformConnection,
  platformSlug: string,
): Promise<string | null> {
  if (!connection.access_token) return null

  // Check if token is expired (with 5-minute buffer)
  if (connection.token_expires_at) {
    const expiresAt = new Date(connection.token_expires_at)
    const buffer = 5 * 60 * 1000 // 5 minutes
    if (expiresAt.getTime() - buffer < Date.now()) {
      // Token is expired or about to expire — refresh it
      if (!connection.refresh_token) return null

      const refreshed = await refreshAccessToken(platformSlug, connection.refresh_token)
      if (!refreshed) return null

      // Update the stored tokens
      const supabase = await createClient()
      const expiresAtStr = refreshed.expires_in
        ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
        : null

      await supabase
        .from('platform_connections')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token ?? connection.refresh_token,
          token_expires_at: expiresAtStr,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id)

      return refreshed.access_token
    }
  }

  return connection.access_token
}
