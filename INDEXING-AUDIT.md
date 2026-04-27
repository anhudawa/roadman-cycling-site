# Indexing Audit — Roadman Cycling

Audit date: 2026-04-27. Triggered by Google Search Console flagging 404s, soft 404s,
robots.txt blocks, canonical issues, and redirects.

---

## Summary

| Area | Status | Issues found | Fixed |
|------|--------|-------------|-------|
| 404s | ✅ Clean | 0 real 404s | — |
| Soft 404s | ✅ Clean | 0 | — |
| robots.txt | ✅ Clean | 0 | — |
| Canonical tags | ✅ Clean | 0 | — |
| Redirects | ⚠️ 1 note | `/2026` is 302 (intentional) | Documented |
| Sitemap coverage | 🔴 Fixed | 3 indexable pages missing | ✅ Fixed |
| Sitemap resilience | 🟡 Fixed | Beehiiv failure was silent | ✅ Fixed |

---

## 1. 404s

**Result: No 404s found.**

All routes listed in the sitemap have corresponding `page.tsx` files. Every redirect
destination was verified to have a live route. No internal link points to a missing
page — the only candidate flagged (`/compare/heart-rate-vs-power`) is a valid slug
in `src/lib/comparisons.ts` and the route correctly calls `getComparisonBySlug()`.

All redirect destinations confirmed live:
- `/apply` ✅  `/coaching` ✅  `/community/clubhouse` ✅
- `/community/not-done-yet` ✅  `/strength-training` ✅  `/plan` ✅
- `/blog/*` slugs resolved at build time ✅

---

## 2. Soft 404s

**Result: None.**

Every dynamic route calls `notFound()` when the record is absent:

| Route | notFound() line |
|-------|----------------|
| `/blog/[slug]` | 94 |
| `/podcast/[slug]` | 95 |
| `/guests/[slug]` | 53 |
| `/glossary/[slug]` | 38 |
| `/topics/[slug]` | 57 |
| `/best/[slug]` | 54 |
| `/compare/[slug]` | 83 |
| `/problem/[slug]` | 65 |
| `/author/[slug]` | 67 |
| `/you/[slug]` | 59 |
| `/races/[slug]` | 102 |
| `/plan/[event]` | 92 |
| `/plan/[event]/[weeksOut]` | 72 |
| `/newsletter/[slug]` | 52 |
| `/results/[tool]/[slug]` | 60 |

Pages intentionally excluded from indexing (noindex meta, not soft 404s):
- `/diagnostic/[slug]` — personal diagnostic data
- `/predict/[slug]` — user predictions
- `/reports/[product]/view/[token]` — tokenised paid reports
- `/results/ftp-zones/[slug]`, `/results/fuelling/[slug]` — saved tool results
- `/newsletter/[slug]` — thin content per code comment

---

## 3. robots.txt

**Result: Clean.**

`src/app/robots.ts` disallows only non-indexable paths:

```
/api/, /admin/, /account/, /cart/, /checkout/, /sign-in, /login,
/strength-training/success, /success/, /thank-you, /unsubscribe,
/preview/, /draft/, /_next/
```

None of these paths appear in the sitemap. No sitemap URL is blocked by robots.

AI crawlers (GPTBot, ClaudeBot, OAI-SearchBot, etc.) are explicitly allowed with the
same disallow rules — transactional paths are protected regardless of crawler.

No static `public/robots.txt` exists to shadow the dynamic route.

---

## 4. Canonical Tags

**Result: Clean.**

All public pages export explicit `alternates.canonical` in their metadata:

- Root layout sets `metadataBase: new URL("https://roadmancycling.com")`
- Every dynamic route's `generateMetadata()` returns a self-referencing absolute canonical
- "use client" pages (tool pages, contact) get canonical via parent `layout.tsx` exports —
  correct Next.js pattern

---

## 5. Redirects

### Overview
72 permanent (301), 1 temporary (302). No chains (A→B→C). All destinations return 200.

### `/2026 → /apply` (302 temporary) — intentional
`next.config.ts` line 101. The 302 is deliberate: `/2026` is a year-scoped URL intended
for re-use in subsequent years; a 301 would transfer equity permanently to `/apply` and
make the slug hard to reclaim. **No change needed.**

### Orphan ClickFunnels URLs → 410 Gone
17 legacy ClickFunnels paths are rewritten to `/api/gone` which returns HTTP 410.
410 is the correct response for pages that permanently ceased to exist. GSC will
eventually stop reporting these.

### Redirect chains
None found. All 73 redirects are direct single-hop.

---

## 6. Sitemap Coverage — Fixed

Three indexable pages existed but were missing from the sitemap, causing GSC
"Discovered, currently not indexed" reports.

### Pages added to `src/app/sitemap.ts` (`buildStaticSitemap`, sitemap/0.xml)

| URL | Canonical set | robots meta | Priority | Change freq |
|-----|--------------|------------|---------|------------|
| `/methodology` | ✅ | index:true | 0.6 | monthly |
| `/sponsor` | ✅ | index:true | 0.5 | monthly |
| `/races` | ✅ | index:true, follow:true | 0.7 | monthly |
| `/races/[slug]` × 20 | ✅ each | index:true, follow:true | 0.7 | monthly |

Race slugs added: etape-du-tour, la-marmotte, mallorca-312, wicklow-200, ring-of-kerry,
fred-whitton, maratona-dles-dolomites, leroica, haute-route-alps, dragon-ride, ridelondon,
gran-fondo-new-york, quebrantahuesos, otztaler-radmarathon, cape-town-cycle-tour,
liege-bastogne-liege, tour-of-flanders-cyclo, raid-pyreneen, velo-birmingham,
tour-de-yorkshire.

The `RACES` array from `src/data/races` is now imported directly so future race entries
are automatically included in the sitemap.

---

## 7. Sitemap Resilience — Fixed

### Newsletter sitemap catch block was silent

`src/app/sitemap.ts` line 228 had an empty `catch {}` block around the Beehiiv API
call that generates newsletter URLs for sitemap/5.xml. If the Beehiiv API is down or
rate-limited at build time, all newsletter archive URLs silently disappear from the
sitemap with no build-log evidence.

**Fix:** Added `console.error` logging so failures are visible in Vercel build logs.

---

## 8. Pages Not in Sitemap (Intentional)

These pages exist but are correctly excluded:

| Page | Reason |
|------|--------|
| `/terms`, `/privacy`, `/cookies` | Legal boilerplate, standard practice to exclude |
| `/wrapped` | Seasonal/temporary page |
| `/search` | Dynamic results page, no stable canonical content |
| `/results` | Personal results hub, force-dynamic with noindex |
| `/strength-training/success` | Post-purchase confirmation, blocked in robots.txt too |

---

## 9. Redirect Inventory

All 73 redirects in `next.config.ts`:

**Permanent (301) — 72 total**

Category | Count | Examples
---------|-------|--------
ClickFunnels → New site | 36 | /join→/apply, /shop→/tools, /ftp-calculator→/tools/ftp-zones
Legacy URL patterns | 8 | /plans→/plan, /episodes→/podcast, /calculators→/tools
Content consolidation | 5 | Blog merges (duplicate posts → canonical version)
Coaching subdomain retirement | 5 | coaching.roadmancycling.com/* → roadmancycling.com/*
ClickFunnels orphan pages | 12 | → /api/gone (410)
Product lifecycle | 1 | /compare/trainingpeaks-vs-todays-plan → updated slug
Misc | 5 | /strong, /getstrong, /ndy, etc.

**Temporary (302) — 1 total**

- `/2026 → /apply` — year-scoped URL, intentionally temporary

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/sitemap.ts` | Added `RACES` import; added `/methodology`, `/sponsor`, `/races`, and all 20 `/races/[slug]` entries to `buildStaticSitemap()`; added `console.error` logging to Beehiiv catch block |
