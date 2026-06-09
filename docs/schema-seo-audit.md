# Schema validation & SEO audit

_Last run: 2026-06-09. Scope: **code-level, stable** schema/SEO infrastructure — JSON-LD validity, canonical URLs, meta descriptions, OG tags, sitemap, robots.txt. Per-page generated copy that `seo:batch` and the internal-linking background jobs churn (blog/podcast/answers/topics body + generated descriptions) was deliberately **not** length-audited here; see "Needs re-audit after seo:batch completes" at the end._

## TL;DR

The schema/SEO **infrastructure is in excellent shape** — every public route has exactly one self-referencing canonical, OG/Twitter tags are inherited site-wide and overridden per-page, the sitemap is split into 7 chunks that stay in lockstep with `robots.ts` and `sitemap-index.xml`, and every JSON-LD component emits a valid `@context`/`@type` with required properties.

One **code-level defect class was found and fixed**: two programmatic training-plan routes built meta descriptions by interpolating unbounded editorial prose, so **100%** of `/plan/[event]` descriptions (210–317 chars) and **20%** of `/plan/[event]/[weeksOut]` descriptions (up to 187 chars) blew past the ~160-char SERP truncation point. Both templates are now bounded and verified ≤160 for every event × phase combination. The site-wide default description was also 170 chars and is now 145.

Remaining over-length descriptions are **individually-authored editorial strings** (comparisons, problems, best-for) — flagged for an editor to trim rather than rewritten here.

---

## 1. JSON-LD validity ✅ PASS

All structured-data emitters live in `src/components/seo/` and route through a single `JsonLd` wrapper (`JSON.stringify` into a `<script type="application/ld+json">`). Every type carries a correct `@context: "https://schema.org"` and a valid `@type`, with required properties present:

| Component | Type(s) | Notes |
|---|---|---|
| `JsonLd.tsx` → `OrganizationJsonLd` | `Organization`, `WebSite`, `Person`, `PodcastSeries` (one `@graph`) | Site-wide, injected once in root layout. Entities cross-reference by `@id` from `ENTITY_IDS`, so every page that references the org/author resolves to one entity. `WebSite` has a valid `SearchAction` `potentialAction`. |
| `ArticleSchema.tsx` | `BlogPosting` | `headline`, `author` (Person), `publisher` (Organization), `datePublished`, `mainEntityOfPage` all present; `dateModified` falls back to `datePublished`; `image` typed as `ImageObject` 1200×630. |
| `JsonLd.tsx` → `ArticleJsonLd` | `Article` | References Person/Organization/WebSite by `@id`. |
| `FAQSchema.tsx` / `FAQPageJsonLd` | `FAQPage` | `mainEntity[]` of `Question` → `acceptedAnswer` `Answer`. `FAQPageJsonLd` correctly returns `null` for an empty list. |
| `HowToSchema.tsx` | `HowTo` | `step[]` of `HowToStep` with `position`/`name`/`text`. |
| `BreadcrumbSchema.tsx` + `RouteBreadcrumbJsonLd.tsx` + `BreadcrumbJsonLd` | `BreadcrumbList` | `itemListElement[]` of `ListItem` with `position`/`name`/`item`. The site-wide `RouteBreadcrumbJsonLd` skips routes that emit their own richer trail (`SKIP_PATTERNS`), avoiding duplicate markup. |
| `PodcastEpisodeSchema.tsx` + `PodcastEpisodeJsonLd` | `PodcastEpisode` | `partOfSeries` → `PodcastSeries`; duration converted to ISO-8601 (`PTnHnMnS`); optional `associatedMedia`/`actor`. |
| `SoftwareApplicationSchema.tsx` | `WebApplication` | `applicationCategory`, `operatingSystem`, free `Offer` (price 0 USD), `publisher` by `@id`. |
| `ClaimReviewSchema.tsx` | `ClaimReview` (`@graph`) | `claimReviewed`, `itemReviewed` `Claim`, `reviewRating` `Rating` (best/worst 1–5), `author` Organization. Returns `null` when no items. |
| `ToolSchemas.tsx` | `WebApplication` + `HowTo` + `BreadcrumbList` + `FAQPage` | Pulled from the central `landing-content` registry so JSON-LD and visible copy can't drift. |
| `plan/[event]` page | `CollectionPage`, `Course` (+ `CourseInstance[]`), `SportsEvent` | JSON-LD `description` fields here are long but **uncapped by design** — JSON-LD descriptions have no SERP length limit. |

**No action required.** All `@id` references resolve to the site-wide `@graph` entities.

## 2. Canonical URLs ✅ PASS

- **Root layout intentionally sets no `alternates.canonical`** (`src/app/layout.tsx:77`). This is correct for Next 16's shallow metadata merge — a layout-level canonical would be inherited by every child and previously caused "Duplicate, Google chose different canonical" in GSC. Documented inline.
- **Homepage is the only page whose canonical is the apex origin** (`src/app/page.tsx:21`, `canonical: SITE_ORIGIN`). A repo-wide grep for any other page setting the bare origin as canonical returned **zero** matches.
- Every public page (124 files) sets a self-referencing absolute canonical, either in `page.tsx` or a sibling `layout.tsx` (tools, `/contact`, `/predict`, `/community/not-done-yet/fit`, etc.).
- Noindex funnel/thank-you surfaces correctly either emit no canonical or a self-canonical alongside `robots: noindex` (e.g. `/newsletter/[slug]` is `index:false` + self-canonical + excluded from sitemap — internally consistent).
- `/coaching/{ireland,uk,usa}` country pages emit an hreflang `languages` cluster with `x-default`; city pages get a plain self-canonical. Correct.

## 3. Meta descriptions — ⚠️ FIXED (code) + flagged (editorial)

### Fixed (code-level template defects)

| File | Was | Now | Verified |
|---|---|---|---|
| `src/app/layout.tsx` (site-wide default, inherited by homepage + any page without its own) | **170** chars | **145** | Rendered `/` = 145 ✓ |
| `src/app/(content)/plan/[event]/page.tsx:44` | **All 17** events 210–317 chars (injected `event.description.split(".")[0]` unbounded) | structured template, longest **158** | Rendered hub = 125 ✓ |
| `src/app/(content)/plan/[event]/[weeksOut]/page.tsx:47` | **20 of 102** combos up to 187 chars | bounded base + tagline appended only if it fits; longest **160** | Rendered 16-wk = 152 ✓ |

The two plan templates were genuine logic defects: they concatenated editorial prose / phase taglines with no length budget, so output length scaled with event-name and sentence length and overflowed systematically. Both now compose from bounded structured fields (distance, climbing, weeks-out windows) and were verified ≤160 across the **entire** event × phase matrix before committing.

### Flagged — editorial strings to trim (NOT rewritten)

These are individually hand-authored `seoDescription` values in TS data files. They're stable (not job-churned) but trimming changes wording, which is an editorial call:

- `src/lib/comparisons.ts` — **4 of 42** `seoDescription` over 160 (161, 162, 170, 176 chars). Identified leads: the `trainingpeaks-vs-vekta`, fasted-vs-fed, and sweet-spot-vs-zone-2 comparisons.
- `src/lib/problems.ts` — **5 of 138** `seoDescription` over 160.
- `src/lib/best-for.ts` — **1 of 10** over 160 (`best-cycling-apps-structured-training`).

`races.ts`, `coaching-segments.ts`, `canonical-entities.ts`/entity `shortBio`, `glossary.ts`, `questions.ts`, and the tools `landing-content.ts` were scanned and are all within budget (or use multi-line formats not statically measurable — see re-audit note).

## 4. OG / Twitter tags ✅ PASS

- Root layout (`src/app/layout.tsx:85`) defines a complete default `openGraph` (`type`, `locale`, `url`, `siteName`, `title`, `description` [111 chars], `images` 1200×630 with alt) and `twitter` (`summary_large_image`, `@Roadman_Podcast`). `metadataBase` is set so relative OG image paths resolve.
- 114 page/layout files override `openGraph` per-route; the rest inherit the valid default.
- The referenced assets exist: `public/og-image.jpg` (16 K), `public/images/logo-white.png` (12 K, the Organization logo), `public/images/team/anthony.avif` (24 K, the Person image).

## 5. Sitemap ✅ PASS

`src/app/sitemap.ts` uses `generateSitemaps()` to emit **7 chunks** (`/sitemap/0.xml` … `/sitemap/6.xml`):

- 0 — static/core + coaching (11 locations + all `SEGMENT_SLUGS`) + tools + community + marketing pillars + camps + Girona + legal + races + case studies + entities + predict landings
- 1 — blog · 2 — podcast episodes + transcripts · 3 — guests · 4 — plan hubs/phases + event guides · 5 — topics/glossary/compare/best/problem/question/answers · 6 — experts × topic

Cross-checks:

- **Chunk count is consistent** across `sitemap.ts` (`SITEMAP_IDS = [0..6]`), `sitemap-index.xml/route.ts` (`[0..6]`), and `robots.ts` (`/sitemap/0.xml`…`/sitemap/6.xml`). `next.config.ts` rewrites `/sitemap.xml` → `/sitemap-index.xml`.
- **Every indexable route is covered.** Dynamic param sets verified against their generators: `/coaching/[location]` (11 `LOCATIONS` keys, all in chunk 0), `/you/[slug]` (4 personas: plateau/event/comeback/listener, all listed), coaching segments (`SEGMENT_SLUGS` = all 13 `COACHING_SEGMENTS` keys).
- **No sitemap ↔ noindex contradictions.** All programmatic content routes (`/best`, `/compare`, `/problem`, `/question`, `/answers`, `/glossary`, `/topics`, `/event`, `/plan/*`) inherit `index:true`. `/predict/[slug]` indexes **only** for event-course landings (which match the `RACES.predictor_slug` entries in the sitemap) and noindexes user-prediction results (excluded). `/experts/[slug]/[topic]` uses the shared `isIndexableExpertTopicPair` rule for **both** its `robots` tag and `getIndexableExpertTopicPairs()` sitemap source, so they can't drift.
- **Noindex surfaces correctly excluded:** `/newsletter/[slug]`, `/results/*`, `/search`, `/profile`, `/method/*`, `/reports/*`, `/masters-report`, `/embed/*`, `/go`, and all `*/success` · `*/booked` · `*/booking-confirmed` conversion pages.
- `safeDate()` guards against a single malformed `publishDate` crashing the build with `RangeError: Invalid time value`.

## 6. robots.txt ✅ PASS

`src/app/robots.ts` (covered by `robots.test.ts`, which asserts the 14-rule shape):

- 14 rules: `*` + 13 named AI/search crawlers (GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot, Bingbot, Google-Extended, etc.), each carrying the same disallow list.
- Disallows `/api/`, `/admin/`, `/account/`, `/cart/`, `/checkout/`, `/sign-in`, `/login`, `/unsubscribe`, `/preview/`, `/draft/`, `/_next/`; explicitly allows `/` and `/_next/static/` (so renderers can fetch JS/CSS — more-specific Allow wins under REP).
- Sitemaps listed: `sitemap-index.xml` + `/sitemap/0.xml`…`/sitemap/6.xml` — matches the generated set.
- Correct call (documented inline): noindexed pages that should still be **crawled** (so Google sees the `noindex`/410) are deliberately kept out of the disallow list.

---

## Needs re-audit after `seo:batch` completes

These are **content-level** and outside this code-level pass — re-check once the generation/enrichment jobs have settled:

1. **Generated per-page meta descriptions** on blog, podcast, answers, topics, guests, etc. — these are derived from MDX frontmatter/transcripts that `seo:batch` and the internal-linking job actively rewrite. Their lengths were **not** audited here; run a length sweep against the live build afterwards.
2. **Entity `shortBio` and `race.description`** feed `/entity/[slug]` and `/races/[slug]` meta descriptions but are stored as multi-line/template strings not measurable by the static scan — verify their rendered length against the live server.
3. **Scaled-content backlog** (tracked separately in `docs/scaled-content-audit.md`): 27 thin `/problem` pages and 6 answer↔question near-duplicates.
4. **Editorial trims** from §3: 4 comparison + 5 problem + 1 best-for `seoDescription` strings over 160 — short enough to leave to an editor.

## Changes committed in this pass

- `src/app/layout.tsx` — default meta description 170 → 145 chars.
- `src/app/(content)/plan/[event]/page.tsx` — bounded hub meta description (all 17 events ≤160).
- `src/app/(content)/plan/[event]/[weeksOut]/page.tsx` — bounded phase meta description (all 102 combos ≤160).
