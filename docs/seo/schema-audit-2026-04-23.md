# Structured Data Audit

**Date:** 2026-04-23
**Method:** Parsed JSON-LD blocks from live HTML, validated required fields per schema.org type against Google Rich Results Test requirements.
**Pages tested:** `/coaching`, `/tools/ftp-zones`, `/blog/zone-2-training-complete-guide`, `/plan/wicklow-200`

---

## TL;DR

All expected schema types are present on all 4 pages, and all JSON-LD parses cleanly (no syntax errors). One high-severity issue on `/coaching` (4 testimonials marked up as `Review` without `reviewRating` — risks being ignored at best, flagged as schema-manipulation at worst). One moderate issue on `/plan/wicklow-200` (SportsEvent missing `startDate`). Two trivial `url` omissions on nested Organizations.

---

## Coverage summary

| Page | Blocks | Expected types | Present? |
|---|---|---|---|
| /coaching | 6 | Service, Course, Review, FAQPage | all present |
| /tools/ftp-zones | 6 | SoftwareApplication, HowTo, FAQPage | all present |
| /blog/zone-2-training-complete-guide | 6 | BlogPosting, FAQPage, BreadcrumbList | all present |
| /plan/wicklow-200 | 5 | CollectionPage (+SportsEvent), FAQPage, BreadcrumbList | all present |

Sitewide Organization + WebSite blocks are emitted on every page. BreadcrumbList present on every page. FAQPage present on every page.

---

## Issues

### 1. `/coaching` — 4 Reviews lack `reviewRating` (HIGH)

Four testimonials are marked up as `@type: Review` with `author`, `reviewBody`, and `itemReviewed` — but no `reviewRating`.

**Why it matters.** Google's Review rich result requires `reviewRating`. Without it, Rich Results Test flags the block as ineligible. More importantly, marking up unrated praise as `Review` can be interpreted as schema manipulation — Google's structured-data spam policies specifically call this out.

**Two acceptable fixes, pick one:**

Option A — add ratings (fine if these customers would genuinely rate 5-star):

```json
{
  "@type": "Review",
  "author": { "@type": "Person", "name": "Damien Maloney" },
  "reviewBody": "…",
  "reviewRating": { "@type": "Rating", "ratingValue": 5, "bestRating": 5 },
  "itemReviewed": { "@type": "Service", "name": "Roadman Cycling Coaching" }
}
```

Option B — drop the Review type. If you don't have ratings, use `quotation` or plain HTML for testimonials and leave schema out of it. Safest from a spam-policy perspective.

**File to edit:** likely `src/app/coaching/page.tsx` or a review-schema component it imports.

**Sub-issue:** each `Review.itemReviewed` is a `Service` without a `provider`. Minor — if you fix Option A, also add `"provider": { "@type": "Organization", "name": "Roadman Cycling", "url": "https://roadmancycling.com" }` to the itemReviewed Service.

### 2. `/plan/wicklow-200` — SportsEvent missing `startDate` and typed `location` (MODERATE)

The CollectionPage has an `about` SportsEvent:

```json
"about": {
  "@type": "SportsEvent",
  "name": "Wicklow 200",
  "sport": "Cycling",
  "location": "Ireland"
}
```

**Why it matters.** `SportsEvent` without `startDate` can't surface in event rich results. `location` should be a `Place` object, not a bare string, if you want location-based eligibility.

**Fix (values to confirm):**

```json
"about": {
  "@type": "SportsEvent",
  "name": "Wicklow 200",
  "sport": "Cycling",
  "startDate": "2026-06-07",
  "endDate": "2026-06-07",
  "location": {
    "@type": "Place",
    "name": "Wicklow, Ireland",
    "address": { "@type": "PostalAddress", "addressCountry": "IE", "addressRegion": "Wicklow" }
  },
  "url": "https://wicklow200.ie"
}
```

Repeat for the other 13 `/plan/[event]` hubs. If a page is a training-plan hub rather than an event page, you could alternatively remove the `SportsEvent` entirely — but keeping it (with proper dates) gives you event rich-result eligibility.

**File to edit:** wherever `/plan/[event]` page assembles its JSON-LD — likely `src/app/plan/[event]/page.tsx`, possibly a helper in `src/lib/` using event metadata.

### 3. `/coaching` — Course.provider.Organization uses `sameAs` instead of `url` (TRIVIAL)

```json
"provider": {
  "@type": "Organization",
  "name": "Roadman Cycling",
  "sameAs": "https://roadmancycling.com"   // should also be "url": "..."
}
```

Rich Results Test warns (doesn't error). Fix: add `"url": "https://roadmancycling.com"`.

### 4. `/blog/...` — Author's `worksFor` Organization lacks `url` (TRIVIAL)

```json
"worksFor": { "@type": "Organization", "name": "Roadman Cycling" }
```

Add `"url": "https://roadmancycling.com"`. This lives wherever the author Person block is constructed — likely `src/components/seo/JsonLd.tsx` or a blog-specific author component.

---

## What's working well

- All JSON-LD parses cleanly on all 4 pages. No malformed blocks.
- BlogPosting has all required fields (headline, image, datePublished, author, publisher).
- SoftwareApplication on `/tools/ftp-zones` is complete (name, applicationCategory, offers).
- HowTo on `/tools/ftp-zones` has `step` array populated.
- FAQPage on every page has `mainEntity` with populated Question/Answer pairs.
- BreadcrumbList on every page has `itemListElement` with correctly-numbered ListItems.
- Sitewide Organization + WebSite blocks are present and have required fields.

---

## Also worth running (not automated here)

Once the fixes above ship, paste each URL into <https://search.google.com/test/rich-results> to confirm the warnings clear. The tool also catches some property-level issues my automated check doesn't (e.g. image dimensions too small, price currency codes).

Also recommended: paste a representative podcast episode URL into the Rich Results Test — we audited blog but not podcast, and the PodcastEpisode + VideoObject + Quotation combo is worth a fresh eye.

---

## Priority order for fixing

1. `/coaching` Reviews — either add `reviewRating` or drop the Review type. **Do this first** — spam-policy risk.
2. `/plan/[event]` SportsEvent — add `startDate` + structured `location` (applies to all 14 event hubs).
3. Trivial `url` additions on Course.provider and blog author.worksFor.
