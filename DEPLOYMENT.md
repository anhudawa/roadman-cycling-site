# Deployment Checklist — Roadman Cycling 2.0

## Environment Variables (set in Vercel dashboard)

All env vars currently referenced by the codebase. Vars marked **REQUIRED** will cause
runtime errors or silent feature failures if missing. Optional vars degrade gracefully.

### Core / Auth

| Variable | Required | Notes |
|---|---|---|
| `POSTGRES_URL` | **REQUIRED** | Neon / Vercel Postgres connection string |
| `ADMIN_PASSWORD` | **REQUIRED** | Admin dashboard login password |
| `AUTH_SECRET` | **REQUIRED** | Session signing key — generate with `openssl rand -base64 32` |
| `AUTH_ALLOWED_EMAILS` | **REQUIRED** | Comma-separated list of emails allowed into `/admin` |
| `NEXT_PUBLIC_SITE_URL` | **REQUIRED** | `https://roadmancycling.com` — used for OG, sitemap, emails |
| `CRON_SECRET` | **REQUIRED** | Authorises Vercel Cron calls — generate a random 32-char string |

### Ask Roadman (AI assistant — new in 2.0)

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | **REQUIRED** | Claude API for Ask Roadman responses |
| `VOYAGE_API_KEY` | **REQUIRED** | Voyage AI embeddings (semantic search) |
| `UPSTASH_REDIS_REST_URL` | **REQUIRED** | Rate-limiting for /ask endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | **REQUIRED** | Rate-limiting for /ask endpoint |
| `ASK_BASE_URL` | optional | Base URL for Ask Roadman — defaults to `NEXT_PUBLIC_SITE_URL` |
| `ASK_ROADMAN_ANON_DAILY` | optional | Anonymous daily query cap (default: 10) |
| `ASK_ROADMAN_ANON_RPM` | optional | Anonymous requests-per-minute cap (default: 3) |
| `ASK_ROADMAN_PROFILE_RPH` | optional | Authenticated requests-per-hour cap (default: 60) |
| `EMBEDDING_PROVIDER` | optional | `voyage` (default) or `openai` |

### MCP Server (new in 2.0)

| Variable | Required | Notes |
|---|---|---|
| `MCP_RATE_LIMIT_RPM` | optional | MCP rate limit (default: 60) |
| `OPENAI_API_KEY` | optional | Fallback embedding provider if `EMBEDDING_PROVIDER=openai` |

### Rider Profiles & Paid Reports (new in 2.0)

| Variable | Required | Notes |
|---|---|---|
| `RIDER_HISTORY_SECRET` | **REQUIRED** | Signing key for rider history tokens — generate a random 32-char string |
| `CONSENT_IP_SALT` | optional | Salt for consent tracking (defaults to a fixed string — set for production) |

### Beehiiv (newsletter)

| Variable | Required | Notes |
|---|---|---|
| `BEEHIIV_API_KEY` | **REQUIRED** | Newsletter API key |
| `BEEHIIV_PUBLICATION_ID` | **REQUIRED** | Newsletter publication ID |

### Stripe (payments)

| Variable | Required | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | **REQUIRED** | `sk_live_…` — live key for production |
| `STRIPE_STRENGTH_PRICE_ID` | **REQUIRED** | Stripe price ID for S&C course |
| `STRIPE_WEBHOOK_SECRET` | **REQUIRED** | `whsec_…` — webhook signing secret |

### Resend (transactional email)

| Variable | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | **REQUIRED** | Transactional email API key |
| `RESEND_WEBHOOK_SECRET` | optional | Resend webhook validation |

### Skool (community integration)

| Variable | Required | Notes |
|---|---|---|
| `SKOOL_EMAIL` | **REQUIRED** | Ted's Skool login email |
| `SKOOL_PASSWORD` | **REQUIRED** | Ted's Skool login password |
| `SKOOL_COMMUNITY_SLUG` | **REQUIRED** | `roadman` |
| `SKOOL_INTRO_CATEGORY` | **REQUIRED** | `Intro Yourself` |
| `SKOOL_WEBHOOK_SECRET` | **REQUIRED** | Skool webhook validation secret |

### Ted Agent Alerts

| Variable | Required | Notes |
|---|---|---|
| `TED_ADMIN_ALERT_EMAIL` | optional | Where Ted sends warn/error alerts |
| `TED_ALERT_FROM` | optional | `ted@roadmancycling.com` |

### Analytics

| Variable | Required | Notes |
|---|---|---|
| `GA4_PROPERTY_ID` | optional | Google Analytics 4 property ID |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | optional | GA4 service account JSON (sponsor reports) |
| `NEXT_PUBLIC_META_PIXEL_ID` | optional | Meta Pixel ID |

### Google OAuth (admin Google login)

| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_CLIENT_ID` | optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | optional | Google OAuth secret |
| `GOOGLE_REDIRECT_URI` | optional | OAuth redirect — `https://roadmancycling.com/api/admin/auth/google/callback` |

### Google Custom Search

| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_CSE_API_KEY` | optional | Custom search API key |
| `GOOGLE_CSE_ID` | optional | Custom search engine ID |

### GitHub (workflow triggers)

| Variable | Required | Notes |
|---|---|---|
| `GITHUB_TOKEN` | optional | Token with `actions:write` scope — enables manual workflow triggers |
| `GITHUB_REPO` | optional | `anhudawa/roadman-cycling-site` |
| `GITHUB_DEFAULT_BRANCH` | optional | `main` |

### YouTube

| Variable | Required | Notes |
|---|---|---|
| `YOUTUBE_API_KEY` | optional | YouTube Data API key |
| `YOUTUBE_CHANNEL_HANDLE` | optional | `theroadmanpodcast` |

### Vercel Blob (file uploads)

| Variable | Required | Notes |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | optional | Vercel Blob token — required for CRM file attachments |

### Booking (Calendly / Cal.com)

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_CALENDLY_INNER_CIRCLE` | optional | Full Calendly URL for Inner Circle bookings |
| `NEXT_PUBLIC_CALENDLY_PREMIUM` | optional | Full Calendly URL for Premium bookings |
| `NEXT_PUBLIC_CAL_BOOKING_URL` | optional | Cal.com booking URL |

### Podcast

| Variable | Required | Notes |
|---|---|---|
| `PODCAST_RSS` | optional | RSS feed URL for the podcast |

---

## Migrations (run before first deploy)

Drizzle migrations live in `drizzle/`. The journal tracks 4 applied migrations (0000–0003).
Files 0004–0030 exist on disk and need to be applied to production. Run:

```bash
npm run db:migrate
```

**Known duplicate migration numbers** (these are from parallel feature branches — resolve before running migrate):
- `0003_amusing_masque.sql` vs `0003_crm_phase1.sql`
- `0019_skool_events.sql` vs `0019_ted_community_agent.sql`
- `0020_inbox_status.sql` vs `0020_ted_surface_drafts.sql`
- `0022_cohort_apps_unique_email.sql` vs `0022_team_google_oauth.sql`

**Action required:** Renumber the duplicates (e.g., 0003a/0003b or consolidate into one file) before running `db:migrate` in production. Anthony should review which of the duplicates ran first and renumber accordingly.

Migrations 0027–0030 (MCP tables, Ask Roadman, rider profiles, paid reports) are new in 2.0 and must run before those features go live.

---

## Pre-Deploy Checks

Run these locally before pushing to Vercel:

```bash
npm run build        # must exit 0
npm run lint         # should be clean
npm run test:run     # must be 0 failures
```

---

## DNS Configuration

- [ ] Point `roadmancycling.com` A/CNAME records to Vercel
- [ ] Verify domain in Vercel project settings
- [ ] Ensure `www.roadmancycling.com` redirects to apex (or vice versa)
- [ ] Wait for SSL certificate auto-provisioning

## Post-Deploy Verification

- [ ] Visit `/robots.txt` — confirm it matches expected output
- [ ] Visit `/sitemap.xml` — confirm all routes are present
- [ ] Test `/ask` — Ask Roadman responds without errors (check Redis + Voyage keys)
- [ ] Test MCP endpoint at `/api/mcp` — returns valid JSON-RPC response
- [ ] Spot-check 2-3 blog posts, podcast episodes, guest pages, topic hubs
- [ ] Test newsletter signup form end-to-end
- [ ] Test strength training purchase flow (Stripe checkout → success page)
- [ ] Test Stripe webhook: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Verify `/admin` login works with `AUTH_ALLOWED_EMAILS`
- [ ] Submit sitemap to Google Search Console

## OG Image

- [ ] **Replace `public/og-image.jpg`** — currently logo-only (902×290). Replace with 1200×630 branded image for social sharing.

## Favicon / Icons

- [ ] `src/app/favicon.ico` exists ✓
- [ ] **Add `apple-touch-icon.png`** (180×180) to `src/app/` or `public/` for iOS

## Static Assets

- [ ] Remove `public/robots.txt` — shadows the dynamic `src/app/robots.ts` route
- [ ] Check `public/sitemap.xml` and `public/sitemap-0.xml` are not stale build artifacts
