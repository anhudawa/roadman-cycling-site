# Roadman Glitch Hero

Self-contained animated hero block. Pure HTML + CSS, no JS, no canvas,
no external libraries. Server-renders fine with JS disabled.

## Files

| File | Purpose |
|---|---|
| `roadman-hero.html` | Single-file deliverable — open in any browser. Demo page + component. |
| `roadman-portrait.jpg` | Portrait asset (801-ish square — head/shoulders). Referenced by the CSS `--portrait` token. |

## Previewing

Double-click `roadman-hero.html`. Any modern browser works. Desktop and
mobile both respected — the hero stays 1:1 and caps at 900px wide.

## Dropping into the existing site

1. Copy the `<section class="roadman-hero">…</section>` markup from
   the HTML body into wherever you want the hero (e.g. at the top of
   `src/app/page.tsx`).
2. Copy the CSS block inside `<style>` (everything between the
   `/* .roadman-hero */` banner and the closing brace) into your
   global stylesheet, OR keep it scoped via CSS-in-JS / a
   component-level `<style>`. All selectors are already namespaced
   under `.roadman-hero` so nothing leaks.
3. Drop `roadman-portrait.jpg` into `public/` (or wherever your
   static assets live) and update the `--portrait` custom property
   in the CSS to point at the served URL:
   ```css
   .roadman-hero {
     --portrait: url("/roadman-portrait.jpg");
   }
   ```
4. Remove the demo-page `body { … }` block at the very bottom of the
   `<style>` block — that exists only so the standalone file renders
   nicely when opened directly.

## What the animation does

Six layers, z-stacked bottom to top:

1. **Background** — flat `#1d0838`
2. **Ambient glow** — 85%-wide radial gradient, pulses scale + opacity
   over 2.4s
3. **Portrait** — cropped to head/shoulders via radial mask, subtle
   6s breathe (scale 1 → 1.06 + saturation lift)
4. **Glitch shards** — red + cyan chromatic-aberration copies.
   Invisible ~88% of the time, then snap through four displaced
   positions over the last 12% (steps(1, end), 2.2s). The cyan copy
   is delayed 0.1s so the glitch reads as real aberration, not two
   synced layers.
5. **Slice strips** — three 18px-tall horizontal bands at y=22/47/68%
   that show a portion of the portrait and jump horizontally in a 3s
   steps(1) cycle, staggered 0.7s between strips.
6. **Vignette** — soft radial darkening at the edges.

## Accessibility

- All motion respects `prefers-reduced-motion: reduce` — both the
  keyframe animations and the glitch/slice layers are disabled when
  the user has reduced motion on.
- Overlay text is rendered as real HTML (`<h1>`, `<span>`) so it's
  selectable, copyable, and screen-reader-accessible.
- Background layers carry `aria-hidden="true"`.

## Customising

Most knobs live as CSS custom properties at the top of `.roadman-hero`:

```css
--hero-bg: #1d0838;       /* background */
--glow-red: …;            /* inner glow colour */
--glow-purple: …;         /* outer glow colour */
--accent-red: #ff3d5a;    /* live dot */
--accent-purple: #b27bf0; /* 'signal.' accent */
--portrait: url("roadman-portrait.jpg"); /* swap image here */
```

If you want the glitch to fire more often, drop the 88% threshold in
the `@keyframes rmh-glitch-red` and `rmh-glitch-cyan` rules.

## Fonts

Google Fonts: Space Grotesk (400, 500, 600, 700, 800) and JetBrains
Mono (400, 500, 600) — loaded via `<link rel="stylesheet">` in the
head. If you want to self-host, the stylesheet block at the top can
be deleted and the fonts added to your existing Tailwind / Next font
pipeline.
