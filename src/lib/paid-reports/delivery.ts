/**
 * Resend delivery wrapper for paid reports.
 *
 * A single helper that every delivery code-path (initial send, admin
 * resend, token-expiry re-issue) uses, so the "from" + subject line +
 * Reply-To stay consistent.
 *
 * Retry posture: 4xx errors (auth, validation, attachment too big) are
 * not retried — they will fail the same way next time. 5xx and network
 * errors get up to 2 retries with exponential backoff (300ms → 900ms).
 * Total budget under 1.5 s so the generator stays responsive.
 *
 * On terminal failure the function throws — the generator marks the
 * report failed and notifies admin so a human can resend.
 */

const FROM_ADDRESS = "Roadman Cycling <noreply@roadmancycling.com>";
const REPLY_TO = "anthony@roadmancycling.com";
const RESEND_URL = "https://api.resend.com/emails";

export interface SendReportEmailInput {
  to: string;
  subject: string;
  html: string;
  pdf?: {
    filename: string;
    contentBase64: string;
  };
}

export interface SendReportEmailOptions {
  /** Default 2 (so 3 attempts total: original + 2 retries). */
  maxRetries?: number;
  /** Default 300ms — first delay; doubles each retry. */
  initialBackoffMs?: number;
  /** Hook for tests to short-circuit timer waits. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function sendReportEmail(
  input: SendReportEmailInput,
  options: SendReportEmailOptions = {},
): Promise<{ id: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const body: Record<string, unknown> = {
    from: FROM_ADDRESS,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    reply_to: REPLY_TO,
  };
  if (input.pdf) {
    body.attachments = [
      {
        filename: input.pdf.filename,
        content: input.pdf.contentBase64,
      },
    ];
  }

  const maxRetries = options.maxRetries ?? 2;
  const initialBackoff = options.initialBackoffMs ?? 300;
  const sleep = options.sleep ?? defaultSleep;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(RESEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { id?: string }
          | null;
        return { id: json?.id ?? null };
      }

      const status = res.status;
      const txt = await res.text().catch(() => "");
      const err = new Error(`Resend send failed (${status}): ${txt}`);

      // 4xx (except 429 rate limit) is permanent — retrying will not help.
      if (status >= 400 && status < 500 && status !== 429) {
        throw err;
      }
      lastError = err;
    } catch (err) {
      // Network/abort errors are retryable; explicit 4xx throws above
      // already exited the loop.
      if (err instanceof Error && err.message.startsWith("Resend send failed (4")) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }

    if (attempt < maxRetries) {
      await sleep(initialBackoff * Math.pow(3, attempt));
    }
  }

  throw lastError ?? new Error("Resend send failed after retries");
}
