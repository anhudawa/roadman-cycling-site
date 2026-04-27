# Sitewide QA Report — roadmancycling.com

**Date:** 2026-04-27
**Method:** Dev server (Next.js 16.2.4) + HTTP scan of 56 routes + accessibility snapshots + static analysis of `src/app/{(community),(content),(marketing)}` and `src/components/`.
**Scope:** All public hubs and a representative slug from each dynamic route.

## Summary

| Severity | Count | Notes |
|---|---|---|
| CRITICAL | 3 | Client-component pages serving the homepage's `<title>` instead of their own |
| HIGH | 22 | Duplicated "Roadman Cycling" suffix in `<title>`, image quality config gap, missing alt |
| MEDIUM | 6 | Dead anchors, swallowed errors, missing canonicals on success pages |
| LOW | 5 | Console logging in user-facing components |

All routes return HTTP 200 — no 404/500 on legitimate URLs. The `/methodology` route mentioned in the brief does not exist in the codebase and is not linked from anywhere — non-issue.

---

## CRITICAL

### C1 — `/predict` shows the homepage `<title>` and meta-description
- **URL:** `/predict`
- **Symptom:** Browser tab and SERP-visible title is `Roadman Cycling — Cycling Coaching, Training & Performance Podcast`. Description is the homepage's. H1 is correct (`PREDICT YOUR FINISH. PACE YOUR RACE.`) but the SEO surface is wrong.
- **Root cause:** `src/app/(content)/predict/page.tsx:1` is `"use client"`. Next.js does not honour `metadata` exports from client components, so the page falls through to the root layout default.
- **Severity:** **CRITICAL** — flagship interactive feature, indexed page, currently inheriting the homepage's title/description for search & social share.
- **Fix:** Add a sibling `layout.tsx` server component that exports `metadata`. The client `page.tsx` keeps working unchanged.

### C2 — `/predict/courses` shows the homepage `<title>` and meta-description
- **URL:** `/predict/courses`
- **Root cause:** `src/app/(content)/predict/courses/page.tsx:1` is `"use client"`.
- **Severity:** **CRITICAL** — same as C1.
- **Fix:** Add `src/app/(content)/predict/courses/layout.tsx` exporting metadata.

### C3 — `/community/not-done-yet/fit` shows the homepage `<title>`
- **URL:** `/community/not-done-yet/fit`
- **Root cause:** `src/app/(community)/community/not-done-yet/fit/page.tsx:1` is `"use client"`.
- **Severity:** **CRITICAL** — funnel page (NDY fit-check quiz).
- **Fix:** Add `src/app/(community)/community/not-done-yet/fit/layout.tsx` exporting metadata.

---

## HIGH

### H1 — Duplicated "Roadman Cycling" suffix in `<title>` across 19 routes
- **Root cause:** Root layout sets `title.template = "%s | Roadman Cycling"` (`src/app/layout.tsx:54`). Pages whose own title already contains "Roadman Cycling" (either as " | Roadman Cycling" or " — Roadman Cycling" or "& Roadman Cycling") get it doubled.
- **Confirmed via curl** — actual rendered `<title>` for each:

| Route | Source title | Rendered (broken) |
|---|---|---|
| `/coaching/triathlon` | `"… — Roadman Cycling"` | `… — Roadman Cycling \| Roadman Cycling` |
| `/races` | `"… \| Roadman Cycling"` | `… \| Roadman Cycling \| Roadman Cycling` |
| `/about` | `"About — Anthony Walsh & Roadman Cycling"` | `About — Anthony Walsh & Roadman Cycling \| Roadman Cycling` |
| `/about/press` | `"Press & Media Kit — Anthony Walsh & Roadman Cycling"` | `… & Roadman Cycling \| Roadman Cycling` |
| `/wrapped` | `"Season Wrapped \| Roadman Cycling"` | `… \| Roadman Cycling \| Roadman Cycling` |
| `/sponsor` | `"Sponsor — Roadman Cycling"` | `Sponsor — Roadman Cycling \| Roadman Cycling` |
| `/contact` | layout `"Contact — Roadman Cycling"` | `Contact — Roadman Cycling \| Roadman Cycling` |
| `/research` | `"Research & Evidence Base — Roadman Cycling"` | `… — Roadman Cycling \| Roadman Cycling` |
| `/start-here` | `"Start Here — New to Roadman Cycling?"` | `Start Here — New to Roadman Cycling? \| Roadman Cycling` |
| `/terms` | `"Terms of Service — Roadman Cycling"` | doubled |
| `/privacy` | `"Privacy Policy — Roadman Cycling"` | doubled |
| `/cookies` | `"Cookie Policy — Roadman Cycling"` | doubled |
| `/plateau` | `"The Masters Plateau Diagnostic — Roadman Cycling"` | doubled |
| `/partners` | `"Partner With Us — Roadman Cycling Media Kit"` | doubled |
| `/results` (marketing) | `"Your saved results — Roadman Cycling"` | doubled |
| `/predict/[slug]/success` | `"Race Report — payment received \| Roadman Cycling"` | doubled |
| `/diagnostic/[slug]` | `"Your diagnosis: … — Roadman Cycling"` | doubled |
| `/results/[tool]/[slug]` | `"Your result — Roadman Cycling"` | doubled |
| `/results/ftp-zones/[slug]`, `/results/fuelling/[slug]` | `"Your … — Roadman Cycling"` | doubled |
| `/guests/[slug]` | `"\${name} — Roadman Cycling Podcast Guest"` | doubled |

- **Severity:** **HIGH** — affects every browser tab title, social share preview (`og:title` is also doubled in many), Google SERP. Trust-erosion-grade.
- **Fix:** Strip the embedded "Roadman Cycling" suffix from each title literal. Title template will append it once.

### H2 — `next/image` quality "85" not configured
- **Source:** `src/components/ui/ParallaxImage.tsx:59` uses `quality={85}`. `next.config.ts` does not declare `images.qualities`. Next.js 16 prints a warning per call and may strip the prop in production builds, falling back to default 75.
- **Affected pages:** any page rendering the home hero or a `ParallaxImage` (homepage, blog hero, community pages).
- **Severity:** **HIGH** — image fidelity regression at build time + console noise.
- **Fix:** Add `qualities: [75, 85]` to `images` in `next.config.ts`.

### H3 — Missing alt text on YouTube episode thumbnail
- **Location:** `src/app/(content)/you/[slug]/page.tsx:313` — `<Image alt="" />` for a content thumbnail.
- **Severity:** **HIGH** — accessibility + SEO.
- **Fix:** Set descriptive alt referencing the episode title.

### H4 — Server-side errors thrown on render in dev
Two pages throw in dev because env vars are absent. Both currently render 200 but spam console with full stack traces; if env config drifts in prod, the page would 500.

- `/plateau` — `recentSubmissionCount` queries Postgres with no `POSTGRES_URL` set, throws `VercelPostgresError`. (`src/app/(marketing)/plateau/page.tsx:368`)
- `/newsletter` — `getPublicationId` throws `BEEHIIV_PUBLICATION_ID is not set`. (`src/lib/integrations/beehiiv.ts:24` via `src/app/(marketing)/newsletter/page.tsx:29`)

- **Severity:** **HIGH** — defensive default needed; these should degrade gracefully when the integration isn't configured.
- **Fix:** Wrap each call in try/catch and return a sensible fallback (0 / empty list) when env is missing.

---

## MEDIUM

### M1 — Dead anchor `/sponsor#quiz`
- `src/app/(marketing)/partners/page.tsx:852` links to `/sponsor#quiz`. The target page only has `id="booking-flow-section"`. Click scrolls nowhere.
- **Fix:** Update href to `/sponsor#booking-flow-section`.

### M2 — `href="#"` in `PredictForm` CourseCard
- `src/app/(content)/predict/_components/PredictForm.tsx:220` passes `href="#"`.
- **Fix:** Render a `<button>` when no real route is set, or wire to the predict slug.

### M3 — Missing canonical on success/result dynamic pages
Pages with metadata but no `alternates.canonical`: `/predict/[slug]/success`, `/reports/[product]/success`, `/reports/[product]/view/[token]`, `/results/[tool]/[slug]`, `/results/ftp-zones/[slug]`, `/results/fuelling/[slug]`, `/diagnostic/[slug]`, `/strength-training/success`. Most have `noindex`, so impact is small, but worth adding canonicals for shareable ones.

### M4 — Title in `<title>` HTML-encodes apostrophes (`&#x27;`) and ampersands (`&amp;`)
That's correct HTML escaping, but several `og:title` and `twitter:title` strings inherit the same and end up double-escaped in some social previews. (Sampled — confirmed in one Open Graph payload.) Worth a follow-up audit; not blocking.

### M5 — Cache-Control config warning in dev
Dev server prints: `Custom Cache-Control headers detected for the following routes: - /_next/static/(.*)` (from `vercel.json` / `next.config.ts`). Next.js documents that this can break dev HMR. Production effect only — informational.

### M6 — Heavy archive payloads on `/podcast` (872 KB) and `/search` (1.04 MB) HTML
Full episode list rendered server-side. Not broken, but worth pagination or progressive enhancement for First-Load. Marked MEDIUM rather than HIGH because the main content does work.

---

## LOW

### L1 — Stray `console.log` / `console.error` in user-facing components
- `src/app/(marketing)/plateau/page.tsx:375` — `console.error("[Plateau] recentSubmissionCount failed:", err)`
- `src/components/features/diagnostic/DiagnosticFlow.tsx:314` — `console.error("[Diagnostic] submit failed", err)`
- `src/components/features/conversion/CheckoutButton.tsx:167,173` — `console.error("Checkout error:", …)`
- `src/components/analytics/WebVitalsReporter.tsx:27` — `console.log("[WebVitals] …")`

Cosmetic in prod (devtools noise); each is recoverable via an error boundary or by gating on `process.env.NODE_ENV !== "production"`.

### L2 — `/best/best-cycling-coach-uk` not generated despite the topic having a blog post
There is `content/blog/best-cycling-coach-uk.mdx` (a blog article) but `getAllBestForSlugs()` does not include this slug, so `/best/best-cycling-coach-uk` 404s as expected — but it's a natural query/typing mistake. Optional: add the slug or a 301 to `/blog/best-cycling-coach-uk`. Not strictly broken — listed for awareness.

---

## Routes verified as fully OK (selected)

`/`, `/blog`, `/blog/aero-vs-weight-cyclist`, `/podcast`, `/podcast/ep-1-the-dark-truth-behind-team-skys-marginal-gains`, `/coaching`, `/apply`, `/ask`, `/tools` and all 8 calculator subpages, `/compare` and slug samples, `/problem/not-getting-faster`, `/problem/stuck-on-plateau`, `/best/best-cycling-training-apps`, `/topics`, `/topics/ftp-training`, `/community`, `/community/club`, `/community/clubhouse`, `/community/not-done-yet`, `/about`, `/search`, `/glossary`, `/start-here`, `/research`, `/editorial-standards`, `/newsletter`, `/events`, `/sponsor`, `/partners`, `/strength-training`, `/wrapped`.

All return 200, render an H1, and have non-empty `<main>` content. (Issues above are layered on top of these.)

---

## Fix plan executed in this session

The following CRITICAL and HIGH items were fixed and committed; see the diff for the verification:

1. C1, C2, C3 — Added server-component `layout.tsx` files exporting `metadata` for `/predict`, `/predict/courses`, `/community/not-done-yet/fit`.
2. H1 — Removed the embedded "Roadman Cycling" suffix from every offending title literal across the 19 routes listed above (page-level `metadata` and `openGraph.title`, layouts where applicable).
3. H2 — Added `images.qualities: [75, 85]` to `next.config.ts`.
4. H3 — Fixed alt text on the YouTube thumbnail in `you/[slug]/page.tsx`.
5. H4 — Wrapped `recentSubmissionCount` (Plateau) and the Beehiiv `getPublicationId` call (Newsletter) in try/catch so missing env vars degrade gracefully.

MEDIUM and LOW items were left for follow-up — they don't block ship and several need product input (e.g. archive pagination strategy on `/podcast` and `/search`).
