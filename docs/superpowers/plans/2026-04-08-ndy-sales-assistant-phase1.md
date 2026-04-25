# NDY Sales Assistant $€” Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the routing logic, Airtable integration, and API endpoint for the NDY prospect qualification tool, fully tested against 20 sample profiles.

**Architecture:** Server-side routing via a pure JavaScript function. A single POST endpoint `/api/ndy/recommend` accepts prospect answers, runs deterministic routing rules, writes to Airtable, and returns the routing decision. No LLM calls, no front-end, no templates in this phase.

**Tech Stack:** Next.js 16 (app router), TypeScript, Vitest (new $€” needs setup), Airtable REST API (existing pattern at `src/lib/inventory/airtable.ts`).

**Spec:** `docs/superpowers/specs/2026-04-08-ndy-sales-assistant-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `vitest.config.mts` | Vitest configuration (new $€” project has no test framework yet) |
| `src/lib/ndy/types.ts` | TypeScript types for questions, answers, routing decisions, Airtable record |
| `src/lib/ndy/routing.ts` | Pure routing function: answers in $†’ routing decision out |
| `src/lib/ndy/airtable.ts` | Airtable client for `ndy_prospects` table (create record, follows existing pattern) |
| `src/lib/ndy/routing.test.ts` | Unit tests for routing logic $€” 20 sample profiles |
| `src/app/api/ndy/recommend/route.ts` | POST endpoint: validate input, run routing, write Airtable, return decision |

---

## Task 0: Vitest Setup

**Files:**
- Create: `vitest.config.mts`
- Modify: `package.json` (add test script + dev dependencies)

- [ ] **Step 1: Install Vitest and vite-tsconfig-paths**

```bash
cd ~/Desktop/roadman-cycling-site && npm install -D vitest vite-tsconfig-paths
```

No React Testing Library needed $€” Phase 1 tests are pure logic, no components.

- [ ] **Step 2: Create vitest.config.mts**

```ts
// vitest.config.mts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Add test script to package.json**

Add to the `"scripts"` object in `package.json`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Verify Vitest runs**

```bash
cd ~/Desktop/roadman-cycling-site && npx vitest run
```

Expected: `No test files found` (no error, clean exit).

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/roadman-cycling-site
git add vitest.config.mts package.json package-lock.json
git commit -m "chore: add vitest for unit testing"
```

---

## Task 1: TypeScript Types

**Files:**
- Create: `src/lib/ndy/types.ts`

- [ ] **Step 1: Create the types file**

```ts
// src/lib/ndy/types.ts

// ---------------------------------------------------------------------------
// Question option types
// ---------------------------------------------------------------------------

export type TrainingGoal =
  | 'race_with_date'
  | 'specific_watts_target'
  | 'group_ride_fitness'
  | 'general_fitness'
  | 'other';

export type HoursPerWeek =
  | 'under_4'
  | '4_to_6'
  | '6_to_9'
  | '9_to_12'
  | '12_plus';

export type FtpRange =
  | 'under_200'
  | '200_to_280'
  | '280_to_350'
  | '350_plus'
  | 'not_sure';

export type PlateauDuration =
  | 'not_stuck'
  | 'few_months'
  | '6_to_12_months'
  | 'over_a_year'
  | 'no_idea';

export type Frustration =
  | 'plateaued_at_number'
  | 'no_structure'
  | 'lost_motivation'
  | 'recurring_injury'
  | 'other';

export type CoachingHistory =
  | 'never'
  | 'self_coached'
  | 'had_coach_before'
  | 'currently_have_one';

// ---------------------------------------------------------------------------
// Prospect answers (input to routing)
// ---------------------------------------------------------------------------

export interface ProspectAnswers {
  q1TrainingFor: TrainingGoal;
  q2HoursPerWeek: HoursPerWeek;
  q3FtpRange: FtpRange;
  q4PlateauDuration: PlateauDuration;
  q5Frustration: Frustration;
  q6WeightKg: number | null;
  q7CoachingHistory: CoachingHistory;
  q8Freetext: string | null;
}

// ---------------------------------------------------------------------------
// Routing output
// ---------------------------------------------------------------------------

export type RoutingDecision =
  | 'standard'
  | 'premium'
  | 'inner_circle'
  | 'not_a_fit';

export interface RoutingResult {
  decision: RoutingDecision;
  budgetFlag: boolean;
  injuryFlag: boolean;
  computedWpkg: number | null;
}

// ---------------------------------------------------------------------------
// Airtable record shape (what we write)
// ---------------------------------------------------------------------------

export interface NdyProspectRecord {
  timestamp: string; // ISO 8601
  q1TrainingFor: TrainingGoal;
  q2HoursPerWeek: HoursPerWeek;
  q3FtpRange: FtpRange;
  q4PlateauDuration: PlateauDuration;
  q5Frustration: Frustration;
  q6WeightKg: number | null;
  q7CoachingHistory: CoachingHistory;
  q8Freetext: string | null;
  computedWpkg: number | null;
  routingDecision: RoutingDecision;
  budgetFlag: boolean;
  injuryFlag: boolean;
  responseShown: string;
  email: string | null;
  buttonClicked: string | null;
  outcome: string | null;
  notes: string | null;
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Desktop/roadman-cycling-site
git add src/lib/ndy/types.ts
git commit -m "feat(ndy): add TypeScript types for prospect qualification"
```

---

## Task 2: Routing Logic

**Files:**
- Create: `src/lib/ndy/routing.ts`

- [ ] **Step 1: Create the routing module**

```ts
// src/lib/ndy/routing.ts

import type {
  ProspectAnswers,
  RoutingResult,
  FtpRange,
} from './types';

// ---------------------------------------------------------------------------
// FTP midpoints for w/kg calculation
// ---------------------------------------------------------------------------

const FTP_MIDPOINTS: Record<FtpRange, number> = {
  under_200: 175,
  '200_to_280': 240,
  '280_to_350': 315,
  '350_plus': 375,
  not_sure: 0,
};

// ---------------------------------------------------------------------------
// Keyword scanning
// ---------------------------------------------------------------------------

const BUDGET_KEYWORDS = [
  'cost',
  'budget',
  'afford',
  'expensive',
  'price',
  'cheap',
  'money',
  'too much',
];

const INJURY_KEYWORDS = [
  'injury',
  'injured',
  'physio',
  'doctor',
  'surgery',
  'pain',
  'knee',
  'back',
  'hip',
];

function scanKeywords(text: string | null, keywords: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return keywords.some((kw) => {
    const pattern = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i');
    return pattern.test(lower);
  });
}

// ---------------------------------------------------------------------------
// W/kg computation
// ---------------------------------------------------------------------------

function computeWpkg(ftpRange: FtpRange, weightKg: number | null): number | null {
  if (weightKg === null || weightKg <= 0) return null;
  const midpoint = FTP_MIDPOINTS[ftpRange];
  if (midpoint === 0) return null; // not_sure
  return Math.round((midpoint / weightKg) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Routing function
// ---------------------------------------------------------------------------

export function routeProspect(answers: ProspectAnswers): RoutingResult {
  const budgetFlag = scanKeywords(answers.q8Freetext, BUDGET_KEYWORDS);
  const injuryFlag = scanKeywords(answers.q8Freetext, INJURY_KEYWORDS);
  const wpkg = computeWpkg(answers.q3FtpRange, answers.q6WeightKg);

  // Rule 1: Not a fit
  if (
    (answers.q5Frustration === 'recurring_injury' && injuryFlag) ||
    (answers.q2HoursPerWeek === 'under_4' && answers.q5Frustration === 'recurring_injury') ||
    (answers.q2HoursPerWeek === 'under_4' && answers.q1TrainingFor === 'general_fitness')
  ) {
    return { decision: 'not_a_fit', budgetFlag, injuryFlag, computedWpkg: wpkg };
  }

  // Rule 2: Budget override $†’ Standard
  if (budgetFlag) {
    return { decision: 'standard', budgetFlag, injuryFlag, computedWpkg: wpkg };
  }

  // Rule 3: Inner Circle
  const highHours = answers.q2HoursPerWeek === '9_to_12' || answers.q2HoursPerWeek === '12_plus';
  const raceGoal = answers.q1TrainingFor === 'race_with_date';
  const strongFtp =
    answers.q3FtpRange === '280_to_350' ||
    answers.q3FtpRange === '350_plus' ||
    (wpkg !== null && wpkg >= 3.5);
  const icFrustration =
    answers.q5Frustration === 'plateaued_at_number' ||
    answers.q5Frustration === 'other';
  const hasCoachingAwareness =
    answers.q7CoachingHistory === 'self_coached' ||
    answers.q7CoachingHistory === 'had_coach_before' ||
    answers.q7CoachingHistory === 'currently_have_one';

  if (highHours && raceGoal && strongFtp && icFrustration && hasCoachingAwareness) {
    return { decision: 'inner_circle', budgetFlag, injuryFlag, computedWpkg: wpkg };
  }

  // Rule 4: Premium
  const moderateHours =
    answers.q2HoursPerWeek === '6_to_9' ||
    answers.q2HoursPerWeek === '9_to_12' ||
    answers.q2HoursPerWeek === '12_plus';
  const specificGoal =
    answers.q1TrainingFor === 'race_with_date' ||
    answers.q1TrainingFor === 'specific_watts_target' ||
    answers.q1TrainingFor === 'group_ride_fitness';
  const premiumFrustration =
    answers.q5Frustration === 'plateaued_at_number' ||
    answers.q5Frustration === 'no_structure' ||
    answers.q5Frustration === 'other';
  const premiumCoaching =
    answers.q7CoachingHistory === 'self_coached' ||
    answers.q7CoachingHistory === 'had_coach_before';

  if (moderateHours && specificGoal && premiumFrustration && premiumCoaching) {
    return { decision: 'premium', budgetFlag, injuryFlag, computedWpkg: wpkg };
  }

  // Rule 5: Standard (default)
  return { decision: 'standard', budgetFlag, injuryFlag, computedWpkg: wpkg };
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Desktop/roadman-cycling-site
git add src/lib/ndy/routing.ts
git commit -m "feat(ndy): add prospect routing logic"
```

---

## Task 3: Routing Tests

**Files:**
- Create: `src/lib/ndy/routing.test.ts`

- [ ] **Step 1: Write the test file with all 20 sample profiles**

```ts
// src/lib/ndy/routing.test.ts

import { describe, it, expect } from 'vitest';
import { routeProspect } from './routing';
import type { ProspectAnswers, RoutingDecision } from './types';

// Helper to build a full ProspectAnswers with defaults
function prospect(overrides: Partial<ProspectAnswers>): ProspectAnswers {
  return {
    q1TrainingFor: 'general_fitness',
    q2HoursPerWeek: '4_to_6',
    q3FtpRange: 'not_sure',
    q4PlateauDuration: 'no_idea',
    q5Frustration: 'no_structure',
    q6WeightKg: null,
    q7CoachingHistory: 'never',
    q8Freetext: null,
    ...overrides,
  };
}

interface TestCase {
  name: string;
  answers: ProspectAnswers;
  expected: RoutingDecision;
}

const testCases: TestCase[] = [
  // --- Inner Circle (profiles 1-3) ---
  {
    name: '#1: IC $€” 9-12hrs, race, 280-350W, plateau, self-coached, 72kg',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 72,
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'inner_circle',
  },
  {
    name: '#2: IC $€” 12+hrs, race, 350+W, plateau, had coach, 68kg',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '12_plus',
      q3FtpRange: '350_plus',
      q4PlateauDuration: '6_to_12_months',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 68,
      q7CoachingHistory: 'had_coach_before',
    }),
    expected: 'inner_circle',
  },
  {
    name: '#3: IC via w/kg $€” 200-280W range but 65kg (3.69 w/kg >= 3.5)',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 65,
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'inner_circle',
  },
  // --- Premium (profiles 4-7) ---
  {
    name: '#4: Premium $€” 200-280W but 80kg (3.0 w/kg, below IC threshold)',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 80,
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
  {
    name: '#5: Premium $€” specific watts target, 6-9hrs, self-coached',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'plateaued_at_number',
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
  {
    name: '#6: Premium $€” group ride, 6-9hrs, no structure, had coach',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'no_structure',
      q7CoachingHistory: 'had_coach_before',
    }),
    expected: 'premium',
  },
  {
    name: '#7: Premium $€” race, 6-9hrs, 280-350W, no structure, self-coached',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: '6_to_12_months',
      q5Frustration: 'no_structure',
      q6WeightKg: 75,
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
  // --- Standard (profiles 8-14) ---
  {
    name: '#8: Standard $€” strong profile but never coached (blocks Premium)',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '350_plus',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 70,
      q7CoachingHistory: 'never',
    }),
    expected: 'standard',
  },
  {
    name: '#9: Standard $€” race goal, 4-6hrs, never coached',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'no_structure',
      q7CoachingHistory: 'never',
    }),
    expected: 'standard',
  },
  {
    name: '#10: Standard $€” general fitness, 4-6hrs, lost motivation, never coached',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'never',
    }),
    expected: 'standard',
  },
  {
    name: '#11: Standard $€” group ride, 4-6hrs, lost motivation, self-coached',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'standard',
  },
  {
    name: '#12: Standard $€” other goal, 6-9hrs, not sure FTP, never coached',
    answers: prospect({
      q1TrainingFor: 'other',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'other',
      q7CoachingHistory: 'never',
    }),
    expected: 'standard',
  },
  {
    name: '#13: Standard (budget override) $€” IC profile but mentions cost',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '350_plus',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 69,
      q7CoachingHistory: 'self_coached',
      q8Freetext: 'is this expensive',
    }),
    expected: 'standard',
  },
  {
    name: '#14: Standard (budget override) $€” IC profile, "can\'t afford much"',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '12_plus',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'plateaued_at_number',
      q6WeightKg: 72,
      q7CoachingHistory: 'had_coach_before',
      q8Freetext: "can't afford much right now",
    }),
    expected: 'standard',
  },
  // --- Not a fit (profiles 15-18) ---
  {
    name: '#15: Not a fit $€” under 4hrs, general fitness, recurring injury',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'recurring_injury',
      q7CoachingHistory: 'never',
    }),
    expected: 'not_a_fit',
  },
  {
    name: '#16: Not a fit $€” under 4hrs, recurring injury + injury in freetext',
    answers: prospect({
      q1TrainingFor: 'group_ride_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'under_200',
      q4PlateauDuration: 'not_stuck',
      q5Frustration: 'recurring_injury',
      q7CoachingHistory: 'never',
      q8Freetext: 'bad knee from physio',
    }),
    expected: 'not_a_fit',
  },
  {
    name: '#17: Not a fit $€” under 4hrs, general fitness (no specific goal)',
    answers: prospect({
      q1TrainingFor: 'general_fitness',
      q2HoursPerWeek: 'under_4',
      q3FtpRange: 'not_sure',
      q4PlateauDuration: 'no_idea',
      q5Frustration: 'lost_motivation',
      q7CoachingHistory: 'never',
    }),
    expected: 'not_a_fit',
  },
  {
    name: '#18: Not a fit $€” recurring injury in Q5 + injury confirmed in freetext',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '4_to_6',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: '6_to_12_months',
      q5Frustration: 'recurring_injury',
      q6WeightKg: 75,
      q7CoachingHistory: 'self_coached',
      q8Freetext: 'recurring back injury from doctor',
    }),
    expected: 'not_a_fit',
  },
  // --- Edge cases (profiles 19-20) ---
  {
    name: '#19: IC $€” currently has a coach, meets all other IC criteria',
    answers: prospect({
      q1TrainingFor: 'race_with_date',
      q2HoursPerWeek: '9_to_12',
      q3FtpRange: '280_to_350',
      q4PlateauDuration: 'over_a_year',
      q5Frustration: 'other',
      q6WeightKg: 74,
      q7CoachingHistory: 'currently_have_one',
    }),
    expected: 'inner_circle',
  },
  {
    name: '#20: Premium $€” specific watts, 6-9hrs, other frustration, self-coached',
    answers: prospect({
      q1TrainingFor: 'specific_watts_target',
      q2HoursPerWeek: '6_to_9',
      q3FtpRange: '200_to_280',
      q4PlateauDuration: 'few_months',
      q5Frustration: 'other',
      q7CoachingHistory: 'self_coached',
    }),
    expected: 'premium',
  },
];

describe('routeProspect', () => {
  for (const tc of testCases) {
    it(tc.name, () => {
      const result = routeProspect(tc.answers);
      expect(result.decision).toBe(tc.expected);
    });
  }
});

describe('routeProspect flags', () => {
  it('sets budgetFlag when freetext contains budget keyword', () => {
    const result = routeProspect(
      prospect({ q8Freetext: 'is this expensive' }),
    );
    expect(result.budgetFlag).toBe(true);
  });

  it('does not set budgetFlag on unrelated freetext', () => {
    const result = routeProspect(
      prospect({ q8Freetext: 'looking forward to racing' }),
    );
    expect(result.budgetFlag).toBe(false);
  });

  it('sets injuryFlag when freetext contains injury keyword', () => {
    const result = routeProspect(
      prospect({ q8Freetext: 'seeing a physio for my knee' }),
    );
    expect(result.injuryFlag).toBe(true);
  });

  it('does not set injuryFlag on unrelated freetext', () => {
    const result = routeProspect(
      prospect({ q8Freetext: 'just want to get faster' }),
    );
    expect(result.injuryFlag).toBe(false);
  });

  it('computes w/kg when FTP and weight are provided', () => {
    const result = routeProspect(
      prospect({ q3FtpRange: '280_to_350', q6WeightKg: 70 }),
    );
    // 315 / 70 = 4.5
    expect(result.computedWpkg).toBe(4.5);
  });

  it('returns null w/kg when weight is null', () => {
    const result = routeProspect(
      prospect({ q3FtpRange: '280_to_350', q6WeightKg: null }),
    );
    expect(result.computedWpkg).toBeNull();
  });

  it('returns null w/kg when FTP is not_sure', () => {
    const result = routeProspect(
      prospect({ q3FtpRange: 'not_sure', q6WeightKg: 70 }),
    );
    expect(result.computedWpkg).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd ~/Desktop/roadman-cycling-site && npx vitest run src/lib/ndy/routing.test.ts
```

Expected: All 27 tests pass (routing.ts already exists from Task 2). If any fail, this catches routing logic bugs before we continue.

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/roadman-cycling-site
git add src/lib/ndy/routing.test.ts
git commit -m "test(ndy): add 20 routing profiles + 7 flag/wpkg tests"
```

---

## Task 4: Airtable Client

**Files:**
- Create: `src/lib/ndy/airtable.ts`

- [ ] **Step 1: Create the Airtable client**

This follows the exact pattern from `src/lib/inventory/airtable.ts` $€” uses the same env vars, same `createRecords` function, same `mapFieldsToAirtable` helper.

```ts
// src/lib/ndy/airtable.ts

import {
  createRecords,
  mapFieldsToAirtable,
  type AirtableRecord,
} from '@/lib/inventory/airtable';
import type { NdyProspectRecord } from './types';

const TABLE_NAME = 'ndy_prospects';

export async function createProspect(
  record: NdyProspectRecord,
): Promise<AirtableRecord> {
  const fields = mapFieldsToAirtable(record as unknown as Record<string, unknown>);
  const created = await createRecords(TABLE_NAME, [fields]);
  return created[0];
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Desktop/roadman-cycling-site
git add src/lib/ndy/airtable.ts
git commit -m "feat(ndy): add Airtable client for ndy_prospects"
```

---

## Task 5: API Route

**Files:**
- Create: `src/app/api/ndy/recommend/route.ts`

- [ ] **Step 1: Create the API route**

```ts
// src/app/api/ndy/recommend/route.ts

import { NextResponse } from 'next/server';
import { routeProspect } from '@/lib/ndy/routing';
import { createProspect } from '@/lib/ndy/airtable';
import type {
  ProspectAnswers,
  TrainingGoal,
  HoursPerWeek,
  FtpRange,
  PlateauDuration,
  Frustration,
  CoachingHistory,
} from '@/lib/ndy/types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_TRAINING_GOALS: TrainingGoal[] = [
  'race_with_date', 'specific_watts_target', 'group_ride_fitness', 'general_fitness', 'other',
];
const VALID_HOURS: HoursPerWeek[] = [
  'under_4', '4_to_6', '6_to_9', '9_to_12', '12_plus',
];
const VALID_FTP: FtpRange[] = [
  'under_200', '200_to_280', '280_to_350', '350_plus', 'not_sure',
];
const VALID_PLATEAU: PlateauDuration[] = [
  'not_stuck', 'few_months', '6_to_12_months', 'over_a_year', 'no_idea',
];
const VALID_FRUSTRATION: Frustration[] = [
  'plateaued_at_number', 'no_structure', 'lost_motivation', 'recurring_injury', 'other',
];
const VALID_COACHING: CoachingHistory[] = [
  'never', 'self_coached', 'had_coach_before', 'currently_have_one',
];

function validateAnswers(body: unknown): { answers: ProspectAnswers } | { error: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;

  if (!VALID_TRAINING_GOALS.includes(b.q1TrainingFor as TrainingGoal)) {
    return { error: `Invalid q1TrainingFor: ${b.q1TrainingFor}` };
  }
  if (!VALID_HOURS.includes(b.q2HoursPerWeek as HoursPerWeek)) {
    return { error: `Invalid q2HoursPerWeek: ${b.q2HoursPerWeek}` };
  }
  if (!VALID_FTP.includes(b.q3FtpRange as FtpRange)) {
    return { error: `Invalid q3FtpRange: ${b.q3FtpRange}` };
  }
  if (!VALID_PLATEAU.includes(b.q4PlateauDuration as PlateauDuration)) {
    return { error: `Invalid q4PlateauDuration: ${b.q4PlateauDuration}` };
  }
  if (!VALID_FRUSTRATION.includes(b.q5Frustration as Frustration)) {
    return { error: `Invalid q5Frustration: ${b.q5Frustration}` };
  }
  if (!VALID_COACHING.includes(b.q7CoachingHistory as CoachingHistory)) {
    return { error: `Invalid q7CoachingHistory: ${b.q7CoachingHistory}` };
  }

  const weightKg = b.q6WeightKg;
  if (weightKg !== null && weightKg !== undefined) {
    if (typeof weightKg !== 'number' || weightKg < 40 || weightKg > 160) {
      return { error: 'q6WeightKg must be a number between 40 and 160, or null' };
    }
  }

  const freetext = b.q8Freetext;
  if (freetext !== null && freetext !== undefined) {
    if (typeof freetext !== 'string' || freetext.length > 500) {
      return { error: 'q8Freetext must be a string of 500 characters or fewer, or null' };
    }
  }

  return {
    answers: {
      q1TrainingFor: b.q1TrainingFor as TrainingGoal,
      q2HoursPerWeek: b.q2HoursPerWeek as HoursPerWeek,
      q3FtpRange: b.q3FtpRange as FtpRange,
      q4PlateauDuration: b.q4PlateauDuration as PlateauDuration,
      q5Frustration: b.q5Frustration as Frustration,
      q6WeightKg: (weightKg as number) ?? null,
      q7CoachingHistory: b.q7CoachingHistory as CoachingHistory,
      q8Freetext: (freetext as string) ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateAnswers(body);

    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { answers } = validation;
    const routing = routeProspect(answers);

    // Write to Airtable (non-blocking $€” don't fail the response if Airtable is down)
    const airtablePromise = createProspect({
      timestamp: new Date().toISOString(),
      ...answers,
      computedWpkg: routing.computedWpkg,
      routingDecision: routing.decision,
      budgetFlag: routing.budgetFlag,
      injuryFlag: routing.injuryFlag,
      responseShown: routing.decision, // template key = decision name for now
      email: null,
      buttonClicked: null,
      outcome: null,
      notes: null,
    }).catch((err) => {
      console.error('Airtable write failed:', err);
    });

    // Don't await Airtable $€” return the routing decision immediately
    void airtablePromise;

    return NextResponse.json({
      decision: routing.decision,
      computedWpkg: routing.computedWpkg,
      budgetFlag: routing.budgetFlag,
      injuryFlag: routing.injuryFlag,
    });
  } catch (error) {
    console.error('NDY recommend error:', error);
    const message = error instanceof Error ? error.message : 'Recommendation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd ~/Desktop/roadman-cycling-site
git add src/app/api/ndy/recommend/route.ts
git commit -m "feat(ndy): add /api/ndy/recommend POST endpoint"
```

---

## Task 6: Manual Smoke Test

- [ ] **Step 1: Start the dev server and test the endpoint**

```bash
cd ~/Desktop/roadman-cycling-site && npm run dev
```

In a second terminal:

```bash
curl -X POST http://localhost:3000/api/ndy/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "q1TrainingFor": "race_with_date",
    "q2HoursPerWeek": "9_to_12",
    "q3FtpRange": "280_to_350",
    "q4PlateauDuration": "over_a_year",
    "q5Frustration": "plateaued_at_number",
    "q6WeightKg": 72,
    "q7CoachingHistory": "self_coached",
    "q8Freetext": null
  }'
```

Expected response:

```json
{
  "decision": "inner_circle",
  "computedWpkg": 4.38,
  "budgetFlag": false,
  "injuryFlag": false
}
```

- [ ] **Step 2: Test validation $€” send invalid input**

```bash
curl -X POST http://localhost:3000/api/ndy/recommend \
  -H "Content-Type: application/json" \
  -d '{"q1TrainingFor": "invalid"}'
```

Expected: `400` with `{"error": "Invalid q1TrainingFor: invalid"}`

- [ ] **Step 3: Test a budget override case**

```bash
curl -X POST http://localhost:3000/api/ndy/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "q1TrainingFor": "race_with_date",
    "q2HoursPerWeek": "9_to_12",
    "q3FtpRange": "350_plus",
    "q4PlateauDuration": "over_a_year",
    "q5Frustration": "plateaued_at_number",
    "q6WeightKg": 69,
    "q7CoachingHistory": "self_coached",
    "q8Freetext": "is this expensive"
  }'
```

Expected: `{"decision": "standard", "budgetFlag": true, ...}`

Note: Airtable writes will fail silently if `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` aren't set in `.env.local`. That's expected $€” the routing response still works. Airtable integration is verified once Anthony provides the credentials.

---

## Task 7: Final Commit + Phase 1 Summary

- [ ] **Step 1: Run the full test suite one final time**

```bash
cd ~/Desktop/roadman-cycling-site && npx vitest run
```

Expected: All 27 tests pass.

- [ ] **Step 2: Verify build still works**

```bash
cd ~/Desktop/roadman-cycling-site && npm run build
```

Expected: Build completes with no errors. The new API route should appear in the build output.

- [ ] **Step 3: Commit any remaining changes**

If any files were modified during smoke testing (e.g. `.env.local` additions), ensure they're not committed. Only source code.

---

## Phase 1 Deliverable Checklist

- [ ] `src/lib/ndy/types.ts` $€” All types for questions, answers, routing, Airtable record
- [ ] `src/lib/ndy/routing.ts` $€” Pure routing function, no side effects
- [ ] `src/lib/ndy/routing.test.ts` $€” 20 profile tests + 7 flag/wpkg tests, all passing
- [ ] `src/lib/ndy/airtable.ts` $€” Airtable client following existing pattern
- [ ] `src/app/api/ndy/recommend/route.ts` $€” POST endpoint with validation
- [ ] `vitest.config.mts` $€” Test framework setup
- [ ] Build passes, no regressions

**Stop here.** Phase 2 (response templates in Anthony's voice) requires Anthony's review before proceeding.
