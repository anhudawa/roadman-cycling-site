import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { buildAuthUrl } from '@/lib/utils/oauth'

/**
 * Initiate OAuth2 flow for a platform.
 * GET /api/auth/[platform]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params

  const validPlatforms = ['youtube', 'meta', 'linkedin', 'spotify', 'tiktok', 'twitter', 'gsc']
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json(
      { error: `Unknown platform: ${platform}` },
      { status: 400 },
    )
  }

  // Generate CSRF state token
  const state = randomBytes(32).toString('hex')

  // Store state in cookie for validation on callback
  const cookieStore = await cookies()
  cookieStore.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  const authUrl = buildAuthUrl(platform, state)
  if (!authUrl) {
    return NextResponse.json(
      { error: 'OAuth not configured for this platform' },
      { status: 500 },
    )
  }

  return NextResponse.redirect(authUrl)
}
