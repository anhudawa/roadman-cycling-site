# The Roadman Method — Technical Architecture (Phase 1)

> Premium members-only 12-week course area on roadmancycling.com
> Status: Phase 1 — container/scaffolding only (no syllabus content yet)

## 1. Goals & non-goals

**In scope (Phase 1)**

- A gated `/method` route group with its own dark, premium layout
- Custom auth flow: Stripe purchase → magic-link sign-in → gated access
- Drizzle schema + migration for enrollments, progress, login tokens
- 12 module slots with a reusable module-page template
- Progress tracking (per-module completion, percent-complete dashboard)
- Optional drip-unlock (per-module `unlocksOnDayOffset` + env override)
- Stripe checkout + webhook integration (reuses existing dispatcher)

**Out of scope (Phase 1)**

- Real video IDs, protocol copy, PDFs, or TrainingPeaks links — placeholders only
- Account self-service (password reset, email change) — magic-link only for now
- Refund flows beyond `enrollment.status = 'refunded'`
- Quizzes / certificates / community DMs

## 2. High-level flow

```
                                                 ┌──────────────────────────┐
[Anonymous] ── /method/checkout ──┐              │  /api/webhooks/stripe    │
                                  ▼              │  → dispatchStripeEvent   │
                       ┌──────────────────┐      │    (existing)            │
                       │ POST /api/method │      │  branch: type =          │
                       │      /checkout   │──────│   "method_course"        │
                       └──────────────────┘      │  → method-dispatch.ts    │
                                  │              └────────────┬─────────────┘
                                  ▼                           ▼
                          Stripe Checkout            INSERT enrollment
                            (hosted URL)             SEND magic-link email
                                  │                  TAG Beehiiv "method-paid"
                                  ▼
                       success_url:
                       /method/welcome?session_id=…

[Email] ── /method/login (or click magic link) ───────────┐
                                  │                       │
                                  ▼                       ▼
                       POST /api/method/login    GET /api/method/login/verify?token=
                       (request fresh link)     (consume token, set cookie)
                                                          │
                                                          ▼
                                                Set HttpOnly `method_session`
                                                       cookie (HMAC-signed,
                                                       30-day expiry)
                                                          │
                                                          ▼
                                                Redirect to /method
                                                  (course dashboard)
```

## 3. Auth design

### 3.1 Why a separate flow

The site already has a NextAuth v5 instance at `src/lib/auth.ts` that's locked to an admin email allowlist via `AUTH_ALLOWED_EMAILS`. Two reasonable paths existed:

1. Extend the existing NextAuth `signIn` callback to also allow paid members
2. Build a separate, self-contained passwordless flow for `/method`

We chose **option 2** for these reasons:

- The admin instance has a tight blast radius — adding "paid customer" surface area to it widens what a session-token leak could do
- Members never need admin endpoints; admins never need member endpoints
- A leaked admin allowlist email shouldn't grant course access, and vice versa
- The member flow can iterate (account self-service, billing portal) without touching admin
- Cookie scoping is cleaner: `method_session` vs `__Secure-authjs.session-token`

### 3.2 Mechanism

- **Sign-in**: User submits email at `/method/login`. We look up `method_enrollments` for an active row matching that email. If found, we mint a one-time token, hash it (`bcrypt`), insert into `method_login_tokens` with a 15-min TTL, and email a magic link via Resend (`https://roadmancycling.com/api/method/login/verify?token=<raw>`). If not found, we still respond 200 (no enumeration) and silently noop.
- **Verify**: `GET /api/method/login/verify?token=…` looks up the row by hashed token, checks `expires_at > now()` and `used_at IS NULL`, marks it used, sets the `method_session` cookie, and redirects to `/method`.
- **Session**: HMAC-signed JWT (HS256, `METHOD_SESSION_SECRET`) carrying `{ enrollmentId, email, iat, exp }`. 30-day expiry. HttpOnly + Secure + SameSite=Lax. Cookie name: `method_session`.
- **Sign-out**: `POST /api/method/logout` clears the cookie.

We deliberately do NOT use NextAuth here — a small custom flow is ~80 lines, has no provider abstraction to pin, and avoids accidentally sharing auth surface with admin.

### 3.3 Gating

`src/app/(method)/method/layout.tsx` is a server component that calls `getMethodSession()`. If no session, it redirects to `/method/login`. Per-module pages additionally check `isModuleUnlocked(enrollment, module)` and render a locked state if drip mode hasn't released that week yet.

API routes that mutate state (`/api/method/progress`) call `requireMethodSession()` — throws → 401 JSON.

## 4. Stripe integration

Reuses the existing pattern from `src/app/api/camps/book/route.ts` + `src/lib/stripe/dispatch.ts`.

### 4.1 Checkout

`POST /api/method/checkout`
- Validates `{ name, email }`
- Idempotently upserts `method_enrollments` row at `status='pending'`
- Creates Stripe Checkout session with:
  - `mode: "payment"`
  - `customer_email`
  - One line item: `price_data` (USD cents) — price configurable via `STRIPE_METHOD_PRICE_CENTS` (default 29700, $297) or `STRIPE_METHOD_PRICE_ID` if a Price object is preferred
  - `metadata.type = "method_course"` ← dispatcher hook
  - `metadata.enrollment_id`
  - `success_url`: `/method/welcome?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url`: `/method/checkout?cancelled=1`
- Backfills `stripeSessionId` on the enrollment row
- Returns `{ checkoutUrl }`

Beehiiv lead-capture on submit (pre-payment), tag `method-applicant`.

### 4.2 Webhook

The unified dispatcher at `src/lib/stripe/dispatch.ts` already branches on `metadata.type`. We add one branch:

```ts
if (metadata.type === "method_course") {
  await handleMethodCourseCheckoutCompleted(session);
  return;
}
```

The handler lives in `src/lib/stripe/method-dispatch.ts` (lazy-imported, matching the camps pattern):

1. Bail if `payment_status !== 'paid'` (defensive — async confirmations)
2. Look up enrollment by `enrollment_id` metadata, fall back to `customer_email`
3. **Idempotency**: if `paidAt IS NOT NULL`, log and return (Stripe retries + dual-URL webhooks)
4. Update row: `status='active'`, `paidAt=now()`, `dripStartAt=now()`, `stripePaymentIntentId`, `amountCents`
5. Mint a magic-link token, send Resend "Welcome to The Method" email with sign-in link
6. Tag Beehiiv `method-paid`, fire CRM activity
7. Send admin notification (`notifyMethodSale`)

The webhook always returns 2xx after signature verification — handler errors are caught and logged so a single bad branch doesn't trigger Stripe's retry storm.

### 4.3 Refunds

`charge.refunded` events already route through `handlePaidReportRefund`. Phase 1 doesn't auto-revoke method access — a separate `method_course` branch in the refund handler is a follow-up. Manual revoke is `UPDATE method_enrollments SET status='refunded' WHERE …`.

## 5. Data model

Migration `drizzle/0042_method_course.sql`. Schema additions in `src/lib/method/schema.ts` (re-exported from `src/lib/db/schema.ts` on merge).

### `method_enrollments`

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| email | text, NOT NULL, UNIQUE | Lowercased on insert |
| name | text | |
| status | text, NOT NULL, default `'pending'` | `pending` \| `active` \| `refunded` \| `cancelled` |
| paid_at | timestamptz | Set by webhook |
| drip_start_at | timestamptz | Defaults to `paid_at`. Admin can advance/rewind for VIPs |
| amount_cents | integer | |
| currency | text, default `'usd'` | |
| stripe_session_id | text, UNIQUE | |
| stripe_payment_intent_id | text | |
| stripe_event_ids | jsonb, default `[]` | Idempotency log, mirrors `orders` pattern |
| notes | text | Admin notes |
| created_at, updated_at | timestamptz, defaultNow() | |

Indexes: `email`, `status`, `stripe_session_id`.

### `method_progress`

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| enrollment_id | integer, FK → method_enrollments(id), ON DELETE CASCADE | |
| module_slug | text, NOT NULL | E.g. `'01-foundation'` — references manifest |
| completed_at | timestamptz, NOT NULL, defaultNow() | |

Unique index `(enrollment_id, module_slug)` so `markComplete` is upsert-idempotent.

### `method_login_tokens`

| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| enrollment_id | integer, FK → method_enrollments(id), ON DELETE CASCADE | |
| token_hash | text, NOT NULL, UNIQUE | bcrypt-hashed |
| expires_at | timestamptz, NOT NULL | 15-minute default |
| used_at | timestamptz | NULL = unused. Single-use enforced via this column |
| created_at | timestamptz, defaultNow() | |

Index on `expires_at` for periodic prune.

## 6. Module manifest (static, in code)

`src/lib/method/modules.ts` — exports a typed const array of 12 module entries. The syllabus is being drafted separately, so Phase 1 ships placeholders with stable slugs the content team can fill in.

```ts
export interface MethodModule {
  slug: string;                    // URL: /method/modules/{slug}
  weekIndex: 1..12;
  title: string;
  oneLiner: string;
  pillar: "coaching" | "nutrition" | "strength" | "recovery" | "community";
  unlocksOnDayOffset: number;      // Days after dripStartAt; 0 = available immediately
  videoYouTubeId: string | null;   // Unlisted YT ID
  protocolMdxPath: string | null;  // Phase 2 — MDX in /content/method/
  resources: ResourceLink[];       // PDF / TrainingPeaks / external
  discussionUrl: string;           // Skool "Not Done Yet" thread
  estimatedReadMinutes: number;
}
```

Drip pacing is one module per 7 days by default. When `METHOD_DRIP_MODE=all-at-once` is set in env, `isModuleUnlocked` short-circuits to `true`.

## 7. Routes

```
src/app/(method)/method/
├── layout.tsx                       Gate (server component) + dark theme shell
├── page.tsx                         Dashboard (progress ring + module grid)
├── login/page.tsx                   Email form
├── login/check-email/page.tsx       "Check your inbox"
├── login/verify/page.tsx            Loading state while /api consumes token
├── checkout/page.tsx                Sales page → POST /api/method/checkout
├── welcome/page.tsx                 Post-payment thank-you (waits on webhook)
├── modules/[slug]/page.tsx          Module template (video, protocol, resources)
├── account/page.tsx                 Email + sign-out + receipt link
└── _components/                     (private, not routable)
    ├── MethodHeader.tsx
    ├── ModuleNav.tsx
    ├── ProgressRing.tsx
    ├── VideoEmbed.tsx
    ├── ResourceList.tsx
    ├── CompleteToggle.tsx
    └── DiscussionCTA.tsx

src/app/api/method/
├── checkout/route.ts                POST → Stripe session
├── login/route.ts                   POST { email } → request magic link
├── login/verify/route.ts            GET ?token=… → set cookie, redirect
├── logout/route.ts                  POST → clear cookie
└── progress/route.ts                POST { moduleSlug } → upsert completion
```

The new route group `(method)` sits alongside `(marketing)`, `(content)`, `(community)`. The group's `layout.tsx` is the auth + theme boundary — it does NOT inherit `ConversionChrome` (the global header/footer chrome) because the course area is its own world.

## 8. Visual identity

Brand-locked per `skills/roadman-cycling/SKILL.md`:

- **Background**: `bg-charcoal` (#252526) base, gradients dipping into `bg-deep-purple` (#210140) on hero/empty states
- **Headings**: Bebas Neue, all-caps, generous tracking (existing `--font-heading` token)
- **Body**: Work Sans, generous line-height for protocol reading
- **Accent**: Coral (#F16363) for primary CTAs, active module nav state, progress ring fill, and "Mark complete" success
- **Borders**: `border-white/10` neutral, `border-coral/40` for the current module
- **Module numerals**: Bebas Neue at 7xl/8xl ("01", "02", … "12") — the visual signature of the grid
- **Glow**: existing `--shadow-glow-coral` on hover for primary CTAs

The module page layout is a 12-column grid: 8 cols protocol on the left, 4 cols sidebar (resources + discussion CTA + complete toggle) on the right, collapsing to a single column on mobile with the sidebar sliding to the bottom.

Premium feel comes from restraint: a lot of negative space, no marketing chrome, no "MOST POPULAR" badges, no urgency timers. The Inner-Circle reference: this is a working environment for athletes, not a sales funnel.

## 9. Component inventory

| Component | Type | Purpose |
|---|---|---|
| `MethodHeader` | Server | Logo, current week badge, account dropdown |
| `ModuleNav` | Server | Left rail (desktop) / top sheet (mobile). Lists 12 modules with status (locked / available / completed). |
| `ProgressRing` | Client | SVG ring, animates from 0 → percent on mount via framer-motion |
| `VideoEmbed` | Client | YouTube iframe with privacy-enhanced mode (`youtube-nocookie.com`) and 16:9 wrapper |
| `ResourceList` | Server | Renders PDF/TrainingPeaks/external links |
| `CompleteToggle` | Client | "Mark complete" button → POST `/api/method/progress` → optimistic UI |
| `DiscussionCTA` | Server | "Discuss this module in Not Done Yet" → external Skool URL |
| `LockedModuleNotice` | Server | Shown when drip hasn't released a module yet |

## 10. Environment variables (new)

| Var | Purpose |
|---|---|
| `METHOD_SESSION_SECRET` | HMAC secret for `method_session` cookie. **Must be 32+ random bytes**. Required. |
| `STRIPE_METHOD_PRICE_CENTS` | USD cents for inline `price_data`. Default `29700` ($297). |
| `STRIPE_METHOD_PRICE_ID` | (Optional) Pre-created Stripe Price object. If set, takes precedence over inline pricing. |
| `METHOD_DRIP_MODE` | `weekly` (default) or `all-at-once`. |
| `METHOD_SUPPORT_EMAIL` | Reply-to on transactional emails. Defaults to `support@roadmancycling.com`. |
| `METHOD_NDY_DISCUSSION_URL` | Base URL of the Skool "Not Done Yet" community for the per-module CTA. |

Existing env (re-used): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `POSTGRES_URL`.

## 11. Security notes

- **Session secret**: HS256 over `{ enrollmentId, email, iat, exp }`. 30-day expiry. Rotating the secret invalidates all sessions — fine, users magic-link back in.
- **Token hashing**: bcrypt(12) on raw magic-link tokens. Raw token is 32 bytes from `crypto.randomBytes` → base64url. Lookup is by hash, comparison is constant-time.
- **Single-use enforcement**: `used_at` column. The verify route updates `used_at` in the same transaction as the read; concurrent reuses race on the unique index.
- **Rate limiting**: `/api/method/login` is rate-limited via `@upstash/ratelimit` (already in deps): 5 requests / minute / IP, 10 / hour / email.
- **No email enumeration**: `/api/method/login` returns 200 regardless of whether the email is enrolled.
- **Cookie**: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/method` to scope to the course area only.
- **CSRF**: `POST /api/method/progress` requires the session cookie + a same-origin check. Form action posts use a `csrf` field bound to the session.
- **PII in metadata**: Stripe metadata holds only `enrollment_id`, never name/email beyond what Stripe already has via `customer_email`.

## 12. Edits required when merging into `main`

This branch creates new files. Two existing files in `main` need a small edit on merge — flagged here for reviewers:

1. `src/lib/db/schema.ts` — add `export * from "@/lib/method/schema";` at the bottom (or copy the four exports inline if the project prefers a single schema file)
2. `src/lib/stripe/dispatch.ts` — inside `handleCheckoutCompleted`, add the `method_course` branch before the legacy fallback:

   ```ts
   if (metadata.type === "method_course") {
     const { handleMethodCourseCheckoutCompleted } = await import("./method-dispatch");
     await handleMethodCourseCheckoutCompleted(session);
     return;
   }
   ```

Both edits are mechanical and additive; neither removes or alters existing behaviour.

## 13. Phase 2 (out of scope, noted for sequencing)

- Real syllabus content: 12 MDX protocols in `content/method/`, real video IDs, PDFs in `/public/method/`, TrainingPeaks plan URLs
- Quizzes / module checkpoints
- Certificate of completion (PDF, reuse `@react-pdf/renderer` already in deps)
- Account self-service: change email, magic-link rate-limit transparency, billing-portal link
- Refund automation: `charge.refunded` for `method_course` orders → `status='refunded'`, revoke session
- Cohort cohort tracking: `cohort_id` on enrollments for live group launches
- Drip notifications: weekly Resend email when next module unlocks
- Affiliate / discount codes via Stripe Promotion Codes

## 14. Open questions for content / business

- Final price: **$297 vs $397**? Phase 1 ships configurable; default is $297.
- Drip pacing: **all-at-once** (full library day-1) **or weekly** (one module / 7 days)? Phase 1 ships drip with env override.
- Discussion CTA destination: are we creating a per-module Skool thread, or one general "method-questions" thread? `discussionUrl` per-module is wired; needs URLs.
- Free trial / preview: do we want module 1 to be free-to-preview as a top-of-funnel? Trivial to add by setting that module's `requiresEnrollment: false` once the field exists.
