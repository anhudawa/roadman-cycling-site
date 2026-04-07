# Roadman Cycling Site -- QC Report

**Date:** 2026-04-03
**Auditor:** Claude Opus 4.6
**Build status:** PASS (no errors or warnings)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2     |
| High     | 8     |
| Medium   | 10    |
| Low      | 8     |
| **Total**| **28**|

---

## 1. BROKEN LINKS

### CRITICAL-01: 10 broken blog links on tools pages
Every tools page has "Related Reading" links to blog posts that do not exist yet. These render as clickable links that lead to 404 pages.

| Tools page | Broken link |
|---|---|
| `/tools/shock-pressure` | `/blog/mtb-suspension-setup-complete-guide` |
| `/tools/shock-pressure` | `/blog/mtb-tyre-pressure-guide` |
| `/tools/shock-pressure` | `/blog/mtb-fork-setup-guide` |
| `/tools/energy-availability` | `/blog/cycling-body-composition-guide` |
| `/tools/energy-availability` | `/blog/cycling-weight-loss-fuel-for-the-work-required` |
| `/tools/fuelling` | `/blog/cycling-in-ride-nutrition-guide` |
| `/tools/fuelling` | `/blog/cycling-energy-gels-guide` |
| `/tools/ftp-zones` | `/blog/ftp-training-zones-cycling-complete-guide` |
| `/tools/ftp-zones` | `/blog/how-to-improve-ftp-cycling` |
| `/tools/tyre-pressure` | `/blog/cycling-tyre-pressure-guide` |

**Fix:** Either create these blog posts or remove/hide the links until the content exists.

### CRITICAL-02: Club page links to old ClickFunnels domain
`/community/club` has a "Join Roadman CC" button pointing to `https://www.roadmancycling.com/roadman-club-membership` -- this is the OLD ClickFunnels domain that the new site is replacing. This link is either dead or will break once DNS switches over.

**Fix:** Replace with the correct Skool or new-site equivalent URL.

---

## 2. LINK CONSISTENCY

### HIGH-01: Inconsistent Skool community URLs
Two different Skool URLs are used across the site:

- `https://skool.com/roadmancycling` -- used on homepage and Not Done Yet page
- `https://skool.com/roadman` -- used on community page, clubhouse page

These may point to different communities (Clubhouse = free, Not Done Yet = paid) which would make this intentional. However, the community page's Clubhouse card uses `skool.com/roadman` while the homepage's Clubhouse CTA uses `/community/clubhouse` (the on-site page). Verify these are correct and consistent.

**Fix:** Audit all Skool URLs and confirm each is pointing to the correct community.

---

## 3. SEO ISSUES

### HIGH-02: Podcast page h1 uses section-size font instead of hero-size
`/podcast` page h1 ("THE ARCHIVE") uses `var(--text-section)` instead of `var(--text-hero)`. Every other major landing page uses `text-hero` for its h1. This makes the podcast page visually inconsistent and signals lower importance to search engines (visual hierarchy mismatch).

**File:** `src/app/(content)/podcast/page.tsx:68`

### HIGH-03: Contact page h1 uses section-size font
Same issue as above. `/contact` page h1 ("GET IN TOUCH") uses `var(--text-section)`.

**File:** `src/app/(marketing)/contact/page.tsx:43`

### HIGH-04: No page-level Open Graph metadata on most pages
Only the root layout and dynamic detail pages ([slug]) have OpenGraph metadata. These static pages are missing OG tags (they inherit from root layout, which is OK but not optimal):

- `/about`
- `/guests`
- `/community`
- `/community/club`
- `/community/clubhouse`
- `/community/not-done-yet`
- `/podcast`
- `/blog`
- `/tools`
- `/newsletter`
- `/contact`
- `/strength-training`

The root layout provides fallback OG data, so these pages won't be blank when shared, but they'll all show the generic homepage title/description. This is particularly problematic for the community and strength-training pages which are conversion-focused.

**Fix:** Add `openGraph` metadata to each page's `metadata` export with page-specific titles, descriptions, and ideally unique OG images.

### HIGH-05: Topics not in main navigation
`/topics` is a major content hub with its own page and 9+ sub-pages, but it has no presence in the main nav (`NAV_ITEMS` in `src/types/index.ts`). It is only accessible via footer links. This hurts discoverability and internal linking.

**Fix:** Add Topics to the main navigation, perhaps as a child of "Blog" or as its own top-level item.

### MEDIUM-01: Missing JSON-LD on several pages
These pages have no structured data:

- Homepage: has `OrganizationJsonLd` and `WebSiteJsonLd` (good)
- `/about`: has `Person` schema (good)
- `/guests`: has `CollectionPage` + `BreadcrumbList` (good)
- `/podcast`: has `PodcastSeries` + `BreadcrumbList` (good)
- `/blog`: has `CollectionPage` + `BreadcrumbList` (good)
- `/community`: **MISSING** -- should have Organization or similar
- `/community/clubhouse`: **MISSING** -- should have Product or Service schema
- `/tools`: **MISSING** -- should have CollectionPage schema
- `/newsletter`: **MISSING** -- could have WebPage schema
- `/contact`: **MISSING** -- should have ContactPage schema

### MEDIUM-02: No breadcrumbs on About, Community, Club, Clubhouse, Newsletter, Contact, Tools pages
Breadcrumb structured data exists on Guests, Podcast, Blog, and Topics pages but is missing from other pages. A `Breadcrumbs` component exists (`src/components/seo/Breadcrumbs.tsx`) but is unused on most pages.

### MEDIUM-03: Sitemap missing strength-training/success page
While `robots` on the success page correctly sets `index: false`, this is fine. Just noting for completeness.

---

## 4. UX / CONTENT ISSUES

### HIGH-06: Team member image potentially mismatched
About page team section uses `/images/team/ant.avif` for "Wes Andrade" (Production). The filename "ant.avif" suggests this might be Anthony's image, not Wes's. The team section also shows `anthony.avif` for Anthony Walsh, so there appear to be two different images, but the naming is confusing.

**Fix:** Verify `ant.avif` is actually Wes Andrade. If not, replace with correct image or rename for clarity.

### HIGH-07: Newsletter subscriber count may be hardcoded/stale
The newsletter page displays "Join 29,782 cyclists" -- this appears to be a hardcoded number that will become stale. It appears twice on the page.

**File:** `src/app/(marketing)/newsletter/page.tsx:72,163`

**Fix:** Either dynamically fetch the subscriber count or use a rounded/approximate number ("29,000+") that doesn't appear falsely precise.

### HIGH-08: Community member count hardcoded in multiple places
"113 cyclists" appears on the Not Done Yet page (twice) and "2,100" on the Clubhouse pages. These will go stale.

### MEDIUM-04: Contact page uses raw button element instead of Button component
The contact page submit button is a raw `<button>` element instead of using the shared `Button` component. While functional, this is inconsistent with the rest of the site.

**File:** `src/app/(marketing)/contact/page.tsx:157-168`

### MEDIUM-05: No loading state indication on community page
The community page (`/community`) has no `ScrollReveal` animations unlike every other page, making it feel inconsistent. The page renders instantly with no entrance transitions.

### MEDIUM-06: Heading "THE SATURDAY SPIN" used for newsletter in both banner and footer
The same newsletter heading is used in the homepage email capture banner and the footer. This is fine but the footer version uses an `<h3>` while the banner uses an `<h2>`, creating a minor heading hierarchy inconsistency.

---

## 5. ACCESSIBILITY

### MEDIUM-07: Custom cursor hides native cursor on all desktop devices
`globals.css` sets `cursor: none` on body and all interactive elements for devices with fine pointers. This means the custom `SmoothCursor` component is the ONLY cursor. If the custom cursor fails to render (JS error, slow load), desktop users have no cursor at all.

**Fix:** Consider keeping `cursor: none` only when the custom cursor component has mounted successfully (manage via a class on body from the component).

### MEDIUM-08: No skip-to-content target on some interactive elements
The skip-to-content link targets `#main-content` which exists on all pages (good). However, the mobile menu lacks a "Close" button text -- it relies purely on the animated hamburger icon. The `aria-label` is present (good), but the visual affordance of "close" relies on the animation.

### LOW-01: Timeline section on About page uses emoji as visual content
The milestones timeline uses emoji icons (`aria-hidden="true"` is set, which is correct), but screen readers miss the visual categorization these provide. Minor issue since the text content is descriptive enough.

### LOW-02: Email capture forms lack explicit error IDs for aria-describedby
The EmailCapture component shows error messages but doesn't link them to the input via `aria-describedby`. Screen reader users may not hear the error message.

---

## 6. CONSISTENCY ISSUES

### MEDIUM-09: Font size inconsistency on h1 headings across pages
Most page h1 elements use `var(--text-hero)` but some use `var(--text-section)`:

| Font size | Pages |
|---|---|
| `text-hero` | Homepage, About, Guests, Community, Club, Clubhouse, Not Done Yet, Blog, Tools, Topics, Newsletter, Strength Training |
| `text-section` | **Podcast**, **Contact**, individual tool pages (ftp-zones, tyre-pressure, race-weight, fuelling, energy-availability, shock-pressure) |

The individual tool pages using `text-section` for h1 is arguably intentional (they're utility pages, not landing pages), but Podcast and Contact should match other top-level pages.

### MEDIUM-10: Two different Skool community URL patterns
See HIGH-01 above. `skool.com/roadman` vs `skool.com/roadmancycling`.

### LOW-03: Some pages use `<a>` tags instead of Next.js `<Link>` for internal links
Homepage (`src/app/page.tsx`) uses raw `<a href="/community/not-done-yet">` tags in three places instead of Next.js `<Link>`. This means no client-side navigation for those links -- they trigger full page reloads.

**Files:** `src/app/page.tsx:86,94,100` and `src/app/(marketing)/about/page.tsx:302`

### LOW-04: Inconsistent button usage across community CTAs
The community page Clubhouse card uses `<Button external>` pointing to Skool, while the homepage Clubhouse card uses `<Button href="/community/clubhouse">` pointing to the on-site page. The user experience differs depending on which card they click.

### LOW-05: Card component has `"use client"` directive
The `Card` component uses `"use client"` for mouse-tracking effects. This means every page that uses `Card` (nearly all of them) forces client-side rendering for the card tree. The tilt/shine effects are nice but may not justify the hydration cost on content-heavy pages.

### LOW-06: Tools page heading h3 instead of h2
On the homepage tools section and the tools index page, tool titles use `<h3>` tags. On the homepage this is correct (h2 is "YOUR TOOLKIT", h3 is each tool). On the tools index page, there's no h2 before the grid, so the h3 tags skip a level.

**File:** `src/app/(content)/tools/page.tsx:90-93`

### LOW-07: Footer "Strength Training" link path inconsistency
Footer links to `/strength-training` which is under `(marketing)` route group. This works, but the nav item under Community dropdown also links to `/strength-training`. Since it's a standalone product page, it may be better suited under its own nav section rather than nested under Community.

### LOW-08: Grain overlay positioning
The `grain-overlay` CSS class uses `position: absolute` for its `::after` pseudo-element, which requires the parent to have `position: relative`. The `Section` component likely handles this, but if `grain` is applied to elements without `position: relative`, the grain will misposition. Just a defensive coding note.

---

## 7. BUILD STATUS

Build completed successfully with:
- 0 errors
- 0 warnings
- All static pages generated
- Sitemap generated correctly (both Next.js native and next-sitemap)
- 311+ podcast episodes, 68+ guest pages, 9+ topic hubs, all blog posts generated

---

## TOP 5 QUICK WINS

1. **Fix 10 broken blog links on tools pages** -- Either create the blog posts or remove/comment out the "Related Reading" links. These are visible 404s on your highest-traffic utility pages. (CRITICAL-01)

2. **Replace ClickFunnels URL on club page** -- The `roadmancycling.com/roadman-club-membership` link will break when DNS moves. Swap to correct URL. (CRITICAL-02)

3. **Audit and standardize Skool URLs** -- Verify `skool.com/roadman` and `skool.com/roadmancycling` are both correct and used in the right contexts. (HIGH-01)

4. **Add Topics to main navigation** -- It's a major content hub hidden in the footer. Adding it to the nav (under Blog or standalone) improves discoverability and SEO internal linking. (HIGH-05)

5. **Fix podcast/contact h1 font sizes** -- Two-character change on each file: swap `text-section` to `text-hero`. Visual consistency and SEO hierarchy improvement. (HIGH-02, HIGH-03)

---

## PAGES AUDITED

| Page | Metadata | JSON-LD | OG | h1 | Canonical | Notes |
|------|----------|---------|----|----|-----------|-------|
| `/` (homepage) | Yes (layout) | Yes (Org + WebSite) | Yes (layout) | Yes (HeroSection) | Yes | No page-level OG |
| `/about` | Yes | Yes (Person) | No (inherits) | Yes | Yes | |
| `/guests` | Yes | Yes (Collection + Breadcrumb) | No (inherits) | Yes | Yes | |
| `/podcast` | Yes | Yes (PodcastSeries + Breadcrumb) | No (inherits) | Yes (undersized) | Yes | h1 uses text-section |
| `/blog` | Yes | Yes (Collection + Breadcrumb) | No (inherits) | Yes | Yes | |
| `/community` | Yes | No | No (inherits) | Yes | Yes | No JSON-LD |
| `/community/clubhouse` | Yes | No | No (inherits) | Yes | Yes | No JSON-LD |
| `/community/not-done-yet` | Yes | Yes (Product + FAQ) | No (inherits) | Yes | Yes | |
| `/community/club` | Yes | Yes (SportsOrg) | No (inherits) | Yes | Yes | Broken CTA link |
| `/tools` | Yes | No | No (inherits) | Yes | Yes | No JSON-LD, h3 skip |
| `/newsletter` | Yes | No | No (inherits) | Yes | Yes | Hardcoded numbers |
| `/contact` | Yes (layout) | No | No (inherits) | Yes (undersized) | Yes | Uses raw button |
| `/strength-training` | Yes | Yes (Product) | No (inherits) | Yes | Yes | |
| `/topics` | Yes | Yes (Collection + Breadcrumb) | No (inherits) | Yes | Yes | Not in main nav |

---

*End of QC report.*
