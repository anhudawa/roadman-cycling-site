# Blog SEO Audit Report

**Date:** 2026-04-07
**Files audited:** 91 MDX files in `/content/blog/`
**Components audited:** `src/app/(content)/blog/page.tsx`, `src/app/(content)/blog/[slug]/page.tsx`

---

## Executive Summary

The blog is in strong SEO shape overall. Every file has the core frontmatter fields populated (title, seoTitle, seoDescription, excerpt, pillar, author, publishDate, keywords). No files are missing descriptions, no files have short content, and all pillars are valid values. The main gaps are: missing `featuredImage` on 7 posts, missing FAQ schema on ~30 posts, and a formatting glitch in one file (fixed).

---

## Page Component Audit

### Blog List Page (`/blog/page.tsx`)

| Check | Status |
|-------|--------|
| `<title>` meta tag | PASS - "Blog -- Training, Nutrition & Performance" |
| `<meta name="description">` | PASS - 171 chars, well-written |
| Canonical URL | PASS - `https://roadmancycling.com/blog` |
| Open Graph tags | PASS - title, description, type, url |
| Twitter Card | NOT SET (inherits from OG, acceptable) |
| Structured data: CollectionPage | PASS - JSON-LD with numberOfItems |
| Structured data: BreadcrumbList | PASS - Home > Blog |

**Verdict:** Solid. No action needed.

### Blog Post Page (`/blog/[slug]/page.tsx`)

| Check | Status |
|-------|--------|
| `<title>` meta tag | PASS - uses seoTitle with title fallback |
| `<meta name="description">` | PASS - uses seoDescription |
| `<meta name="keywords">` | PASS - uses keywords array |
| Canonical URL | PASS - per-post canonical |
| Open Graph tags | PASS - title, description, type=article, publishedTime, modifiedTime, authors, url, images, tags |
| Twitter Card | PASS - summary_large_image with OG image |
| Dynamic OG image | PASS - via /api/og with title, pillar, author |
| Structured data: BlogPosting | PASS - headline, description, author (Person), publisher (Organization), dates, mainEntityOfPage, keywords, image |
| Structured data: Person (E-E-A-T) | PASS - Anthony Walsh with jobTitle, knowsAbout, sameAs |
| Structured data: BreadcrumbList | PASS - Home > Blog > Post Title |
| Structured data: FAQPage | PASS - conditional, renders when faq array exists |

**Verdict:** Excellent implementation. All major schema types present. E-E-A-T signals in place.

---

## Frontmatter Audit (All 91 Files)

### Required Fields - All Present

Every file has all of these populated:

- **title** - All present, all > 20 characters
- **seoTitle** - All present
- **seoDescription** - All present, all > 120 characters
- **excerpt** - All present
- **pillar** - All present, all valid values (coaching, nutrition, strength, recovery, le-metier)
- **author** - All present (Anthony Walsh)
- **publishDate** - All present
- **keywords** - All present, all have 5+ keywords

### Content Length

No files flagged for short content. All posts appear to be substantial (1,000+ words based on reading-time estimates).

---

## Issues Found & Fixed

### FIXED: Blank line in keywords array

**File:** `pogacar-training-secrets.mdx`
**Issue:** A blank line between keyword entries broke the YAML array.
**Fix:** Removed the blank line.

---

## Issues Found - Recommendations

### 1. Missing `featuredImage` (7 files)

These posts have no `featuredImage` field. The OG image generator at `/api/og` will still work (it uses title/pillar/author params), but having a featuredImage enables the BlogPosting schema `image` property which helps with Google rich results.

| File | Suggested Image |
|------|----------------|
| `cycling-in-rain-guide.mdx` | `/images/cycling/gravel-canyon-rest.jpg` |
| `mtb-bike-fit-basics.mdx` | `/images/cycling/gravel-rest-stop.jpg` |
| `mtb-dropper-post-setup-guide.mdx` | `/images/cycling/gravel-rest-stop.jpg` |
| `mtb-fork-setup-guide.mdx` | `/images/cycling/gravel-rest-stop.jpg` |
| `mtb-maintenance-guide.mdx` | `/images/cycling/gravel-rest-stop.jpg` |
| `mtb-skills-beginners-guide.mdx` | `/images/cycling/gravel-riding-canyon.jpg` |
| `how-to-get-faster-cycling.mdx` | `/images/cycling/gravel-road-climb.jpg` |

**Priority:** Medium. The OG image still generates, but the schema `image` property is missing on these 7 posts.

### 2. Missing FAQ Schema (30 files)

These posts have no `faq` array in frontmatter, meaning they miss out on FAQPage rich results in Google. Posts with FAQs get significantly more SERP real estate.

**High-priority (high-volume keywords, FAQ would add real value):**
- `cycling-hydration-guide.mdx`
- `cycling-over-40-getting-faster.mdx`
- `cycling-over-50-training.mdx`
- `cycling-power-to-weight-ratio-guide.mdx`
- `cycling-weight-loss-mistakes.mdx`
- `cycling-training-full-time-job.mdx`
- `cycling-body-composition-guide.mdx`
- `cycling-fasted-riding-myth.mdx`
- `ftp-plateau-breakthrough.mdx`
- `gravel-cycling-beginners-guide.mdx`
- `how-to-descend-faster-cycling.mdx`
- `vo2max-cycling-fixable-reasons-low.mdx`
- `zone-2-training-complete-guide.mdx` (has FAQ already)
- `polarised-training-cycling-guide.mdx` (has FAQ already)

**Medium-priority (editorial/narrative content, FAQ less critical):**
- `eating-like-pidcock-60-days.mdx`
- `greg-lemond-interview-roadman-podcast.mdx`
- `how-pro-cyclist-trains-60-days.mdx`
- `lachlan-morton-why-quit-world-tour.mdx`
- `pogacar-training-secrets.mdx`

**Lower-priority (content already thorough):**
- `cycling-climbing-tips-stop-getting-dropped.mdx`
- `cycling-vo2max-intervals.mdx`
- `etape-du-tour-training-plan.mdx`
- `heart-rate-high-cycling-fixable-reasons.mdx`
- `low-cadence-training-cycling-torque-intervals.mdx`
- `reverse-periodisation-cycling.mdx`
- `self-coached-cyclist-mistakes.mdx`
- `sweet-spot-training-cycling.mdx`
- `trainerroad-vs-coaching.mdx`
- `winter-training-cycling-guide.mdx`

**Priority:** High for the first group. FAQ rich results drive measurably more clicks from search.

### 3. No `tags` Array Used

The frontmatter schema uses `keywords` but there is no separate `tags` field. This is fine -- keywords serve double duty for meta tags and post filtering. No action needed unless a separate tagging/category system is planned.

### 4. No `updatedDate` on Any Post

None of the 91 posts have an `updatedDate` field. The schema falls back to `publishDate` for `dateModified`. For evergreen content that gets updated, adding `updatedDate` signals freshness to Google.

**Priority:** Low now. Add `updatedDate` whenever a post is substantially revised.

---

## Pillar Distribution

| Pillar | Count |
|--------|-------|
| coaching | 42 |
| le-metier | 23 |
| nutrition | 14 |
| recovery | 7 |
| strength | 2 |
| (triathlon, filed under coaching/nutrition) | 6 |

The `strength` pillar is notably thin (only cycling-strength-training-guide.mdx and cycling-stretching-routine.mdx). Consider whether strength & conditioning content should expand or whether these should be recategorised under `coaching` or `recovery`.

---

## What's Working Well

1. **Every post has an seoTitle distinct from title** - good for SERP optimisation vs. on-page readability
2. **seoDescription lengths are all 120-160 chars** - within Google's display range
3. **All keywords arrays have 5-8 targeted terms** - well-researched
4. **FAQ schema is conditional** - only renders when data exists, no empty schema
5. **E-E-A-T signals are strong** - Person schema with sameAs links, author attribution, podcast credibility
6. **Canonical URLs are set on every page** - good for preventing duplicate content
7. **BreadcrumbList schema on both list and detail pages** - helps Google understand site structure
8. **OG images are dynamically generated** - consistent branding across all shares

---

## Recommended Next Steps (Priority Order)

1. **Add FAQ sections to the 12 high-priority posts** listed above. 2-3 questions each, targeting "People Also Ask" queries.
2. **Add `featuredImage` to the 7 posts missing it** so BlogPosting schema includes the image property.
3. **Set `updatedDate` on any post that gets revised** going forward.
4. **Consider expanding strength pillar content** or redistributing those 2 posts.
