# Lighthouse Performance Audit — roadmancycling.com

**Date:** 2026-04-30
**Tool:** Lighthouse 13.1.0 (headless Chrome, mobile, lab)
**Categories:** Performance only
**Pages audited:** 10 production templates

---

## Summary table

| # | Template | URL | Score | LCP | FCP | CLS | TBT | SI | INP |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | Homepage | `/` | **78** ⚠️ | **5.0 s** 🚨 | 1.4 s | 0 | 10 ms | 4.7 s | n/a |
| 2 | Blog article | `/blog/masters-cycling-training-report-2026` | 93 | 3.1 s 🚨 | 1.4 s | 0 | 0 ms | 2.1 s | n/a |
| 3 | Topic hub | `/topics/ftp-training` | 87 | 3.6 s 🚨 | 1.7 s | 0.000 | 20 ms | 4.6 s | n/a |
| 4 | Podcast episode | `/podcast/ep-2-5-...` | 87 | 3.8 s 🚨 | 1.6 s | 0 | 0 ms | 3.1 s | n/a |
| 5 | Glossary | `/glossary/ftp` | 85 | 3.9 s 🚨 | 1.5 s | 0.000 | 20 ms | 4.5 s | n/a |
| 6 | Comparison | `/compare/coach-vs-app` | 95 | 3.0 s 🚨 | 1.2 s | 0 | 10 ms | 1.4 s | n/a |
| 7 | Tool | `/tools/ftp-zones` | 94 | 3.1 s 🚨 | 1.2 s | 0 | 10 ms | 1.4 s | n/a |
| 8 | Coaching | `/coaching` | 95 | 2.9 s 🚨 | 1.2 s | 0 | 10 ms | 1.6 s | n/a |
| 9 | Event | `/event/haute-route-alps-training-plan` | 88 | 3.5 s 🚨 | 1.5 s | 0.000 | 20 ms | 4.5 s | n/a |
| 10 | Newsletter | `/newsletter` | 95 | 3.0 s 🚨 | 1.2 s | 0 | 0 ms | 1.4 s | n/a |

**Legend:** ⚠️ score < 80 · 🚨 LCP > 2.5 s
**INP:** "n/a" because Lighthouse lab tests do not synthesise user interactions; INP can only be sampled in field/CrUX data.

### Top-line read

- **Only one page (Homepage) is below 80.** The rest are 85–95.
- **Every page exceeds the 2.5 s LCP target.** Even the highest-scoring pages sit at 2.9–3.1 s.
- **CLS and TBT are excellent everywhere.** No layout shift problems, no main-thread blocking — interactivity is not the bottleneck.
- **Backend is fast.** TTFB ranges 88–122 ms across the site; LCP problems are purely client-side rendering.

---

## Per-page detail

### 1. Homepage — score 78 ⚠️ · LCP 5.0 s 🚨 (URGENT)

The only page below 80 and the only one with LCP > 4 s.

- **LCP element:** `div.GlitchHero-module__portrait` (the hero image container)
- **LCP breakdown:** TTFB 122 ms · resource load 145 ms · **element render delay 2,053 ms** ← the problem
- **Speed Index 4.7 s** — visual completeness is slow even though FCP is 1.4 s
- Render-blocking CSS costs an estimated 350 ms on FCP
- `image-delivery-insight` flags `glitch-portrait.jpg` (74 KB JPEG) — savings 450 ms LCP if served as properly-sized AVIF/WebP and marked `fetchpriority="high"`
- Unused JS: ~48 KB across two chunks (same chunks ship on every page)

**Fix priority:**
1. Mark hero portrait `<Image priority fetchPriority="high">` and serve modern format
2. Reduce hero render delay (likely a hydration / dynamic-import waterfall)
3. Inline critical CSS for above-the-fold

### 2. Blog article — score 93 · LCP 3.1 s 🚨

- LCP element: the answer-capsule `<p>` (text node)
- LCP breakdown: TTFB 97 ms · element render delay **915 ms**
- Render-blocking CSS: 200 ms FCP/LCP savings available
- `legacy-javascript-insight` flags 14 KB of unnecessary polyfills (≈150 ms LCP)

### 3. Topic hub — score 87 · LCP 3.6 s 🚨

- LCP element: `p.topic-description` (text node)
- LCP breakdown: TTFB 113 ms · element render delay **2,465 ms** ← dominant
- Speed Index 4.6 s
- Render-blocking CSS: 100 ms savings

### 4. Podcast episode — score 87 · LCP 3.8 s 🚨

- LCP element: `h1.font-heading` (episode title)
- LCP breakdown: TTFB 108 ms · element render delay **1,040 ms**
- `cache-insight` and `font-display-insight` are clean
- Render-blocking CSS still in play

### 5. Glossary — score 85 · LCP 3.9 s 🚨

- LCP element: `p.text-foreground-muted` (definition body)
- LCP breakdown: TTFB 95 ms · element render delay **2,471 ms** ← dominant
- Render-blocking CSS: 250 ms savings
- Speed Index 4.5 s

### 6. Comparison — score 95 · LCP 3.0 s 🚨

- LCP element: `h1.font-heading`
- LCP breakdown: TTFB 93 ms · element render delay 518 ms
- Best in class on Speed Index (1.4 s) but still trips the 2.5 s LCP threshold

### 7. Tool (FTP zones) — score 94 · LCP 3.1 s 🚨

- LCP element: above-the-fold `<p>`
- LCP breakdown: TTFB 100 ms · element render delay 595 ms
- `bf-cache` flagged — pages can't be restored from back/forward cache

### 8. Coaching — score 95 · LCP 2.9 s 🚨

- LCP element: above-the-fold `<p>`
- LCP breakdown: TTFB 95 ms · element render delay 670 ms
- Closest page to clearing the 2.5 s LCP bar — eliminating render-blocking CSS would do it

### 9. Event (training plan) — score 88 · LCP 3.5 s 🚨

- LCP element: `p.event-guide-intro`
- LCP breakdown: TTFB 91 ms · element render delay **2,466 ms** ← dominant
- Speed Index 4.5 s
- Same template signature as Topic hub and Glossary — the slow trio

### 10. Newsletter — score 95 · LCP 3.0 s 🚨

- LCP element: above-the-fold `<p>`
- LCP breakdown: TTFB 89 ms · element render delay only 145 ms (best on the site)
- LCP is dominated by load delay, not render — so the standard CSS / unused-JS fixes will move it under 2.5 s most cleanly

---

## Top 3 site-wide fixes (biggest impact across all 10 pages)

### Fix 1 — Cut element render delay on the slow trio (Homepage, Topic, Glossary, Event)

**Why this is #1:** Four pages have element render delay of **2.0–2.5 s**, which is 70–80 % of their LCP. TTFB is fine, the resource is fast — the LCP element is sitting there waiting for something (almost certainly client-side hydration or a dynamic import) before it gets painted.

The slow pages all match a pattern: long-form pages whose LCP element is a `<p>` inside a description container that sits below a hero (Topic hub, Glossary, Event). Likely caused by:
- A client component above the LCP element delaying paint
- Font loading without `font-display: swap` (audit said clean — recheck per-page)
- Heavy JS executing before paint

**Action:** Server-render the LCP element's parent. Move the offending `'use client'` boundary below the hero/intro block. On Homepage specifically, mark the glitch portrait image as priority and remove the JS-driven glitch effect from the LCP path (apply the effect *after* paint).

**Estimated impact:** -1.0 to -2.0 s LCP on 4 pages. Pulls Homepage from 78 → 90+.

### Fix 2 — Eliminate render-blocking CSS site-wide

**Why:** Every audit flagged the same two CSS bundles as render-blocking:
- `_next/static/chunks/0vk5s14kp0z2j.css` (≈31 KB)
- `_next/static/chunks/0ni50lx1f7cln.css` (≈1.5 KB)

Lighthouse-reported savings: **100–350 ms** of FCP/LCP per page. That's enough alone to move Coaching (2.9 s LCP) and Newsletter (3.0 s LCP) under the 2.5 s threshold.

**Action:** Inline critical CSS for the above-the-fold slice and lazy-load the rest. In Next.js (current install) this is done with route-scoped CSS modules + `next/font` already in use; the issue is the global stylesheet shipping unused rules. Run a critical-CSS extraction step or split the global stylesheet by route group.

**Estimated impact:** -150 to -350 ms LCP on every page. 2–3 pages clear the 2.5 s bar from this fix alone.

### Fix 3 — Drop legacy JavaScript polyfills

**Why:** Same two JS chunks (`167qcxko6pkl0.js` 74 KB, `0yzpud45gzyl5.js` 42 KB) appear on every page with ~25 KB and ~24 KB of unused code respectively (~50 KB total). The `legacy-javascript-insight` audit specifically flags `167qcxko6pkl0.js` for shipping ~14 KB of legacy polyfills to modern browsers (e.g. `Array.prototype.at`).

**Action:** Tighten the browserslist target. Next.js auto-generates a polyfill chunk for legacy browsers — switch the target to `last 2 Chrome versions, last 2 Firefox versions, last 2 Safari versions, last 2 Edge versions, not dead` and the polyfill shrinks dramatically. Also audit which top-level imports are pulling unused tree.

**Estimated impact:** -50 KB transferred, -150 ms LCP on JS-heavy paths (notably blog), and a cleaner score across all 10 templates.

---

## Bonus quick wins (not in top 3 but cheap)

- **Add preconnect hints** to your most important origins (`network-dependency-tree-insight` flagged this on every page).
- **Fix `bf-cache`** on the FTP zones tool page so it restores from back/forward cache.
- **Recheck font-display** per page — clean in lab on the pages I sampled, but worth confirming across all routes.

---

## Methodology notes

- Mobile profile, throttled (Lighthouse default).
- Each URL audited once. For decisions, run 3–5 trials and median (lab variance can be ±10 % on LCP).
- INP cannot be measured in the lab; pull from CrUX / RUM for real INP figures.
- Raw JSON reports archived in `/tmp/lighthouse-reports/` on the audit machine (not committed).
