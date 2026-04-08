# Sponsor System — Morning Status Report
**Updated:** 2026-04-09 (overnight session complete)
**Status:** BUILT, SEEDED, VERIFIED

---

## What's Done

### Code: Complete
- ~40 files across data layer, auth, admin views, public page, API routes, notifications
- Production build: **549 pages, 0 TypeScript errors**
- Spec document: `docs/superpowers/specs/2026-04-08-sponsor-system-design.md`

### Infrastructure: Complete
- Airtable base created: `appraxzCzNsH71Tk8` (roadman-sponsorship)
- 3 tables: inventory, events, sponsors — with all fields, linked records, and select options
- Airtable token updated with `schema.bases:write` scope
- Resend API key created (roadman-sponsor-system, sending access)
- AUTH_SECRET generated

### Seed Data: Complete
- **393 inventory slots** (6 months of podcast, newsletter, YouTube production)
- **10 cycling events** (Spring Classics through Winter Indoor 2026-27)
- **5 sponsor records** (TrainingPeaks, Parlee, 4Endurance, Hexis, Bikmo)
- **222 slots auto-linked** to events with premium pricing applied

### Verification: Confirmed
- `/sponsor` returns HTTP 200, 239KB HTML
- All 6 page sections render: Events Calendar, Rate Card, Proof Block, FAQ, Quiz, Booking Flows
- 10 event cards with live inventory counts from Airtable (e.g. "49 of 49 slots remaining")
- 20 "slots remaining" data points across event cards — all live from Airtable
- Tour de France, Giro, Vuelta, Spring Classics, Migration Gravel, Performance Camp — all present
- Spotlight, Quarter, Annual tiers all rendering with correct copy

### Known Dev Server Issue
The Next.js 16 Turbopack dev server has intermittent cache corruption (`middleware-manifest.json` ENOENT). This is a **known Turbopack bug**, not caused by our code. The production build (`npm run build`) passes cleanly. When the dev server hits this, just `rm -rf .next && npm run dev` to restart fresh.

---

## What Still Needs Doing

### You Need To Do (2 minutes, in Stripe dashboard)

1. **Stripe Webhook** — go to https://dashboard.stripe.com/webhooks
   - Click "+ Add endpoint"
   - URL: `https://roadmancycling.com/api/webhooks/stripe` (or staging domain)
   - Events: `checkout.session.completed`
   - Copy the signing secret → put in `.env.local` as `STRIPE_WEBHOOK_SECRET`

2. **Stripe Publishable Key** — go to https://dashboard.stripe.com/apikeys
   - Copy "Publishable key" (starts with `pk_live_`)
   - Put in `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Note: this is only needed if you switch to embedded Stripe checkout. Current code uses redirect checkout which doesn't need a publishable key.

3. **Vercel CRON_SECRET** — set in Vercel project settings → Environment Variables
   - Name: `CRON_SECRET`, value: any random string
   - Used by the daily sponsor renewal/staleness alert cron

### Content Placeholders (before public launch)
- [ ] Audience stats: household income, purchase intent, cycling spend (currently placeholder numbers)
- [ ] 4iiii testimonial: exact quote and attribution
- [ ] Discovery+ case study: confirm cleared for public reference
- [ ] Performance Camp: exact November dates
- [ ] Calendly URL for Quarter bookings

---

## .env.local Status

| Variable | Status |
|----------|--------|
| AIRTABLE_API_KEY | Set |
| AIRTABLE_BASE_ID | Set (appraxzCzNsH71Tk8) |
| AUTH_SECRET | Set |
| AUTH_ALLOWED_EMAILS | Set (anthony, sarah, wes) |
| RESEND_API_KEY | Set |
| STRIPE_SECRET_KEY | Set (pre-existing) |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Placeholder — get from Stripe dashboard |
| STRIPE_WEBHOOK_SECRET | Placeholder — create webhook in Stripe dashboard |
| CRON_SECRET | Not set — add in Vercel project settings |

---

## Quick Commands

```bash
# Start dev server (clean)
rm -rf .next && npm run dev

# Production build
npm run build

# Re-seed Airtable (if needed)
AIRTABLE_API_KEY=patBeH79tmiGbWRj7... AIRTABLE_BASE_ID=appraxzCzNsH71Tk8 npx tsx src/lib/inventory/seed.ts

# Dry run seed (preview without writing)
npx tsx src/lib/inventory/seed.ts --dry-run
```

---

## File Map (new sponsor system files)

```
src/lib/inventory/          # Data access layer
  types.ts                  # TypeScript interfaces
  config.ts                 # Base rates, premiums, table names
  airtable.ts               # Airtable REST client
  index.ts                  # Public API (12 functions)
  seed.ts                   # Seed script

src/lib/auth.ts             # NextAuth v5 config
src/lib/auth-utils.ts       # isAnthony() helper
src/lib/notifications.ts    # Email notifications via Resend

src/middleware.ts            # Admin route protection

src/app/admin/inventory/    # Admin views
  page.tsx                  # Redirect to pipeline
  layout.tsx                # Auth guard + sidebar
  actions.ts                # Server actions
  this-week/page.tsx        # Editor production view
  pipeline/page.tsx         # Quarter pipeline grid
  sponsors/page.tsx         # Sponsor health table
  events/page.tsx           # Events overlay

src/components/admin/inventory/  # Admin UI components (16 files)

src/app/(marketing)/sponsor/     # Public sales page
  page.tsx                       # Server component
  SponsorClientSections.tsx      # Client components (quiz, FAQ, booking flows)

src/app/api/sponsor/             # API routes
  apply/route.ts                 # Annual application → email
  spotlight/route.ts             # Stripe Checkout Session
  quarter-enquiry/route.ts       # Quarter lead notification

src/app/api/webhooks/stripe/route.ts  # Stripe webhook handler
src/app/api/cron/sponsor-alerts/route.ts  # Daily renewal/staleness alerts
```
