/**
 * Low-level Airtable REST API client using native fetch.
 * No npm package dependency -- just plain HTTP against the Airtable REST v0 API.
 *
 * Env vars required:
 *   AIRTABLE_API_KEY  -- Personal access token (pat...)
 *   AIRTABLE_BASE_ID  -- Base ID (app...)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function baseUrl(): string {
  const baseId = getEnv('AIRTABLE_BASE_ID');
  return `https://api.airtable.com/v0/${baseId}`;
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${getEnv('AIRTABLE_API_KEY')}`,
    'Content-Type': 'application/json',
  };
}

// ---------------------------------------------------------------------------
// Field name mapping: snake_case (Airtable) <-> camelCase (TypeScript)
// ---------------------------------------------------------------------------

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/** Convert an Airtable fields object (snake_case keys) to camelCase. */
export function mapFieldsFromAirtable<T extends Record<string, unknown>>(
  fields: Record<string, unknown>,
): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[snakeToCamel(key)] = value;
  }
  return result as T;
}

/** Convert a camelCase object back to snake_case fields for Airtable. */
export function mapFieldsToAirtable(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    result[camelToSnake(key)] = value;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Airtable record shape
// ---------------------------------------------------------------------------

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

class AirtableError extends Error {
  constructor(
    public statusCode: number,
    public errorType: string,
    message: string,
  ) {
    super(`Airtable ${errorType} (${statusCode}): ${message}`);
    this.name = 'AirtableError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = (body as Record<string, Record<string, string>>)?.error ?? {};
    throw new AirtableError(
      response.status,
      error.type ?? 'UNKNOWN',
      error.message ?? response.statusText,
    );
  }
  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Rate limiting -- Airtable allows 5 req/sec. Simple queue.
// ---------------------------------------------------------------------------

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 210; // ~4.7 req/sec with safety margin

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

// ---------------------------------------------------------------------------
// Generic CRUD
// ---------------------------------------------------------------------------

/**
 * List all records from a table, automatically paginating.
 * Returns raw Airtable records -- caller maps to domain types.
 */
export async function listRecords(
  table: string,
  options?: {
    filterByFormula?: string;
    sort?: { field: string; direction?: 'asc' | 'desc' }[];
    fields?: string[];
    maxRecords?: number;
  },
): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    await rateLimit();

    const params = new URLSearchParams();
    if (offset) params.set('offset', offset);
    if (options?.filterByFormula) {
      params.set('filterByFormula', options.filterByFormula);
    }
    if (options?.maxRecords) {
      params.set('maxRecords', String(options.maxRecords));
    }
    if (options?.sort) {
      options.sort.forEach((s, i) => {
        params.set(`sort[${i}][field]`, s.field);
        params.set(`sort[${i}][direction]`, s.direction ?? 'asc');
      });
    }
    if (options?.fields) {
      options.fields.forEach((f) => params.append('fields[]', f));
    }

    const url = `${baseUrl()}/${encodeURIComponent(table)}?${params.toString()}`;
    const response = await fetch(url, { headers: headers(), cache: 'no-store' });
    const data = await handleResponse<AirtableListResponse>(response);

    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

/**
 * Get a single record by Airtable record ID.
 */
export async function getRecord(
  table: string,
  recordId: string,
): Promise<AirtableRecord | null> {
  await rateLimit();

  const url = `${baseUrl()}/${encodeURIComponent(table)}/${recordId}`;
  const response = await fetch(url, { headers: headers(), cache: 'no-store' });

  if (response.status === 404) return null;

  return handleResponse<AirtableRecord>(response);
}

/**
 * Create one or more records. Airtable accepts up to 10 per request.
 * This function batches automatically for larger sets.
 */
export async function createRecords(
  table: string,
  recordsData: Record<string, unknown>[],
): Promise<AirtableRecord[]> {
  const BATCH_SIZE = 10;
  const created: AirtableRecord[] = [];

  for (let i = 0; i < recordsData.length; i += BATCH_SIZE) {
    await rateLimit();

    const batch = recordsData.slice(i, i + BATCH_SIZE);
    const body = {
      records: batch.map((fields) => ({ fields })),
      typecast: true, // allow Airtable to create select options if needed
    };

    const url = `${baseUrl()}/${encodeURIComponent(table)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });

    const data = await handleResponse<{ records: AirtableRecord[] }>(response);
    created.push(...data.records);
  }

  return created;
}

/**
 * Update one or more records (PATCH -- partial update).
 * Batches in groups of 10.
 */
export async function updateRecords(
  table: string,
  updates: { id: string; fields: Record<string, unknown> }[],
): Promise<AirtableRecord[]> {
  const BATCH_SIZE = 10;
  const updated: AirtableRecord[] = [];

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    await rateLimit();

    const batch = updates.slice(i, i + BATCH_SIZE);
    const body = {
      records: batch,
      typecast: true,
    };

    const url = `${baseUrl()}/${encodeURIComponent(table)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(body),
    });

    const data = await handleResponse<{ records: AirtableRecord[] }>(response);
    updated.push(...data.records);
  }

  return updated;
}

/**
 * Delete one or more records. Batches in groups of 10.
 */
export async function deleteRecords(
  table: string,
  recordIds: string[],
): Promise<void> {
  const BATCH_SIZE = 10;

  for (let i = 0; i < recordIds.length; i += BATCH_SIZE) {
    await rateLimit();

    const batch = recordIds.slice(i, i + BATCH_SIZE);
    const params = batch.map((id) => `records[]=${id}`).join('&');
    const url = `${baseUrl()}/${encodeURIComponent(table)}?${params}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers(),
    });

    await handleResponse(response);
  }
}
