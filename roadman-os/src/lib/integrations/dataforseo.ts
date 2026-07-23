/**
 * DataForSEO API client.
 *
 * Provides search volume, keyword suggestions, SERP overviews,
 * and domain ranking data via the DataForSEO v3 API.
 *
 * Auth: Basic auth with base64-encoded login:password.
 * Credentials are stored per-connection in the platform_connections table.
 *
 * ALL actual API calls are currently STUBBED — see TODO comments.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DATAFORSEO_API_BASE = 'https://api.dataforseo.com/v3'

// ---------------------------------------------------------------------------
// Credential & result types
// ---------------------------------------------------------------------------

export type DataForSEOCredentials = {
  login: string
  password: string
}

export type KeywordVolumeResult = {
  keyword: string
  search_volume: number
  competition: number // 0–1
  cpc: number // in USD cents
  monthly_searches: { year: number; month: number; search_volume: number }[]
}

export type SerpPosition = {
  keyword: string
  position: number | null
  url: string | null
  title: string | null
  checked_at: string
}

// ---------------------------------------------------------------------------
// Result types (mirrors ga4.ts pattern)
// ---------------------------------------------------------------------------

export type DataForSEOApiError = {
  ok: false
  status: number
  message: string
}

type DataForSEOApiSuccess<T> = {
  ok: true
  data: T
}

export type DataForSEOResult<T> = DataForSEOApiSuccess<T> | DataForSEOApiError

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function dataforseoFetch<T>(
  url: string,
  credentials: DataForSEOCredentials,
  body: unknown[],
): Promise<DataForSEOResult<T>> {
  const encoded = btoa(`${credentials.login}:${credentials.password}`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    let message = `DataForSEO API ${response.status}`
    try {
      const parsed = JSON.parse(text) as {
        status_message?: string
      }
      message = parsed.status_message ?? message
    } catch {
      // Use the default message
    }
    return { ok: false, status: response.status, message }
  }

  const data = (await response.json()) as T
  return { ok: true, data }
}

// ---------------------------------------------------------------------------
// getSearchVolume
// ---------------------------------------------------------------------------

/**
 * Fetch search volume, CPC, competition, and 12-month trend for a batch of keywords.
 *
 * POST /keywords_data/google_ads/search_volume/live
 *
 * @param credentials  DataForSEO login + password
 * @param keywords     Array of keywords to look up (max 700 per request)
 * @param locationCode Google Ads location code (default 2826 = United Kingdom)
 * @param languageCode Language code (default "en")
 */
export async function getSearchVolume(
  credentials: DataForSEOCredentials,
  keywords: string[],
  locationCode = 2826,
  languageCode = 'en',
): Promise<DataForSEOResult<KeywordVolumeResult[]>> {
  // TODO: Implement actual DataForSEO API call
  // const url = `${DATAFORSEO_API_BASE}/keywords_data/google_ads/search_volume/live`
  // const payload = [{ keywords, location_code: locationCode, language_code: languageCode }]
  // const result = await dataforseoFetch(url, credentials, payload)
  // Parse result.data.tasks[0].result into KeywordVolumeResult[]

  void credentials
  void keywords
  void locationCode
  void languageCode
  void dataforseoFetch
  void DATAFORSEO_API_BASE

  return { ok: true, data: [] }
}

// ---------------------------------------------------------------------------
// getKeywordSuggestions
// ---------------------------------------------------------------------------

/**
 * Fetch related keyword suggestions for a seed keyword.
 *
 * POST /keywords_data/google_ads/keywords_for_keywords/live
 *
 * @param credentials DataForSEO login + password
 * @param seedKeyword The keyword to find suggestions for
 * @param locationCode Google Ads location code (default 2826 = United Kingdom)
 */
export async function getKeywordSuggestions(
  credentials: DataForSEOCredentials,
  seedKeyword: string,
  locationCode = 2826,
): Promise<DataForSEOResult<KeywordVolumeResult[]>> {
  // TODO: Implement actual DataForSEO API call
  // const url = `${DATAFORSEO_API_BASE}/keywords_data/google_ads/keywords_for_keywords/live`
  // const payload = [{ keywords: [seedKeyword], location_code: locationCode }]
  // const result = await dataforseoFetch(url, credentials, payload)
  // Parse result.data.tasks[0].result into KeywordVolumeResult[]

  void credentials
  void seedKeyword
  void locationCode

  return { ok: true, data: [] }
}

// ---------------------------------------------------------------------------
// getSerpOverview
// ---------------------------------------------------------------------------

/**
 * Fetch live SERP results for a keyword.
 *
 * POST /serp/google/organic/live/regular
 *
 * @param credentials DataForSEO login + password
 * @param keyword     Keyword to search
 * @param locationCode Google Ads location code (default 2826 = United Kingdom)
 */
export async function getSerpOverview(
  credentials: DataForSEOCredentials,
  keyword: string,
  locationCode = 2826,
): Promise<DataForSEOResult<SerpPosition[]>> {
  // TODO: Implement actual DataForSEO API call
  // const url = `${DATAFORSEO_API_BASE}/serp/google/organic/live/regular`
  // const payload = [{ keyword, location_code: locationCode, language_code: 'en', device: 'desktop', os: 'windows' }]
  // const result = await dataforseoFetch(url, credentials, payload)
  // Parse result.data.tasks[0].result[0].items into SerpPosition[]

  void credentials
  void keyword
  void locationCode

  return { ok: true, data: [] }
}

// ---------------------------------------------------------------------------
// getRankingsForDomain
// ---------------------------------------------------------------------------

/**
 * Check where a specific domain ranks for a list of keywords.
 * Performs a SERP lookup per keyword and extracts the domain's position.
 *
 * POST /serp/google/organic/live/regular per keyword, extract domain position.
 *
 * @param credentials DataForSEO login + password
 * @param domain      Domain to check rankings for (e.g. "roadmancycling.com")
 * @param keywords    Keywords to check
 */
export async function getRankingsForDomain(
  credentials: DataForSEOCredentials,
  domain: string,
  keywords: string[],
): Promise<DataForSEOResult<SerpPosition[]>> {
  // TODO: Implement actual DataForSEO API call
  // For each keyword, POST to /serp/google/organic/live/regular
  // Then scan the organic results for items where the domain matches
  // Return SerpPosition[] with the position (or null if not found)

  void credentials
  void domain
  void keywords

  return { ok: true, data: [] }
}
