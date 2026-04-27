# Indexing Audit — roadmancycling.com

Audit date: 2026-04-27
Branch: `claude/loving-elbakyan-56a27e` (merging in concurrent fixes from
`2a633a9` on `main`).

Code-side audit triggered by Google Search Console flagging:
*Alternate page with proper canonical tag*, *Not found (404)*,
*Page with redirect*, *Blocked by robots.txt*, *Soft 404*.

Two independent audits ran in parallel and found complementary defects;
all four fixes are now landed together.

---

## Summary

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | `/methodology`, `/sponsor` indexable but missing from sitemap | Medium | **Fixed in `2a633a9`** |
| 2 | `/races` hub + 20× `/races/[slug]` indexable but missing from sitemap | Medium | **Fixed in `2a633a9`** |
| 3 | Beehiiv build-time failure was silent — no log when newsletter URLs disappeared | Low | **Resolved by #5** |
| 4 | `/predict/[slug]/success` indexable with thin content (soft 404 risk) | High | **Fixed in this PR** |
| 5 | `/newsletter/[slug]` is `noindex` but emitted in sitemap (contradiction) | High | **Fixed in this PR** |

Everything else Google reports in those five categories is healthy in the
codebase — listed below for completeness.

---

## 1. 404s

### Sitemap → routes
Every URL emitted by `src/app/sitemap.ts` resolves to a real route:
- Static pages map 1:1 to existing `page.tsx` files. After `2a633a9`,
  `/methodology`, `/sponsor`, `/races`, and every `/races/{slug}` from
  the `RACES` array in `src/data/races.ts` are included — these were
  indexable pages absent from the sitemap, the textbook "Discovered, not
  indexed" pattern.
- Dynamic pages: every dynamic route used by the sitemap has
  `generateStaticParams()` that fully enumerates its slugs from the
  canonical data layer — `getAllPosts()`, `getAllEpisodes()`,
  `getAllGuests()`, `getAllTopicSlugs()`, `getAllTermSlugs()`,
  `getAllComparisonSlugs()`, `getAllBestForSlugs()`,
  `getAllProblemSlugs()`, `getAllPlanCombinations()` /
  `getAllEventSlugs()`.
- `coaching/[location]/page.tsx` exposes the 11 locations the sitemap
  names (ireland, uk, usa, dublin, cork, galway, london, manchester,
  belfast, edinburgh, leeds) via a hardcoded `LOCATIONS` map plus
  `generateStaticParams`. No gaps.
- `/you/[slug]` covers plateau, event, comeback, listener.

### Redirect destinations
`next.config.ts` declares ~73 redirects (72 × 301, 1 × 302 — the 302 is
`/2026 → /apply`, intentional and time-bound). Every destination
resolves:
- `/coaching/{ireland,uk,usa}` → real `[location]` slugs.
- `/community/clubhouse`, `/community/club`, `/community/not-done-yet`,
  `/strength-training`, `/apply`, `/coaching`, `/coaching/triathlon`,
  `/tools/*`, `/about`, `/about/press`, `/partners`, `/podcast`,
  `/contact`, `/plan` — all exist.
- All seven blog redirect targets present in `content/blog/*.mdx`:
  `/blog/cycling-weight-loss-fuel-for-the-work-required`,
  `/blog/cycling-periodisation-plan-guide`,
  `/blog/common-training-mistakes-from-1400-podcast-episodes`,
  `/blog/best-cycling-podcasts-2026`,
  `/blog/cycling-coach-near-me-why-location-doesnt-matter-2026`,
  `/blog/how-much-does-online-cycling-coach-cost-2026`,
  `/blog/trainerroad-vs-online-cycling-coach`.
- `/compare/trainingpeaks-vs-todays-plan` →
  `/compare/trainingpeaks-vs-vekta`: destination present in
  `src/lib/comparisons.ts`. Verified.

No redirect chains: every `permanent: true` source goes to a final route
in one hop.

### Stale internal links
Searched `src/components`, `src/app`, and `content/` for `<Link href="…">`
references; cross-checked against the route map and redirect sources.
No stale public-facing internal links found. No remaining references to
the old `/compare/trainingpeaks-vs-todays-plan` slug exist in `src/` or
`content/` — anything Google still has cached resolves via the 301 in
`next.config.ts`.

The admin sidebar contains a `href="/admin"` link without a matching
`/admin/page.tsx`; this is internal-only, robots.txt-blocked, and not
part of the GSC public-indexing surface, so out of scope.

### Dynamic data-source 404 behaviour
Every public dynamic route calls `notFound()` when the slug resolves to
no data, returning a real HTTP 404 — never a 200 with empty content.
Verified in `blog/[slug]`, `podcast/[slug]`, `predict/[slug]`,
`compare/[slug]`, `glossary/[slug]`, `topics/[slug]`, `best/[slug]`,
`problem/[slug]`, `guests/[slug]`, `you/[slug]`, `plan/[event]`,
`plan/[event]/[weeksOut]`, `coaching/[location]`, `races/[slug]`,
`author/[slug]`, `newsletter/[slug]`, `results/[tool]/[slug]`,
`results/ftp-zones/[slug]`, `results/fuelling/[slug]`,
`diagnostic/[slug]`, `reports/[product]/*`.

---

## 2. robots.txt

`src/app/robots.ts` blocks:
`/api/`, `/admin/`, `/account/`, `/cart/`, `/checkout/`, `/sign-in`,
`/login`, `/strength-training/success`, `/success/`, `/thank-you`,
`/unsubscribe`, `/preview/`, `/draft/`, `/_next/`.

- API and admin paths blocked correctly.
- Defensive paths (`/account/`, `/cart/`, `/checkout/`, `/sign-in`,
  `/login`) don't exist as routes — intentional future-proofing.
- `/strength-training/success` is also `noindex` at the page level
  (belt + braces).
- `/success/` is a prefix-match disallow. It does NOT match
  `/predict/{slug}/success` (which doesn't start with `/success/`) —
  that page needed its own page-level `noindex` (see fix #4).
- No sitemap URL is blocked by robots.txt. **No contradiction.**

---

## 3. Soft 404s

### Issue #4 — `/predict/[slug]/success` (FIXED in this PR)

**File:** `src/app/(content)/predict/[slug]/success/page.tsx`

Post-Stripe payment confirmation page for the Race Report. It:
- Returns HTTP 200 regardless of whether `slug` resolves.
- Has thin content (a single paragraph + an outbound CTA).
- Lacked `robots: { index: false }` in its metadata.
- Inherits the parent `/predict/layout.tsx` canonical
  (`https://roadmancycling.com/predict`), which would tell Google this
  page is a duplicate of `/predict`.

Either signal alone is enough to be flagged as a soft 404 or "Alternate
page with proper canonical tag". The page is per-user, transactional,
and should never be indexed.

**Fix:** added `robots: { index: false, follow: false }` to the
page-level `metadata` export. A canonical tag is unnecessary when
noindexed.

### Other risk pages (verified clean)
- `/predict/[slug]` itself → already `robots: { index: false, follow: true }`.
- `/strength-training/success` → noindex + robots.txt block.
- `/results` → noindex (per-user, token-gated). Not in sitemap.
- `/results/[tool]/[slug]` and `/results/{ftp-zones,fuelling}/[slug]` →
  noindex. Not in sitemap.
- `/reports/[product]/{success,view/[token]}` → noindex. Not in sitemap.
  Download endpoint sets `X-Robots-Tag: noindex, nofollow`.
- `/search` → noindex. Not in sitemap.
- `/diagnostic/[slug]` → noindex. Not in sitemap.
- `/wrapped` → server component with proper metadata; renders demo data
  by default so the page is never empty.
- `/offline` → noindex. Not in sitemap.
- Global `not-found.tsx` → noindex; App Router emits HTTP 404
  automatically.

---

## 4. Canonical tags

### Sitemap–canonical format consistency
- Sitemap emits `https://roadmancycling.com/...` (apex, no `www`, no
  trailing slash).
- Every canonical tag in the codebase uses the same format.
- `next.config.ts` sets `trailingSlash: false`.
- `metadataBase = new URL("https://roadmancycling.com")` in
  `src/app/layout.tsx`.

No `www.roadmancycling.com` or trailing-slash variants found.

### Client-component canonical coverage
Every client-component page in the sitemap (`/tools/*`, `/predict`,
`/predict/courses`, `/contact`, `/wrapped` shell,
`/community/not-done-yet/fit`) has a sibling `layout.tsx` that exports
`metadata` with `alternates.canonical`. Layout-level metadata is the
correct way to attach canonicals to client-component pages in App
Router and is being used consistently.

### Author route collision
Both `src/app/(marketing)/author/anthony-walsh/page.tsx` (static) and
`src/app/(marketing)/author/[slug]/page.tsx` (dynamic) exist. Next.js
matches the static segment first, and the dynamic route's
`generateStaticParams` filters Anthony out (`a.primary`). No duplicate
emission, no canonical conflict.

### Issue #5 — newsletter sitemap–noindex contradiction (FIXED in this PR)

**Files:**
- `src/app/(marketing)/newsletter/[slug]/page.tsx` — sets
  `robots: { index: false, follow: true }` because individual newsletter
  issues are thin email broadcasts repurposed as web pages.
- `src/app/sitemap.ts` (`buildTopicAndMoreSitemap`) — was emitting one
  entry per Beehiiv issue at `/newsletter/{slug}`.

A page that's `noindex` should not be in the sitemap — Google flags this
as "Submitted URL marked 'noindex'", and it's also one of the patterns
that shows up under "Alternate page with proper canonical tag" because
Google ends up choosing a different canonical entirely.

**Fix:** removed the per-issue newsletter URLs from the sitemap. The
`/newsletter` index page (which IS indexable) stays in the sitemap.
Issue slugs remain reachable via internal links from `/newsletter`,
RSS, and emails — they just don't claim indexability.

This also resolves issue #3 (Beehiiv silent-failure logging from
`2a633a9`): now that the sitemap doesn't depend on Beehiiv at all, the
silent-failure path no longer exists. The `console.error` added in
`2a633a9` was for a code path we've now removed.

---

## 5. Redirects

All redirects in `next.config.ts` are single-hop and land on real routes
(see §1). The two patterns worth calling out:

- `coaching.roadmancycling.com` subdomain rules use
  `has: [{ type: "host" }]` and consolidate the legacy ClickFunnels
  subdomain onto the apex. Path-to-regexp v8 (Next.js 16+) syntax is
  used correctly (`/optin-:rest(.*)` and `/roadmancc:rest(.*)`).
- `rewrites().beforeFiles` rewrites a list of dead ClickFunnels paths to
  `/api/gone`, which returns HTTP 410 — the correct way to tell Google
  those URLs are gone for good. `/sitemap.xml` rewrites to the
  `sitemap-index.xml` route handler.

The "Page with redirect" GSC category is informational — these are
expected for any site that has migrated URL structures, and Google will
drop the redirect sources from the index over time. No action needed.

---

## Combined fix list (this PR + `2a633a9`)

In `src/app/sitemap.ts`:
- ✅ `/methodology` and `/sponsor` added to `buildStaticSitemap` (`2a633a9`).
- ✅ `/races` hub + every `/races/{slug}` from the `RACES` array added
  via spread; new entries pick up automatically (`2a633a9`).
- ✅ Per-issue newsletter URLs removed from `buildTopicAndMoreSitemap`
  to resolve the noindex/sitemap contradiction (this PR).
- ✅ Beehiiv import dropped — sitemap no longer depends on the external
  API at all.

In `src/app/(content)/predict/[slug]/success/page.tsx`:
- ✅ Added `robots: { index: false, follow: false }` to the page metadata.

That's the full code delta. Everything else inspected was already healthy.
