# Canonical URL Audit — 2026-04-07

## Site URL

`https://roadmancycling.com` (no www, no trailing slash)

## Convention Enforced

- **No trailing slash** on any canonical URL (matches Next.js default `trailingSlash: false`)
- **No www prefix** — bare domain `roadmancycling.com` is canonical
- `metadataBase` set in root layout to `https://roadmancycling.com`

## Issues Found and Fixed

### 1. www vs non-www inconsistency

**Files changed:**
- `src/app/layout.tsx` — RSS feed `<link>` used `www.roadmancycling.com`, changed to `roadmancycling.com`
- `src/app/feed/podcast/route.ts` — `SITE_URL` constant used `www.roadmancycling.com`, changed to `roadmancycling.com`

### 2. Explicit `trailingSlash: false` added to next.config.ts

Next.js defaults to no trailing slash, but making it explicit prevents accidental breakage if defaults change and documents the decision.

**File changed:** `next.config.ts`

### 3. Duplicate metadata export in strength-training/success

Both `layout.tsx` and `page.tsx` exported `metadata` with conflicting titles and different `robots` directives. Consolidated into layout only.

**Files changed:**
- `src/app/(marketing)/strength-training/success/layout.tsx` — Added `alternates.canonical`
- `src/app/(marketing)/strength-training/success/page.tsx` — Removed duplicate `metadata` export (layout handles it)

## Full Page Canonical Coverage

| Page | Canonical URL | Status |
|------|--------------|--------|
| `/` (root layout) | `https://roadmancycling.com` | OK |
| `/blog` | `https://roadmancycling.com/blog` | OK |
| `/blog/[slug]` | `https://roadmancycling.com/blog/{slug}` | OK (dynamic) |
| `/podcast` | `https://roadmancycling.com/podcast` | OK |
| `/podcast/[slug]` | `https://roadmancycling.com/podcast/{slug}` | OK (dynamic) |
| `/guests` | `https://roadmancycling.com/guests` | OK |
| `/guests/[slug]` | `https://roadmancycling.com/guests/{slug}` | OK (dynamic) |
| `/topics` | `https://roadmancycling.com/topics` | OK |
| `/topics/[slug]` | `https://roadmancycling.com/topics/{slug}` | OK (dynamic) |
| `/tools` | `https://roadmancycling.com/tools` | OK |
| `/tools/ftp-zones` | `https://roadmancycling.com/tools/ftp-zones` | OK (in layout) |
| `/tools/tyre-pressure` | `https://roadmancycling.com/tools/tyre-pressure` | OK (in layout) |
| `/tools/race-weight` | `https://roadmancycling.com/tools/race-weight` | OK (in layout) |
| `/tools/fuelling` | `https://roadmancycling.com/tools/fuelling` | OK (in layout) |
| `/tools/energy-availability` | `https://roadmancycling.com/tools/energy-availability` | OK (in layout) |
| `/tools/shock-pressure` | `https://roadmancycling.com/tools/shock-pressure` | OK (in layout) |
| `/community` | `https://roadmancycling.com/community` | OK |
| `/community/clubhouse` | `https://roadmancycling.com/community/clubhouse` | OK |
| `/community/not-done-yet` | `https://roadmancycling.com/community/not-done-yet` | OK |
| `/community/club` | `https://roadmancycling.com/community/club` | OK |
| `/events` | `https://roadmancycling.com/events` | OK |
| `/about` | `https://roadmancycling.com/about` | OK |
| `/contact` | `https://roadmancycling.com/contact` | OK (in layout) |
| `/newsletter` | `https://roadmancycling.com/newsletter` | OK |
| `/partners` | `https://roadmancycling.com/partners` | OK |
| `/strength-training` | `https://roadmancycling.com/strength-training` | OK |
| `/strength-training/success` | `https://roadmancycling.com/strength-training/success` | FIXED (added) |
| `/search` | `https://roadmancycling.com/search` | OK |

## Redirect Analysis (next.config.ts)

All redirects are 301 (permanent) and point to valid canonical paths:
- `/members` -> `/community/clubhouse`
- `/2026` -> `/community/not-done-yet`
- `/strong` -> `/strength-training`
- `/self-coaching-system` -> `/community/not-done-yet`
- `/application-funnel-6` -> `/community/not-done-yet`

No rewrites configured. No duplicate-content risk from redirects.

## Trailing Slash Consistency

All 29 canonical URLs use no trailing slash. `trailingSlash: false` is now explicit in `next.config.ts`.

## www vs non-www

All internal URLs now use `roadmancycling.com` (no www). The hosting provider should also configure a 301 redirect from `www.roadmancycling.com` to `roadmancycling.com` at the DNS/CDN level.

## next-sitemap.config.js

`siteUrl` is correctly set to `https://roadmancycling.com` (no www, no trailing slash). No issues.
