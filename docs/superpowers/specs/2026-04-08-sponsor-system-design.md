# Roadman Cycling — Sponsor Sales & Operations System

**Date:** 2026-04-08
**Status:** DRAFT — Pending review
**Site:** ~/Desktop/roadman-cycling-site (Next.js 16.2.2, App Router, Tailwind 4, Vercel)
**Author:** Spec produced via brainstorming session, to be handed to Claude Code for implementation

---

## 1. Context

### What This Is

A sponsor sales and operations system added to the existing Roadman Cycling Next.js site. Three parts sharing one data layer:

1. **Public sales page at `/sponsor`** — the conversion machine. Events calendar, rate card, booking flows.
2. **Internal admin at `/admin/inventory`** — pipeline management, production scheduling, sponsor health tracking.
3. **Shared data layer in Airtable** — single source of truth. Sarah books in admin → public page updates. Brand self-books on public → admin updates. Zero double-entry.

### Why It Exists

Roadman Cycling has ~£14k/mo in sponsor revenue (TrainingPeaks £5k, Parlee £2k, 4Endurance £2k, Hexis £5k affiliate) with zero pricing transparency, zero calendar logic, zero scarcity mechanics, and zero automation. The current `/partners` page is a media kit brochure — every inbound becomes a personal email thread. This system replaces that with productised sponsorship: published prices, visible availability, self-serve checkout for small deals, and an operating system that lets Sarah sell proactively and Wes produce without bottlenecks.

Target: 3× sponsor revenue (£14k → £43k/mo) within 12 months through better pricing, more inventory sold via the public page, and Annual Partner deals locking in stable cheques.

### Decisions Locked

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend for v1 | Airtable | Ship fast, Sarah/Wes can edit directly in Airtable UI as fallback |
| Build sequence | Admin first, public page second | Dogfood internally before sponsors see the public face |
| Calendar population | Pre-populate with existing sponsors at launch | Empty calendar = empty restaurant |
| Hold deposits | None for v1 | Removed to reduce complexity. Holds are admin-only, manual. |
| `/partners` page | Stays, CTAs updated to point to `/sponsor` | Different intent: `/partners` = credibility, `/sponsor` = conversion |
| Auth | NextAuth v5 + magic links via Resend | No passwords, 3-user allowlist in env var |
| Event premiums | +15% / +10% / flat | Conservative for year 1, raise with data in year 2 |
| Notifications | Email via Resend only | Already in stack for auth, Slack is v2 |
| Stripe | Spotlight checkout only (full payment) | No deposits, no partial payments for v1 |

### Existing Site Context

- **Stack:** Next.js 16.2.2, React 19, Tailwind 4, TypeScript, Vercel
- **Stripe:** Already installed (`stripe@^22.0.0`)
- **Design system:** Charcoal `#252526`, deep-purple `#210140`, coral `#F16363`, Bebas Neue headings, Work Sans body
- **Route groups:** `(marketing)`, `(content)`, `(community)` already established
- **Existing admin:** `/admin` with sidebar nav (Dashboard, Traffic, Experiments, Leads, Emails, Content, Agent, Newsletter, Revenue). Currently uses password-based cookie auth via `/api/admin/login` — this will be replaced with NextAuth v5 magic links.
- **Existing `/partners` page:** Has brand logos (TrainingPeaks, SRAM, Parlee, 4Endurance, Bikmo), audience stats, Discovery+ × Giro case study, 4iiii testimonial. Stays as-is, CTAs updated.

### Admin Users

| User | Email | Role |
|------|-------|------|
| Anthony Walsh | anthony@roadmancycling.com | Founder — approves reads, sees everything |
| Sarah | sarah@roadmancycling.com | Operations/sales — manages pipeline and sponsors |
| Wes | wes@roadmancycling.com | Video editor — manages production schedule |

---

## 2. Auth Model

**Decision: NextAuth v5 + Email Provider (magic links) + Resend**

### Why This Approach

- 3 users, no passwords, no external auth service dependency beyond email delivery
- Resend is already needed for notification emails — single integration serves both purposes
- Allowlist pattern means adding/removing users is a config change, not a code change
- NextAuth v5 is the standard for Next.js App Router auth, well-documented, actively maintained

### Implementation

1. Install `next-auth@5` and `@auth/core`
2. Configure Email provider with Resend as the transport
3. Store allowed emails in `AUTH_ALLOWED_EMAILS` env var: `anthony@roadmancycling.com,sarah@roadmancycling.com,wes@roadmancycling.com`
4. In the `signIn` callback, check if the email is in the allowlist. If not, block the sign-in.
5. Session strategy: JWT stored in HTTP-only cookie, 30-day expiry
6. Replace the existing `/admin/login/page.tsx` password form with a magic link email input
7. Remove the existing `/api/admin/login` route and cookie-based auth check
8. Guard all `/admin/*` routes via NextAuth middleware

### Auth Flow

```
User visits /admin → middleware checks session → no session → redirect to /admin/login
User enters email → NextAuth sends magic link via Resend → user clicks link
→ NextAuth verifies token → creates session → redirect to /admin/inventory/pipeline
```

### One Role-Based Guard

Only Anthony can advance read status to `approved` or `live`. Check `session.user.email === 'anthony@roadmancycling.com'` in the server action. Wes sees those transitions as greyed-out "Awaiting Anthony" labels.

---

## 3. Data Model

### Airtable Base: `roadman-sponsorship`

Three linked tables. All field names use `snake_case` to match the TypeScript interfaces in the data access layer.

### Table 1: `inventory`

Each row is one discrete, sellable ad slot.

| Field | Airtable Type | Constraints |
|---|---|---|
| `slot_id` | Auto-number | Primary key. Read-only. |
| `inventory_type` | Single select | `podcast_preroll`, `podcast_midroll`, `podcast_endroll`, `newsletter_dedicated`, `newsletter_banner`, `newsletter_classified`, `youtube_integration` |
| `episode_number` | Number | Integer. Nullable. Podcast slots only. |
| `episode_title` | Single line text | Nullable. Podcast slots only. |
| `planned_publish_date` | Date | ISO 8601. Required. Used for event auto-assignment. |
| `position` | Number | Integer 1–3. Podcast: 1=pre, 2=mid, 3=end. Newsletter: 1=dedicated, 2=banner, 3+=classified. |
| `status` | Single select | `available`, `held`, `sold`, `live`. Default: `available`. |
| `sponsor` | Link to `sponsors` | Nullable when status is `available`. |
| `rate_paid` | Currency (GBP) | Actual amount charged. Nullable until sold. |
| `rack_rate` | Currency (GBP) | Computed: `base_rate[type] × event_premium[tier]`. Updated when event link changes. |
| `campaign_id` | Single line text | Groups slots into a campaign. Convention: `{BRAND}-{Q+YEAR}`, e.g. `TP-Q3-2026`. |
| `brief_url` | URL | Link to brief document. |
| `script_text` | Long text | The ad read script. |
| `read_status` | Single select | `pending`, `script_written`, `read_recorded`, `approved`, `live`. Podcast only. |
| `event` | Link to `events` | Nullable. Auto-assigned when `planned_publish_date` falls in event window. |
| `notes` | Long text | Internal notes. |

**Constraints:**
- `episode_number`, `episode_title`, `read_status` only meaningful for podcast types. Null for others.
- `rack_rate` recalculated when `event` link changes. No event = base rate (×1.00).
- `sponsor` must be set before status can transition to `held`, `sold`, or `live`.

### Table 2: `events`

| Field | Airtable Type | Constraints |
|---|---|---|
| `event_name` | Single line text | Primary field. E.g. "Tour de France 2026". |
| `event_type` | Single select | `grand_tour`, `monument`, `classics_block`, `world_championship`, `olympics`, `roadman_owned`, `winter` |
| `start_date` | Date | Required. |
| `end_date` | Date | Required. Must be ≥ `start_date`. |
| `premium_tier` | Single select | `1` (+15%), `2` (+10%), `3` (flat). |
| `coverage_plan` | Long text | Editorial plan for the event window. |
| `hero_image_url` | URL | For public page event cards. |
| `status` | Single select | `upcoming`, `active`, `completed`. |
| `inventory` | Link to `inventory` | Reverse lookup — all slots in this event's date window. |

### Table 3: `sponsors`

| Field | Airtable Type | Constraints |
|---|---|---|
| `brand_name` | Single line text | Primary field. |
| `contact_name` | Single line text | |
| `contact_email` | Email | |
| `tier` | Single select | `spotlight`, `quarter_starter`, `quarter_standard`, `quarter_premium`, `annual` |
| `contract_start` | Date | |
| `contract_end` | Date | |
| `total_value` | Currency (GBP) | Total contract value. |
| `renewal_date` | Date | |
| `last_contact` | Date | |
| `notes` | Long text | |
| `logo_url` | URL | |
| `inventory` | Link to `inventory` | All slots assigned to this sponsor. |

### Pricing Constants

Stored in `lib/inventory/config.ts`, not Airtable.

**Base Rates (GBP):**

| Type | Rate |
|------|------|
| `podcast_preroll` | £900 |
| `podcast_midroll` | £1,200 |
| `podcast_endroll` | £500 |
| `newsletter_dedicated` | £1,800 |
| `newsletter_banner` | £600 |
| `newsletter_classified` | £400 |
| `youtube_integration` | £2,000 |

**Event Premium Multipliers:**

| Tier | Multiplier | Events |
|------|-----------|--------|
| 1 | ×1.15 | Tour de France, World Championships, Olympics |
| 2 | ×1.10 | Giro, Vuelta, Spring Classics block |
| 3 | ×1.00 | Monuments, Dauphiné, Roadman-owned events |

**Rack Rate Formula:** `rack_rate = BASE_RATES[inventory_type] × EVENT_MULTIPLIERS[event.premium_tier ?? '3']`

### Event Auto-Assignment

When `event.start_date <= slot.planned_publish_date <= event.end_date`, the slot is automatically linked to that event and its `rack_rate` recalculated. Runs on slot creation, slot date update, and event date changes.

### Seed Data

**Production cadence:**

| Channel | Frequency | Slots/Occurrence | Slots/Week | Slots/Month |
|---------|-----------|-----------------|------------|-------------|
| Podcast | 3×/week (Mon/Wed/Fri) | 3 (pre/mid/end) | 9 | ~36 |
| Newsletter | 1×/week (Saturday Spin) | 4 (1 dedicated + 1 banner + 2 classified) | 4 | ~16 |
| YouTube | ~2×/week | 1 integration | ~2 | ~8 |

Generate slots for next 6 months (~360 total). Create events for the 2026 cycling calendar:

| Event | Type | Premium Tier |
|-------|------|-------------|
| Spring Classics Block | `classics_block` | 2 |
| Giro d'Italia 2026 | `grand_tour` | 2 |
| Critérium du Dauphiné 2026 | `classics_block` | 3 |
| Tour de France 2026 | `grand_tour` | 1 |
| Vuelta a España 2026 | `grand_tour` | 2 |
| UCI World Championships 2026 | `world_championship` | 1 |
| Il Lombardia 2026 | `monument` | 3 |
| Migration Gravel 2026 | `roadman_owned` | 3 |
| Roadman Performance Camp 2026 | `roadman_owned` | 3 |
| Winter Indoor Season 2026–27 | `winter` | 3 |

Seed sponsors: TrainingPeaks (annual, £5k/mo), Parlee (quarter, £2k/mo), 4Endurance (quarter, £2k/mo), Hexis (affiliate — note only, no inventory slots), Bikmo (historical, inactive).

### Data Access Layer: `lib/inventory/`

All Airtable access encapsulated in this module. No component or API route imports from `airtable` or calls the Airtable REST API directly.

```typescript
// lib/inventory/types.ts

export type InventoryType =
  | 'podcast_preroll' | 'podcast_midroll' | 'podcast_endroll'
  | 'newsletter_dedicated' | 'newsletter_banner' | 'newsletter_classified'
  | 'youtube_integration';

export type InventoryStatus = 'available' | 'held' | 'sold' | 'live';
export type ReadStatus = 'pending' | 'script_written' | 'read_recorded' | 'approved' | 'live';
export type EventType = 'grand_tour' | 'monument' | 'classics_block' | 'world_championship' | 'olympics' | 'roadman_owned' | 'winter';
export type EventStatus = 'upcoming' | 'active' | 'completed';
export type PremiumTier = '1' | '2' | '3';
export type SponsorTier = 'spotlight' | 'quarter_starter' | 'quarter_standard' | 'quarter_premium' | 'annual';

export interface Slot {
  id: string;
  slotId: number;
  inventoryType: InventoryType;
  episodeNumber: number | null;
  episodeTitle: string | null;
  plannedPublishDate: string;
  position: number;
  status: InventoryStatus;
  sponsorId: string | null;
  ratePaid: number | null;
  rackRate: number;
  campaignId: string | null;
  briefUrl: string | null;
  scriptText: string | null;
  readStatus: ReadStatus | null;
  eventId: string | null;
  notes: string | null;
}

export interface SlotWithRelations extends Slot {
  sponsor: Sponsor | null;
  event: Event | null;
}

export interface Event {
  id: string;
  eventName: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  premiumTier: PremiumTier;
  coveragePlan: string | null;
  heroImageUrl: string | null;
  status: EventStatus;
}

export interface EventWithInventory extends Event {
  inventory: Slot[];
}

export interface Sponsor {
  id: string;
  brandName: string;
  contactName: string | null;
  contactEmail: string;
  tier: SponsorTier | null;
  contractStart: string | null;
  contractEnd: string | null;
  totalValue: number | null;
  renewalDate: string | null;
  lastContact: string | null;
  notes: string | null;
  logoUrl: string | null;
}

export interface SponsorWithInventory extends Sponsor {
  inventory: Slot[];
}

export interface AvailabilityByMonth {
  month: string;
  byType: Record<InventoryType, { total: number; available: number }>;
}

export interface UtilisationByMonth {
  month: string;
  byType: Record<InventoryType, { total: number; sold: number; held: number; utilisation: number }>;
}
```

**Exported functions:**

```typescript
// lib/inventory/index.ts

// Slots
export async function getSlots(filters?: SlotFilters): Promise<Slot[]>;
export async function getSlotById(id: string): Promise<SlotWithRelations | null>;
export async function createSlot(data: Omit<Slot, 'id' | 'slotId' | 'rackRate'>): Promise<Slot>;
export async function updateSlot(id: string, data: Partial<Omit<Slot, 'id' | 'slotId'>>): Promise<Slot>;

// Events
export async function getEvents(filters?: EventFilters): Promise<Event[]>;
export async function getEventById(id: string): Promise<EventWithInventory | null>;

// Sponsors
export async function getSponsors(filters?: SponsorFilters): Promise<Sponsor[]>;
export async function getSponsorById(id: string): Promise<SponsorWithInventory | null>;
export async function createSponsor(data: Omit<Sponsor, 'id'>): Promise<Sponsor>;
export async function updateSponsor(id: string, data: Partial<Omit<Sponsor, 'id'>>): Promise<Sponsor>;

// Aggregated views
export async function getAvailability(dateRange: DateRange): Promise<AvailabilityByMonth[]>;
export async function getUtilisation(dateRange: DateRange): Promise<UtilisationByMonth[]>;
```

All functions return typed objects, never raw Airtable records. All dates as ISO 8601 strings. Currency as plain numbers (GBP decimal).

---

## 4. Public Page: /sponsor

### Component Architecture

Single-page scroll. Dark charcoal base, deep-purple premium sections, coral CTAs. Scroll-driven animations via Framer Motion.

### 1. Hero

**Component:** `SponsorHero` — full-viewport, dark overlay on cycling footage.

**Headline (Bebas Neue, ~120px, uppercase):**

> REAL NUMBERS. REAL DATES. REAL CYCLING FANS.

**Subline (Work Sans, 20px):**

> No media kit fluff. Actual inventory, live pricing, and a calendar that shows exactly what's available. Pick a slot. Book it. Done.

**Button (coral):**

> SEE RATES AND WHAT'S STILL OPEN

### 2. Events Calendar

**Component:** `EventsCalendar` — full-bleed, horizontal scroll on desktop, vertical stack on mobile. Deep-purple background. Each card ~340px fixed-width.

**Section label (coral, small caps):** THE NEXT 12 MONTHS

**Heading (Bebas Neue, 80px):**

> WHERE YOUR BRAND LIVES IN 2026

**Body:**

> Every major race. Every Roadman original. Twelve months of inventory laid out in front of you. Green means it's yours. Amber means move fast. Red means you missed it.

**Event card structure:**
```
[STATUS BADGE — top right]
[EVENT NAME — Bebas Neue, 32px]
[DATES — Work Sans, muted]
[COVERAGE PLAN — Work Sans, 14px]
[INVENTORY REMAINING — live from data layer]
[PRICING]
[CTA BUTTON]
```

**Tour de France card — coverage plan copy:**

> Three weeks. Twenty-one stages. Anthony is in the car for nine of them, with nightly dispatch episodes recorded from the team hotels and published same-day. Full daily podcast coverage for the duration, two long-form YouTube pieces — one at the end of the first week, one full race debrief — plus a dedicated email to the list on race morning and another when the peloton hits Paris. Sponsor gets read-outs in every daily episode, opening placement in both YouTube pieces, logo in the dedicated sends, and a custom mid-roll recorded by Anthony in-location.

**Migration Gravel card — coverage plan copy:**

> This is Roadman's own race. We built it. We run it. We cover every inch of it. Two dedicated pre-race episodes in the week leading up, live social coverage on the day, a full race debrief episode published within 48 hours, and a short-form YouTube doc in the following fortnight. The audience for this one is not passive — these are the people who paid to turn up and ride. Sponsor gets title placement in the two pre-race episodes, branding across all race-day comms, logo on the event page, and an on-site mention in Anthony's race-day address.

**All 10 events for launch:** Spring Classics Block, Giro d'Italia, Critérium du Dauphiné, Tour de France, Vuelta a España, World Championships, Il Lombardia, Migration Gravel, Roadman Performance Camp, Winter Indoor Season. Coverage plan copy to be written for each at build time, matching the style of Tour and Migration examples above.

### 3. Three-Tier Rate Card

**Section label (coral):** EVERGREEN INVENTORY

**Heading (Bebas Neue, 80px):**

> PICK YOUR WEIGHT CLASS

**Body:**

> Short engagement or long game — both work. What doesn't work is a brand dropping in for a week and expecting transformation. Pick the level that matches where you actually are.

#### Spotlight — from £500

**Tagline (coral):** One placement. In and out. No fuss.

> You want to test the water before committing to a quarter. Fair enough. Spotlight gives you a single slot — one end-roll, one mid-roll, or one newsletter classified — scripted by Anthony, delivered to the full list or full listener base. No long brief process. You tell us what you need said, we say it properly, and we send you the numbers afterwards. If it works, you'll know.

**CTA:** BOOK NOW → Stripe Checkout

#### Quarter — from £6,000/quarter

**Badge (coral):** MOST POPULAR

**Tagline (coral):** Three months. Proper presence. Audience actually learns who you are.

| Sub-tier | Price | Includes |
|----------|-------|----------|
| Starter | £6,000 | 6 mid-rolls + 1 dedicated email + 1 banner |
| Standard | £12,000 | 12 mid-rolls + 3 dedicated sends + 1 YouTube |
| Premium | £20,000 | 24 mid-rolls + 6 dedicated sends + 2 YouTube + 1 co-produced piece |

> One mention doesn't move a room. But twelve weeks of consistent placement — mid-rolls in the episodes your audience listens to on their Saturday ride, a dedicated email to 40,000+ subscribers, your brand turning up in the YouTube pieces they share — that's when something shifts. This is the format that works. It gives the audience time to hear you, understand what you do, and actually consider buying. The co-produced piece at Premium level is exactly what it sounds like: Anthony sits down with your team and we make something worth watching together. Not an ad dressed up as content. Content that happens to feature your brand because it genuinely fits.

**CTA:** CHECK AVAILABILITY → Calendly + pre-screener

#### Annual Title Partner — from £8,000/month

**Tagline (coral):** Three brands. All year. First at everything.

> There are three slots. That's the policy, and it won't change. Title partners get first refusal on every event, logo placement on the /partners page for the full year, a quarterly strategy call with Anthony to plan what's coming and where your brand sits in it, and the kind of deep audience familiarity that only happens when you're consistently present across twelve months of serious cycling content. This isn't a package you buy off a shelf. It's an ongoing working relationship. If that's what you're after, apply below and we'll have a proper conversation.

**CTA:** APPLY FOR PARTNERSHIP → Application form

### 4. Proof Block

**Heading (Bebas Neue, 60px):**

> BRANDS THAT DIDN'T NEED TO BE CONVINCED TWICE

**Logo intro:**

> A few of the brands who've already figured out that this audience buys things.

Logos: TrainingPeaks, SRAM, Parlee, 4Endurance, Bikmo — horizontal row, desaturated on dark, full colour on hover.

**Case study reference (deep-purple background):**

Label: CASE STUDY
Heading: DISCOVERY+ × GIRO D'ITALIA

> The Discovery+ partnership around the Giro d'Italia is documented in full. If you want to see how a major media brand integrated into a race coverage block and what the results looked like, that case study is available — ask for it in the enquiry form.

**Testimonial:**

> "THE ROADMAN AUDIENCE DOESN'T JUST LISTEN — THEY ACT."
> — 4iiii [CONFIRM: exact quote and attribution name/title needed from Anthony]

### 5. Audience Block

> Look, if the audience numbers don't work for your brand, nothing else on this page matters. So here they are.

| Stat | Value | Status |
|------|-------|--------|
| Monthly podcast listeners | 1M+ | [CONFIRM] |
| Average household income | £85,000 | [CONFIRM: placeholder] |
| Purchase intent | 73% | [CONFIRM: placeholder] |
| Annual cycling spend | £4,200 | [CONFIRM: placeholder] |

> Full audience report — demographics, device split, geographic breakdown, purchasing behaviour — available on request. Ask for it in the enquiry form.

### 6. FAQ

**Heading (Bebas Neue, 72px):**

> THE QUESTIONS EVERYONE ASKS FIRST

**Q1: How is pricing determined?**

> Straight answer: format, placement, and timing. A mid-roll in a standard episode costs less than a mid-roll in a Tour de France dispatch episode because the audience for the latter is three times the size and already hyped. Event-specific inventory is priced per block based on the reach of that coverage window. The rate card gives you the floor — actual pricing for event slots is listed on the calendar above. No hidden fees, no "call us for pricing" nonsense. What you see is what you pay.

**Q2: What's the turnaround from brief to live?**

> Minimum two weeks from signed agreement to first placement. That gives us time to receive your brief, script the read, get your sign-off, and slot it into the production schedule. For event-specific blocks, we work backwards from the event start date — if you're booking the Tour de France block, you want to be confirmed at least four weeks out. Rush slots exist if something comes up and you need to move fast. Flag it in the enquiry form and we'll tell you honestly whether we can make it work.

**Q3: Can I see audience data before committing?**

> Yes. Full audience report is available on request — demographics, household income, purchase intent, geographic split, device breakdown, the works. We don't put every number on the page because some of it requires context to be useful and we'd rather talk you through it. Fill in the form below and we'll send it over. No commitment required to see the data.

**Q4: Do you have category restrictions?**

> A few. We don't work with brands whose core business is at odds with the sport — so no fast food, no tobacco, nothing that would make Anthony cringe to read out loud. Beyond that, we do apply a one-brand-per-category rule for Title Partners, and we'll flag if a category is already taken for a specific quarter before you go through the booking process. If you're not sure whether your brand fits, ask. Worst we can say is no.

**Q5: Can I test before committing to a quarter?**

> That's exactly what Spotlight is for. One placement, proper execution, real numbers sent back to you afterwards. If it works, you move to a Quarter. If it doesn't — which is rare, but happens — you've spent £500 and found out quickly. We'd rather you do a Spotlight first and then commit to three months than skip the test, do a full quarter, and not be happy. Spotlight is at the top of the page. Book one.

**Q6: What does success look like?**

> That depends on what you're tracking, and we'll ask you that at the start. Some brands are tracking promo code redemptions. Some are tracking site traffic from the link in show notes. Some just want the association with the audience — they know their sales cycle is long and they're playing a longer game. We'll agree what we're measuring before anything goes live, and we'll send you the numbers when it's done. We don't hide behind "brand awareness" when a brand wants to see clicks. We also don't pretend every campaign produces a direct-attribution sale, because that's not always how this works. Honest conversation upfront means no awkward one afterwards.

### 7. Recommendation Quiz

**Heading (Bebas Neue, 64px):**

> NOT SURE WHICH IS RIGHT FOR YOU?

**Body:**

> Four questions. Thirty seconds. Anthony effectively asks you these anyway on the first call — this just saves us both some time. Answer honestly and we'll point you at the right tier.

**CTA:** LET'S FIND OUT →

**Question 1: What's the honest reason you're here?**
- A) We want to test whether podcast sponsorship works for us before spending serious money
- B) We have a budget set aside and we need consistent brand presence over a quarter
- C) We're looking for a proper long-term partnership and we want to be the brand associated with Roadman
- D) We have a specific event we want to be attached to

**Question 2: What's your approximate budget for this?**
- A) Under £2,000
- B) £2,000–£15,000
- C) £15,000–£30,000+
- D) We have a specific event budget and it depends on the slot

**Question 3: How quickly do you need this live?**
- A) This week or next — we have something specific to promote
- B) We're planning a quarter out, no rush
- C) We're thinking about next year and want to get ahead of it
- D) We're flexible — we just want the right slot, not the fastest one

**Question 4: Has your brand ever sponsored a podcast or sport-adjacent media before?**
- A) No — this would be the first time
- B) Yes, and it worked — we want to do more of it
- C) Yes, and it didn't work — but we think Roadman's audience is different
- D) We're a returning Roadman partner

**Routing logic:**

| Pattern | Result |
|---------|--------|
| Mostly A's / Q2=A | → **Spotlight**: "Start with a single placement. Low risk, real data, proper execution." |
| Mostly B's / Q2=B or C | → **Quarter**: "Three months gives the audience time to actually learn who you are. This is the format that works." |
| Mostly C's / Q2=C+ / Q4=B or D | → **Annual Title Partner**: "You're thinking like a long-term partner. There are three slots. Apply below." |
| Q1=D or event-specific answers | → **Events Calendar**: "You've got something specific in mind. Go back to the calendar above and book the slot." |

### 8. Booking Flows

#### Spotlight: Stripe Checkout

1. Slot picker — tabs for End-roll / Mid-roll / Newsletter Classified. Date grid shows available weeks (live from data layer).
2. Brief upload — Brand name, product/service, key message (200 chars), show notes URL, brief PDF (optional), words to avoid (optional).

**Brief intro copy:**

> Keep the brief tight. Anthony scripts the read himself — you're telling him what to say, not writing the script for him. The shorter and clearer this is, the better the result.

3. Stripe Checkout redirect — full payment for selected slot.
4. Success page:

> Done. You'll get a confirmation to the email you used at checkout, and we'll be in touch within 2 working days to confirm your slot and collect anything else we need. If you have questions in the meantime, it's partnerships@roadmancycling.com.

#### Quarter: Calendly + Pre-screener

**Intro:**

> Three questions before we get a call in the diary. Honest answers only — if the Quarter isn't right for you, we'll tell you and point you at something that is.

1. Brand name + website URL
2. Approximate budget (dropdown): Under £2k / £2k–£5,999 / £6k–£12k / £12k–£20k / £20k+
3. Target launch month (month picker, next 6 months + "Flexible")

**Routing:**
- Budget < £6k → redirect to Spotlight with message: "Look, the Quarter starts at £6k and we can't flex that. But a Spotlight at £500 is a proper entry point — one placement, real numbers, no commitment. Start there and see how it goes."
- Budget ≥ £6k → Calendly embed, pre-populated with brand name and launch month.

#### Annual: Application Form

**Intro:**

> Three brands a year. That's the rule and it won't change. If you're applying, tell us who you are and what you're actually trying to achieve. This goes directly to Anthony. He reads them himself.

10 questions:

1. Brand name (text)
2. Website (URL)
3. Primary contact name and title (text)
4. Contact email (email)
5. Describe your brand in two sentences (textarea, 300 chars) — *"Not your marketing copy. What you actually do and who buys it."*
6. Who is your target customer and why do you think they overlap with the Roadman audience? (textarea, 500 chars)
7. What's the outcome you're looking for from a year-long partnership? (textarea, 500 chars) — *"Be specific. 'Brand awareness' is not specific."*
8. Budget range (dropdown): £96k/yr (£8k/mo) / £120k–£180k/yr / £180k+/yr / Let's discuss
9. Previous podcast/sport sponsorship experience — what worked, what didn't? (textarea, 500 chars)
10. Anything about your category or business we should know? (textarea, 300 chars) — *"Category exclusivity, competitor restrictions, timing constraints — flag it here."*

**Submit → webhook → email to anthony@roadmancycling.com** with formatted summary.

**Post-submit:**

> Application received. Anthony reads these himself and responds within 48 hours — usually faster. If you don't hear back in two working days, check your spam filter and then email partnerships@roadmancycling.com directly.

---

## 5. Admin: /admin/inventory

### Route Structure

```
/admin/inventory                    → redirects to /pipeline (default)
/admin/inventory/this-week          → View 1: Editor Production
/admin/inventory/pipeline           → View 2: Quarter Pipeline
/admin/inventory/sponsors           → View 3: Sponsor Health
/admin/inventory/events             → View 4: Events Overlay
```

Add "Inventory" to existing admin sidebar with four child links.

### View 1: This Week (Wes's view)

Episodes publishing in the next 14 days, grouped by date. Each episode shows its ad slots with:

- Position badge (pre/mid/end/dedicated/banner/classified)
- Sponsor name or "AVAILABLE"
- Talking points summary + brief link (if sold)
- Inline editable script text field (auto-saves on blur)
- Read status stepper — single-click advancement:
  - `pending` → "Mark as Written" → `script_written`
  - `script_written` → "Mark as Recorded" → `read_recorded`
  - `read_recorded` → "Submit for Approval" → `approved` (Wes sees "Awaiting Anthony" for this and `live`)
  - `approved` → "Mark Live" (Anthony only)
  - `live` → green badge, done

Toggle between 7-day and 14-day windows. Filter by status (all / needs attention / sold only).

### View 2: Quarter Pipeline (Sarah's + Anthony's view)

**Top metric bar:** Revenue Booked | Available at Rack Rate | Gap (Opportunity) — computed across next 6 months.

**Grid:** Months across top (current + 5), inventory types down side. Each cell shows `sold/total` with colour-coded fill bar:
- 0–49%: grey
- 50–74%: amber
- 75–100%: green

Click any cell → SlotListDrawer slides in from right. Shows individual slots. Actions:
- Available → Book (inline form: sponsor select, rate, campaign ID)
- Held → Convert to sold or Release
- Sold → View details (editable inline)

**Events Overlay toggle:** Enables coloured bands showing event windows on the grid.

### View 3: Sponsor Health

Sortable table of active sponsors:

| Column | Details |
|--------|---------|
| Brand | Logo + name + alert badge if needs attention |
| Tier | Pill badge |
| Campaign dates | Start → End |
| Contract value | £X,XXX |
| Delivery | Progress bar: delivered/contracted per slot type |
| Renewal | Date, colour-coded: green (60+ days), amber (30–60), red (<30) |
| Last contact | Date + staleness dot: green (<14 days), amber (14–30), red (30+) |
| Notes | Truncated, expand on click |

Click row → SponsorDetailDrawer with tabs: Overview (editable fields), Slots (all assigned slots), History (past campaigns).

Alert badges on sponsors where renewal < 30 days OR last contact > 30 days.

### View 4: Events Overlay

Two-panel layout. Left: event list with inventory summary per event. Right: Pipeline grid with event bands.

Each event item shows: name, dates, tier, total/sold/available slots, booked revenue vs potential.

Event CRUD: create, edit dates/coverage/tier/image, delete (only if no sold slots in window).

### CRUD Operations

All via server actions in `app/admin/inventory/actions.ts`.

**Slots:** Create (bulk per episode), read (filtered), update (status, sponsor, script, read_status, rate), delete (available only).

**Sponsors:** Create, read (list + detail), update (any field), deactivate (soft-delete, no active campaigns only).

**Events:** Create, read, update, delete (no sold slots only).

**Episode creation:** `createEpisode()` auto-creates all slot positions (pre/mid/end for podcast, dedicated/banner/classified×2 for newsletter).

### Access Control

NextAuth v5 session guard on all `/admin/*` routes. One role check: only `anthony@roadmancycling.com` can advance read status to `approved` or `live`.

---

## 6. Stripe Integration

### Spotlight Checkout

- Use Stripe Checkout Sessions
- On "Book Now" click: create a Checkout Session with line item = selected slot type + week, metadata includes `slot_id`
- Redirect to Stripe's hosted checkout page
- Webhook: `checkout.session.completed` → update slot status to `sold` in Airtable, create sponsor record if new, send notification email

### Webhook Handling

API route at `/api/webhooks/stripe`:
- Verify Stripe signature
- On `checkout.session.completed`: extract `slot_id` from metadata, update slot, create/link sponsor, send email notification

### What Stripe Does NOT Handle in v1

- Quarter and Annual payments (manual invoicing)
- Event hold deposits (removed from v1)
- Refunds (manual via Stripe dashboard)

---

## 7. Notifications

All via Resend. Triggered by server actions and webhooks.

| Event | Recipients | Content |
|-------|-----------|---------|
| Spotlight purchased | Anthony, Sarah | Brand name, slot type, week, amount paid |
| Quarter enquiry submitted | Anthony, Sarah | Brand name, budget, launch month |
| Annual application received | Anthony | Full form data |
| Sponsor renewal in 30 days | Sarah | Brand name, renewal date, contract value |
| Sponsor last contact > 30 days | Sarah | Brand name, last contact date |

Renewal and staleness alerts: daily check via Vercel Cron at 8am, scans sponsors table.

---

## 8. Edge Cases

### Episode publish date moves, breaking event window

**Scenario:** Episode 1450 was scheduled July 10 (inside Tour, +15% premium). Slot sold at £1,380. Date slips to August 5 (outside Tour).

**Rule:** Once a slot is `sold`, the `rate_paid` is locked. The event link may update but the price doesn't change retroactively. The sponsor paid for a Tour-adjacent placement and should receive equivalent value — either the episode stays associated with Tour coverage thematically (even if published slightly after), or Sarah contacts the sponsor to discuss options. The system flags the discrepancy (slot linked to no event but `rate_paid` > `rack_rate`) so Sarah can handle it manually.

**Implementation:** On date change for a sold slot, if the new date falls outside the original event window, add a `notes` entry: "Date moved from [old] to [new]. Originally in [event name] at premium rate. Review with sponsor." Send notification email to Sarah.

### Event dates change after slots are sold

**Scenario:** Tour de France dates shift by a week. Some sold slots now fall outside the window.

**Rule:** Same as above. Sold slots keep their `rate_paid`. The event link updates automatically but the price stays locked. System flags affected sold slots for manual review.

### Sponsor data conflicts

**Scenario:** Brand self-books a Spotlight on the public page. Sarah is simultaneously booking the same brand into a Quarter in the admin.

**Rule:** Airtable handles concurrent writes. The Spotlight creates a new sponsor record. Sarah's Quarter booking links to the existing sponsor record. On next admin view refresh, Sarah sees both — the Spotlight purchase and her Quarter booking — and can merge/reconcile manually. For v1, this is acceptable. V2 could add a "brand already exists" check during Spotlight checkout.

### Slot double-booking

**Scenario:** Two people try to book the same Spotlight slot simultaneously.

**Rule:** Stripe Checkout Session is created with slot_id in metadata. The webhook handler checks slot status before updating. If the slot is already `sold` when the webhook fires, the second purchase is refunded automatically and an email is sent to the buyer: "The slot you booked was just taken. We've refunded your payment. Here are the remaining available slots." This is a race condition that's unlikely at current volume but must be handled.

### Airtable rate limits

Airtable's API allows 5 requests/second per base. At current scale this is fine. If the public page gets significant traffic, add server-side caching (Vercel KV or simple in-memory with 60-second TTL) for `getAvailability()` responses. The admin doesn't need caching — 3 users won't hit rate limits.

---

## 9. Schema Migration Plan (v2)

### When to Migrate

Migrate from Airtable to Postgres when any of these triggers hit:
- API rate limits cause visible public page delays
- Data volume exceeds Airtable's 100k records/table limit
- Need for complex queries (JOINs, aggregations) that Airtable can't handle efficiently
- Need for real-time updates (websockets for live availability)

### How to Migrate

1. The `lib/inventory/` abstraction layer is the migration boundary. Every component and API route imports from this module, never from Airtable directly.
2. Add Prisma with a Postgres schema that mirrors the Airtable tables exactly. Same field names, same types, same relationships.
3. Write a one-time migration script that reads all Airtable records and inserts them into Postgres.
4. Swap the implementation inside `lib/inventory/` from Airtable REST calls to Prisma queries. The exported function signatures don't change.
5. No component, API route, or server action needs to change. The migration is invisible to the rest of the codebase.

### What to Avoid

- Don't put Airtable field IDs or API-specific logic anywhere outside `lib/inventory/`
- Don't use Airtable formula fields for business logic — keep rack rate calculation in TypeScript
- Don't store configuration (base rates, multipliers) in Airtable — keep in `lib/inventory/config.ts`

---

## 10. Build Phases

### Phase 1: Data Layer + Auth (1 session)

**Build:**
- Airtable base with all 3 tables, correct field types and relationships
- Seed data: 6 months of inventory slots, 10 events, 5 sponsor records
- `lib/inventory/` module with all typed interfaces and exported functions
- `lib/inventory/config.ts` with base rates and multiplier constants
- Replace existing password auth with NextAuth v5 + Resend magic links
- `AUTH_ALLOWED_EMAILS` env var with anthony/sarah/wes emails

**Done when:**
- All three Airtable tables exist with seed data
- `getSlots()`, `getEvents()`, `getSponsors()`, `getAvailability()`, `getUtilisation()` return typed data from Airtable
- Event auto-assignment works (slot with July 10 date links to Tour de France)
- Rack rate calculation works (Tour slot shows £1,380 for mid-roll, not £1,200)
- Magic link login works for all three email addresses
- Old password auth is removed

### Phase 2: Admin — /admin/inventory (1–2 sessions)

**Build:**
- All four admin views (This Week, Pipeline, Sponsors, Events)
- Sidebar navigation with Inventory group
- CRUD operations via server actions
- SlotBookingForm, SponsorDetailDrawer, EventCreateModal
- Read status stepper with Anthony-only approval guard
- Alert badges for sponsor renewal/staleness

**Done when:**
- Wes can log in, see This Week, view scripts, advance read status through the stepper
- Sarah can see Pipeline grid, click a cell, book a sponsor into a slot
- Sarah can see Sponsor Health, sort by renewal date, see alert badges
- Events overlay shows event bands on the pipeline grid
- Anthony can approve reads and mark as live
- All CRUD operations work end-to-end through Airtable

### Phase 3: Public /sponsor Page (1–2 sessions)

**Build:**
- Full page: Hero, Events Calendar, Rate Card, Proof Block, Audience Block, FAQ, Recommendation Quiz
- All copy as specified in this doc (Roadman voice)
- Events Calendar reads live availability from data layer
- Recommendation quiz with client-side routing logic
- Three booking flow shells (Spotlight slot picker + brief form, Quarter pre-screener + Calendly embed, Annual application form + webhook)
- Update /partners CTAs to point to /sponsor

**Done when:**
- Page renders with all sections, correct styling matching existing design system
- Events Calendar shows all 10 events with live availability data
- Event cards show correct pricing (including premiums for Tier 1/2)
- Recommendation quiz routes correctly based on answers
- Quarter pre-screener filters by budget and routes to Calendly or Spotlight
- Annual application form submits and emails anthony@roadmancycling.com
- /partners page CTAs updated

### Phase 4: Stripe + Notifications (1 session)

**Build:**
- Stripe Checkout Sessions for Spotlight purchases
- Webhook handler at `/api/webhooks/stripe`
- Slot status update on successful payment
- Double-booking prevention in webhook handler
- Email notifications via Resend (purchase, enquiry, application, renewal alerts)
- Vercel Cron for daily renewal/staleness checks

**Done when:**
- Test Spotlight purchase works end-to-end: select slot → pay via Stripe test mode → slot marked sold in Airtable → availability updates on /sponsor → notification email received
- Double-booking scenario handled (second buyer refunded)
- Quarter and Annual form submissions trigger notification emails
- Renewal alerts fire for sponsors within 30 days of renewal

### Phase 5: Launch Prep (1 session)

**Build:**
- Map existing sponsors to events: TrainingPeaks across Grand Tours, Parlee on gravel events, 4Endurance on quarter inventory
- Verify calendar looks populated (not empty restaurant)
- End-to-end testing of all flows
- Edge case handling: date changes on sold slots, concurrent booking attempts
- Performance check: public page loads within performance targets

**Done when:**
- Events Calendar shows existing sponsors visibly attached to events
- Several events show "filling up" or partial availability
- All booking flows work in Stripe test mode
- No broken states in admin after rapid booking/releasing
- Public page Lighthouse performance score ≥ 90

---

## 11. What Claude Code Should Do First

### Session 1 — Start Here

1. Read this entire spec. Don't skim.
2. Read `AGENTS.md` in the project root — it warns that this is Next.js 16, not the version you know. Check `node_modules/next/dist/docs/` for API changes.
3. Check the existing admin structure at `src/app/admin/` — there's already a dashboard with sidebar, login page, and layout. You're adding to this, not replacing it (except the auth, which you are replacing).
4. Check the existing design system in `src/app/globals.css` — the brand tokens, typography, and colour variables are already defined. Use them.
5. Set up the Airtable base and create the three tables. Ask for the Airtable API key and base ID if not in env vars.
6. Build `lib/inventory/` — types, config, and the first few functions (getSlots, getEvents, getSponsors). Verify they return real data from Airtable.
7. Replace the existing password auth with NextAuth v5 + Resend. Test magic link login.
8. Stop and check in. Show me what's working before moving to Phase 2.

### Environment Variables Needed

```
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AUTH_SECRET=                    # NextAuth secret
AUTH_ALLOWED_EMAILS=anthony@roadmancycling.com,sarah@roadmancycling.com,wes@roadmancycling.com
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Placeholders Requiring Confirmation

Before the public page goes live, Anthony needs to confirm:

- [ ] Monthly podcast listener count (currently listed as 1M+)
- [ ] £85,000 average household income — needs audience survey source
- [ ] 73% purchase intent — needs source or remove
- [ ] £4,200 average annual cycling spend — needs survey source
- [ ] 4iiii testimonial — exact quote and attribution
- [ ] Discovery+ × Giro case study — cleared for public reference?
- [ ] Roadman Performance Camp — exact November dates and format
- [ ] Winter Indoor Season — format and coverage plan details
- [ ] Calendly link for Quarter bookings
- [ ] Stripe account: test mode vs live mode for initial deploy

---

*This spec is the complete brief for Claude Code. Work through the phases in order, check in between each phase, and flag anything ambiguous before building it.*
