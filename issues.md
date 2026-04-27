# Sitewide Quality Audit — 2026-04-27

Branch: `claude/eloquent-kowalevski-ba442b`
Scope: every public route on roadmancycling.com
Method: HTTP smoke-test of 58 routes against the dev server, static code analysis (4 parallel agents), in-browser verification via Claude Preview, TypeScript check.

All routes from the user's checklist returned **200** except:
- `/methodology` → **404** (page does not exist; user mentioned as "new")
- `/admin` → 307 (redirect to `/admin/login`, expected)

---

## Critical

### C1. Race detail pages link to a 404 prediction route
- **Files:** `src/app/(marketing)/races/[slug]/page.tsx:111-114`, `src/app/(marketing)/races/[slug]/page.tsx:343,350`
- **Symptom:** every race with `predictor_slug` (Étape du Tour, La Marmotte, Mallorca 312, Wicklow 200, Dragon Ride, RideLondon, Tour of Flanders sportive) renders a "Predict My Finish Time" CTA pointing at `/predict/{predictor_slug}`. That URL hits the **prediction-result** route, which calls `notFound()` because the slug isn't a stored prediction — every click 404s.
- **Verified:** `curl /predict/wicklow-200` → 404, `curl /predict/etape-du-tour-2026` → 404 (and 5 more).
- **Root cause:** `/predict/[slug]/page.tsx` is the result page (slug is a generated prediction id from `getPredictionBySlug`). The route to **start** a prediction with a course pre-selected is `/predict?course={slug}` (already used by `predict/courses` and `_components/CourseCard`).
- **Fix:** `predictorHref = race.predictor_slug ? `/predict?course=${race.predictor_slug}` : `/predict/courses``
- **Severity:** CRITICAL — main conversion CTA on every race page is dead.

---

## High

### H1. Page titles render the brand suffix twice
- **Files:**
  - `src/app/(marketing)/wrapped/page.tsx:6`
  - `src/app/(marketing)/races/page.tsx:9`
  - `src/app/(marketing)/races/[slug]/page.tsx:27`
  - `src/app/(content)/predict/[slug]/success/page.tsx:14`
- **Symptom:** root layout sets `title.template = "%s | Roadman Cycling"`. These four pages hardcode `"... | Roadman Cycling"` in the `title` string, so the rendered `<title>` becomes `"X | Roadman Cycling | Roadman Cycling"`.
- **Verified:** `curl /races/wicklow-200 | grep title` → duplicated. Same for `/races` and `/wrapped`.
- **Fix:** drop the trailing `| Roadman Cycling` from each `title` string (template will append it).
- **Severity:** HIGH — every search result, social card, and browser tab on these high-traffic pages shows ugly duplication.

### H2. /predict, /predict/courses, /predict/[slug] inherit default site metadata
- **Files:**
  - `src/app/(content)/predict/page.tsx` — `"use client"`, no metadata or sibling layout
  - `src/app/(content)/predict/courses/page.tsx` — same
  - `src/app/(content)/predict/[slug]/page.tsx` — server component but no `generateMetadata`
- **Symptom:** all three render `<title>Roadman Cycling — Cycling Coaching, Training & Performance Podcast</title>` and the homepage description. These are the highest-intent tool pages on the site.
- **Verified:** `curl /predict | grep '<title>'` returns the homepage title.
- **Fix:** add a `predict/layout.tsx` server component exporting metadata for `/predict` (and `/predict/courses` if a separate sub-layout). Add `generateMetadata` to `/predict/[slug]/page.tsx` that uses the prediction's course name.
- **Severity:** HIGH — SEO + share-card miss on the most valuable pages.

### H3. Race-result CTA links to a redirect instead of canonical URL
- **File:** `src/app/(content)/predict/[slug]/page.tsx:403`
- **Symptom:** `<Button href="/not-done-yet">` returns 308 → `/community/not-done-yet`. Works, but every click pays a redirect, leaks attribution params under some setups, and breaks `Link` prefetch on a route that doesn't exist client-side.
- **Fix:** change to `/community/not-done-yet`.
- **Severity:** HIGH — visible CTA, primary upgrade flow.

---

## Medium

### M1. /methodology returns 404
- **Symptom:** user mentioned `/methodology` as "(new)" but no `page.tsx` exists at `src/app/(*)/methodology/`. Only `src/lib/mcp/services/methodology.ts` (an MCP backend service).
- **Status:** likely intentional / not-yet-shipped. Flagging because user listed it in the audit checklist.
- **Action:** confirm with user whether `/methodology` should be a public page.

### M2. HR Zones and W/kg calculators lack a save / email-capture step
- **Files:** `src/app/(content)/tools/hr-zones/page.tsx`, `src/app/(content)/tools/wkg/page.tsx`
- **Symptom:** FTP Zones, Race Weight, Fuelling, Energy Availability all render a `SaveToolResultForm` after calculation (email gate → result delivery). HR Zones and W/kg only offer a "Copy" button.
- **Severity:** MEDIUM — feature gap, lost email captures.

### M3. Number inputs across all tools lack `inputMode="decimal"`
- **Files:** all of `src/app/(content)/tools/*/page.tsx`
- **Symptom:** `<input type="number" step="0.1">` shows the integer keypad on iOS, not the decimal keypad. Only the predict-page `NumberField` sets it correctly.
- **Severity:** MEDIUM — mobile UX.

### M4. Cohort banner consumes the top of the viewport on initial load
- **Symptom:** the homepage screenshot shows a black band above the cohort banner — that's the banner-height CSS variable applied to header `top` even when the banner is closed (animated render). Visible only on the very first paint; resolves once the banner mounts.
- **Severity:** LOW–MEDIUM — minor flash, no layout shift after first frame.

### M5. /tools index lists 10 items but 3 are not calculators
- **File:** `src/app/(content)/tools/page.tsx:23-94`
- **Symptom:** Race Predictor (real tool, deep page at /predict), Plateau Diagnostic (`/plateau`), and Coaching Assessment (`/assessment`) sit in the same grid as the 8 calculators. Naming is inconsistent — "tool" means three different things.
- **Severity:** MEDIUM — IA confusion, not a bug.

---

## Low

### L1. Dead `void` statements
- **File:** `src/app/(content)/predict/[slug]/page.tsx:99-100`
- **Symptom:** `void baselinePower; void siteUrl;` — leftover from a refactor. ESLint-suppression noise.
- **Severity:** LOW.

### L2. No loading / disabled state on Calculate buttons
- **Files:** `src/app/(content)/tools/*/page.tsx`
- **Symptom:** rapid double-clicks fire the handler twice; clipboard writes can race.
- **Severity:** LOW — calculation is synchronous, low real-world impact.

### L3. Decorative `alt=""` on a podcast persona page
- **File:** `src/app/(content)/you/[slug]/page.tsx:313`
- **Symptom:** image has `alt=""`. If the image is purely decorative, this is correct; if it's a guest portrait, it needs alt text. Visual confirmation needed.
- **Severity:** LOW — depends on image role.

### L4. `defaultValue="0"` NumberField regression — NOT present
- Audited every `<input type="number">` and the custom `NumberField`. The known 0-prefix bug is fixed: `NumberField` uses an internal string state (`useState<string>("")`), and tool pages use `value={controlled}` with `placeholder` for the example numeric. No regressions.

### L5. Exit-intent popup blocking — NOT present
- Audited `ConversionChrome`, `ExitIntentPopup`, `CookieConsent`, `MobileStickyApply`, `CohortBanner`, `PodcastPlayerShell`, mobile menu. Z-index stack is sane (header z-50, exit-intent z-[10000], cookie z-50). All overlays have working close buttons, and body scroll locks have cleanup.

### L6. "Browse Strava" file-picker mismatch — NOT present
- Audited `GpxDropzone`, `StravaPlaceholder`, predict form, wrapped form. The Strava placeholder card on `/wrapped` is correctly disabled with "Connect Strava (coming soon)". The GpxDropzone copy says "Export the route from Strava, Komoot, Garmin or RideWithGPS, then upload it here" — accurate, no false promise. No CTA exists labeled "Browse Strava".

---

## Verified clean

- All 58 audited public routes return 200 (only `/methodology` 404s, by absence).
- Dynamic routes (`/blog/[slug]`, `/podcast/[slug]`, `/topics/[slug]`, `/glossary/[slug]`, etc.) call `notFound()` on miss.
- `Header` NAV_ITEMS hrefs all resolve.
- `Footer` columns (Podcast, Learn, Coaching, Community, About, Legal) all resolve.
- TypeScript: only test-file errors (`process.env.NODE_ENV` readonly), no production-code errors.
- Cookie consent has a working "reject all", dismissable on every route.
- Mobile menu: `aria-expanded` set, body-scroll lock cleans up on unmount.
- Homepage and `/community/clubhouse` render with single h1.
- Number inputs on `/predict` use a controlled `NumberField` that handles empty state correctly.

---

## Fix plan

This audit will land:
1. **C1** — repoint race-page predictor CTAs.
2. **H1** — strip duplicate brand suffix from 4 titles.
3. **H2** — add metadata for /predict, /predict/courses, /predict/[slug].
4. **H3** — replace `/not-done-yet` with `/community/not-done-yet`.
5. **L1** — drop dead `void` statements while editing the file.

Medium/low items deferred (separate tickets).
