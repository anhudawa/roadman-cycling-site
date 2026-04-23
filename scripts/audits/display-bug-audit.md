# Display Bug Audit — 2026-04-22

Full-site audit for text clipping, overflow, and illegible layouts on mobile + desktop. Triggered by the live headline-clip bug on `/blog/cycling-strength-training-guide`.

## Root cause of the reported bug

The blog-hero (Satori-generated branded card, `/api/og/blog-hero/route.tsx`) was rendered at 1600×900 (16:9). The consumer container on `/blog/[slug]/page.tsx` forces `aspect-[21/9]` with `object-cover`, which centre-crops a 16:9 image to 21:9 — chopping **~107px off both the top and the bottom** of the source image. That's exactly where the Satori layout placed the pillar badge + "ROADMAN · BLOG" label (top) and the "ROADMAN / roadmancycling.com" footer (bottom). On long-headline posts the inner text also drifts closer to the clip zone, producing the "headline text cut off" symptom Anthony saw.

## High-confidence fixes (applied)

1. **`src/app/api/og/blog-hero/route.tsx`** — Changed output dimensions from 1600×900 to 1600×686 (21:9). Now matches the consumer container exactly; nothing gets centre-cropped.
2. **`src/app/api/og/blog-hero/route.tsx`** — Shrunk the oversized pillar dot glyph from 360×360 → 280×280 so it stays centred inside the tighter 686px canvas rather than nosing into the headline column.
3. **`src/app/api/og/blog-hero/route.tsx`** — Tightened `resolveTitleFontSize` with a finer 5-tier scale (118/100/80/68/58px) and an additional >90-char bucket. Previous thresholds only went down to 68px at 80+ chars; the longest current blog title is 81 chars ("I Read Every Stephen Seiler Paper I Could Get My Hands On. Here's What I Learned."), and several podcast-adjacent headlines push into the 90s.
4. **`src/app/api/og/blog-hero/route.tsx`** — Reduced inner padding from `90px 90px 80px` → `64px 90px 60px` to compensate for the shorter canvas while preserving the visual balance.
5. **`src/app/(content)/blog/[slug]/opengraph-image.tsx`** — Added two smaller buckets (`>90 → 38px`, `>75 → 42px`) to the title font-size ladder. Was previously floored at 48px, which wrapped to 4+ lines and risked clipping the author line/footer on an 81-char title.
6. **`src/app/(content)/podcast/[slug]/opengraph-image.tsx`** — Same two-bucket extension as the blog OG. Longest podcast title today is 78 chars; episode title drift trends long over time.
7. **`src/app/globals.css`** — Added `overflow-wrap: break-word` to the global `h1-h6` rule. Narrow mobile viewports + long uppercase compound words (TRAINERROAD, PERIODISATION, MARATONA DLES DOLOMITES) can otherwise force horizontal scroll on the whole page. Scoped to headings only so body prose rules are unaffected.

All seven edits ship as a single commit (see below). TypeScript pass: `npx tsc --noEmit` — zero errors.

## Medium/low confidence — flagged, not fixed

- **Decorative ambient orbs** at `src/app/(community)/apply/page.tsx:190` (`w-[600px] h-[600px]`) and `:441` (`w-[800px] h-[400px]`) — these sit outside the content column with `pointer-events-none` and `blur-[120px+]`. They don't clip text but they do force the `<Section>` wrapper to be taller than its content on wide viewports. Likely intentional; no fix.
- **CohortBanner detail truncate** at `src/components/features/conversion/CohortBanner.tsx:125` — uses `truncate` on the banner detail text. On narrow mobile viewports (<375px) a long-detail cohort could get cut off. Currently operating safely (short copy), but a future copywriter could ship a broken banner without noticing. Consider swapping to `line-clamp-2` with a min-height.
- **Long plan-hub event names** on `/plan/[event]` — uses `var(--text-hero)` with `event.name.toUpperCase()` + `TRAINING PLAN.` on two lines. At the 3.5rem mobile floor, 23-char names like "MARATONA DLES DOLOMITES" are right at the 375px-viewport edge. The new global `overflow-wrap: break-word` on `h1` mitigates the worst case; still worth eyeballing on a real phone.
- **Plateau OG "ROADMAN CYCLING" bottom-marker** at `src/app/(marketing)/plateau/opengraph-image.tsx:95` — absolutely positioned `bottom: -40px` relative to a centered content div. It'll render somewhere mid-canvas rather than at the bottom — ugly, not clipped. Same pattern repeats in `/topics/[slug]`, `/guests/[slug]`, `/you/[slug]`, `/plan/[event]` OG routes. Single-project polish pass, not urgent.
- **Featured-image blog posts (non-generic)** — any post whose `featuredImage` is NOT in `GENERIC_BLOG_IMAGES` renders the raw asset inside the same `aspect-[21/9]` + `max-h-[480px]` + `object-cover` container. If a curated 16:9 editorial photo is uploaded, it will crop the same ~12% top/bottom. Not a text-clip bug, but worth knowing when the image library gets curated (flag in `src/lib/blog-images.ts`).

## Pages still worth eyeballing on a real device

- `/blog/cycling-strength-training-guide` — should now display the full Satori hero with no clipping
- `/blog/ftp-training-zones-cycling-complete-guide` (73 chars) — hits the 80-char font tier; check the new 68px wrap
- `/blog/polarised-vs-sweet-spot-training` — "POLARISED" at mobile hero size
- `/podcast/ep-2132-how-do-team-bora-approach-building-endurance-we-find-out-joh` — long title, new 42/38px bucket
- `/plan/maratona-dles-dolomites` — longest event name + "TRAINING PLAN" stacked
- `/start-here` — short hero, quick smoke test for the global `overflow-wrap` change
- `/plateau` — diagnostic hero + OG card visually
- Any `/topics/[slug]` page — topic headlines at `var(--text-hero)` on mobile

## Commit

See trailing commit hash in the shell output accompanying this report.
