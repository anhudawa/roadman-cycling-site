// src/lib/analytics/ga4.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

let client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient | null {
  if (client) return client;
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!credsJson || !propertyId) return null;

  try {
    const credentials = JSON.parse(credsJson);
    client = new BetaAnalyticsDataClient({ credentials });
    return client;
  } catch (e) {
    console.error('[ga4] Failed to init client:', e);
    return null;
  }
}

/**
 * Returns monthly web sessions for the given 'YYYY-MM' month.
 * Returns null if GA4 is not configured or the request fails — callers
 * should render a graceful "—" rather than erroring.
 */
export async function getMonthlyWebSessions(month: string): Promise<number | null> {
  const c = getClient();
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!c || !propertyId) return null;

  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return null;
  const startDate = `${month}-01`;
  const end = new Date(year, m, 0); // last day of month
  const endDate = `${month}-${String(end.getDate()).padStart(2, '0')}`;

  try {
    const [response] = await c.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'sessions' }],
    });
    const raw = response.rows?.[0]?.metricValues?.[0]?.value;
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    console.error('[ga4] runReport failed:', e);
    return null;
  }
}

export interface OrganicSearchTotals {
  sessions: number;
  users: number;
  /** False when GA4 env vars are missing — UI can show a "Not configured" panel. */
  configured: boolean;
}

function fmtDate(d: Date): string {
  // GA4 uses YYYY-MM-DD.
  return d.toISOString().slice(0, 10);
}

/**
 * Sessions + users from the "Organic Search" default channel group between
 * `from` and `to`. Returns { configured: false } when GA4 isn't wired —
 * callers render a graceful "configure GA4" message rather than zeroes.
 */
export async function getOrganicSearchTotals(
  from: Date,
  to: Date,
): Promise<OrganicSearchTotals> {
  const c = getClient();
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!c || !propertyId) {
    return { sessions: 0, users: 0, configured: false };
  }

  try {
    const [response] = await c.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: fmtDate(from), endDate: fmtDate(to) }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
    });
    const row = response.rows?.find(
      (r) => r.dimensionValues?.[0]?.value === 'Organic Search',
    );
    const sessions = parseInt(row?.metricValues?.[0]?.value ?? '0', 10);
    const users = parseInt(row?.metricValues?.[1]?.value ?? '0', 10);
    return { sessions, users, configured: true };
  } catch (e) {
    console.error('[ga4] organic search runReport failed:', e);
    return { sessions: 0, users: 0, configured: true };
  }
}
