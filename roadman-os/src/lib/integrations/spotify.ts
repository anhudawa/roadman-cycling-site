/**
 * Spotify / Podcast integration — RSS feed parsing + Spotify for Podcasters API.
 *
 * Two data sources:
 * 1. RSS Feed (universal) — parse any podcast RSS XML feed for episode metadata
 * 2. Spotify for Podcasters API (optional) — rich analytics when OAuth is connected
 *
 * Falls back gracefully when the Spotify API is unavailable.
 */

// ==========================================================================
// Types
// ==========================================================================

/** A single episode parsed from an RSS feed. */
export type RSSEpisode = {
  title: string
  description: string
  duration: number | null // seconds
  publishDate: string | null // ISO 8601
  guid: string
  enclosureUrl: string | null
  enclosureType: string | null
}

/** Result of parsing a full RSS feed. */
export type RSSFeedResult = {
  podcastTitle: string
  podcastDescription: string
  episodes: RSSEpisode[]
}

/** Spotify episode-level analytics. */
export type SpotifyEpisodeStats = {
  plays: number
  starts: number
  streams: number
  listeners: number
}

/** Spotify podcast-level analytics. */
export type SpotifyPodcastStats = {
  totalPlays: number
  followers: number
  avgConsumptionPercent: number
}

/** Spotify listener demographic breakdown. */
export type SpotifyDemographics = {
  ageBuckets: DemographicBucket[]
  genderBuckets: DemographicBucket[]
  countryBuckets: DemographicBucket[]
}

export type DemographicBucket = {
  label: string
  count: number
  percent: number
}

/** Manual metric input for episodes without API access. */
export type ManualEpisodeMetrics = {
  episodeGuid: string
  downloads: number
  recordedAt: string // ISO 8601
  notes?: string
}

// ==========================================================================
// RSS Feed Parsing
// ==========================================================================

/**
 * Fetch and parse a podcast RSS XML feed.
 *
 * Uses the global `fetch` + a lightweight DOMParser-compatible XML parser
 * built from the response text. In Node.js (Next.js server runtime),
 * we parse with a regex-based approach since DOMParser is browser-only.
 */
export async function parseRSSFeed(feedUrl: string): Promise<RSSFeedResult> {
  const response = await fetch(feedUrl, {
    headers: { 'User-Agent': 'RoadmanOS/1.0 PodcastSync' },
    next: { revalidate: 0 }, // always fresh
  })

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`)
  }

  const xml = await response.text()
  return parseRSSXml(xml)
}

/**
 * Parse raw RSS XML string into structured episode data.
 * Works in Node.js server context without DOM dependencies.
 */
export function parseRSSXml(xml: string): RSSFeedResult {
  const podcastTitle = extractTag(xml, 'title') ?? 'Untitled Podcast'

  // Extract the channel description (first <description> before any <item>)
  const channelEndIdx = xml.indexOf('<item')
  const channelSection = channelEndIdx > -1 ? xml.slice(0, channelEndIdx) : xml
  const podcastDescription = extractTag(channelSection, 'description') ?? ''

  const episodes = parseItems(xml)

  return { podcastTitle, podcastDescription, episodes }
}

/**
 * Extract all <item> elements from RSS XML and parse each one.
 */
function parseItems(xml: string): RSSEpisode[] {
  const episodes: RSSEpisode[] = []
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    episodes.push(parseItem(itemXml))
  }

  return episodes
}

/**
 * Parse a single <item> block into an RSSEpisode.
 */
function parseItem(itemXml: string): RSSEpisode {
  const title = extractTag(itemXml, 'title') ?? 'Untitled Episode'
  const description =
    extractTag(itemXml, 'description') ??
    extractTag(itemXml, 'itunes:summary') ??
    ''

  const rawDuration =
    extractTag(itemXml, 'itunes:duration') ?? null
  const duration = rawDuration ? parseDuration(rawDuration) : null

  const pubDateStr = extractTag(itemXml, 'pubDate') ?? null
  const publishDate = pubDateStr ? parsePublishDate(pubDateStr) : null

  const guid =
    extractTag(itemXml, 'guid') ??
    extractTag(itemXml, 'link') ??
    crypto.randomUUID()

  const enclosure = parseEnclosure(itemXml)

  return {
    title: stripCdata(title),
    description: stripCdata(description),
    duration,
    publishDate,
    guid: stripCdata(guid),
    enclosureUrl: enclosure.url,
    enclosureType: enclosure.type,
  }
}

// ==========================================================================
// RSS XML Helpers
// ==========================================================================

/**
 * Extract the text content of the first occurrence of a tag.
 * Handles both self-closing tags and CDATA sections.
 */
function extractTag(xml: string, tagName: string): string | null {
  // Try namespaced and non-namespaced patterns
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `<${escapedTag}[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`,
    'i',
  )
  const match = regex.exec(xml)
  if (!match) return null
  return match[1].trim()
}

/**
 * Strip CDATA wrappers from a string.
 */
function stripCdata(text: string): string {
  return text
    .replace(/^\s*<!\[CDATA\[/i, '')
    .replace(/\]\]>\s*$/i, '')
    .trim()
}

/**
 * Parse the <enclosure> self-closing tag for url and type attributes.
 */
function parseEnclosure(itemXml: string): { url: string | null; type: string | null } {
  const enclosureRegex = /<enclosure\s+([^>]*?)\/?>/i
  const match = enclosureRegex.exec(itemXml)
  if (!match) return { url: null, type: null }

  const attrs = match[1]

  const urlMatch = /url=["']([^"']+)["']/i.exec(attrs)
  const typeMatch = /type=["']([^"']+)["']/i.exec(attrs)

  return {
    url: urlMatch ? urlMatch[1] : null,
    type: typeMatch ? typeMatch[1] : null,
  }
}

/**
 * Parse podcast duration strings into seconds.
 *
 * Supported formats:
 * - "HH:MM:SS" (e.g. "1:23:45")
 * - "MM:SS"    (e.g. "45:30")
 * - Raw seconds as string (e.g. "3600")
 */
export function parseDuration(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Raw seconds (no colons)
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10)
  }

  const parts = trimmed.split(':').map((p) => parseInt(p, 10))

  // Validate all parts are numbers
  if (parts.some((p) => isNaN(p))) return null

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  }

  return null
}

/**
 * Parse an RSS pubDate string into an ISO 8601 date string.
 */
function parsePublishDate(pubDate: string): string | null {
  const date = new Date(pubDate)
  if (isNaN(date.getTime())) return null
  return date.toISOString()
}

// ==========================================================================
// Spotify for Podcasters API
// ==========================================================================

const SPOTIFY_PODCASTERS_BASE = 'https://generic.wg.spotify.com/podcasters/v2'

/**
 * Fetch episode-level analytics from Spotify for Podcasters.
 */
export async function getEpisodeStats(
  accessToken: string,
  showId: string,
  episodeId: string,
): Promise<SpotifyEpisodeStats | null> {
  const url = `${SPOTIFY_PODCASTERS_BASE}/shows/${showId}/episodes/${episodeId}/stats`

  const data = await spotifyFetch<{
    plays?: number
    starts?: number
    streams?: number
    listeners?: number
  }>(url, accessToken)

  if (!data) return null

  return {
    plays: data.plays ?? 0,
    starts: data.starts ?? 0,
    streams: data.streams ?? 0,
    listeners: data.listeners ?? 0,
  }
}

/**
 * Fetch podcast-level analytics from Spotify for Podcasters.
 */
export async function getPodcastStats(
  accessToken: string,
  showId: string,
): Promise<SpotifyPodcastStats | null> {
  const url = `${SPOTIFY_PODCASTERS_BASE}/shows/${showId}/stats`

  const data = await spotifyFetch<{
    totalPlays?: number
    followers?: number
    avgConsumptionPercent?: number
  }>(url, accessToken)

  if (!data) return null

  return {
    totalPlays: data.totalPlays ?? 0,
    followers: data.followers ?? 0,
    avgConsumptionPercent: data.avgConsumptionPercent ?? 0,
  }
}

/**
 * Fetch listener demographics from Spotify for Podcasters.
 */
export async function getListenerDemographics(
  accessToken: string,
  showId: string,
): Promise<SpotifyDemographics | null> {
  const url = `${SPOTIFY_PODCASTERS_BASE}/shows/${showId}/demographics`

  const data = await spotifyFetch<{
    ageBuckets?: DemographicBucket[]
    genderBuckets?: DemographicBucket[]
    countryBuckets?: DemographicBucket[]
  }>(url, accessToken)

  if (!data) return null

  return {
    ageBuckets: data.ageBuckets ?? [],
    genderBuckets: data.genderBuckets ?? [],
    countryBuckets: data.countryBuckets ?? [],
  }
}

// ==========================================================================
// Spotify API Helpers
// ==========================================================================

/**
 * Generic authenticated GET request to the Spotify for Podcasters API.
 * Returns null on any error for graceful fallback.
 */
async function spotifyFetch<T>(url: string, accessToken: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      console.error(
        `Spotify API error: ${response.status} ${response.statusText} for ${url}`,
      )
      return null
    }

    return (await response.json()) as T
  } catch (error) {
    console.error('Spotify API request failed:', error)
    return null
  }
}

// ==========================================================================
// Slug Generation
// ==========================================================================

/**
 * Generate a URL-safe slug from a title string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}
