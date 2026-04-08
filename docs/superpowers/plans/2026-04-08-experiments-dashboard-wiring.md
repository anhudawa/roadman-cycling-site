# Experiments Engine + Dashboard Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire A/B experiment action buttons, auto-sync proxy, real experiment results, auto-optimization, revenue trend chart, dashboard placeholder replacement, TimeRangePicker on all pages, and agent-to-experiment form pre-fill.

**Architecture:** Client components handle mutations (start/stop/delete experiments) via fetch to existing API routes, then refresh server component data via `router.refresh()`. The proxy auto-syncs active experiments from a new API endpoint with a 60-second in-memory cache. Dashboard pages read `searchParams.range` and pass parsed dates to `getStatsForRange()` which runs all queries in parallel.

**Tech Stack:** Next.js 16, React 19, Drizzle ORM, Vercel Postgres, Recharts, Tailwind CSS

**CRITICAL: Next.js 16 conventions:**
- `searchParams` and `params` are `Promise` types — must be `await`ed
- Proxy file is `src/proxy.ts` (not `middleware.ts`)
- Auth uses NextAuth v5 via `src/lib/auth.ts` — `auth()` returns session
- All DB queries must be wrapped in try/catch with demo data fallbacks (DB not provisioned yet)

---

### Task 1: Schema — Add `completedBy` column to `ab_tests`

**Files:**
- Modify: `src/lib/db/schema.ts:73-84`

- [ ] **Step 1: Add the `completedBy` column**

In `src/lib/db/schema.ts`, add `completedBy` to the `abTests` table definition, after the `createdBy` column:

```typescript
// In the abTests table definition, add after createdBy line:
completedBy: text("completed_by"), // 'manual' | 'auto' | null
```

The full `abTests` block becomes:

```typescript
export const abTests = pgTable("ab_tests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  page: text("page").notNull(),
  element: text("element").notNull(),
  variants: jsonb("variants").notNull(),
  status: text("status").notNull().default("draft"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  winnerVariantId: text("winner_variant_id"),
  createdBy: text("created_by").notNull().default("manual"),
  completedBy: text("completed_by"),
});
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds (no DB connection needed for schema definition)

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/lib/db/schema.ts
git commit -m "feat: add completedBy column to ab_tests schema"
```

---

### Task 2: Experiment Actions Client Component

**Files:**
- Create: `src/app/admin/(dashboard)/experiments/[id]/experiment-actions.tsx`
- Modify: `src/app/admin/(dashboard)/experiments/[id]/page.tsx`

- [ ] **Step 1: Create the `ExperimentActions` client component**

Create `src/app/admin/(dashboard)/experiments/[id]/experiment-actions.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ABTestStatus, ABVariant } from "@/lib/ab/types";

export function ExperimentActions({
  experimentId,
  status,
  variants,
}: {
  experimentId: string;
  status: ABTestStatus;
  variants: ABVariant[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  async function handleAction(action: string, winnerVariantId?: string) {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch("/api/admin/experiments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: experimentId,
          action,
          ...(winnerVariantId ? { winnerVariantId } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Action failed");
      }
      setConfirmAction(null);
      setSelectedWinner(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  if (status === "completed") return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {status === "draft" && (
          <button
            onClick={() => handleAction("start")}
            disabled={loading !== null}
            className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 text-sm font-medium rounded-lg transition-colors border border-green-500/20"
          >
            {loading === "start" ? "Starting..." : "Start Test"}
          </button>
        )}
        {status === "running" && (
          <>
            {confirmAction === "stop" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground-muted">Stop this test?</span>
                <button
                  onClick={() => handleAction("stop")}
                  disabled={loading !== null}
                  className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 text-xs font-medium rounded-lg transition-colors border border-red-500/20"
                >
                  {loading === "stop" ? "Stopping..." : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-3 py-1.5 text-foreground-subtle hover:text-off-white text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmAction("stop")}
                disabled={loading !== null}
                className="px-4 py-2 bg-white/5 text-foreground-muted hover:text-off-white disabled:opacity-50 text-sm font-medium rounded-lg transition-colors border border-white/10"
              >
                Stop Test
              </button>
            )}
            {confirmAction === "declare_winner" ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedWinner ?? ""}
                  onChange={(e) => setSelectedWinner(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-off-white focus:outline-none focus:border-coral/50 appearance-none"
                >
                  <option value="" className="bg-charcoal">Select winner...</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id} className="bg-charcoal">
                      {v.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (selectedWinner) handleAction("declare_winner", selectedWinner);
                  }}
                  disabled={loading !== null || !selectedWinner}
                  className="px-3 py-1.5 bg-coral/20 text-coral hover:bg-coral/30 disabled:opacity-50 text-xs font-medium rounded-lg transition-colors border border-coral/20"
                >
                  {loading === "declare_winner" ? "Declaring..." : "Confirm Winner"}
                </button>
                <button
                  onClick={() => {
                    setConfirmAction(null);
                    setSelectedWinner(null);
                  }}
                  className="px-3 py-1.5 text-foreground-subtle hover:text-off-white text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmAction("declare_winner")}
                disabled={loading !== null}
                className="px-4 py-2 bg-coral/20 text-coral hover:bg-coral/30 disabled:opacity-50 text-sm font-medium rounded-lg transition-colors border border-coral/20"
              >
                Declare Winner
              </button>
            )}
          </>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update the detail page to use the new client component**

In `src/app/admin/(dashboard)/experiments/[id]/page.tsx`:

1. Add the import at the top:
```typescript
import { ExperimentActions } from "./experiment-actions";
```

2. Delete the existing `ExperimentActions` function component (lines 57-100 — the one with dead buttons).

3. Update the usage in the JSX (around line 165, now in the header area). Replace:
```tsx
<ExperimentActions experiment={experiment} results={results} />
```
with:
```tsx
<ExperimentActions
  experimentId={experiment.id}
  status={experiment.status}
  variants={experiment.variants}
/>
```

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/experiments/\[id\]/experiment-actions.tsx src/app/admin/\(dashboard\)/experiments/\[id\]/page.tsx
git commit -m "feat: wire experiment Start/Stop/Declare Winner action buttons"
```

---

### Task 3: Delete Button on Experiments List Page

**Files:**
- Create: `src/app/admin/(dashboard)/experiments/delete-button.tsx`
- Modify: `src/app/admin/(dashboard)/experiments/page.tsx`

- [ ] **Step 1: Create the `DeleteButton` client component**

Create `src/app/admin/(dashboard)/experiments/delete-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ experimentId }: { experimentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/experiments?id=${encodeURIComponent(experimentId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 text-xs font-medium rounded transition-colors"
        >
          {loading ? "..." : "Delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-foreground-subtle hover:text-off-white text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        setConfirming(true);
      }}
      className="p-1.5 text-foreground-subtle hover:text-red-400 transition-colors rounded"
      title="Delete experiment"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
    </button>
  );
}
```

- [ ] **Step 2: Wire into experiments list page**

In `src/app/admin/(dashboard)/experiments/page.tsx`:

1. Add import at the top:
```typescript
import { DeleteButton } from "./delete-button";
```

2. In the experiment row mapping (inside the `experiments.map()` block), add the delete button next to the "View" span. Replace the existing "View" span block:

```tsx
<span className="text-xs text-foreground-muted hover:text-off-white transition-colors px-3 py-1.5 border border-white/10 rounded-lg flex-shrink-0">
  View
</span>
```

with:

```tsx
<div className="flex items-center gap-2 flex-shrink-0">
  {exp.status !== "running" && (
    <DeleteButton experimentId={exp.id} />
  )}
  <span className="text-xs text-foreground-muted hover:text-off-white transition-colors px-3 py-1.5 border border-white/10 rounded-lg">
    View
  </span>
</div>
```

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/experiments/delete-button.tsx src/app/admin/\(dashboard\)/experiments/page.tsx
git commit -m "feat: add delete button to experiments list page"
```

---

### Task 4: Active Experiments API Endpoint

**Files:**
- Create: `src/app/api/admin/experiments/active/route.ts`

- [ ] **Step 1: Create the active experiments endpoint**

Create `src/app/api/admin/experiments/active/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { ABVariant } from "@/lib/ab/types";

interface ActiveTest {
  id: string;
  pathPrefix: string;
  variantIds: string[];
}

export async function GET() {
  try {
    const { db } = await import("@/lib/db");
    const { abTests } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const rows = await db
      .select({
        id: abTests.id,
        page: abTests.page,
        variants: abTests.variants,
      })
      .from(abTests)
      .where(eq(abTests.status, "running"));

    const tests: ActiveTest[] = rows.map((row) => {
      const variants = (row.variants ?? []) as ABVariant[];
      return {
        id: `exp_${row.id}`,
        pathPrefix: row.page,
        variantIds: variants.map((v) => v.id),
      };
    });

    return NextResponse.json({ tests });
  } catch {
    // DB not available — return empty
    return NextResponse.json({ tests: [] });
  }
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/api/admin/experiments/active/route.ts
git commit -m "feat: add GET /api/admin/experiments/active endpoint for proxy"
```

---

### Task 5: Proxy Auto-Sync from API

**Files:**
- Modify: `src/proxy.ts`

- [ ] **Step 1: Replace hardcoded ACTIVE_TESTS with cached fetch**

In `src/proxy.ts`, replace the `ActiveTest` interface, `ACTIVE_TESTS` constant, and the proxy function with:

Replace from line 12 (`interface ActiveTest {`) through line 28 (closing of `ACTIVE_TESTS`) with:

```typescript
interface ActiveTest {
  /** Unique experiment id — used as the cookie suffix */
  id: string;
  /** URL path prefix the test applies to (e.g. "/" or "/skool") */
  pathPrefix: string;
  /** Variant IDs to randomly assign — first is always "control" */
  variantIds: string[];
}

// ── Cached active tests from API ──────────────────────────
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
    // Use last known good value on failure
  }
  return cachedTests;
}
```

Then update the `proxy` function. Replace the current `export function proxy(request: NextRequest) {` (sync) with async, and replace the `ACTIVE_TESTS` reference:

```typescript
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Global visitor variant assignment cookie ──────────────
  const existingVariant = request.cookies.get("ab_variant")?.value;

  if (!existingVariant) {
    response.cookies.set("ab_variant", generateUUID(), {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  // ── Per-experiment variant assignment ─────────────────────
  const origin = new URL(request.url).origin;
  const activeTests = await getActiveTests(origin);

  if (activeTests.length === 0) {
    return response;
  }

  const assignments: Record<string, string> = {};

  for (const test of activeTests) {
    if (!pathname.startsWith(test.pathPrefix)) continue;

    const cookieName = `roadman_ab_${test.id}`;
    const existing = request.cookies.get(cookieName)?.value;

    if (existing && test.variantIds.includes(existing)) {
      assignments[test.id] = existing;
    } else {
      const idx = Math.floor(Math.random() * test.variantIds.length);
      const assigned = test.variantIds[idx];
      assignments[test.id] = assigned;

      response.cookies.set(cookieName, assigned, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 90,
        sameSite: "lax",
      });
    }
  }

  if (Object.keys(assignments).length > 0) {
    response.headers.set("x-ab-variants", JSON.stringify(assignments));
  }

  return response;
}
```

Keep the existing `generateUUID` function and `config` export unchanged.

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/proxy.ts
git commit -m "feat: proxy auto-syncs active experiments from API with 60s cache"
```

---

### Task 6: `getExperimentResults()` in Events Store

**Files:**
- Modify: `src/lib/admin/events-store.ts`

- [ ] **Step 1: Add the `getExperimentResults` function**

At the end of `src/lib/admin/events-store.ts`, before the closing of the file, add:

```typescript
import { calculateChiSquared } from "@/lib/ab/statistics";
import type { ABResult } from "@/lib/ab/types";
```

Add these imports at the top of the file alongside the existing imports. Then add the function at the end:

```typescript
// ── Experiment results aggregation ────────────────────────

export async function getExperimentResults(
  variantIds: string[],
  page: string
): Promise<ABResult[]> {
  if (variantIds.length === 0) return [];

  const rows = await db
    .select({
      variantId: events.variantId,
      type: events.type,
      cnt: count(),
    })
    .from(events)
    .where(
      and(
        sql`${events.variantId} IN (${sql.join(
          variantIds.map((id) => sql`${id}`),
          sql`, `
        )})`,
        eq(events.page, page)
      )
    )
    .groupBy(events.variantId, events.type);

  // Build per-variant counts
  const variantMap = new Map<string, { impressions: number; conversions: number }>();
  for (const id of variantIds) {
    variantMap.set(id, { impressions: 0, conversions: 0 });
  }
  for (const row of rows) {
    if (!row.variantId) continue;
    const entry = variantMap.get(row.variantId);
    if (!entry) continue;
    if (row.type === "pageview") entry.impressions = Number(row.cnt);
    if (row.type === "signup") entry.conversions = Number(row.cnt);
  }

  // Control is the first variant
  const controlId = variantIds[0];
  const control = variantMap.get(controlId)!;

  const results: ABResult[] = variantIds.map((id) => {
    const data = variantMap.get(id)!;
    const conversionRate = data.impressions > 0 ? data.conversions / data.impressions : 0;

    if (id === controlId) {
      return {
        variantId: id,
        impressions: data.impressions,
        conversions: data.conversions,
        conversionRate,
        isSignificant: false,
        confidence: 0,
      };
    }

    const chi = calculateChiSquared(
      control.impressions,
      control.conversions,
      data.impressions,
      data.conversions
    );

    return {
      variantId: id,
      impressions: data.impressions,
      conversions: data.conversions,
      conversionRate,
      isSignificant: chi.significant,
      confidence: chi.confidence,
    };
  });

  return results;
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/lib/admin/events-store.ts
git commit -m "feat: add getExperimentResults() with chi-squared significance testing"
```

---

### Task 7: Wire Real Results + Auto-Declare into Experiment Detail Page

**Files:**
- Modify: `src/app/admin/(dashboard)/experiments/[id]/page.tsx`
- Modify: `src/app/api/admin/experiments/route.ts` (add `completedBy` to PATCH)

- [ ] **Step 1: Update PATCH endpoint to support `completedBy`**

In `src/app/api/admin/experiments/route.ts`, in the `updateExperimentStatus` function (line 67), update the parameter type to include `completedBy`:

```typescript
async function updateExperimentStatus(
  id: number,
  updates: { status?: string; startedAt?: Date; endedAt?: Date; winnerVariantId?: string; completedBy?: string }
): Promise<boolean> {
```

In the `PATCH` handler's `declare_winner` case (around line 231), add `completedBy` to the body parsing and updates:

```typescript
    const { id, action, winnerVariantId, completedBy } = body as {
      id: string;
      action: "start" | "stop" | "declare_winner";
      winnerVariantId?: string;
      completedBy?: string;
    };
```

And update the `declare_winner` case:

```typescript
      case "declare_winner":
        if (!winnerVariantId) {
          return NextResponse.json(
            { error: "winnerVariantId required for declare_winner action" },
            { status: 400 }
          );
        }
        updates = {
          status: "completed",
          endedAt: new Date(),
          winnerVariantId,
          completedBy: completedBy ?? "manual",
        };
        break;
```

Also update `getAllExperiments` to include `completedBy` in the returned object (around line 26). Add to the row mapping:

```typescript
// In the getAllExperiments function, add to the return mapping:
completedBy: (row as Record<string, unknown>).completedBy as string | undefined,
```

Note: Since the `completedBy` column may not exist in the DB yet (not provisioned), this will silently return `undefined` which is fine.

- [ ] **Step 2: Update the experiment detail page to use real results and auto-declare**

In `src/app/admin/(dashboard)/experiments/[id]/page.tsx`:

1. Add import for `getExperimentResults`:
```typescript
import { getExperimentResults } from "@/lib/admin/events-store";
```

2. Delete the `getMockResults` function entirely (lines 24-38).

3. Replace the line `const results = getMockResults(experiment);` with:

```typescript
  let results: ABResult[];
  try {
    results = await getExperimentResults(
      experiment.variants.map((v) => v.id),
      experiment.page
    );
  } catch {
    // DB not available — generate zero-data results
    results = experiment.variants.map((v, i) => ({
      variantId: v.id,
      impressions: 0,
      conversions: 0,
      conversionRate: 0,
      isSignificant: false,
      confidence: 0,
    }));
  }

  // Auto-declare winner if experiment is running and a variant is significant
  if (experiment.status === "running") {
    const significantResults = results.filter(
      (r) => r.isSignificant && r.variantId !== experiment.variants[0]?.id
    );
    if (significantResults.length > 0) {
      const winner = significantResults.reduce((best, r) =>
        r.conversionRate > best.conversionRate ? r : best
      );
      const controlRate = results[0]?.conversionRate ?? 0;
      const minSamples = estimateSampleSize(Math.max(controlRate, 0.01), 0.1);
      if (winner.impressions >= minSamples) {
        // Auto-declare via API
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
          await fetch(`${baseUrl}/api/admin/experiments`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: experiment.id,
              action: "declare_winner",
              winnerVariantId: winner.variantId,
              completedBy: "auto",
            }),
          });
          // Re-fetch experiment to get updated status
          experiment = (await getExperiment(id))!;
        } catch {
          // Auto-declare failed silently — manual declaration still available
        }
      }
    }
  }
```

Note: This means the `experiment` variable needs to be `let` not `const`. Change line 110 from:
```typescript
  const experiment = await getExperiment(id);
```
to:
```typescript
  let experiment = await getExperiment(id);
```

4. Add an auto-completion banner in the JSX. After the existing "WINNER DECLARED" block (the `experiment.winnerVariantId &&` section), add:

```tsx
      {/* Auto-completion notice */}
      {(experiment as Record<string, unknown>).completedBy === "auto" && (
        <div className="bg-purple/10 border border-purple/20 rounded-xl p-5">
          <p className="text-sm text-off-white">
            <span className="text-purple font-medium">Auto-optimized</span> — This experiment was
            automatically completed when a variant reached statistical significance.
          </p>
        </div>
      )}
```

- [ ] **Step 3: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/experiments/\[id\]/page.tsx src/app/api/admin/experiments/route.ts
git commit -m "feat: wire real experiment results from events + auto-declare winner"
```

---

### Task 8: Auto-Completion Badge on Experiments List

**Files:**
- Modify: `src/app/admin/(dashboard)/experiments/page.tsx`

- [ ] **Step 1: Add "Auto" badge for auto-completed experiments**

In `src/app/admin/(dashboard)/experiments/page.tsx`, in the experiment row mapping, after the `StatusBadge` component, add a conditional "Auto" badge.

Find the line (inside the map):
```tsx
<StatusBadge status={exp.status} />
```

After it, add:
```tsx
{(exp as Record<string, unknown>).completedBy === "auto" && (
  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple/10 text-purple">
    Auto
  </span>
)}
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/experiments/page.tsx
git commit -m "feat: show Auto badge on auto-completed experiments in list"
```

---

### Task 9: `getDailyVisitors()` and `getRevenueSnapshots()` in Events Store

**Files:**
- Modify: `src/lib/admin/events-store.ts`

- [ ] **Step 1: Add both query functions**

At the end of `src/lib/admin/events-store.ts`, add:

```typescript
// ── Daily visitors for overview chart ─────────────────────

export async function getDailyVisitors(
  from: Date,
  to: Date
): Promise<{ date: string; visitors: number }[]> {
  const rows = await db
    .select({
      day: sql<string>`DATE(${events.timestamp})`,
      cnt: count(),
    })
    .from(events)
    .where(
      and(
        eq(events.type, "pageview"),
        gte(events.timestamp, from),
        lte(events.timestamp, to)
      )
    )
    .groupBy(sql`DATE(${events.timestamp})`)
    .orderBy(sql`DATE(${events.timestamp})`);

  return rows.map((r) => ({
    date: r.day,
    visitors: Number(r.cnt),
  }));
}

// ── Revenue snapshots for trend chart ─────────────────────

export async function getRevenueSnapshots(
  from: Date,
  to: Date
): Promise<{ date: string; revenue: number }[]> {
  const { stripeSnapshots } = await import("@/lib/db/schema");

  const rows = await db
    .select({
      snapshotDate: stripeSnapshots.snapshotDate,
      totalRevenueCents: stripeSnapshots.totalRevenueCents,
    })
    .from(stripeSnapshots)
    .where(
      and(
        gte(stripeSnapshots.snapshotDate, from.toISOString().split("T")[0]),
        lte(stripeSnapshots.snapshotDate, to.toISOString().split("T")[0])
      )
    )
    .orderBy(stripeSnapshots.snapshotDate);

  return rows.map((r) => ({
    date: r.snapshotDate,
    revenue: r.totalRevenueCents / 100,
  }));
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/lib/admin/events-store.ts
git commit -m "feat: add getDailyVisitors() and getRevenueSnapshots() query functions"
```

---

### Task 10: Overview Page — Replace Placeholders with Real Data

**Files:**
- Modify: `src/app/admin/(dashboard)/page.tsx`

- [ ] **Step 1: Wire real data to replace placeholders**

In `src/app/admin/(dashboard)/page.tsx`:

1. Add imports at the top:
```typescript
import { getDashboardStats, getStatsForRange, getDailyVisitors, type DashboardStats } from "@/lib/admin/events-store";
```
(Replace the existing import that only imports `getDashboardStats` and `DashboardStats`.)

2. Inside the page function, after the existing `stats` try/catch block, add:

```typescript
  // Ranged data for tables and charts
  let topPages = PLACEHOLDER_TOP_PAGES;
  let trafficSources = PLACEHOLDER_SOURCES;
  let timeSeries = generateDemoTimeSeries();

  try {
    const [rangedStats, dailyVisitors] = await Promise.all([
      getStatsForRange(from, to),
      getDailyVisitors(from, to),
    ]);

    if (rangedStats.pages.length > 0) {
      topPages = rangedStats.pages.slice(0, 5).map((p) => ({
        page: p.page,
        views: p.views,
        signups: p.signups,
        convRate: p.conversionRate,
      }));
    }

    if (rangedStats.traffic.referrers.length > 0) {
      trafficSources = rangedStats.traffic.referrers.slice(0, 6).map((r) => ({
        name: r.referrer,
        value: r.count,
      }));
    }

    if (dailyVisitors.length > 0) {
      timeSeries = dailyVisitors.map((d) => ({
        date: d.date,
        visitors: d.visitors,
        signups: 0, // Daily signup breakdown not available from this query
      }));
    }
  } catch {
    // DB not available — placeholders already set above
  }
```

3. Update the JSX to use the variables instead of constants. Replace `demoTimeSeries` with `timeSeries` in the `TimeSeriesChart` data prop:

```tsx
<TimeSeriesChart
  data={timeSeries}
```

Replace `PLACEHOLDER_TOP_PAGES` with `topPages` in the table:

```tsx
{topPages.map((row) => (
```

Replace `PLACEHOLDER_SOURCES` with `trafficSources` in the DonutChart:

```tsx
<DonutChart data={trafficSources} />
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/page.tsx
git commit -m "feat: wire overview page to real event data with demo fallbacks"
```

---

### Task 11: Content Page — Wire TimeRangePicker

**Files:**
- Modify: `src/app/admin/(dashboard)/content/page.tsx`

- [ ] **Step 1: Wire `searchParams.range` to `getStatsForRange`**

In `src/app/admin/(dashboard)/content/page.tsx`:

1. Update the imports at the top:
```typescript
import { getStatsForRange, type PageStats } from "@/lib/admin/events-store";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
```

2. Update the function signature to accept `searchParams`:
```typescript
export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "7d";
  const { from, to } = parseTimeRange(rangeParam);
```

3. Replace the data fetching block. Replace:
```typescript
  try {
    pages = await getPageStats();
    usingLiveData = true;
  } catch {
    pages = PLACEHOLDER_DATA;
  }
```

with:

```typescript
  try {
    const rangedStats = await getStatsForRange(from, to);
    pages = rangedStats.pages;
    usingLiveData = true;
  } catch {
    pages = PLACEHOLDER_DATA;
  }
```

4. Remove the unused `getPageStats` import (it was the only usage).

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/content/page.tsx
git commit -m "feat: wire content page TimeRangePicker to getStatsForRange"
```

---

### Task 12: Traffic Page — Add TimeRangePicker and Wire Data

**Files:**
- Modify: `src/app/admin/(dashboard)/traffic/page.tsx`

- [ ] **Step 1: Add TimeRangePicker and wire searchParams**

In `src/app/admin/(dashboard)/traffic/page.tsx`:

1. Update imports at the top:
```typescript
import { getStatsForRange } from "@/lib/admin/events-store";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
```

2. Update the function signature:
```typescript
export default async function TrafficPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "7d";
  const { from, to } = parseTimeRange(rangeParam);
```

3. Replace the data fetching. Replace:
```typescript
  let topPages, referrers, devices;
  try {
    ({ topPages, referrers, devices } = await getTrafficStats());
  } catch {
```

with:

```typescript
  let topPages, referrers, devices;
  try {
    const rangedStats = await getStatsForRange(from, to);
    topPages = rangedStats.traffic.topPages;
    referrers = rangedStats.traffic.referrers;
    devices = rangedStats.traffic.devices;
  } catch {
```

4. Remove the unused `getTrafficStats` import.

5. Add the TimeRangePicker to the header. Replace:
```tsx
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">TRAFFIC</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Page views, referrers, and device breakdown (this week)
        </p>
      </div>
```

with:

```tsx
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">TRAFFIC</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Page views, referrers, and device breakdown
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/traffic/page.tsx
git commit -m "feat: add TimeRangePicker to traffic page, wire to getStatsForRange"
```

---

### Task 13: Leads Page — Add TimeRangePicker and Wire Data

**Files:**
- Modify: `src/app/admin/(dashboard)/leads/page.tsx`

- [ ] **Step 1: Add TimeRangePicker and wire searchParams**

In `src/app/admin/(dashboard)/leads/page.tsx`:

1. Update imports at the top:
```typescript
import { getStatsForRange, getLeadTotals } from "@/lib/admin/events-store";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
```

(Keep `getLeadTotals` for the summary cards — it provides today/week/month with previous period comparisons that `getStatsForRange` doesn't.)

2. Update the function signature:
```typescript
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "7d";
  const { from, to } = parseTimeRange(rangeParam);
```

3. Update the data fetching. Replace:
```typescript
  try {
    [leads, totals] = await Promise.all([getRecentLeads(100), getLeadTotals()]);
  } catch {
```

with:

```typescript
  try {
    const [rangedStats, leadTotals] = await Promise.all([
      getStatsForRange(from, to),
      getLeadTotals(),
    ]);
    leads = rangedStats.leads;
    totals = leadTotals;
  } catch {
```

4. Remove the unused `getRecentLeads` import.

5. Add the TimeRangePicker to the header. Replace:
```tsx
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">LEADS</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Recent email signups and lead trends
        </p>
      </div>
```

with:

```tsx
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">LEADS</h1>
          <p className="text-foreground-muted text-sm mt-1">
            Recent email signups and lead trends
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/leads/page.tsx
git commit -m "feat: add TimeRangePicker to leads page, wire to getStatsForRange"
```

---

### Task 14: Revenue Page — Add Trend Chart and TimeRangePicker

**Files:**
- Modify: `src/app/admin/(dashboard)/revenue/page.tsx`

- [ ] **Step 1: Add TimeRangePicker and revenue trend chart**

In `src/app/admin/(dashboard)/revenue/page.tsx`:

1. Add imports at the top:
```typescript
import { getRevenueSnapshots } from "@/lib/admin/events-store";
import { parseTimeRange } from "@/lib/admin/time-ranges";
import { Suspense } from "react";
import { TimeRangePicker } from "../components/TimeRangePicker";
import { TimeSeriesChart } from "../components/charts/TimeSeriesChart";
```

2. Update the function signature:
```typescript
export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rangeParam = typeof resolvedParams.range === "string" ? resolvedParams.range : "30d";
  const { from, to } = parseTimeRange(rangeParam);
```

3. Add revenue snapshots fetching. After the existing `try/catch` block (line ~40), add:

```typescript
  // Fetch revenue snapshots for trend chart
  let revenueSnapshots: { date: string; revenue: number }[] = [];
  try {
    revenueSnapshots = await getRevenueSnapshots(from, to);
  } catch {
    // DB not available — empty chart
  }
```

4. Add the TimeRangePicker to the header. Replace:
```tsx
      <div>
        <h1 className="font-heading text-3xl text-off-white tracking-wider">
          REVENUE
        </h1>
        <p className="text-foreground-muted text-sm mt-1">
          {apiError
            ? "Stripe API not configured \u2014 add STRIPE_SECRET_KEY to .env.local"
            : "Data from Stripe (last 30 days)"}
        </p>
      </div>
```

with:

```tsx
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-off-white tracking-wider">
            REVENUE
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            {apiError
              ? "Stripe API not configured \u2014 add STRIPE_SECRET_KEY to .env.local"
              : "Data from Stripe"}
          </p>
        </div>
        <Suspense fallback={null}>
          <TimeRangePicker />
        </Suspense>
      </div>
```

5. Replace the placeholder chart section. Replace:
```tsx
      {/* Revenue trend placeholder (needs time-series aggregation from Stripe) */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          REVENUE OVER TIME
        </h2>
        <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
          <p className="text-foreground-subtle text-sm">
            {apiError
              ? "Revenue chart will appear once Stripe is connected"
              : "Revenue trend chart coming soon \u2014 daily aggregation pending"}
          </p>
        </div>
      </div>
```

with:

```tsx
      {/* Revenue trend chart */}
      <div className="bg-background-elevated border border-white/5 rounded-xl p-5">
        <h2 className="font-heading text-sm text-foreground-muted tracking-wider mb-4">
          REVENUE OVER TIME
        </h2>
        {revenueSnapshots.length > 0 ? (
          <TimeSeriesChart
            data={revenueSnapshots}
            dataKeys={[
              { key: "revenue", color: "#E8836B", label: "Revenue ($)" },
            ]}
            height={256}
          />
        ) : (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
            <p className="text-foreground-subtle text-sm">
              {apiError
                ? "Revenue chart will appear once Stripe is connected"
                : "Revenue data will appear once daily sync begins"}
            </p>
          </div>
        )}
      </div>
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/revenue/page.tsx
git commit -m "feat: add revenue trend chart from Stripe snapshots + TimeRangePicker"
```

---

### Task 15: Pre-fill Experiment Form from Agent Page Links

**Files:**
- Modify: `src/app/admin/(dashboard)/experiments/new/page.tsx`

- [ ] **Step 1: Read searchParams and pre-fill form fields**

In `src/app/admin/(dashboard)/experiments/new/page.tsx`:

1. Add the `useSearchParams` import. Update the import from `next/navigation`:
```typescript
import { useRouter, useSearchParams } from "next/navigation";
```

2. Add `useEffect` to the React import:
```typescript
import { useState, useEffect } from "react";
```

3. Inside the component, right after `const router = useRouter();`, add:
```typescript
  const searchParams = useSearchParams();
```

4. After all the `useState` declarations (after the `error` state), add the pre-fill effect:
```typescript
  useEffect(() => {
    const p = searchParams.get("page");
    const e = searchParams.get("element");
    const c = searchParams.get("content");
    if (p) setPage(p);
    if (e && ELEMENT_TYPES.some((t) => t.value === e)) setElement(e as ABElementType);
    if (c) setControlContent(c);
    if (p && e) {
      const pageName = p === "/" ? "Homepage" : p.replace(/^\//, "").replace(/-/g, " ");
      const elementName = e.replace(/_/g, " ");
      setName(`${pageName} ${elementName} test`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 2: Verify build passes**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/tedcrilly/Desktop/roadman-cycling-site
git add src/app/admin/\(dashboard\)/experiments/new/page.tsx
git commit -m "feat: pre-fill experiment form from agent page query params"
```

---

### Task 16: Final Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run full build**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run build 2>&1 | tail -20`
Expected: Build succeeds with no errors

- [ ] **Step 2: Check for TypeScript errors**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npx tsc --noEmit 2>&1 | tail -20`
Expected: No type errors

- [ ] **Step 3: Verify no lint issues**

Run: `cd /Users/tedcrilly/Desktop/roadman-cycling-site && npm run lint 2>&1 | tail -10`
Expected: No lint errors (warnings are acceptable)
