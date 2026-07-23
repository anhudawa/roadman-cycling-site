/**
 * Shared webhook utilities — signature validation and failure logging.
 */

import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import type { MetricSource } from '@/types/database'

// ==========================================================================
// HMAC-SHA1 signature validation (used by YouTube PubSubHubbub)
// ==========================================================================

/**
 * Validate an HMAC-SHA1 hub signature.
 *
 * YouTube PubSubHubbub sends a signature in the `X-Hub-Signature` header
 * in the format `sha1=<hex_digest>`.
 *
 * @param body - The raw request body as a string
 * @param signature - The `X-Hub-Signature` header value (e.g. `sha1=abc123`)
 * @param secret - The hub secret used when subscribing
 * @returns true if the signature is valid
 */
export function validateHubSignature(
  body: string,
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!secret) {
    // No secret configured — skip validation but log a warning
    console.warn('[webhook-utils] No hub secret configured, skipping signature validation')
    return true
  }

  if (!signature) {
    return false
  }

  // Parse the algorithm and digest from the header
  const parts = signature.split('=')
  if (parts.length !== 2) return false

  const algorithm = parts[0] // 'sha1'
  const digest = parts[1]

  if (algorithm !== 'sha1') {
    console.warn(`[webhook-utils] Unexpected signature algorithm: ${algorithm}`)
    return false
  }

  const expected = crypto
    .createHmac('sha1', secret)
    .update(body)
    .digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(expected, 'hex'),
    )
  } catch {
    return false
  }
}

// ==========================================================================
// HMAC-SHA256 signature validation (used by Beehiiv)
// ==========================================================================

/**
 * Validate an HMAC-SHA256 signature.
 * Used by Beehiiv webhooks.
 */
export function validateSha256Signature(
  body: string,
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!secret) return true // No secret = skip validation
  if (!signature) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    )
  } catch {
    return false
  }
}

// ==========================================================================
// Webhook failure logging
// ==========================================================================

/**
 * Log a webhook processing failure as a failed sync_job.
 *
 * This creates a record in the sync_jobs table so webhook failures
 * appear alongside sync failures in the monitoring dashboard.
 *
 * @param platform - The metric source (e.g. 'youtube', 'beehiiv')
 * @param error - The error message
 * @param payload - The webhook payload (truncated for storage)
 */
export async function logWebhookFailure(
  platform: MetricSource,
  error: string,
  payload: unknown,
): Promise<void> {
  const supabase = await createClient()

  const truncatedPayload =
    typeof payload === 'string'
      ? payload.slice(0, 2000)
      : JSON.stringify(payload).slice(0, 2000)

  await supabase.from('sync_jobs').insert({
    connection_id: null,
    source: platform,
    status: 'failed',
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    records_synced: 0,
    error_message: error,
    metadata: {
      type: 'webhook',
      payload_preview: truncatedPayload,
    },
  })
}
