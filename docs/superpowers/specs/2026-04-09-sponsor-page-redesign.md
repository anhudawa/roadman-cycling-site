# /sponsor Page Redesign $€” Simplified Booking Flow

**Date:** 2026-04-09
**Status:** APPROVED $€” Design approved by Anthony, moving to implementation
**Replaces:** Current /sponsor page (8 sections, 3 booking flows, quiz, complex events calendar)

---

## 1. Context

The current /sponsor page has too many entry points and too many fields. Three separate booking flows (Spotlight, Quarter, Annual), a 4-question recommendation quiz, a 10-question application form, a 3-question pre-screener, and an events calendar with per-event booking buttons. An advertiser lands on the page and doesn't know where to start.

The redesign collapses everything into one product with one flow:

**Two ways in** (marquee event blocks OR duration-based contracts) $†’ **pick your slot type** $†’ **upload your assets** $†’ **done**.

Three steps. One page. No quiz, no pre-screener, no application form.

---

## 2. Decisions Locked

| Decision | Choice |
|----------|--------|
| Product model | One slot type per contract. Want newsletter + mid-roll? Two contracts. |
| Event blocks | Same model as duration $€” one slot type, event sets the duration |
| Self-serve | Stripe checkout for 1-3 month deals. Form submission for 6mo+ (routes to Anthony/Sarah) |
| Pricing | Percentage discount off monthly rate. Longer = cheaper per month. |
| Asset collection | Three fields only: logo upload, website URL, ad copy |
| Multi-year | Skips to contact form (conversation required) |

---

## 3. Page Structure (4 sections, down from 8)

### Section 1: Hero
Same as current. Headline, subline, one CTA button that scrolls to the booking flow.

**Headline:** REAL NUMBERS. REAL DATES. REAL CYCLING FANS.
**Subline:** No media kit fluff. Pick a moment or a duration. Choose your slot. Upload your assets. Done.
**CTA:** SEE WHAT'S AVAILABLE $†’ scrolls to booking flow

### Section 2: Booking Flow (the core $€” replaces events calendar, rate card, quiz, all booking flows)
Three-step progressive disclosure within one container. Details in Section 4 below.

### Section 3: Proof Block (condensed)
- Brand logos: TrainingPeaks, SRAM, Parlee, 4Endurance, Bikmo
- One testimonial (4iiii)
- Four audience numbers (1M+ listeners, income, intent, spend)
- One line: "Full audience report available on request"

### Section 4: FAQ (trimmed to 4)
1. What's the turnaround from brief to live?
2. Can I see audience data before committing?
3. Do you have category restrictions?
4. What does success look like?

Dropped: "How is pricing determined?" (the booking flow shows live pricing) and "Can I test before committing?" (1-month option IS the test).

---

## 4. Booking Flow $€” Detailed Spec

### Step 1: Choose Your Campaign

Two tabs at the top of the booking section:

**Tab A: "PICK A MOMENT"**

5 marquee event block cards displayed in a horizontal scroll (desktop) / vertical stack (mobile):

| Block | Duration | Dates | Event Premium |
|-------|----------|-------|---------------|
| Tour de France | 3 weeks | Jul 4-26 2026 | +15% (Tier 1) |
| Giro d'Italia | 3 weeks | May 9-31 2026 | +10% (Tier 2) |
| Vuelta a EspaÃ±a | 3 weeks | Aug 15 - Sep 6 2026 | +10% (Tier 2) |
| Gravel Season | 6 months | Apr-Sep 2026 | Flat |
| Indoor Season | 5 months | Nov 2026 - Mar 2027 | Flat |

Each card shows:
- Block name (Bebas Neue heading)
- Date range
- One-line coverage description (from existing COVERAGE_PLANS)
- Status badge (available / filling up / sold out) $€” live from Airtable
- Clickable $€” selecting highlights the card with coral border and reveals Step 2

**Tab B: "PICK A DURATION"**

5 selectable cards in a row:

| Duration | Discount | Label |
|----------|----------|-------|
| 1 month | 0% | "Test the water" |
| 3 months | 10% off | "Proper presence" |
| 6 months | 20% off | "Serious commitment" |
| 12 months | 30% off | "Annual partner" |
| Multi-year | 35% off | "Let's talk" |

Each card shows:
- Duration (large, Bebas Neue)
- Discount badge (e.g. "SAVE 20%") $€” not shown on 1 month
- One-line description
- Clickable $€” selecting highlights with coral border and reveals Step 2
- Multi-year selection skips Step 2 and Step 3, shows a short contact form instead (name, email, brand, message)

### Step 2: Choose Your Slot

Appears below Step 1 with a smooth scroll-into-view animation after selection.

4 slot type cards:

| Slot | Base Rate/mo | Description |
|------|-------------|-------------|
| Pre-roll | $$900 | "First thing listeners hear. Premium position." |
| Mid-roll | $$1,200 | "Peak attention. Lowest skip rate. Most popular." |
| End-roll | $$500 | "Frequency play. Lower cost, consistent presence." |
| Newsletter | $$1,800 | "60,000 inboxes. 65% open rate. Direct to inbox." |

**Live pricing calculation shown on each card:**
- If Step 1 was a duration: `base_rate Ã— (1 - discount) Ã— months`
- If Step 1 was an event block: `base_rate Ã— event_premium Ã— number_of_episodes_in_block`

Example: Sponsor picks "3 months" then hovers over "Mid-roll":
$†’ Shows: "Mid-roll Ã— 3 months (39 episodes) $€” $$1,080/ep (10% off) = $$42,120"

Example: Sponsor picks "Tour de France" then hovers over "Mid-roll":
$†’ Shows: "Mid-roll Ã— Tour de France (9 episodes) $€” $$1,380/ep (+15%) = $$12,420"

**Note on display:** Show the per-episode rate and total. Don't show the multiplication formula $€” sponsors want to see "what does this cost" not "how is this calculated". The formula is for our reference only.

**Episode count for event blocks:**
- Grand Tours (3 weeks): 9 episodes (3/week Ã— 3 weeks)
- Gravel Season (6 months): 78 episodes (3/week Ã— 26 weeks)
- Indoor Season (5 months): 65 episodes (3/week Ã— ~21.7 weeks)

**Newsletter count for event blocks:**
- Grand Tours: 3 sends (1/week Ã— 3 weeks)
- Gravel Season: 26 sends (1/week Ã— 26 weeks)
- Indoor Season: 22 sends (1/week Ã— ~22 weeks)

"MOST POPULAR" badge on Mid-roll card.

Selecting a slot highlights it with coral border and reveals Step 3.

### Step 3: Your Assets

Appears below Step 2 with smooth scroll animation.

**Summary bar at top:**
Shows the full selection in one line, e.g.:
"Mid-roll Ã— Tour de France $€” 9 episodes @ $$1,380/ep = **$$12,420**"
or
"Mid-roll Ã— 3 months $€” 39 episodes @ $$1,080/ep = **$$42,120**"

**Three input fields:**

1. **Logo or graphic** $€” drag-and-drop upload zone. Accepts PNG, SVG, JPG. Max 5MB. Shows preview thumbnail after upload.
   - Helper text: "Your logo for show notes and newsletter placement"

2. **Website URL** $€” text input with URL validation
   - Helper text: "Where should we send listeners?"

3. **Ad copy** $€” textarea, 500 char max
   - Helper text: "What do you want Anthony to say? Keep it tight $€” he'll script the read himself."

**CTA button (below the fields):**

For **1-month and 3-month** deals (from "Pick a Duration" tab):
$†’ Button text: **"PAY AND BOOK $€” $$X,XXX"**
$†’ Clicking creates a Stripe Checkout Session with the total amount, slot metadata, and uploaded assets
$†’ Redirects to Stripe hosted checkout
$†’ On success: slot marked sold in Airtable, notification email sent, redirect to success page

For **6-month and 12-month** deals (from "Pick a Duration" tab):
$†’ Button text: **"SUBMIT $€” WE'LL BE IN TOUCH WITHIN 48 HOURS"**
$†’ Also collects: contact name (text) + contact email (email) $€” two additional fields shown only for 6mo+
$†’ Posts to `/api/sponsor/apply` which sends formatted email to anthony@roadmancycling.com via Resend
$†’ Shows confirmation message inline

For **event blocks** (from "Pick a Moment" tab):
- Grand Tour blocks (3 weeks): **self-serve Stripe checkout** (same as 1-3 month)
- Gravel Season (6 months): **form submission** (same as 6-12 month)
- Indoor Season (5 months): **form submission** (same as 6-12 month)

For **multi-year** (from "Pick a Duration" tab):
$†’ Steps 2 and 3 are skipped entirely
$†’ Instead shows a minimal contact form: name, email, brand name, "Tell us what you're thinking" textarea
$†’ Button: **"START THE CONVERSATION"**
$†’ Posts to same `/api/sponsor/apply` endpoint

### Step transitions

Each step uses a smooth `framer-motion` slide-down + fade-in animation. Previous steps remain visible but dim slightly (opacity 0.6) so the user can see their selections and click back to change them. Clicking a previous step re-activates it and hides steps below it.

---

## 5. Pricing Reference

### Base Monthly Rates (per episode/send)

| Slot Type | Rate/episode or send |
|-----------|---------------------|
| Pre-roll | $$900 |
| Mid-roll | $$1,200 |
| End-roll | $$500 |
| Newsletter | $$1,800 |

### Duration Discounts

| Duration | Discount | Mid-roll example (monthly) |
|----------|----------|---------------------------|
| 1 month | 0% | $$1,200/ep Ã— ~13 eps = $$15,600 |
| 3 months | 10% | $$1,080/ep Ã— ~39 eps = $$42,120 |
| 6 months | 20% | $$960/ep Ã— ~78 eps = $$74,880 |
| 12 months | 30% | $$840/ep Ã— ~156 eps = $$131,040 |
| Multi-year | 35% | By conversation |

**Note:** "Per episode" pricing means the rate applies to each episode within the contract period. 3 episodes/week Ã— 4.33 weeks/month $‰ˆ 13 episodes/month.

### Event Premiums (on top of base rate, before duration discount)

| Event | Premium | Applied to |
|-------|---------|-----------|
| Tour de France | +15% | All slots in Jul 4-26 window |
| Giro d'Italia | +10% | All slots in May 9-31 window |
| Vuelta a EspaÃ±a | +10% | All slots in Aug 15-Sep 6 window |
| Gravel Season | Flat | No premium |
| Indoor Season | Flat | No premium |

### Price Calculation

**Duration path:** `total = base_rate Ã— (1 - discount) Ã— episodes_in_period`
**Event path:** `total = base_rate Ã— event_premium Ã— episodes_in_event`

---

## 6. What Gets Removed

The following current page elements are **deleted**:

- Recommendation quiz (4 questions) $€” replaced by the two-tab design
- Spotlight/Quarter/Annual tier naming $€” replaced by duration + slot type
- Quarter pre-screener (3 questions + Calendly) $€” replaced by Stripe checkout or form submission
- Annual application form (10 questions) $€” replaced by the 3-field asset form + contact fields for long deals
- Individual event "BOOK THIS EVENT" buttons $€” replaced by event block selection in Step 1
- Separate events calendar horizontal scroll section $€” events are now inside the "Pick a Moment" tab
- Rate card section (three-column Spotlight/Quarter/Annual) $€” replaced by the slot type picker in Step 2
- "PICK YOUR WEIGHT CLASS" heading and tier descriptions

The following are **kept**:
- Hero (updated subline)
- Proof block (condensed, same content)
- FAQ (trimmed to 4 questions)
- Audience stats block (merged into proof block)

---

## 7. API Changes

### Keep
- `POST /api/sponsor/apply` $€” receives form submissions for 6mo+, multi-year, and long event blocks. Sends email via Resend.
- `POST /api/sponsor/spotlight` $€” renamed conceptually but same endpoint. Creates Stripe Checkout Session for self-serve deals (1-3 month + Grand Tour blocks).
- `POST /api/webhooks/stripe` $€” unchanged. Handles checkout.session.completed.

### Remove
- `POST /api/sponsor/quarter-enquiry` $€” no longer needed (no separate Quarter flow)

### Modify
- `POST /api/sponsor/spotlight` $€” update to accept new metadata format:
  - `duration` or `eventBlock` (identifies what was selected in Step 1)
  - `slotType` (pre-roll / mid-roll / end-roll / newsletter)
  - `totalAmount` (calculated price)
  - `logoUrl` (uploaded file URL)
  - `websiteUrl`
  - `adCopy`

---

## 8. Data Layer Impact

No changes to the Airtable schema. The booking flow writes to the same `inventory` table with the same fields. The only difference is how slots are selected:

- Duration-based: find available slots of the chosen type within the date range
- Event-based: find available slots of the chosen type within the event's date window

Both use existing `getSlots()` with date range + type filters.

---

## 9. File Changes

| File | Action |
|------|--------|
| `src/app/(marketing)/sponsor/page.tsx` | Rewrite $€” 4 sections instead of 8 |
| `src/app/(marketing)/sponsor/SponsorClientSections.tsx` | Rewrite $€” replace all client components with the 3-step booking flow |
| `src/app/api/sponsor/spotlight/route.ts` | Modify $€” accept new metadata format |
| `src/app/api/sponsor/apply/route.ts` | Modify $€” accept simplified form data |
| `src/app/api/sponsor/quarter-enquiry/route.ts` | Delete |

---

## 10. Acceptance Criteria

The redesign is done when:
1. Page has 4 sections: hero, booking flow, proof block, FAQ
2. "Pick a Moment" tab shows 5 event blocks with live availability from Airtable
3. "Pick a Duration" tab shows 5 duration options with discount badges
4. Selecting either reveals the slot type picker with live calculated pricing
5. Selecting a slot type reveals the 3-field asset upload form
6. 1-3 month and Grand Tour deals go through Stripe Checkout
7. 6-12 month, Gravel Season, and Indoor Season deals submit a form to anthony@
8. Multi-year shows a contact form and submits to anthony@
9. Successful Stripe payment marks the slot as sold in Airtable
10. All copy is in Roadman voice
11. Build passes with 0 errors
