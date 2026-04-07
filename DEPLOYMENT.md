# Deployment Checklist — Roadman Cycling

## Environment Variables (set in Vercel dashboard)

- [ ] `BEEHIIV_API_KEY` — newsletter integration
- [ ] `BEEHIIV_PUBLICATION_ID` — newsletter integration
- [ ] `STRIPE_SECRET_KEY` — strength training course payments
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe client-side key
- [ ] `STRIPE_STRENGTH_PRICE_ID` — Stripe price for strength course
- [ ] `ANTHROPIC_API_KEY` — AI quote extraction during YouTube sync (optional)
- [ ] `YOUTUBE_CHANNEL_HANDLE` — set to `theroadmanpodcast`
- [ ] `NEXT_PUBLIC_SITE_URL` — set to `https://roadmancycling.com`
- [ ] `NEXT_PUBLIC_GA_ID` — Google Analytics (optional)

## DNS Configuration

- [ ] Point `roadmancycling.com` A/CNAME records to Vercel
- [ ] Verify domain in Vercel project settings
- [ ] Ensure `www.roadmancycling.com` redirects to apex (or vice versa)
- [ ] Wait for SSL certificate auto-provisioning

## Beehiiv Integration

- [ ] Verify `/api/newsletter` endpoint works with real Beehiiv credentials
- [ ] Test newsletter signup form end-to-end on the deployed site
- [ ] Confirm subscribers appear in Beehiiv dashboard after test signup

## Stripe Integration

- [ ] Verify `/api/checkout` endpoint creates Stripe Checkout sessions
- [ ] Test strength training purchase flow end-to-end
- [ ] Confirm `/strength-training/success` page renders correctly after purchase
- [ ] Set up Stripe webhook for payment confirmation (if applicable)

## OG Image

- [ ] **Replace `public/og-image.jpg`** — current file is the logo only (902x290 PNG saved as .jpg). For best social sharing, replace with a 1200x630 branded image that includes the Roadman logo, tagline, and visual context.

## Favicon / Icons

- [ ] `src/app/favicon.ico` exists (good)
- [ ] **Add `apple-touch-icon.png`** (180x180) to `src/app/` or `public/` for iOS home screen bookmarks

## Static vs Dynamic robots.txt

- [ ] **Remove `public/robots.txt`** — it duplicates `src/app/robots.ts` and may shadow the dynamic route. The dynamic version in `src/app/robots.ts` is the canonical one and is already being generated correctly (builds to `/robots.txt`).
- [ ] Also consider removing `public/sitemap.xml` and `public/sitemap-0.xml` if they are stale build artifacts — the dynamic `src/app/sitemap.ts` generates these at build time.

## Post-Deploy Verification

- [ ] Visit `https://roadmancycling.com/robots.txt` and confirm it matches expected output
- [ ] Visit `https://roadmancycling.com/sitemap.xml` and confirm all routes are present
- [ ] Spot-check 2-3 blog posts, podcast episodes, guest pages, and topic hubs
- [ ] Test contact form (`/api/contact` endpoint)
- [ ] Verify images load from remote domains (ytimg.com, scdn.co, sanity.io)
- [ ] Run Google PageSpeed Insights on home page and one blog post
- [ ] Submit sitemap to Google Search Console
