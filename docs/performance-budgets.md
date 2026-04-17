# Performance Budgets

> **Scope:** Admin dashboard (`/admin/**`) and public marketing pages (`/`, `/blog`, `/apply`, `/tools`).
>
> **Why budgets:** admin pages are auth-gated so have no SEO cost, but they still burn Ted's laptop CPU every time he opens a page. Public pages affect conversion — 100ms delay on mobile checkout costs measurable revenue. This doc sets targets and tracks known offenders.

## Targets

### Public marketing pages (logged-out visitors)

| Metric | Budget | Why |
|---|---|---|
| First Load JS | < 180 KB gzipped | Mobile 4G Time to Interactive < 3s |
| Largest Contentful Paint | < 2.5s | Core Web Vitals "good" threshold |
| Cumulative Layout Shift | < 0.1 | Core Web Vitals "good" threshold |
| Image requests above-the-fold | ≤ 1 hero image | Every other image should lazy-load |

### Admin dashboard (`/admin/**`)

| Metric | Budget | Why |
|---|---|---|
| First Load JS per route | < 250 KB gzipped | Ted's laptop hydrates in < 2s |
| Recharts bundle | Lazy-loaded only | ~100 KB that most routes don't need immediately |
| Tanstack Table | Not yet used; if added, lazy-load | Large dep; only needed on data tables |
| PDF renderer (`@react-pdf/renderer`) | Route handler only, never client | 200+ KB, only needed server-side |

## Wins shipped

### Recharts lazy-loading (2026-04-17)

All 5 chart components now lazy-load via `next/dynamic({ ssr: false })`:

- `src/app/admin/(dashboard)/components/charts/SparkLine.tsx`
- `src/app/admin/(dashboard)/components/charts/TimeSeriesChart.tsx`
- `src/app/admin/(dashboard)/components/charts/DonutChart.tsx`
- `src/app/admin/(dashboard)/components/charts/BarChartHorizontal.tsx`
- `src/app/admin/(dashboard)/ted/_components/CostTrendChart.tsx`

Pattern: the exported component is a thin wrapper that defers loading `./<Name>.impl.tsx`. The impl contains the actual recharts imports. This means the recharts bundle no longer appears in the initial JS payload for admin pages — it only loads after the route is interactive, when the chart is about to render. Skeleton placeholders render in the meantime.

Impact: expected ~80-100 KB gzipped removed from first-load JS for every admin page that uses charts (dashboard home, revenue, newsletter, mission-control, ted).

### FloatingParticles respects `prefers-reduced-motion` (2026-04-17)

`src/components/ui/FloatingParticles.tsx` no longer renders any motion at all when the user has `prefers-reduced-motion: reduce`. Reduces main-thread work for accessibility users and saves CPU on older devices.

### Mobile count cap (pre-existing)

`FloatingParticles` caps at 8 particles on screens < 768px wide. Keeps 60fps on mid-range phones.

## Known offenders (prioritised)

### P0 — Measurable CPU hit

_None currently open._ Recharts lazy-loading was the biggest single win.

### P1 — Worth addressing next

1. **Admin dashboard home page (`/admin/(dashboard)/page.tsx`)** — imports many chart components eagerly via the wrappers. After the recharts lazy-load, the wrappers themselves are thin, but if the dashboard renders 5+ charts on mount, each triggers its own dynamic import. Consider consolidating into a single chart-chunk boundary.
2. **Bundle analyzer not wired up.** Running `next build` shows per-route sizes but not the dep breakdown. Add `@next/bundle-analyzer` with `ANALYZE=true` env flag for quarterly audits.
3. **Framer Motion on admin pages.** Already in `experimental.optimizePackageImports` — verify it's actually tree-shaking.

### P2 — Nice-to-have

1. Preload fonts in `src/app/layout.tsx` — saves a 100-200ms FOIT on first visit.
2. Add `priority` prop to the hero image on `/` — it's the LCP element on mobile.
3. Inline critical CSS for `/` fold (~14KB).

## Monitoring

- **Build output**: `npm run build` prints per-route First Load JS. Check quarterly.
- **Vercel Analytics**: enabled via dashboard — tracks real-user LCP/CLS per route.
- **Error monitoring**: see `src/instrumentation.ts` — prod errors logged to `events` table with `type=error_report`.

## Enforcing budgets

Not currently enforced in CI. Options if regression becomes a problem:

1. **Lighthouse CI** — run against deployed preview on every PR. Good for real-world metrics.
2. **`next-bundle-analyzer` + threshold check** — fail CI if any route's First Load JS exceeds budget.
3. **Manual review** — simpler; check `next build` output before merging.

For now, manual review + this doc as the source of truth.
