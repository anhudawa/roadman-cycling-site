# Image Integrity Audit — Roadman Cycling Site

**Date:** 2026-05-03  
**Scope:** All MDX content, source files, and public assets  
**Status:** Report only (no fixes applied)

---

## 1. Missing Featured Images (25 files)

Blog posts reference these images in frontmatter `featuredImage` fields, but the files do not exist in `public/`:

| # | Missing File | Example Content File |
|---|---|---|
| 1 | public/images/cycling/cycling-history-podium.jpg | content/blog/trek-lemond-doping-dispute-cycling-history.mdx |
| 2 | public/images/cycling/cyclist-cafe-stop-rapha-style.jpg | content/blog/cutting-training-half-real-power-data.mdx |
| 3 | public/images/cycling/cyclist-data-screen.jpg | content/blog/rapha-lost-its-soul-cycling-brand-decline.mdx |
| 4 | public/images/cycling/cyclist-fueling-bottle.jpg | — |
| 5 | public/images/cycling/cyclist-gym-strength-training.jpg | — |
| 6 | public/images/cycling/cyclist-interval-pain.jpg | — |
| 7 | public/images/cycling/cyclist-knee-pain.jpg | — |
| 8 | public/images/cycling/cyclist-nutrition-table.jpg | — |
| 9 | public/images/cycling/cyclist-power-meter-data.jpg | — |
| 10 | public/images/cycling/cyclist-recovery-stretching.jpg | — |
| 11 | public/images/cycling/cyclist-winter-rest.jpg | — |
| 12 | public/images/cycling/desert-cyclist-trail.jpg | — |
| 13 | public/images/cycling/female-cyclist-climb.jpg | — |
| 14 | public/images/cycling/gravel-cyclist-dust.jpg | — |
| 15 | public/images/cycling/gravel-race-bike-action.jpg | — |
| 16 | public/images/cycling/indoor-trainer-setup.jpg | — |
| 17 | public/images/cycling/lone-cyclist-coast.jpg | — |
| 18 | public/images/cycling/masters-cycling-race-pack.jpg | — |
| 19 | public/images/cycling/mountain-climb.jpg | — |
| 20 | public/images/cycling/peloton-sunset.jpg | — |
| 21 | public/images/cycling/road-cyclist-power-meter.jpg | — |
| 22 | public/images/cycling/road-race-pack-action.jpg | — |
| 23 | public/images/cycling/strength-training-cyclist.jpg | — |
| 24 | public/images/cycling/track-cycling-velodrome.jpg | — |
| 25 | public/images/cycling/zone-2-cycling-training.jpg | — |

---

## 2. Broken Image References in MDX Content

**PASS** — All inline image references (markdown syntax, `<img>` tags, `<Image>` components) in MDX files resolve to existing files in `public/`.

---

## 3. Orphaned Images (51 files)

Images in `public/images/` that are never referenced in any source or content file:

### Partner Logos (9 files)

- `public/images/partners/4endurance.png`
- `public/images/partners/4endurance.svg`
- `public/images/partners/4iiii.svg`
- `public/images/partners/bikmo-original.png`
- `public/images/partners/bikmo.png`
- `public/images/partners/bikmo.svg`
- `public/images/partners/discovery-plus.svg`
- `public/images/partners/parlee.png`
- `public/images/partners/parlee.svg`

### Logo Assets (35 files)

- `public/images/logo/Colour_1x/_logo 1.png` through `_logo 6.png`
- `public/images/logo/Colour_2x/Artboard 218@2x.png` through `Artboard 223@2x.png`
- `public/images/logo/White_1x/_RM Logo_White 1.png` through `_RM Logo_White 6.png`
- `public/images/logo/White_2x/_RM Logo_White@2x 1.png` through `_RM Logo_White@2x 5.png`

### Community Images (7 files)

- `public/images/community/DSC05595.JPG`
- `public/images/community/DSC05605.JPG`
- `public/images/community/DSC05714.JPG`
- `public/images/community/DSC05790.JPG`
- `public/images/community/DSC05832.JPG`
- `public/images/community/DSC05858.JPG`
- `public/images/community/main.JPG`

### Blog Images (2 files)

- `public/images/blog/hincapie-modern-adventure.jpg`
- `public/images/blog/paris-roubaix-2026-corvos.jpg`

### Other (1 file)

- `public/images/team/ant.avif`

---

## 4. Missing Alt Text

**PASS** — All `<img>` elements and `<Image>` components have `alt` attributes present.

Notes:
- Some decorative/tracking elements use `alt=""` (acceptable per WCAG for non-content images):
  - `src/components/features/diagnostic/MetaPixel.tsx:57`
  - `src/components/analytics/ConsentAwarePixel.tsx:68`
  - `src/components/proof/AthleteProfileCard.tsx:96`
- MDX fallback at `src/components/mdx/MDXComponents.tsx:31` uses `alt={alt ?? ""}` ensuring attribute is always present.

---

## 5. OG/Social Images

### Root Configuration

- **File:** `src/lib/brand-facts.ts:40` defines `ogImage: "/og-image.jpg"`
- **Asset:** `public/og-image.jpg` EXISTS (1200x630px)
- **Layout:** `src/app/layout.tsx:79-94` applies openGraph metadata with image
- **Twitter card:** `summary_large_image` configured

### Page-Level Issues

- **MISSING og:image:** `src/app/(marketing)/entity/[slug]/page.tsx` — Expert entity pages (~60+ pages) have openGraph title/description but NO image property in `generateMetadata`
- **PASS:** All other marketing pages inherit root og:image or explicitly set it

---

## 6. Favicon and Brand Assets

### Favicon: NOT CONFIGURED

Checked and NOT found:
- `public/favicon.ico`
- `public/favicon.png`
- `public/apple-touch-icon.png`
- No `icons` property in `src/app/layout.tsx` metadata export

### Brand assets present but unreferenced:

- `public/images/logo-white-2x.png` (not referenced in code)

---

## Summary

| Category | Status | Count |
|----------|--------|-------|
| Missing featured images | FAIL | 25 |
| Broken MDX image references | PASS | 0 |
| Orphaned images | WARN | 51 |
| Missing alt text | PASS | 0 |
| Missing og:image (entity pages) | WARN | ~60+ pages |
| Favicon missing | FAIL | No favicon files |

### Priority Actions

1. **CRITICAL:** Supply 25 missing featured images or update MDX frontmatter to reference existing files
2. **CRITICAL:** Add favicon.ico to public/ and configure in layout.tsx metadata
3. **MODERATE:** Add og:image to entity/[slug] generateMetadata
4. **LOW:** Audit orphaned images — remove unused or document their purpose
