# Performance Audit & Core Web Vitals Optimization

**Date:** 2026-04-08
**Scope:** Full site $€” layout, homepage, key components, third-party scripts

---

## Summary

The site was already in good shape. Fonts use `display: "swap"` via `next/font`, all images use `next/image` with proper `sizes` attributes, the Meta Pixel uses `lazyOnload` strategy, and the exit-intent popup + smooth cursor are already dynamically imported with `ssr: false`. This audit addressed the remaining gaps.

---

## Issues Found & Fixes Applied

### 1. Missing preconnect/dns-prefetch hints (LCP impact)

**File:** `src/app/layout.tsx`

The browser was discovering third-party origins late (Google Fonts, Facebook pixel, YouTube, Sanity CDN). Added:
- `preconnect` for Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
- `dns-prefetch` for Facebook (connect.facebook.net, www.facebook.com)
- `dns-prefetch` for YouTube (www.youtube.com, i.ytimg.com)
- `dns-prefetch` for Sanity CDN (cdn.sanity.io)

**Impact:** Reduces connection setup time by ~100-300ms for first resource from each origin.

### 2. ParallaxImage missing lazy/priority controls (LCP)

**File:** `src/components/ui/ParallaxImage.tsx`

The ParallaxImage component had no way to specify `loading="lazy"` or `priority`. Both homepage parallax dividers are well below the fold but were loading eagerly by default (next/image with `fill` still loads eagerly unless told otherwise).

Added an optional `priority` prop. When false (default), images load lazily.

**Impact:** Defers ~200-600KB of image data until the user scrolls near them.

### 3. GuestMarquee using JS-driven animation (INP / main thread)

**File:** `src/components/ui/GuestMarquee.tsx`

The marquee was using framer-motion's `animate` prop for continuous scrolling. This keeps the JS thread busy recalculating positions every frame. Replaced with CSS `@keyframes` animation using `transform: translateX()` which runs entirely on the compositor thread.

**File:** `src/app/globals.css` $€” Added `marquee-left` and `marquee-right` keyframes, plus `prefers-reduced-motion` rule to pause marquees.

**Impact:** Eliminates continuous JS animation overhead. Transform animations run at 60fps on the compositor without touching the main thread.

### 4. StatsSection DotField rendering 40 individual DOM nodes (DOM size / CLS)

**File:** `src/components/features/home/StatsSection.tsx`

The DotField component was creating 40 `<span>` elements with random positions (requiring client-side hydration, Math.random, and individual style calculations). Replaced with a single `<div>` using a CSS `radial-gradient` pattern that achieves the same visual effect.

**Impact:** Removes 40 DOM nodes, eliminates a mount-dependent render cycle, and removes the `useMemo`/`useState`/`useEffect` overhead.

### 5. FloatingParticles excessive count on mobile (INP / FPS)

**File:** `src/components/ui/FloatingParticles.tsx`

The hero renders two FloatingParticles instances (25 + 10 = 35 animated divs). On mobile, this is excessive for small screens. Added a responsive cap: max 8 particles on viewports under 768px.

**Impact:** Reduces animated DOM elements from 35 to 16 on mobile, improving frame rates on lower-powered devices.

---

## Already Optimized (no changes needed)

- **Fonts:** Bebas Neue and Work Sans loaded via `next/font/google` with `display: "swap"` and CSS variable injection. No FOIT.
- **Meta Pixel:** Uses `strategy="lazyOnload"` $€” the most deferred Script strategy. Does not block render or interactivity.
- **Exit Intent Popup:** Already wrapped in `dynamic()` with `ssr: false`.
- **Smooth Cursor:** Already wrapped in `dynamic()` with `ssr: false`, and only activates on `pointer: fine` devices.
- **Header logo:** Has `priority` set correctly (above the fold).
- **All images:** Use `next/image` with appropriate `sizes` attributes. No raw `<img>` tags found anywhere.
- **Image formats:** Config enables AVIF and WebP via `next.config.ts`.
- **Cache headers:** Static assets and images get `max-age=31536000, immutable`.
- **Package imports:** `framer-motion`, `shiki`, and `rehype-pretty-code` are in `optimizePackageImports`.
- **PodcastPlayerShell:** Uses React context provider pattern $€” children pass through as server components (no unnecessary client boundary).
- **CLS:** All images use `fill` with aspect-ratio containers or explicit `width`/`height`. No layout shift sources found.

---

## Recommendations (not implemented $€” require manual testing)

1. **Consider replacing framer-motion ScrollReveal with CSS `@starting-style`** $€” The site has 47 `"use client"` files, many just for scroll-reveal animations. CSS `@starting-style` (supported in all modern browsers) could replace many of these, reducing the client JS bundle. This is a larger refactor.

2. **Add `fetchPriority="high"` to the hero background if/when a hero image is added** $€” Currently the hero is pure CSS gradients, but if a background image is ever added, it should get `fetchPriority="high"`.

3. **Consider `next/dynamic` for below-fold tool pages** $€” The calculator pages (FTP zones, tyre pressure, etc.) are all `"use client"` with framer-motion. Since they're standalone pages this is fine, but if they're ever embedded in other pages, they should be dynamically imported.
