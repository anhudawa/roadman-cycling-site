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
