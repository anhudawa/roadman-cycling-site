# SEO Health Check — 2026-05-29

Three checks run in parallel against `main`. Two commits landed:
`9281427c` (sitemap + schema fixes) and `2df92b7a` (internal linking sweep).

## 1. Sitemap health

- **Total indexable URLs**: 1,962 across seven child sitemaps
  (`/sitemap/0.xml` through `/sitemap/6.xml`).
- **Broken URLs**: 0. Every entry resolves — 1,941 prerendered,
  21 runtime-rendered (notably `/ask`, `/sponsor`, the `/tools/*`
  cookie-reading pages, and the 16 `/predict/[slug]` pages).

### Fixed

- **Orphan**: `/training-plans` had full SEO metadata and `index:true`
  but was never emitted in `sitemap.ts`. Added to `buildStaticSitemap`
  with `priority 0.85, weekly` — sits between the marketing-pillar
  block and the `/training-camps` cluster.
- **Duplicate URL — `/glossary/energy-availability`**: defined twice in
  `src/lib/glossary.ts` (lines 659 and 825). Kept the line-825 entry
  (longer, Roadman-voice, includes `relatedTopicHub`); removed the
  earlier short duplicate.
- **Duplicate URLs — guests**: `greg-lemond` and `laurens-ten-dam` were
  each emitted twice. Root cause: `getAllGuests()` keys its `Map` by
  the normalised display name; episode metadata contained both
  "Greg LeMond"/"Greg Lemond" and "Laurens Ten Dam"/"Laurens ten Dam";
  `slugify()` collapsed the two variants to identical slugs but the
  Map kept two entries. Added `NAME_ALIASES` entries pointing the
  lowercase variants at the canonical capitalisations
  (already present in `KNOWN_CREDENTIALS`).

### Not fixed (intentional)

- 154 `/experts/[expert]/[topic]` pages are excluded because they're
  `noindex,follow` by design — no curated quote, summary, or evidence.
  The `isIndexableExpertTopicPair` gate keeps the sitemap in lockstep
  with the page-level robots tag.
- All `/admin/*`, `/embed/*`, `/go/*`, `/method/*`, success/booked
  pages, `/search`, `/offline`, `/masters-report`, `/newsletter/[slug]`
  — all `noindex` per spec, correctly omitted.
- `/sitemap.xml` rewrites to `/sitemap-index.xml` — intentional, per
  `next.config.ts`.

## 2. Internal linking sweep — 20 newest blog posts

Reviewed the 20 most recently published posts (`unbound-gravel-2026-…`
through `breathing-for-cyclists-…`). **9 new internal links added,
3 pre-existing broken links fixed.**

| Action | Count |
|---|---|
| New `/answers/*` links | 8 |
| New `/experts/*` links | 1 (`matt-bottrill`) |
| `/diagnostic` → `/plateau` corrections | 3 |
| Posts left unchanged (already dense / no natural fit) | 10 |

Each link was added inline on existing phrasing — no anchor-text
rewrites, no force-fits.

### Why `/diagnostic` was broken

The brief asked to link to `/diagnostic` but that route does not
render — only `/diagnostic/[slug]` exists (for stored results of a
completed submission). The canonical Plateau Diagnostic landing page
site-wide is `/plateau`. Verified no remaining MDX references to bare
`/diagnostic`. **Note:** `src/lib/ask/cta.ts:23` hardcodes
`/diagnostic/plateau` — that path expects a submission hash, not the
literal string "plateau", so it likely 404s. Flagged for follow-up.

### Data-quality issues surfaced

1. `/experts/[slug]` overrides missing for **Dylan Johnson, Daryl
   Fitzgerald, Bent Ronstad, Tim Kerrison** — all cited as authorities
   in multiple posts but currently only have `/guests/[slug]` pages
   (or `/entity/[slug]` in Kerrison's case).
2. Body-text **"Yori Carlson"** vs profile slug **`uri-carlson`** —
   one of the two is wrong. Unsafe to link until decided.
3. Two parallel expert URL systems (`/experts/[slug]` and
   `/guests/[slug]`) with overlapping but unequal coverage — the older
   `/guests/` links dominate existing posts, which is why only one new
   `/experts/` link landed.

### Candidate answer pages worth creating

- `/answers/winter-training`
- `/answers/heat-training`
- `/answers/strength-training-cyclists` (deeper protocol than the
  existing `should-cyclists-lift-weights`)

## 3. JSON-LD schema audit — 10 pages

Audited: `/`, a recent blog post, a podcast episode, an expert hub,
an answer page, `/go`, `/masters`, `/about`, `/podcast` index, `/ask`.

| Page | Verdict |
|---|---|
| `/` | PASS |
| `/blog/[slug]` (most recent) | PASS |
| `/podcast/[slug]` | PASS |
| `/experts/[slug]` | PASS |
| `/answers/[slug]` | PASS |
| `/go` | PASS (noindex — root `@graph` only, intentional) |
| `/masters` | PASS |
| `/about` | **FAIL → fixed** |
| `/podcast` (index) | PASS |
| `/ask` | PASS |

### Fixed

- **`/about` JSON-LD `mentions[].@id` mismatch**: a local
  `expertSlug()` helper skipped both `NAME_ALIASES` normalisation and
  Unicode-diacritic stripping that `slugifyGuestName` performs. Result:
  "Professor Stephen Seiler", "Dr. David Dunne", and "Rosa Klöser"
  emitted `@id`s like `…/guests/professor-stephen-seiler#person` that
  did not match the canonical Person `@id`s emitted by `/guests/[slug]`
  (`…/guests/stephen-seiler#person`). Crawlers would have seen two
  distinct Person nodes per expert. Replaced helper body with a
  delegation to `slugifyGuestName`.
- **`/about` visible expert Card `href`** used the same broken inline
  slug logic. Pointed it at the now-canonical `expertSlug()` helper so
  the UI links and JSON-LD `@id`s stay in lockstep.

### Cross-page consistency

- All audited pages reference `ENTITY_IDS.{organization, website,
  podcast, person}` from `src/lib/brand-facts.ts` — no hardcoded `@id`
  divergence found anywhere else.
- `/podcast` index re-asserts the canonical `PodcastSeries @id` and
  augments with `numberOfEpisodes`, `webFeed`, `sameAs` — correct
  same-`@id` merge pattern.
- Topic-hub linkage (`isPartOf`, `about`) is consistent across blog,
  podcast episode, and answer pages.

### Not fixed (recommended follow-ups)

1. `/podcast` index imports `BRAND_STATS, PODCAST` without using them.
   Lint-level cleanup.
2. `/ask` `WebApplication` lacks an `@id`. Adding
   `@id: "${SITE_ORIGIN}/#ask-roadman"` would make it referenceable
   from `mentions` arrays on blog/podcast pages that already CTA into
   Ask. Schema-valid without, but worth doing.
3. `JsonLd.test.tsx` has good root-`@graph` coverage but no assertion
   that `/about` `mentions[].@id` values resolve to canonical guest
   `@id`s. A test there would catch this class of bug in future.

### Post-commit verification caught a regression

A spot-check after `2df92b7a` revealed the linking agent had invented
answer-slugs rather than checking `src/lib/answers-data/`. 7 of the 8
new `/answers/*` links pointed at non-existent pages — every one would
have been a 404. Repointed at real slugs in `97364e58`:

| Invented (broken) | Replacement (verified) |
|---|---|
| `ftp-test-guide` | `20-minute-ftp-test` |
| `how-to-stop-plateauing` (x2) | `ftp-not-improving` |
| `polarised-vs-sweet-spot` | `polarised-or-pyramidal-training` |
| `should-cyclists-lift-weights` | `does-strength-training-increase-ftp` |
| `carbs-per-hour-cycling` | `fuel-for-the-work-required` |
| `cycling-training-over-40` | `can-you-get-faster-after-50` |
| `how-many-hours-training` | `periodisation-limited-time` |

Process note: when delegating linking work to a sub-agent in future,
have it write out the candidate target slug list once, grep it against
the data source, then iterate. The "verify each URL before linking"
instruction in the prompt wasn't sufficient on its own.

## Commits

- `9281427c` — fix(seo): sitemap orphan, guest dup slugs, glossary dup, /about @id mismatch
- `2df92b7a` — seo: internal linking sweep on 20 newest blog posts
- `97364e58` — fix(seo): repoint 7 invented answer-slugs at real ones

## Suggested next pass

- Add the four missing `/experts/[slug]` overrides flagged above.
- Decide "Yori Carlson" vs "uri-carlson" and reconcile the body-text
  spellings with the slug.
- Investigate `src/lib/ask/cta.ts:23` `/diagnostic/plateau` link
  (likely 404 at runtime since `plateau` isn't a stored submission
  hash).
- Add the three candidate answer pages where the linking sweep
  surfaced unmet query intent.
