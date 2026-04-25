/**
 * Client-side analytics event dispatcher. Thin wrapper over
 * `POST /api/events` so individual components don't each re-implement
 * the fetch shim with its own error handling.
 *
 * - Fire-and-forget: never throws, never awaits. Callers don't care.
 * - `keepalive: true` so the request survives if the user navigates
 *   away mid-flight (crucial for final-click events).
 * - No-op on the server (covers accidental import from an RSC).
 */

export interface TrackEventInput {
  type: string;
  page: string;
  sessionId?: string;
  meta?: Record<string, string>;
}

export function trackAnalyticsEvent(input: TrackEventInput): void {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: input.type,
        page: input.page,
        meta: input.meta,
        session_id: input.sessionId,
      }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // swallow $— analytics should never break a user flow
  }
}
