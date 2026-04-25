# Experiments Engine + Dashboard Data Wiring

**Date:** 2026-04-08
**Scope:** Wire A/B experiment actions, auto-sync proxy, real experiment results, auto-optimization, revenue trend chart, dashboard placeholder replacement, TimeRangePicker on all pages, agent-to-experiment form pre-fill.
**Deferred:** CSV export, downloadable agent reports.

---

## 1. Experiments Engine

### 1A. Action Buttons

**Detail page (`src/app/admin/(dashboard)/experiments/[id]/page.tsx`):**

Extract a `"use client"` component `ExperimentActions` that receives `experimentId: string`, `status: ABTestStatus`, `variants: ABVariant[]`, and `winnerVariantId: string | null`.

Buttons by status:
- `draft` → "Start Test" button. Calls `PATCH /api/admin/experiments` with `{ id: experimentId, action: "start" }`.
- `running` → "Stop Test" and "Declare Winner" buttons. Stop calls `{ id, action: "stop" }`. Declare Winner shows a variant selector (dropdown or button per variant), then calls `{ id, action: "declare_winner", winnerVariantId }`.
- `completed` → No action buttons. Winner banner already renders.

Behavior:
- Each action shows a loading spinner on the clicked button and disables all other buttons.
- Stop and Declare Winner require a confirmation step (inline "Are you sure?" with confirm/cancel).
- On success, call `router.refresh()` to reload server component data.
- On error, show an inline error message below the buttons.

**List page (`src/app/admin/(dashboard)/experiments/page.tsx`):**

Add a delete button (trash icon) per experiment row. Extract a `"use client"` `ExperimentRow` or `DeleteButton` component.

- Calls `DELETE /api/admin/experiments?id={exp.id}`.
- Confirmation dialog before delete.
- Only visible for `draft` and `completed` experiments (not `running`).
- On success, `router.refresh()`.

### 1B. Proxy Auto-Sync

**New endpoint: `GET /api/admin/experiments/active`**

Location: `src/app/api/admin/experiments/active/route.ts`

- Queries `ab_tests` table for rows where `status = 'running'`.
- Maps each to `ActiveTest` format: `{ id: string, pathPrefix: string, variantIds: string[] }` where `pathPrefix` = experiment's `page` field and `variantIds` = `variants.map(v => v.id)`.
- No auth required (called internally by proxy).
- Returns `{ tests: ActiveTest[] }`.
- Try/catch with empty array fallback when DB is unavailable.

**Proxy changes (`src/proxy.ts`):**

Replace the hardcoded `ACTIVE_TESTS: ActiveTest[] = []` with a cached fetch:

```
let cachedTests: ActiveTest[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

async function getActiveTests(origin: string): Promise<ActiveTest[]> {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL) return cachedTests;
  try {
    const res = await fetch(`${origin}/api/admin/experiments/active`);
    if (res.ok) {
      const data = await res.json();
      cachedTests = data.tests ?? [];
      cacheTimestamp = now;
    }
  } catch {
    // Use last known good value
  }
  return cachedTests;
}
```

In the proxy function, derive `origin` from the request URL (`new URL(request.url).origin`) and call `const activeTests = await getActiveTests(origin)` instead of reading the constant.

### 1C. Real Experiment Results

**New function in `src/lib/admin/events-store.ts`:**

```
async function getExperimentResults(
  variantIds: string[],
  page: string
): Promise<ABResult[]>
```

Logic:
1. Query `events` table: `SELECT variantId, type, COUNT(*) FROM events WHERE variantId IN (...variantIds) AND page = :page GROUP BY variantId, type`.
2. For each variant, count `type = 'pageview'` as impressions, `type = 'signup'` as conversions.
3. Identify the control variant (first in the array, matching the experiment's variant order).
4. For each non-control variant, call `calculateChiSquared(controlImpressions, controlConversions, variantImpressions, variantConversions)` from `src/lib/ab/statistics.ts`.
5. For the control variant, set `isSignificant: false`, `confidence: 0`.
6. Return `ABResult[]` with `{ variantId, impressions, conversions, conversionRate, isSignificant, confidence }`.

**Detail page wiring:**

Replace the `getMockResults()` call in `experiments/[id]/page.tsx` with:

```
const results = await getExperimentResults(
  experiment.variants.map(v => v.id),
  experiment.page
);
```

Wrap in try/catch with existing demo data fallback pattern.

### 1D. Auto-Declare Winner

**Trigger:** Server-side check when the experiment detail page loads (inside the server component).

Logic:
1. After fetching results via `getExperimentResults()`, check if the experiment is `running`.
2. If any variant has `isSignificant: true` AND `impressions >= estimateSampleSize(controlRate, 0.1)` (minimum detectable effect of 10%):
   - Find the variant with the highest `conversionRate` among significant variants.
   - Call the internal PATCH logic (or fetch to `/api/admin/experiments`) with `{ id, action: "declare_winner", winnerVariantId }`.
   - Add a field `completedBy: "auto"` to the DB update (requires adding this column to the `ab_tests` schema — nullable string, values: `"manual" | "auto"`).
3. Refresh the page data after auto-declaration.

**Notification surfaces:**

- **Experiments list page:** For experiments where `status = 'completed'` and `completedBy = 'auto'` and `endedAt` is within the last 7 days, show a small "Auto" badge next to the status badge.
- **Experiment detail page:** When `completedBy = 'auto'`, show a callout banner: "This experiment was automatically completed — {winnerLabel} won with {confidence}% confidence."

**Schema change:** Add `completedBy` column to `ab_tests` table in `src/lib/db/schema.ts`:
```
completedBy: varchar('completed_by', { length: 10 }), // 'manual' | 'auto' | null
```

---

## 2. Dashboard Data Wiring

### 2A. Overview Page — Replace Placeholders

**File:** `src/app/admin/(dashboard)/page.tsx`

Changes:
1. Read `searchParams.range` (the page already imports `parseTimeRange` and renders `TimeRangePicker`).
2. Call `const { from, to } = parseTimeRange(searchParams.range ?? '7d')`.
3. Call `getStatsForRange(from, to)` inside the existing try/catch.
4. Replace `PLACEHOLDER_TOP_PAGES` with `statsForRange.pages` (map to same table format: page, views, signups, convRate).
5. Replace `PLACEHOLDER_SOURCES` with `statsForRange.traffic.referrers` (feed into `DonutChart`).
6. Replace `generateDemoTimeSeries()` with a new `getDailyVisitors(from, to)` function (see below). `getStatsForRange` only returns aggregate totals, not daily breakdowns, so a separate query is needed.

Keep existing `DEMO_STATS` fallback for `getDashboardStats()` — that's the summary cards which work independently.

### 2B. TimeRangePicker on Content, Traffic, Leads Pages

All three follow the same pattern:

**Content page (`src/app/admin/(dashboard)/content/page.tsx`):**
- Already renders `TimeRangePicker` but doesn't read `searchParams.range`.
- Add `searchParams` to the page props type.
- Call `parseTimeRange(searchParams.range ?? '7d')` to get `from`/`to`.
- Replace `getPageStats()` with `getStatsForRange(from, to)` and use `.pages`.
- Keep demo data fallback in try/catch.

**Traffic page (`src/app/admin/(dashboard)/traffic/page.tsx`):**
- Add `TimeRangePicker` import and render in header.
- Add `searchParams` to page props.
- Call `parseTimeRange(searchParams.range ?? '7d')`.
- Replace `getTrafficStats()` with `getStatsForRange(from, to)` and use `.traffic`.
- Keep demo data fallback.

**Leads page (`src/app/admin/(dashboard)/leads/page.tsx`):**
- Add `TimeRangePicker` import and render in header.
- Add `searchParams` to page props.
- Call `parseTimeRange(searchParams.range ?? '7d')`.
- Replace `getRecentLeads(100)` with `getStatsForRange(from, to)` and use `.leads`.
- Replace `getLeadTotals()` — the summary cards can derive today/week/month from the ranged data or keep calling `getLeadTotals()` separately (simpler).
- Keep demo data fallback.

### 2B-extra. Daily Visitors for Overview Chart

**New function in `src/lib/admin/events-store.ts`:**

```
async function getDailyVisitors(
  from: Date,
  to: Date
): Promise<{ date: string; visitors: number }[]>
```

- Queries `events` table: `SELECT DATE(timestamp) as day, COUNT(*) FROM events WHERE type = 'pageview' AND timestamp BETWEEN from AND to GROUP BY DATE(timestamp) ORDER BY day ASC`.
- Returns `{ date: "2026-04-01", visitors: 142 }[]` — one entry per day.
- Used by the overview page `TimeSeriesChart` to replace `generateDemoTimeSeries()`.

### 2C. Revenue Trend Chart

**New function** in `src/lib/admin/events-store.ts` (or a new `src/lib/admin/stripe-store.ts` if preferred — keeping it in events-store is simpler since it follows the same DB access pattern):

```
async function getRevenueSnapshots(
  from: Date,
  to: Date
): Promise<{ date: string; revenue: number }[]>
```

- Queries `stripeSnapshots` table: `SELECT snapshotDate, totalRevenueCents FROM stripe_snapshots WHERE snapshot_date >= :from AND snapshot_date <= :to ORDER BY snapshot_date ASC`.
- Maps each row to `{ date: row.snapshotDate (ISO string), revenue: row.totalRevenueCents / 100 }`.

**Revenue page (`src/app/admin/(dashboard)/revenue/page.tsx`):**

- Add `TimeRangePicker` to the header area.
- Read `searchParams.range`, call `parseTimeRange()`.
- Call `getRevenueSnapshots(from, to)` in the try/catch block.
- Replace the placeholder "Revenue trend chart coming soon" dashed box with:
  - If snapshots are non-empty: `<TimeSeriesChart data={snapshots} dataKeys={[{ key: "revenue", color: chartColors.coral, label: "Revenue ($)" }]} />`.
  - If snapshots are empty: Styled empty state — "Revenue data will appear once daily sync begins."

### 2D. Agent Page — Pre-fill Experiment Form

**File:** `src/app/admin/(dashboard)/experiments/new/page.tsx`

The page is already `"use client"`. Changes:

1. Import `useSearchParams` from `next/navigation`.
2. In the component body, call `const searchParams = useSearchParams()`.
3. In a `useEffect` (runs once on mount), read params and set state:
   ```
   useEffect(() => {
     const p = searchParams.get('page');
     const e = searchParams.get('element');
     const c = searchParams.get('content');
     if (p) setPage(p);
     if (e && ELEMENT_TYPES.some(t => t.value === e)) setElement(e as ABElementType);
     if (c) setControlContent(c);
     // Auto-generate name from params
     if (p && e) setName(`${p === '/' ? 'Homepage' : p.slice(1)} ${e.replace('_', ' ')} test`);
   }, []);
   ```

No changes to the agent page — links already pass `page`, `element`, and `content` query params.

---

## Files Changed Summary

| File | Change Type | Description |
|------|------------|-------------|
| `src/app/admin/(dashboard)/experiments/[id]/page.tsx` | Modify | Wire real results, auto-declare, extract client actions component |
| `src/app/admin/(dashboard)/experiments/[id]/experiment-actions.tsx` | New | `"use client"` component for Start/Stop/Declare Winner buttons |
| `src/app/admin/(dashboard)/experiments/page.tsx` | Modify | Add delete button per row, auto-completion badge |
| `src/app/admin/(dashboard)/experiments/new/page.tsx` | Modify | Read searchParams to pre-fill form |
| `src/app/api/admin/experiments/active/route.ts` | New | GET endpoint returning active experiments for proxy |
| `src/proxy.ts` | Modify | Replace hardcoded ACTIVE_TESTS with cached fetch |
| `src/lib/admin/events-store.ts` | Modify | Add `getExperimentResults()`, `getRevenueSnapshots()`, and `getDailyVisitors()` |
| `src/lib/db/schema.ts` | Modify | Add `completedBy` column to `ab_tests` |
| `src/app/admin/(dashboard)/page.tsx` | Modify | Wire real data to placeholder tables and time series |
| `src/app/admin/(dashboard)/content/page.tsx` | Modify | Wire searchParams.range to getStatsForRange |
| `src/app/admin/(dashboard)/traffic/page.tsx` | Modify | Add TimeRangePicker, wire searchParams.range |
| `src/app/admin/(dashboard)/leads/page.tsx` | Modify | Add TimeRangePicker, wire searchParams.range |
| `src/app/admin/(dashboard)/revenue/page.tsx` | Modify | Add TimeSeriesChart for revenue, add TimeRangePicker |

**Total: 11 modified files, 2 new files.**
