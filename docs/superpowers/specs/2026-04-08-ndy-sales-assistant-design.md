# NDY Sales Assistant $€” Design Spec

**Date:** 2026-04-08
**Status:** Draft
**Author:** Ted / Claude (brainstorming session)

---

## Overview

A conversational qualification tool at `/ndy/fit` that asks a prospect seven structured questions plus an optional free-text field, determines which NDY tier fits them (Standard $15/mo, Premium $195/mo, Inner Circle $697/mo, or "not a fit right now"), and routes them to the right next step.

Full-screen, one-question-at-a-time, Typeform-style UX. Not a chat widget. Voice matches Roadman brand per the voice guide $€” no SaaS funnel language, no "elevate your cycling", no exclamation marks.

Replaces the "pick a tier off the pricing page and guess" experience. The existing NDY page gets one new CTA above the tier cards: "Not sure which tier fits? Two minutes, no email required." Opens `/ndy/fit`.

---

## Architecture

**Approach:** Server-side routing, static page (Approach A from brainstorming).

- `/ndy/fit` $€” Client-side React page with state machine managing question visibility. All questions rendered in a single page component, one visible at a time with transitions.
- `/api/ndy/recommend` $€” POST endpoint. Receives all answers, runs routing logic, writes to Airtable, returns routing decision + template key + interpolated prospect details.
- No LLM in the routing path. Routing is pure JavaScript.
- Claude API used only in Phase 2 for drafting the four response templates (a one-time authoring step, not a runtime call).
- Airtable write is server-side $€” API key never exposed to client.

**Stack:** Next.js 16 (existing codebase), Airtable (existing integration pattern at `src/lib/inventory/airtable.ts`), Tailwind v4 (existing), Framer Motion (existing).

**What this build touches:**
- New: `/src/app/(community)/community/not-done-yet/fit/page.tsx`
- New: `/src/app/api/ndy/recommend/route.ts`
- New: `/src/lib/ndy/routing.ts` (pure routing logic, unit-testable)
- New: `/src/lib/ndy/airtable.ts` (Airtable client for ndy_prospects, following existing pattern)
- New: `/src/lib/ndy/templates.ts` (four response templates)
- New: `/src/lib/ndy/types.ts` (TypeScript types for questions, answers, routing)
- Modified: `/src/app/(community)/community/not-done-yet/page.tsx` (add one CTA above tier cards)

**What this build does NOT touch:**
- Sponsor system, `/partners` page, main navigation, shared component library (beyond the one CTA addition)
- No new npm dependencies required $€” everything needed is already in the project

---

## Question Flow

Seven structured inputs + one optional free-text, full-screen one at a time.

### Q1: What are you actually training for?
- Type: Single select (button grid)
- Options:
  - `race_with_date` $€” "A race or event with a specific date"
  - `specific_watts_target` $€” "A specific watts or power number"
  - `group_ride_fitness` $€” "Sick of getting shelled on the group ride"
  - `general_fitness` $€” "General fitness, no specific target"
  - `other` $€” "Something else"
- Airtable field: `q1_training_for`

### Q2: How many hours a week can you realistically train $€” not your fantasy number, your actual number?
- Type: Single select (button grid)
- Options:
  - `under_4` $€” "Less than 4 hours"
  - `4_to_6` $€” "4$€“6 hours"
  - `6_to_9` $€” "6$€“9 hours"
  - `9_to_12` $€” "9$€“12 hours"
  - `12_plus` $€” "12+ hours"
- Airtable field: `q2_hours_per_week`

### Q3: What's your current FTP?
- Type: Single select (button grid)
- Options:
  - `under_200` $€” "Under 200W"
  - `200_to_280` $€” "200$€“280W"
  - `280_to_350` $€” "280$€“350W"
  - `350_plus` $€” "350W+"
  - `not_sure` $€” "Not sure / never tested"
- Airtable field: `q3_ftp_range`
- Note: `not_sure` is treated as not meeting the >280W threshold for Inner Circle routing

### Q4: How long have you been stuck at that number?
- Type: Single select (button grid)
- Options:
  - `not_stuck` $€” "I'm not stuck, just getting started"
  - `few_months` $€” "A few months"
  - `6_to_12_months` $€” "6$€“12 months"
  - `over_a_year` $€” "Over a year"
  - `no_idea` $€” "No idea, I don't test regularly"
- Airtable field: `q4_plateau_duration`
- Skippable: If Q3 = `not_sure`, auto-skip Q4 and set to `no_idea`

### Q5: What's the thing actually doing your head in?
- Type: Single select (button grid)
- Options:
  - `plateaued_at_number` $€” "Plateaued at a number I can't shift"
  - `no_structure` $€” "No structure, making it up as I go"
  - `lost_motivation` $€” "Lost motivation, can't stay consistent"
  - `recurring_injury` $€” "Recurring injury holding me back"
  - `other` $€” "Something else"
- Airtable field: `q5_frustration`

### Q6: What's your weight?
- Type: Number input (kg) with skip button
- Validation: 40$€“160kg range, integer or one decimal
- Airtable field: `q6_weight_kg` (nullable)
- Used to compute w/kg for Inner Circle routing when combined with Q3 FTP range

### Q7: Worked with a coach before, or coaching yourself off podcasts and forums?
- Type: Single select (button grid)
- Options:
  - `never` $€” "Never had any coaching"
  - `self_coached` $€” "Self-coached from podcasts, forums, YouTube"
  - `had_coach_before` $€” "Had a coach before"
  - `currently_have_one` $€” "Currently have a coach"
- Airtable field: `q7_coaching_history`

### Q8: Anything else we should know? (Optional)
- Type: Free text, max 500 characters
- Skip button prominent
- Airtable field: `q8_freetext`
- Scanned for budget keywords and injury keywords before routing

---

## Routing Logic

Pure JavaScript. Evaluated top-to-bottom, first match wins.

### Pre-processing

1. **Compute w/kg** (if Q3 FTP range and Q6 weight both provided):
   - FTP midpoints: `under_200` $†’ 175, `200_to_280` $†’ 240, `280_to_350` $†’ 315, `350_plus` $†’ 375
   - `computed_wpkg = ftp_midpoint / weight_kg`

2. **Scan Q8 freetext** for keywords:
   - Budget keywords: `cost`, `budget`, `afford`, `expensive`, `price`, `cheap`, `money`, `too much`
   - Injury keywords: `injury`, `injured`, `physio`, `doctor`, `surgery`, `pain`, `knee`, `back`, `hip`
   - Case-insensitive, word-boundary matching
   - Sets `budget_flag` and `injury_flag` booleans

### Rules (evaluated in order)

#### Rule 1: Not A Fit
```
IF (q5_frustration = "recurring_injury" AND injury_flag = true)
OR (q2_hours = "under_4" AND q5_frustration = "recurring_injury")
OR (q2_hours = "under_4" AND q1_training_for = "general_fitness")
$†’ not_a_fit
```
Narrow gate. Only triggers on genuine injury concerns or someone with <4hrs and no specific goal. Honest refusal, not gatekeeping.

#### Rule 2: Budget Override $†’ Standard
```
IF budget_flag = true
$†’ standard
```
If the prospect mentions cost anywhere in freetext, default to Standard regardless of profile.

#### Rule 3: Inner Circle
```
IF q2_hours IN ("9_to_12", "12_plus")
AND q1_training_for = "race_with_date"
AND (q3_ftp IN ("280_to_350", "350_plus") OR computed_wpkg >= 3.5)
AND q5_frustration IN ("plateaued_at_number", "other")
AND q7_coaching IN ("self_coached", "had_coach_before", "currently_have_one")
$†’ inner_circle
```
Requires all four signals: serious hours, race goal, strong FTP, coaching awareness. Missing any one drops down.

#### Rule 4: Premium
```
IF q2_hours IN ("6_to_9", "9_to_12", "12_plus")
AND q1_training_for IN ("race_with_date", "specific_watts_target", "group_ride_fitness")
AND q5_frustration IN ("plateaued_at_number", "no_structure", "other")
AND q7_coaching IN ("self_coached", "had_coach_before")
$†’ premium
```

#### Rule 5: Standard (default)
```
Everything else $†’ standard
```
Widest net. Includes never-coached, lost-motivation, and anyone who doesn't match Premium/IC criteria.

### Key behaviours
- `not_sure` on FTP treated as not meeting >280W (blocks Inner Circle, not Premium)
- `currently_have_one` on coaching blocks Premium (they already have a coach $€” route to IC if profile fits, otherwise Standard). This is intentional: someone with an existing coach who doesn't meet IC criteria isn't a Premium upsell target $€” they're either an IC candidate or they stay where they are.
- `lost_motivation` on frustration routes to Standard (community-first, not plan-first)
- Injury alone in Q5 without injury confirmation in freetext routes to Standard, not "not a fit" (single data point is insufficient)

---

## Response Templates

Four pre-approved templates, one per routing state. Written in Anthony's voice (patterns from voice guide). Claude API inserts prospect-specific details at template variables: `{goal}`, `{hours}`, `{ftp_range}`, `{frustration}`.

Templates are stored in `/src/lib/ndy/templates.ts` as string literals. Phase 2 deliverable $€” Anthony must review and approve all four before they ship.

### Template structure (all four follow this pattern):
1. **Diagnostic opener** (2-3 sentences) $€” Reflects back what the prospect told us, using Anthony's "here's the thing" framing
2. **Recommendation** (1-2 sentences) $€” Clear statement of which tier and why
3. **What they get** (2-3 bullet points) $€” Tier-specific, grounded in specifics not features
4. **CTA** $€” Tier-specific action

### Routing-specific CTAs:

| Route | Primary CTA | Secondary CTA | Tertiary CTA |
|-------|-------------|---------------|--------------|
| Standard | "Start your 7-day free trial" $†’ Skool Standard checkout | "Talk to someone first" $†’ contact form | "Not ready yet" $†’ free resource |
| Premium | "Start your 7-day free trial" $†’ Skool Premium checkout | "Book a call first" $†’ Calendly | "Not ready yet" $†’ free resource |
| Inner Circle | "Book a call with Anthony" $†’ Calendly (direct to Anthony) | "Tell me more first" $†’ contact form | "Not ready yet" $†’ free resource |
| Not a fit | "Get the free resources" $†’ email capture $†’ Beehiiv nurture | "Talk to someone anyway" $†’ contact form | $€” |

### Email capture:
- **Not a fit:** Required. Email field shown inline before delivering free resource link. Triggers Beehiiv webhook for nurture sequence.
- **All other routes:** No email capture on this page. Skool/Calendly captures contact downstream.

---

## Airtable Schema: `ndy_prospects`

| Field | Type | Notes |
|-------|------|-------|
| `prospect_id` | Auto-number | Primary key |
| `timestamp` | DateTime | Server-side, UTC |
| `q1_training_for` | Single select | race_with_date / specific_watts_target / group_ride_fitness / general_fitness / other |
| `q2_hours_per_week` | Single select | under_4 / 4_to_6 / 6_to_9 / 9_to_12 / 12_plus |
| `q3_ftp_range` | Single select | under_200 / 200_to_280 / 280_to_350 / 350_plus / not_sure |
| `q4_plateau_duration` | Single select | not_stuck / few_months / 6_to_12_months / over_a_year / no_idea |
| `q5_frustration` | Single select | plateaued_at_number / no_structure / lost_motivation / recurring_injury / other |
| `q6_weight_kg` | Number | Nullable |
| `q7_coaching_history` | Single select | never / self_coached / had_coach_before / currently_have_one |
| `q8_freetext` | Long text | Nullable, max 500 chars |
| `computed_wpkg` | Number | Calculated server-side, nullable |
| `budget_flag` | Checkbox | From freetext keyword scan |
| `injury_flag` | Checkbox | From freetext keyword scan |
| `routing_decision` | Single select | standard / premium / inner_circle / not_a_fit |
| `response_shown` | Single line text | Template key used |
| `email` | Email | Nullable, required for not_a_fit only |
| `button_clicked` | Single select | primary / secondary / tertiary / none |
| `outcome` | Single line text | Updated manually later |
| `notes` | Long text | Admin notes |

---

## Front-end Design

### Page: `/ndy/fit`

- **Full-screen layout.** No header, no footer, no navigation. Just the question.
- **Dark background** (#252526) with off-white text (#FAFAFA). Coral (#F16363) for the active/selected state.
- **Typography:** Bebas Neue for the question text, Work Sans for option labels and body.
- **One question visible at a time.** Framer Motion transitions (slide-up or fade) between questions.
- **Progress indicator:** Subtle step dots or thin progress bar at top. Not numbered $€” avoids "7 questions" fatigue.
- **Option buttons:** Large, full-width on mobile, two-column on desktop. Tap/click to select and auto-advance after a brief delay (300ms) to confirm the selection visually before moving.
- **Back button:** Small, top-left. Allows going back to previous questions.
- **Skip button:** Shown only on Q6 (weight) and Q8 (freetext). Styled as text link, not a button.
- **Mobile-first.** Touch targets minimum 48px. Question text readable without scrolling on any screen.

### Result screen

After the last input, a branded transition ("Finding the right fit...") with a subtle animation (1-2 seconds, Framer Motion). Then the response template renders:

- Diagnostic opener paragraph
- Recommendation paragraph
- Three CTA buttons stacked vertically:
  - Primary: Coral background, white text, full-width
  - Secondary: Outlined, coral border
  - Tertiary: Text link style

### Responsive behaviour

- **Mobile (<768px):** Single column, full-bleed buttons, question text at ~1.5rem
- **Desktop (>768px):** Centered card (max-width 640px), question text at ~2rem, two-column button grid for options with 5+ choices

---

## Integration Points

### Airtable
- Follow existing pattern at `src/lib/inventory/airtable.ts`
- New client at `src/lib/ndy/airtable.ts` using same env vars (`AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`)
- Single `createProspect()` function called from the API route
- Rate limiting inherited from existing pattern

### Skool checkout
- Standard: `https://www.skool.com/roadmancycling/about` (existing link, Standard tier)
- Premium: `https://www.skool.com/roadmancycling/about` (existing link, Premium tier)
- Opens in new tab via `window.open()`

### Calendly
- Inner Circle: Direct link to Anthony's calendar (URL TBD $€” one of the questions for Anthony)
- Premium "book a call first": Same or different Calendly link (TBD)
- Embed vs. link: Link in new tab for v1, embed can come later

### Beehiiv
- Not-a-fit nurture: POST to Beehiiv API to subscribe email with tag `ndy_nurture_not_a_fit`
- Existing Beehiiv sync at `/api/admin/sync/beehiiv` $€” follow that pattern
- Webhook fires after email is captured on the result screen

### NDY page CTA
- One new element added above the existing tier cards in `/src/app/(community)/community/not-done-yet/page.tsx`
- Copy: "Not sure which tier fits? Two minutes, no email required."
- Button: "Find your fit" $†’ links to `/community/not-done-yet/fit`
- Styled as a subtle callout, not competing with the tier cards

---

## Build Phases

### Phase 1: Routing logic + Airtable schema + tests
- `src/lib/ndy/types.ts` $€” TypeScript types
- `src/lib/ndy/routing.ts` $€” Pure routing function
- `src/lib/ndy/airtable.ts` $€” Airtable client
- Unit tests for routing against 20 sample prospect profiles (all four routing states covered)
- Airtable table creation (manual, needs base ID + API key)
- Deliverable: `/api/ndy/recommend` returns correct routing for all 20 test cases

### Phase 2: Response templates
- Read voice guide + 10-15 podcast scripts
- Draft four response templates in Anthony's voice
- Generate 20 sample prospect profiles
- Produce 80 sample responses (20 profiles x 4 routing states) using the templates
- Anthony reviews and approves 90%+ before proceeding
- Deliverable: Approved templates in `src/lib/ndy/templates.ts`

### Phase 3: Front-end conversational flow
- `/ndy/fit` page component with question state machine
- Full-screen layout, transitions, progress indicator
- Result screen with three CTAs
- Airtable logging on every completed conversation
- Mobile-first, responsive
- Deliverable: Working flow at `localhost:3000/community/not-done-yet/fit`

### Phase 4: Integration + soft launch
- NDY page CTA addition
- Calendly link integration (needs Anthony's link)
- Beehiiv webhook for nurture routing
- Skool checkout links verified
- Soft launch to 10% of NDY page traffic (A/B via cookie or URL param)
- Deliverable: Live on production at 10% traffic

### Phase 5: Admin + monitoring (post-launch)
- `/admin/prospects` view (auth-gated)
- Monthly voice audit cron (bundles 10 recent conversations for Anthony)
- Deliverable: Admin dashboard, audit process running

**Checkpoint rule:** Stop and confirm with Anthony at the end of each phase before proceeding.

---

## Open Questions for Anthony (before Phase 1)

1. Airtable base ID and API key for the `ndy_prospects` table $€” or permission to create in the existing base?
2. Calendly link for Inner Circle calls $€” direct to Anthony or via Sarah first?
3. Beehiiv API access for nurture sequence routing $€” existing key or new one needed?
4. Should prospect email be captured optionally at the end for paid-tier paths too (current design: not-a-fit only)?
5. What free resource should the "not a fit" path offer? (Existing toolkit? New PDF? Link to Clubhouse?)

---

## Test Plan (Phase 1)

20 sample prospect profiles covering all routing states:

| # | Goal | Hours | FTP | Plateau | Frustration | Weight | Coaching | Freetext | Expected |
|---|------|-------|-----|---------|-------------|--------|----------|----------|----------|
| 1 | race_with_date | 9_to_12 | 280_to_350 | over_a_year | plateaued_at_number | 72 | self_coached | $€” | inner_circle |
| 2 | race_with_date | 12_plus | 350_plus | 6_to_12_months | plateaued_at_number | 68 | had_coach_before | $€” | inner_circle |
| 3 | race_with_date | 9_to_12 | 200_to_280 | over_a_year | plateaued_at_number | 65 | self_coached | $€” | inner_circle (3.7 w/kg) |
| 4 | race_with_date | 9_to_12 | 200_to_280 | over_a_year | plateaued_at_number | 80 | self_coached | $€” | premium (3.0 w/kg, below 3.5) |
| 5 | specific_watts_target | 6_to_9 | 200_to_280 | few_months | plateaued_at_number | $€” | self_coached | $€” | premium |
| 6 | group_ride_fitness | 6_to_9 | under_200 | not_stuck | no_structure | $€” | had_coach_before | $€” | premium |
| 7 | race_with_date | 6_to_9 | 280_to_350 | 6_to_12_months | no_structure | 75 | self_coached | $€” | premium |
| 8 | specific_watts_target | 9_to_12 | 350_plus | over_a_year | plateaued_at_number | 70 | never | $€” | standard (never coached) |
| 9 | race_with_date | 4_to_6 | 200_to_280 | few_months | no_structure | $€” | never | $€” | standard |
| 10 | general_fitness | 4_to_6 | not_sure | no_idea | lost_motivation | $€” | never | $€” | standard |
| 11 | group_ride_fitness | 4_to_6 | under_200 | not_stuck | lost_motivation | $€” | self_coached | $€” | standard |
| 12 | other | 6_to_9 | not_sure | no_idea | other | $€” | never | $€” | standard |
| 13 | race_with_date | 9_to_12 | 350_plus | over_a_year | plateaued_at_number | 69 | self_coached | "is this expensive" | standard (budget) |
| 14 | race_with_date | 12_plus | 280_to_350 | over_a_year | plateaued_at_number | 72 | had_coach_before | "can't afford much" | standard (budget) |
| 15 | general_fitness | under_4 | not_sure | no_idea | recurring_injury | $€” | never | $€” | not_a_fit |
| 16 | group_ride_fitness | under_4 | under_200 | not_stuck | recurring_injury | $€” | never | "bad knee from physio" | not_a_fit |
| 17 | general_fitness | under_4 | not_sure | no_idea | lost_motivation | $€” | never | $€” | not_a_fit |
| 18 | race_with_date | 4_to_6 | 280_to_350 | 6_to_12_months | recurring_injury | 75 | self_coached | "recurring back injury from doctor" | not_a_fit |
| 19 | race_with_date | 9_to_12 | 280_to_350 | over_a_year | other | 74 | currently_have_one | $€” | inner_circle |
| 20 | specific_watts_target | 6_to_9 | 200_to_280 | few_months | other | $€” | self_coached | $€” | premium |
