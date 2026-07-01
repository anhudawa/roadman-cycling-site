# Google Ads Recovery & Optimisation Plan

**Roadman Cycling — Playbook for Anthony**
**Date:** 24 May 2026
**Status:** BLOCKED — awaiting 2FA verification on anthony@roadmancycling.com

---

## The situation

Google Ads has been locked out for 8+ days. The account runs under anthony@roadmancycling.com but requires 2FA verification that hasn't been completed. The operational account (ted@roadmancycling.com) hits a verification wall when trying to make changes. During this time ads have been running with **unverified conversion tracking** — the tag (AW-18123737652) is in the codebase and firing events, but we can't confirm attribution is landing in the Google Ads console.

What we know is live in the code right now:

- **GoogleAdsTag.tsx** loads `gtag.js` with ID `AW-18123737652` via `afterInteractive` strategy
- **AdsLandingAnalytics.tsx** fires a "landing page view" conversion (`AW-18123737652/up0JCJqHxKwcELSUicJD`) on `/go/ads` mount
- **ResultsAnalytics.tsx** fires a "Plateau Diagnostic Complete" conversion (`AW-18123737652/WDZ_CNiOvKwcELSUicJD`) on diagnostic results view, valued at €10
- **Tracker.tsx** fires internal events (pageview, cta_click, scroll_depth, time_on_page) to `/api/events` — these are *not* currently bridged to Google Ads conversions
- One ad group created ("Cycling Coach"), ad groups 2–4 never built
- Manual CPC at €1.50, Display Network OFF
- Landing page: `/go/ads` → `/plateau` (diagnostic quiz)
- A/B test running on `/go` (not `/go/ads`): Variant A "YOUR FTP IS STUCK" vs Variant B "WHY YOUR FTP IS STUCK (AND THE EXACT FIX THIS WEEK)"

---

## Phase 1: First 30 minutes after 2FA resolved

This is damage assessment. Do everything in this section before touching campaign structure.

### Step 1: Verify conversion tracking (5 min)

1. Log into Google Ads at ads.google.com with anthony@roadmancycling.com
2. Go to **Goals → Conversions → Summary**
3. Check both conversion actions exist:
   - "Ads Landing Page View" (`/up0JCJqHxKwcELSUicJD`)
   - "Plateau Diagnostic Complete" (`/WDZ_CNiOvKwcELSUicJD`)
4. Check the **Tag Status** column — it should say "Recording conversions" with a recent timestamp. If it says "Unverified" or "No recent conversions," the tag has been firing into the void
5. Open **Tag Assistant** (tagassistant.google.com), load `roadmancycling.com/go/ads` in debug mode, click through to `/plateau`, complete the diagnostic, and confirm both conversion events fire in the tag assistant timeline

### Step 2: Assess 8 days of unattributed spend (10 min)

1. Go to **Campaigns → All campaigns → Date range: last 8 days**
2. Record: total spend, impressions, clicks, CTR, avg CPC
3. Go to **Conversions** column — if it shows 0 or "—" for the entire period, every click in that window is unattributed. That spend was blind
4. Check **Search terms report** (Campaigns → Keywords → Search terms) — see what queries actually triggered ads. Flag anything irrelevant
5. Export a CSV of the search terms report and save it — this is your baseline intelligence on what real people are typing

### Step 3: Pause or preserve (5 min)

Decision framework:

- **If conversions show 0 for 8 days:** The tag wasn't recording. That spend is gone as measurement data but may have driven real traffic. Check your internal analytics at `/admin/funnel` — filter for `source=ads` events in the last 8 days. If you see diagnostic completions there, the funnel worked even though Google couldn't see it. Don't panic-pause; the money may not have been wasted, just unmeasured
- **If conversions show some data:** Good — the tag was firing. Check CPA. If cost per diagnostic completion is above €15, pause the campaign while you build out ad groups 2–4. If it's under €10, leave it running
- **If search terms show garbage queries** (e.g., "cycling video game", "peloton bike price", "tour de france results"): Add those as negative keywords immediately, then pause if more than 40% of terms are irrelevant

### Step 4: Verify the internal tracking bridge (10 min)

The site already tracks these events server-side via `/api/events`:

| Internal event | Where it fires | Google Ads conversion? |
|---|---|---|
| `pageview` (on `/go/ads`) | Tracker.tsx | No (but AdsLandingAnalytics fires a separate gtag conversion) |
| `diagnostic_complete` | `/api/diagnostic/submit/route.ts` | Yes — ResultsAnalytics.tsx fires gtag on results page |
| `email_captured` | EmailCapture.tsx, LeadMagnetCapture.tsx, PredictionGate.tsx | **No — not bridged to Google Ads** |
| `community_cta_clicked` | Various CTA components | **No — not bridged to Google Ads** |
| `cta_click` (data-track) | Tracker.tsx global delegate | **No** |

**Action:** After verifying the two existing conversions work, create two additional conversion actions in Google Ads:

1. **Email Capture** — fire on `email_captured` events where `source` contains "plateau" or "go". Value: €5. This captures people who complete the diagnostic AND leave their email (the Beehiiv sequence entry point)
2. **Community CTA Click** — fire on `community_cta_clicked` where `destination=skool`. Value: €25. This is the furthest-down-funnel action you can track before they leave your site

To wire these up, add two new gtag conversion calls in the relevant components, following the same pattern used in `ResultsAnalytics.tsx`. Create the conversion actions in Google Ads first to get the `send_to` labels, then add the code.

---

## Phase 2: Ad group structure

Four ad groups, each targeting a distinct search intent cluster. All ad groups live in a single campaign with shared budget and manual CPC.

### Ad Group 1: "Cycling Coach" (existing — restructure)

**Intent:** Cyclist actively looking for coaching or a coach.

**Keywords:**

| Keyword | Match type |
|---|---|
| cycling coach online | Phrase |
| cycling coaching for amateurs | Phrase |
| cycling training coach | Phrase |
| online cycling coach | Phrase |
| cycling coach for masters | Phrase |
| road cycling coach | Broad |
| cycling coaching programme | Phrase |

**Why these work:** Someone searching "cycling coach" has already decided they need external help. They've moved past the DIY phase. This is the highest-intent cluster — they're comparing options, not browsing. The diagnostic positions Roadman as the structured alternative to a random coach on TrainingPeaks.

**Negative keywords for this group:** cycling coach *job*, cycling coach *salary*, cycling coach *certification*, cycling coach *near me* (we're online-only), *peloton* coach, *spin class* coach, *kids* cycling coach, *BMX* coach

### Ad Group 2: "FTP Plateau"

**Intent:** Cyclist whose power numbers have stalled and who is searching for the reason or the fix.

**Keywords:**

| Keyword | Match type |
|---|---|
| ftp plateau cycling | Phrase |
| ftp stuck not improving | Phrase |
| how to increase ftp cycling | Phrase |
| why is my ftp not going up | Phrase |
| ftp plateaued for months | Broad |
| cycling power plateau | Phrase |
| improve ftp over 40 | Phrase |
| ftp stuck at same number | Broad |

**Why these work:** This is the literal pain point the diagnostic was built for. A cyclist typing "ftp stuck not improving" at 10pm on a Tuesday is Persona 1 (Tom) in real time. The diagnostic headline ("FTP Stuck?") is a near-exact match to their query — quality score should be high because the search term, the ad copy, and the landing page all say the same thing.

**Negative keywords for this group:** ftp *meaning*, ftp *server*, ftp *file transfer*, *zwift* ftp test, *what is* ftp (too early in the funnel — informational, not action-ready)

### Ad Group 3: "Masters / Over-40 Training"

**Intent:** Older cyclist looking for age-appropriate training advice, aware that what worked at 30 doesn't work at 45.

**Keywords:**

| Keyword | Match type |
|---|---|
| cycling training over 40 | Phrase |
| cycling training for older riders | Phrase |
| masters cyclist training plan | Phrase |
| cycling performance after 40 | Phrase |
| cycling over 50 training | Phrase |
| how to get faster at cycling over 40 | Broad |
| masters cycling improvement | Phrase |

**Why these work:** This cluster maps to Personas 2 and 3 — the Gran Fondo rider (Mark) and the comeback athlete (James). Both are defined by the feeling that time is running out but there's still something left. "Masters" is the keyword they use even though the landing page audit flagged it as jargon for cold traffic — in search, these people self-identify as masters. They're searching for it because they already know the word. The ad copy bridges to clearer language.

**Negative keywords for this group:** masters *degree*, masters *golf*, *running* over 40, *swimming* over 40, *triathlon* over 40 (different sport, different intent)

### Ad Group 4: "Training Plan / Structured Training"

**Intent:** Cyclist who knows they need structure but hasn't committed to coaching yet. Searching for plans, programmes, or systems.

**Keywords:**

| Keyword | Match type |
|---|---|
| cycling training plan structured | Phrase |
| road cycling training programme | Phrase |
| cycling periodisation plan | Phrase |
| structured cycling training | Phrase |
| cycling training plan serious | Broad |
| base training cycling plan | Phrase |
| cycling training plan intermediate | Phrase |
| polarised training cycling plan | Phrase |

**Why these work:** This is the "I'll do it myself with the right plan" searcher — Persona 4 (Dave, the podcast loyalist who hasn't pulled the trigger) often starts here. They're comparing TrainerRoad, Zwift plans, and coach-written plans. The diagnostic reframes their problem: before you pick a plan, diagnose why the last one didn't work. It repositions the conversation from "which plan" to "what's actually wrong," which is where Roadman's credibility is strongest.

**Negative keywords for this group:** *free* cycling plan, cycling plan *beginner*, cycling plan *download*, *zwift* training plan, *trainerroad* plan (branded competitor — don't bid on these, the CPC is brutal and the intent is locked in)

### Campaign-level negative keywords (apply to all groups)

Add these to the campaign negative keyword list:

- free, cheap, discount, coupon, deal
- beginner, starting, first time, new to cycling
- kids, children, junior
- indoor, turbo trainer, spin bike, peloton
- job, career, salary, hiring, vacancy
- news, results, race results, tour de france
- bike shop, bike for sale, buy bike
- zwift, trainerroad, wahoo (branded — avoid competitor bidding at this budget)
- e-bike, electric bike
- mountain bike (unless you expand later)

---

## Phase 3: Ad copy

Three responsive search ads per ad group. Google Ads allows up to 15 headlines (30 characters each) and 4 descriptions (90 characters each) per RSA. Below are the headlines and descriptions for each group, written in Anthony's voice — direct, specific, grounded in real proof points. No hype words. No "unlock your potential."

### Ad Group 1: Cycling Coach

**Headlines (pin positions noted where order matters):**

1. `Coaching From World Tour Minds` (pin: H1)
2. `Not Done Yet? Neither Are We`
3. `100M+ Podcast Downloads`
4. `Free Plateau Diagnostic`
5. `Stop Guessing. Get Clarity`
6. `FTP +90W Member Result`
7. `Cat 3 to Cat 1 — Real Result`
8. `Serious Cyclists Only`
9. `4-Minute Diagnostic Quiz`
10. `Methods From Pogačar's Coach`
11. `Finally. Structure That Works`
12. `The Fix Is Specific, Not Generic`

**Descriptions:**

1. `Built from conversations with Dan Lorang and Professor Seiler. Take the free diagnostic — 12 questions, 4 minutes.` (pin: D1)
2. `The same methods behind Grand Tour wins, distilled for serious amateurs training 6-12hrs/week. Find your plateau type.`
3. `No generic plans. The diagnostic identifies your specific plateau pattern, then shows you exactly what to change this week.`
4. `Trusted by over 1 million monthly listeners. Community members going Cat 3 to Cat 1. Your turn.`

---

### Ad Group 2: FTP Plateau

**Headlines:**

1. `Your FTP Is Stuck. Here's Why` (pin: H1)
2. `FTP Plateau? It's Fixable`
3. `Free FTP Diagnostic — 4 Mins`
4. `One of Four Things Is Wrong`
5. `100M+ Podcast Downloads`
6. `Methods From Pogačar's Coach`
7. `Stop Training Harder. Train Right`
8. `FTP +90W — Real Member Result`
9. `Same Effort. Actually Adapting`
10. `The Science Has Caught Up`
11. `12 Questions. Specific Answer`
12. `Not Generic Advice. Yours`

**Descriptions:**

1. `Your FTP is stuck — and it's almost always one of four things. 12 questions, 4 minutes, a specific fix for your plateau.` (pin: D1)
2. `Built from conversations with the coaches behind Pogačar, Froome and Bernal. The diagnostic shows what's actually stalling your power.`
3. `Same sessions, same effort — different results. Find out which of four plateau patterns you're in and what to change this week.`
4. `Body fat 20% to 7%. Cat 3 to Cat 1. Real results from real amateurs. Take the free plateau diagnostic now.`

---

### Ad Group 3: Masters / Over-40 Training

**Headlines:**

1. `Over 40? Your FTP Isn't Done` (pin: H1)
2. `Masters Cycling — Not Done Yet`
3. `Training Over 40 Is Different`
4. `Free Plateau Diagnostic`
5. `100M+ Podcast Downloads`
6. `Proven by Sports Scientists`
7. `Still Faster After 40. Proven`
8. `Your Best Years Aren't Behind`
9. `Age-Smart Training Methods`
10. `4 Mins. Your Plateau Pattern`
11. `Dr David Dunne Approved`
12. `Structure Finally. Not Guessing`

**Descriptions:**

1. `What worked at 30 doesn't work at 45. The free diagnostic identifies your specific plateau type and the exact changes to make.` (pin: D1)
2. `Built from Professor Seiler's polarised training research and real results: members going from stuck to Cat 1 after 40.`
3. `Recovery matters more now. Fuelling matters more now. The diagnostic shows which of four factors is holding your power back.`
4. `Serious amateur cyclists training 6-12hrs/week. 100M+ podcast downloads. Take the free diagnostic — your FTP is fixable.`

---

### Ad Group 4: Training Plan / Structured Training

**Headlines:**

1. `Before You Pick a Plan — Read This` (pin: H1)
2. `Structured Cycling Training`
3. `The Right Plan Starts Here`
4. `Free Training Diagnostic — 4 Min`
5. `100M+ Podcast Downloads`
6. `Plans From World Tour Coaches`
7. `Stop. Diagnose. Then Train`
8. `Why Your Last Plan Didn't Work`
9. `Periodisation That Actually Works`
10. `Serious Cyclists. Real Methods`
11. `Not Another Cookie-Cutter Plan`
12. `Find Your Plateau Type First`

**Descriptions:**

1. `Before you buy another training plan, diagnose why the last one didn't work. 12 questions, 4 minutes, a specific answer.` (pin: D1)
2. `Methods from Dan Lorang and Professor Seiler — the coaches behind Grand Tour wins. Structured for amateurs doing 6-12hrs/week.`
3. `Generic plans treat every plateau the same. The diagnostic identifies which of four patterns you're in, then tells you what to fix.`
4. `100M+ downloads. Cat 3 to Cat 1 member results. FTP +90W. Take the free diagnostic before you commit to any plan.`

---

## Phase 4: Audience targeting

### In-market audiences

Add these as **observation** (not targeting) initially so you collect data without restricting reach, then shift to targeting once you see which audiences convert:

- Sports & Fitness → Cycling Equipment
- Sports & Fitness → Fitness Products & Services
- Sports & Fitness → Athletic Apparel (cycling subset)

### Custom intent audiences

Create two custom audiences:

**Custom Audience 1: "Serious Cyclist — Research Phase"**

URLs:
- trainerroad.com
- trainingpeaks.com
- intervals.icu
- cyclinganalytics.com
- whatsonzwift.com/workouts
- fascat.com
- thesufferfest.com

Keywords:
- cycling training plan
- FTP test cycling
- cycling power zones
- polarised training cycling
- cycling periodisation

**Custom Audience 2: "Cycling Content Consumer"**

URLs:
- cyclingtips.com
- road.cc
- bikeradar.com
- gcn.eu
- lanternerouge.com.au
- velonews.com

Keywords:
- cycling podcast
- cycling coaching
- how to get faster cycling
- cycling nutrition performance
- cycling strength training

### Demographic targeting

| Dimension | Setting |
|---|---|
| Age | 35–54 (core), 25–34 and 55–64 as observation |
| Gender | All (but monitor — if male converts 4x, consider narrowing) |
| Household income | Top 50% (this audience has professional careers, discretionary spend) |
| Parental status | All (many have families — it's part of the time constraint that causes the plateau) |

### Geographic targeting

**Primary (target):**
- United Kingdom (London flagged as key city — consider a London-specific ad variant later)
- Ireland
- United States
- Canada
- Australia
- New Zealand

**Secondary (observation):**
- Netherlands, Belgium, Germany, Denmark, South Africa — English-speaking cycling populations in these markets are meaningful but unproven. Set as observation, review after 2 weeks.

**Exclude:** Countries where English isn't the primary language and cycling culture is road-racing-centric (France, Spain, Italy) — the content is English-only and the cultural framing assumes the UK/US/Aus amateur racing structure.

---

## Phase 5: Bid strategy transition plan

### Current state

Manual CPC at €1.50, Display Network off. This is the right starting point for a new account with no conversion data.

### Phase 1: Manual CPC (now → 30 conversions)

Keep manual CPC. The €1.50 bid is reasonable for cycling coaching keywords in English-speaking markets (competitive range is typically €1.00–€3.00).

**Adjustments to make now:**
- Set mobile bid adjustment to +20% (cyclists research on phone, especially post-ride)
- Set time-of-day adjustments: +15% for 18:00–22:00 (after-work research window), +10% for 06:00–08:00 (pre-ride)
- Set London location bid adjustment to +10%
- Review after 50 clicks per ad group and adjust individual keyword bids based on quality score

### Phase 2: Maximise Conversions (30+ conversions in 30 days)

Once you have 30 conversions in a 30-day window (across all conversion actions), switch the campaign bid strategy to **Maximise Conversions**. This gives Google's algorithm enough signal to start automating.

**How to switch:**
1. Campaign settings → Bidding → Change bid strategy → Maximise Conversions
2. Do NOT set a target CPA yet — let the algorithm find its footing for 2 weeks
3. Monitor daily spend carefully — Maximise Conversions can spike spend in the first 48 hours as it explores

### Phase 3: Target CPA (50+ conversions in 30 days, stable CPA)

Once you have 50+ conversions in 30 days and can see a consistent CPA pattern (even if it varies ±30%), set a target CPA.

**How to calculate your target CPA:**
- Work backwards from the value chain: NDY membership is $195/month. Average retention TBD but even 6 months = $1,170 LTV
- The diagnostic → email → Beehiiv sequence → Skool trial conversion rate is the number you need. If 5% of diagnostic completions eventually trial Skool, and 50% of trials convert, each diagnostic completion is worth ~$29
- Set your tCPA at the level where you're profitable at that conversion rate. Start with €12–€15 and adjust based on real downstream data

---

## Phase 6: Budget recommendations

### Testing phase (weeks 1–3)

**Daily budget: €20–€30/day (€140–€210/week)**

This gives you enough volume to test all four ad groups meaningfully. At a €1.50 CPC, that's 13–20 clicks per day across the account. Spread across 4 ad groups, each group gets 3–5 clicks/day — enough to start seeing patterns in 2 weeks but not enough to call statistically significant winners.

**Do not increase budget until:**
- All four ad groups have at least 100 clicks each
- You can see which search terms drive diagnostic completions
- Conversion tracking is confirmed working

### Scaling phase (weeks 4–8)

**Daily budget: €40–€60/day (€280–€420/week)**

Shift budget toward the 1–2 ad groups with the lowest cost per diagnostic completion. Pause keywords in any group that have 50+ clicks and zero conversions.

### Steady state (week 8+)

**Daily budget: based on tCPA and desired volume**

If your target CPA is €12 and you want 5 diagnostic completions/day, budget €60/day. Scale linearly from there. The ceiling is wherever CPA starts climbing — when you've saturated the available daily search volume at a profitable CPA, the money is better spent elsewhere (Meta, YouTube pre-roll).

### Budget guardrails

- Set a monthly budget cap in Google Ads account settings (Account settings → Budget)
- Set up automated rules: pause any keyword where cost > €50 and conversions = 0
- Check the account at least twice per week during testing phase

---

## Phase 7: Measurement plan

### Conversion actions (in priority order)

| Conversion action | Event trigger | Value | Count | Window |
|---|---|---|---|---|
| Diagnostic Complete | `gtag('event', 'conversion', { send_to: 'AW-18123737652/WDZ_CNiOvKwcELSUicJD' })` in ResultsAnalytics.tsx | €10 | Every | 30 days |
| Email Capture (post-diagnostic) | New — fire on `email_captured` where source includes "plateau" | €5 | Every | 30 days |
| Ads Landing Page View | `gtag('event', 'conversion', { send_to: 'AW-18123737652/up0JCJqHxKwcELSUicJD' })` in AdsLandingAnalytics.tsx | €1 | One per user | 30 days |
| Community CTA Click | New — fire on `community_cta_clicked` where destination = "skool" | €25 | One per user | 90 days |

**Primary optimisation target:** Diagnostic Complete. This is the action with the highest volume and the cleanest signal. Email capture happens further down but the volume will be lower (not everyone leaves their email). Use Diagnostic Complete as the primary conversion for bid strategy, with Email Capture as a secondary signal.

### Internal analytics bridge

The site's Tracker.tsx already fires these events to `/api/events`:

| Tracker event | What it tells you |
|---|---|
| `pageview` on `/go/ads` | Ads landing page hit — compare against Google Ads click count to check for tracking discrepancies |
| `cta_click` with `track_id` | Which CTA position on the landing page gets the most clicks (hero vs mid-page vs bottom) |
| `scroll_depth` | How far down the `/go/ads` page visitors scroll — if 80% bounce before the CTA, the page has a problem |
| `time_on_page` milestones | Engagement quality — if most sessions are under 30s, the traffic is low-quality or the page isn't loading fast enough |
| `diagnostic_complete` | Server-side confirmation that the quiz was completed — this is your ground truth, independent of the Google Ads pixel |
| `email_captured` (source=plateau) | Beehiiv sequence entry — this is where the actual nurture begins |

**Cross-reference weekly:** Compare Google Ads reported conversions against your internal `diagnostic_complete` count filtered by `source=ads`. If they diverge by more than 20%, the tracking has a gap.

### Weekly review cadence

Every Monday morning, 15 minutes:

1. **Spend vs conversions:** Total spend, total diagnostic completions, CPA. Is it going up or down?
2. **Search terms:** New terms that triggered ads. Add negatives for garbage. Note high-performing terms for ad copy ideas
3. **Ad group performance:** Which group has the lowest CPA? Which has the most spend with fewest conversions?
4. **Quality scores:** Any keywords below 5/10? Check ad relevance and landing page experience scores
5. **Internal funnel check:** `/admin/funnel` → filter source=ads. How many of those diagnostic completions turned into email captures? How many clicked through to Skool?

### KPIs and targets

| Metric | Target (testing phase) | Target (steady state) |
|---|---|---|
| Cost per click | < €2.00 | < €1.80 |
| Click-through rate | > 3.5% | > 5% |
| Cost per diagnostic completion | < €15 | < €10 |
| Diagnostic → email capture rate | > 40% | > 50% |
| Landing page bounce rate | < 60% | < 50% |
| Quality score (avg) | > 5 | > 7 |

---

## Phase 8: Landing page A/B test plan

### Current test

Two variants running on `/go` (the organic/non-ads landing page):

- **Variant A (control):** "YOUR FTP IS STUCK."
- **Variant B (test):** "WHY YOUR FTP IS STUCK (AND THE EXACT FIX THIS WEEK)"

The `/go/ads` page runs a fixed headline (no A/B test) and routes to `/plateau?source=ads`. The `/go` page runs the A/B test via middleware cookie (`roadman_ab_go_hero`) and routes to `/plateau?source=go&variant=A|B`.

### How to read the results

The experiment data lives in two places:

1. **Internal:** `/admin/experiments` shows diagnostic completions split by variant. The `variant_id` is attached to the session cookie and flows through to the `diagnostic_complete` event
2. **Tracker.tsx:** Every event from a `/go` session carries the `variant_id` field, so you can filter pageviews, scroll depth, time on page, and CTA clicks by variant

**What to compare:**

| Metric | How to read it |
|---|---|
| CTA click rate (hero) | Which headline gets more people to click "Start the Diagnostic"? This is the primary metric — it measures whether the headline earns the next action |
| Scroll depth past hero | If Variant B has higher scroll depth but lower CTA click rate, the longer headline is interesting but not converting — people read more but act less |
| Diagnostic completion rate | Of people who click through, how many finish the quiz? This should be similar across variants (the diagnostic is the same) — if it's not, one headline is attracting the wrong audience |
| Time to first CTA click | Shorter is better — the headline's job is to make the click obvious, not to make people think |

### When to call a winner

**Minimum sample size:** 200 sessions per variant (400 total). At current traffic levels, estimate how long that takes and don't look at the data before you hit it. Early peeking biases the result.

**Statistical threshold:** Use the site's built-in statistics module (`src/lib/ab/statistics.ts`) — it calculates significance. Call a winner when:

- One variant's CTA click rate is higher with >95% statistical significance, OR
- After 500 sessions per variant, the difference is <1% (meaning the headline doesn't matter much and you should test something else instead)

**Decision framework:**
- If B wins clearly: adopt it as the new control. Port the winning headline to `/go/ads` as well
- If A wins clearly: the shorter, punchier headline is stronger. Test a new challenger (see below)
- If no winner at 500/variant: the headline isn't the bottleneck. Move to testing a different page element

### Next variants to test after winner declared

Test these one at a time, always against the current winner:

**Test 2: Identity vs Problem framing**
- Challenger: "NOT DONE YET? NEITHER IS YOUR FTP." — Leads with the brand identity rather than the problem. Tests whether emotional resonance ("Not Done Yet") converts better than problem-awareness ("FTP is stuck")

**Test 3: Specificity of the proof point**
- Challenger: "THIS DIAGNOSTIC ADDED 90W TO A MEMBER'S FTP" — Leads with the strongest specific result. Tests whether a concrete number in the headline beats a generic problem statement

**Test 4: Expert authority in headline**
- Challenger: "THE METHOD POGAČAR'S COACH USES (ADAPTED FOR YOU)" — Leads with the expert credibility. Tests whether borrowed authority from Dan Lorang/World Tour converts cold traffic better than problem-framing

**Test 5: Risk reversal**
- Challenger: "4 MINUTES. NO EMAIL. YOUR FTP FIX." — Leads with the zero-friction promise. Tests whether removing all perceived risk in the headline converts better than creating curiosity

---

## Pre-flight checklist

Before you start spending money again, tick these off:

- [ ] 2FA verification complete on anthony@roadmancycling.com
- [ ] Both conversion actions verified firing in Google Ads (Tag Assistant)
- [ ] Search terms report from the 8-day blind period exported and reviewed
- [ ] Irrelevant search terms added as negative keywords
- [ ] Ad groups 2–4 created with keywords listed above
- [ ] Campaign-level negative keyword list applied
- [ ] All 12 RSAs submitted (3 per ad group)
- [ ] Custom intent audiences created (2 audiences)
- [ ] In-market audiences added as observation
- [ ] Demographic targeting set (age 35–54 primary)
- [ ] Geographic targeting set (UK, IE, US, CA, AU, NZ)
- [ ] Daily budget set to €25
- [ ] Monthly budget cap set in account settings
- [ ] Mobile bid adjustment +20%
- [ ] Time-of-day bid adjustments set
- [ ] Internal analytics cross-reference confirmed (`/admin/funnel`, source=ads)
- [ ] Calendar reminder set: Monday morning weekly review

---

## Quick-reference: what NOT to do

- **Don't bid on competitor brand names** (TrainerRoad, Zwift, Wahoo). The CPCs are high, the intent is locked, and Google penalises low quality scores that drag down your whole account
- **Don't run Display Network.** It's off now — keep it off. Display is cheap but the traffic quality for a niche coaching product is terrible
- **Don't use broad match without negatives.** Every broad match keyword above has a corresponding negative keyword list. Broad without negatives will burn budget on garbage terms within 48 hours
- **Don't mention the $195/month price in any ad copy.** The diagnostic is the free entry point. Pricing belongs in the Beehiiv nurture sequence, not in a cold-traffic ad
- **Don't use these words in ad copy:** game-changer, hack, unlock your potential, crush it, journey, smash it, optimize (without specifics). They violate brand voice and the audience will notice
- **Don't switch to automated bidding before 30 conversions.** The algorithm needs data. Without it, it will overspend wildly in the first week

---

*This plan was written to be executed in one sitting once the 2FA block is resolved. Work through it top to bottom. The phases are sequential — don't skip ahead to ad copy before confirming conversions are tracking.*
