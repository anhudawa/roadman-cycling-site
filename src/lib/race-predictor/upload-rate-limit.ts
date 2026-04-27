/**
 * Per-IP rate limit for `POST /api/courses/upload`.
 *
 * The upload endpoint is unauthenticated, accepts a 5 MB GPX body, parses it
 * into points and inserts a row in `courses`. Without throttling a single IP
 * can flood the table or just burn CPU on parsing.
 *
 * Strategy mirrors `src/lib/diagnostic/rate-limit.ts`: a per-instance
 * in-memory bucket. Not shared across Vercel instances — that's fine for the
 * threat model here (slow casual abuse). If we ever need cross-instance
 * limits we'll layer Upstash on top, but the in-memory layer is the floor.
 */

const MAX_HITS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const ipHits = new Map<string, number[]>();

/** Best-effort client IP from standard Vercel headers. */
export function extractIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? null;
}

export type UploadRateLimitVerdict =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/**
 * Check + consume one upload credit for this IP. Returns ok=false (with a
 * retry hint) once the bucket is full. If the request has no extractable IP
 * we still throttle under a shared "unknown" key so a missing header doesn't
 * become an automatic bypass.
 */
export function checkUploadRateLimit(request: Request): UploadRateLimitVerdict {
  const key = extractIp(request) ?? "unknown";
  const now = Date.now();
  const hits = ipHits.get(key) ?? [];
  const fresh = hits.filter((t) => now - t < WINDOW_MS);

  if (fresh.length >= MAX_HITS) {
    const oldest = fresh[0];
    const retryAfter = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    return { ok: false, retryAfterSeconds: Math.max(retryAfter, 1) };
  }

  fresh.push(now);
  ipHits.set(key, fresh);

  // Opportunistic cleanup so the Map doesn't grow without bound on a long-
  // lived warm instance.
  if (Math.random() < 0.05) {
    for (const [k, stamps] of ipHits.entries()) {
      const recent = stamps.filter((t) => now - t < WINDOW_MS);
      if (recent.length === 0) ipHits.delete(k);
      else ipHits.set(k, recent);
    }
  }

  return { ok: true };
}

/** Test-only reset. Module-level Map otherwise bleeds state between cases. */
export function __resetUploadRateLimit(): void {
  ipHits.clear();
}
