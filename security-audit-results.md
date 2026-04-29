# Security Audit — Roadman Cycling Site

**Date:** 2026-04-28
**Branch:** `claude/security-audit` (off `origin/main`)
**Scope:** Full Next.js 16 app — `src/`, `next.config.ts`, dependencies.

## TL;DR

- **Critical:** 0
- **High:** 4 categories — all fixed in this branch
- **Medium:** 4 — 1 fixed, 3 deferred with rationale
- **Low / Info:** several — partially addressed

The codebase already has solid foundations (next-auth v5 + a custom HMAC admin session, bcrypt cost 12, Stripe/Resend webhook signature verification, Zod input schemas on the AI endpoints, Upstash rate limits on `/api/ask` and `/api/predict`, parameterised Drizzle queries throughout, escapeHtml on email rendering, `httpOnly` + `sameSite=lax` admin cookie). The fixes below close the remaining gaps that real-world automated abuse would find first.

## Methodology

1. `npm audit --json` for dependency CVEs.
2. Three parallel `Explore` subagents reviewing in depth:
   - secrets / env-var handling / XSS / SQL & command injection
   - every `route.ts` under `src/app/api/` for input validation, rate limiting, error handling, CORS, SSRF, IDOR
   - auth implementation, security headers, middleware, cookie flags
3. Manual verification of every flagged finding against the actual code at the cited line numbers — agents are useful but not authoritative.

## Findings & fixes

### 1. Dependency audit — `npm audit`

**Result:** 4 moderate vulnerabilities, 0 high, 0 critical.

All four roll up to a single root cause: `drizzle-kit 0.31.10` pulls a transitive `@esbuild-kit/*` chain that ships an old `esbuild` (≤ 0.24.2) affected by [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) — the esbuild dev server allows any website to make CORS requests to it.

**Severity in our context: LOW (not fixed in this audit).**
- `drizzle-kit` is a **dev-only** CLI used for migrations (`db:generate`, `db:migrate`, `db:push`, `db:studio`). It is never on the production runtime path.
- The CVE only matters if the esbuild dev server is exposed to a malicious page in your browser; we don't run that server in production, and `drizzle-kit` doesn't spin one up during the migration commands we use.
- npm's suggested "fix" (downgrade to drizzle-kit 0.18.1) is a major **regression** that would lose features we use.

**Recommended action:** monitor for a drizzle-kit release that drops the `@esbuild-kit/*` dependency, then upgrade. Track [drizzle-team/drizzle-orm#1947](https://github.com/drizzle-team/drizzle-orm/issues/1947).

### 2. Hardcoded secrets / env handling — clean ✓

- No hardcoded production credentials. The only secret-shaped strings in the repo are `sk-ant-test` test fixtures in `tests/citation-tests/providers/anthropic.test.ts` (false positive).
- All env access goes through `process.env.X`, never literals.
- `.env*` files are gitignored (line 43 of `.gitignore`); only `.env.example` is committed.
- `NEXT_PUBLIC_*` env vars are all genuinely public (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SITE_URL`, etc.).
- `next.config.ts` has no `env:` block inlining sensitive values into the client bundle.
- Admin Skool integrations check env-var presence in a server component (no `"use client"`) — safe.

**No fix required.**

### 3. API route security

#### HIGH — Timing-attack on `Bearer ${CRON_SECRET}` comparison [FIXED]

**17 endpoints** were comparing the `Authorization` header against `Bearer ${CRON_SECRET}` with plain `===`. JavaScript string equality short-circuits on the first byte mismatch, so an attacker with enough samples can recover `CRON_SECRET` byte-by-byte.

**Fix:** new helper `src/lib/security/bearer.ts` wrapping `crypto.timingSafeEqual()`. Every endpoint now uses `verifyBearer(authHeader, cronSecret)`.

Endpoints patched:
- `src/app/api/cron/sponsor-alerts/route.ts`
- `src/app/api/cron/stripe-snapshot/route.ts`
- `src/app/api/cron/sync-all/route.ts`
- `src/app/api/cron/score-all/route.ts`
- `src/app/api/cron/daily-digest/route.ts`
- `src/app/api/cron/weekly-digest/route.ts`
- `src/app/api/cron/diagnostic-digest/route.ts`
- `src/app/api/cron/ted-heartbeat/route.ts`
- `src/app/api/cron/ted-weekly-digest/route.ts`
- `src/app/api/cron/beehiiv-snapshot/route.ts`
- `src/app/api/cron/complete-past-bookings/route.ts`
- `src/app/api/cron/brand-citations/route.ts`
- `src/app/api/admin/sync/beehiiv/route.ts`
- `src/app/api/admin/sync/stripe/route.ts`
- `src/app/api/admin/agent/weekly-analysis/route.ts`
- `src/app/api/admin/experiments/route.ts`
- `src/app/api/admin/ted/health/route.ts`

The agent originally flagged 2 of these; manual sweep found the remaining 15.

#### HIGH — Stripe checkout error leakage + open-redirect risk [FIXED]

`src/app/api/checkout/route.ts`:

1. **Error leakage** — the `catch` returned `error.message` from the Stripe SDK directly to the client. That can include internal SDK state, partial config details, network errors with internal hostnames. **Fix:** log the full error server-side, return a generic `"Checkout could not be created. Please try again or contact support."` message.

2. **Open-redirect via `successUrl` / `cancelUrl`** — the user-supplied `successUrl` and `cancelUrl` were passed straight to Stripe with only a default fallback. Stripe does some host validation, but defence-in-depth: if an attacker phishes a user via a crafted POST to our `/api/checkout`, they could choose where Stripe redirects after payment. **Fix:** new `safeRedirectUrl()` that requires the URL to parse, use `https://` (or `http://localhost`), and have a hostname in `ALLOWED_REDIRECT_HOSTS` (`roadmancycling.com`, `www.roadmancycling.com`, `coaching.roadmancycling.com`, `localhost`). Anything else falls through to the safe default.

#### HIGH — Missing rate limits on email-sending public endpoints [FIXED]

`/api/contact`, `/api/newsletter`, and `/api/lead-magnets` all accepted unlimited unauthenticated POSTs. Each request triggered:
- `/api/contact`: a Resend email to anthony@, plus a DB insert + CRM upsert + Beehiiv subscribe;
- `/api/newsletter`: Beehiiv subscribe (paid external API per request) + DB write;
- `/api/lead-magnets`: same as newsletter, plus an additional CRM activity row.

Concrete abuse vector: an attacker scripts ~1 RPS and floods Anthony's inbox / blows through the Beehiiv plan / fills the CRM with junk in minutes.

**Fix:** new shared helper `src/lib/rate-limit/ip-rate-limit.ts` wrapping Upstash sliding-window the same way `lib/ask/rate-limit.ts` already does. Applied with conservative buckets:
- `/api/contact` — 5 / 10 min per IP
- `/api/newsletter` — 10 / 10 min per IP
- `/api/lead-magnets` — 10 / 10 min per IP

In dev (no Upstash creds set), the helper passes-through with a comment. In production (Upstash already configured for `/api/ask`), the limits enforce.

The other email-touching endpoints (`/api/diagnostic/submit`, `/api/results/request-link`, `/api/cohort/apply`, `/api/sponsor/apply`, `/api/tools/report`, `/api/webhooks/resend`) were reviewed and either gated by a separate auth/secret, or low-throughput one-off entry points whose abuse cost is bounded by other guards. Adding rate limits to them is a recommended follow-up — see "Deferred" below.

### 4. Security headers

The repo had `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a strong HSTS (`max-age=63072000; includeSubDomains; preload`) on every non-`/embed` route. `/embed/*` correctly opts into framing via `frame-ancestors *`. Cache-Control is `no-store` on admin export / health routes.

#### HIGH — Missing Content-Security-Policy [FIXED — Report-Only]

No CSP was set on non-embed routes. Added in `next.config.ts`:
- **`Content-Security-Policy-Report-Only`** with a tight allowlist (Stripe, GA, GTM, Vercel Analytics, Beehiiv embeds, YouTube/Spotify embeds, Vercel Blob storage, Upstash, Google Fonts).
- Shipped in **Report-Only** rather than enforcing because `framer-motion` and `recharts` rely on inline `style=` attributes and Next.js emits a small inline bootstrap `<script>` before nonces are wired up. A blocking CSP today would break the home page. Once we collect a few days of violation reports we can switch the header key to `Content-Security-Policy` and remove the `-Report-Only` suffix.

#### LOW — Missing Permissions-Policy [FIXED]

Added a comprehensive `Permissions-Policy` header denying every powerful API except the ones we actually use (`fullscreen=(self)`, `payment=(self)`, `picture-in-picture=(self)`).

Verified live via `curl -I http://localhost:3001/`:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Permissions-Policy: accelerometer=(), autoplay=(), camera=(), …, payment=(self), …
Content-Security-Policy-Report-Only: default-src 'self'; …
```

### 5. XSS / injection

- **`dangerouslySetInnerHTML`** — three call sites, all justifiable:
  - `src/app/(marketing)/newsletter/[slug]/page.tsx` — Beehiiv-API-sourced HTML (trusted vendor).
  - `src/app/(content)/reports/[product]/view/[token]/page.tsx` — server-generated report HTML, token-gated.
  - `src/app/(marketing)/ask/page.tsx` — static CSS keyframes literal.
- No `eval` / `new Function` / `document.write`.
- No template-literal SQL or string-concatenated SQL — every query is Drizzle parameterised.
- One `execSync` in `agents/transcript-indexer/src/steps/step6-pr.ts` runs git commands inside the indexer pipeline with internally-derived inputs (numeric episode number + truncated slug). Not user-controlled. Low risk; recommend quoting the variable as a future hardening pass.

**No active fix needed.**

### 6. Auth & sessions

- **next-auth v5** with Resend passwordless magic-link, JWT session, 30-day max-age. CSRF and session signing handled by next-auth itself.
- **Custom admin session** in `src/lib/admin/auth.ts`: HMAC-SHA256 signed token (`user:{id}:{exp}.{sig}`), 7-day max-age. Cookie flags `httpOnly: true`, `secure: NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"` — correct.
- Password hashing: bcrypt with **cost 12** (`src/lib/admin/password.ts:15`); legacy SHA-256 hashes auto-migrate to bcrypt on next successful login.
- Constant-time admin-token compare via `crypto.timingSafeEqual` already in place (`src/lib/admin/auth.ts:51-54`).
- `AUTH_SECRET` is **required at runtime in production** — `src/lib/admin/secret.ts:16-19` throws if neither `AUTH_SECRET` nor `ADMIN_PASSWORD` is set. Dev fallback `fallback-dev-secret` is correctly fenced behind a `NODE_ENV !== "production"` check.
- Google OAuth admin login uses an HMAC-signed state token with a 10-minute TTL; `sanitizeNext()` rejects protocol-relative and absolute redirect URLs.

**No fix required.**

### 7. CSRF posture

There is **no traditional `src/middleware.ts`**; auth is enforced per-route via `requireAuth()` / `requireAdmin()`. Mutating admin endpoints don't carry an explicit `X-CSRF-Token`, but they are protected from CSRF by the combination of:
- signed httpOnly admin session cookie, and
- `SameSite=lax` on that cookie, which excludes it from cross-site `POST`/`PUT`/`DELETE` requests.

This is the standard pattern and is acceptable. If the admin domain ever gets framed inside a same-site origin, revisit (consider `SameSite=strict` or explicit double-submit tokens).

### 8. File uploads

The only upload surface is `/api/courses/upload` — accepts a GPX (XML) string, parses with `parseGpx()`, validates content. No raw binary upload, no public bucket write from user input. Acceptable.

## Deferred / accepted findings (not fixed in this branch)

| # | Severity | Finding | Disposition |
|---|----------|---------|-------------|
| D1 | MEDIUM | `/api/reports/download/[token]/route.ts:72` — `fetch(report.pdfUrl)` has no host allowlist. | `pdfUrl` is database-sourced (not user input), and the report record is token-gated, so an attacker would need DB write access to abuse. **Recommendation:** add a Vercel Blob host allowlist as a defence-in-depth follow-up. |
| D2 | MEDIUM | `/api/facts.json/route.ts:60` — `Access-Control-Allow-Origin: *`. | Intentional: this endpoint exposes brand facts (org name, podcast metadata, public stats) for AI citations and partner sites. Keeping the wildcard. |
| D3 | MEDIUM | `/api/ndy/recommend/route.ts` returns `error.message` to the client. | Same shape as Stripe — should be sanitised. Skipped here to keep this audit's blast radius small; flag as a P2 follow-up. |
| D4 | MEDIUM | `/api/cron/sponsor-alerts/route.ts` returned `error.message` in 500 response. | **FIXED** in this branch as a passing improvement while patching its timing attack. |
| D5 | LOW | Email regex in `/api/wrapped/subscribe/route.ts:11` is inconsistent with shared `normaliseEmail()`. | Code-quality issue, not security. P3 follow-up. |
| D6 | LOW | Hardcoded admin email `anthony@roadmancycling.com` in contact route. | Anthony's email is publicly his founder address. Not a leak. |
| D7 | LOW | Google OAuth admin email allowlist hardcoded in `src/lib/admin/google-oauth.ts:39-44`. | Acceptable for a 4-person team; revisit if the team grows. |
| D8 | LOW | Race-predictor cookie-based rate-limit fallback is bypassable by clearing cookies. | Documented intentional behaviour — slows casual abuse, not determined attackers. The paid Race Report email gate is the real moat. |
| D9 | LOW | Cron / digest endpoints with `error.message` in 500 responses. | Gated by `CRON_SECRET`, so the only caller is Vercel. Low real-world impact. |

## Files changed in this branch

```
new   src/lib/security/bearer.ts
new   src/lib/rate-limit/ip-rate-limit.ts
mod   next.config.ts                                          (+CSP report-only, +Permissions-Policy)
mod   src/app/api/checkout/route.ts                            (+URL allowlist, sanitised error)
mod   src/app/api/contact/route.ts                             (+rate limit)
mod   src/app/api/newsletter/route.ts                          (+rate limit)
mod   src/app/api/lead-magnets/route.ts                        (+rate limit)
mod   src/app/api/cron/sponsor-alerts/route.ts                 (+timing-safe + sanitised error)
mod   src/app/api/cron/stripe-snapshot/route.ts                (+timing-safe)
mod   src/app/api/cron/sync-all/route.ts                       (+timing-safe)
mod   src/app/api/cron/score-all/route.ts                      (+timing-safe)
mod   src/app/api/cron/daily-digest/route.ts                   (+timing-safe)
mod   src/app/api/cron/weekly-digest/route.ts                  (+timing-safe)
mod   src/app/api/cron/diagnostic-digest/route.ts              (+timing-safe)
mod   src/app/api/cron/ted-heartbeat/route.ts                  (+timing-safe)
mod   src/app/api/cron/ted-weekly-digest/route.ts              (+timing-safe)
mod   src/app/api/cron/beehiiv-snapshot/route.ts               (+timing-safe)
mod   src/app/api/cron/complete-past-bookings/route.ts         (+timing-safe)
mod   src/app/api/cron/brand-citations/route.ts                (+timing-safe)
mod   src/app/api/admin/sync/beehiiv/route.ts                  (+timing-safe)
mod   src/app/api/admin/sync/stripe/route.ts                   (+timing-safe)
mod   src/app/api/admin/agent/weekly-analysis/route.ts         (+timing-safe)
mod   src/app/api/admin/experiments/route.ts                   (+timing-safe)
mod   src/app/api/admin/ted/health/route.ts                    (+timing-safe)
new   security-audit-results.md                                (this file)
```

## Next steps (recommended)

1. Watch CSP-Report-Only violation reports for ~1 week, then flip to enforcing CSP.
2. Apply `rateLimitOr429` to the remaining unauthenticated POST endpoints (`/api/diagnostic/submit`, `/api/results/request-link`, `/api/cohort/apply`, `/api/sponsor/apply`, `/api/tools/report`).
3. Add a Vercel Blob host allowlist to `/api/reports/download/[token]/route.ts` (D1 above).
4. Sanitise the response error in `/api/ndy/recommend` (D3).
5. Track drizzle-kit upstream for the `@esbuild-kit` cleanup.
