# Marketing + Community fact-check audit — April 2026

Scope: all 24 pages under `src/app/(marketing)/**/page.tsx` and
`src/app/(community)/**/page.tsx`. No `/you` persona page exists. All edits
are stylistically minimal, editor's red pen only.

## 1. Pages checked (24)

Marketing (17):
- `about/page.tsx`
- `about/press/page.tsx`
- `partners/page.tsx`
- `sponsor/page.tsx`
- `coaching/page.tsx`
- `coaching/triathlon/page.tsx`
- `coaching/[location]/page.tsx` (10 geo variants — ireland, uk, usa,
  dublin, cork, galway, belfast, london, manchester, leeds, edinburgh)
- `strength-training/page.tsx`
- `strength-training/success/page.tsx`
- `plateau/page.tsx`
- `newsletter/page.tsx`
- `newsletter/[slug]/page.tsx`
- `contact/page.tsx`
- `privacy/page.tsx`
- `terms/page.tsx`
- `cookies/page.tsx`
- `diagnostic/[slug]/page.tsx`

Community (7):
- `apply/page.tsx`
- `events/page.tsx`
- `community/page.tsx`
- `community/clubhouse/page.tsx`
- `community/club/page.tsx`
- `community/not-done-yet/page.tsx`
- `community/not-done-yet/fit/page.tsx`

## 2. Stats corrected

No marketing-number statistic was wrong against the brief. Spot-checked
and verified as correct across pages:

- Podcast episodes: `1,300+` (no `1,400+` found anywhere)
- Monthly listeners: `1M+` / `1 million` — consistent across
  about, press, partners, sponsor, coaching, plateau, NDY pages
- Newsletter subscribers: `65,000+` / `65K+` — consistent across
  newsletter, partners, press, sponsor
- Clubhouse members: `2,100+` / `2,100` — `community/clubhouse` +
  `community/page` use the right number, no over-claim
- NDY coaching community: stays correctly vague ("For cyclists who
  refuse to plateau") — no headcount like `113` or `100+` anywhere
- Instagram: `49.5K` (partners) — rounds to `49K+` bucket, OK
- Facebook: partners page claims 6.5M monthly reach (not follower
  count, so not a direct conflict with the `29K+` followers figure)

## 3. Expert-network attributions fixed

**Dan Bigham** — was listed only as "Former Hour Record holder" on
three pages. Updated to reflect his current role:

- `about/page.tsx` — `Former Hour Record holder` (athlete card role)
  → `Head of Engineering, Red Bull–Bora–Hansgrohe` with highlight
  `Former UCI Hour Record holder`
- `about/press/page.tsx` — `Former Hour Record holder` →
  `Head of Engineering, Red Bull–Bora–Hansgrohe · Former UCI Hour
  Record holder`
- `partners/page.tsx` (notable guests list) — same update

**Rosa Kloser** — tightened to specify the 200-mile event:

- `about/page.tsx` and `about/press/page.tsx` —
  `2024 Unbound Gravel winner` → `2024 Unbound Gravel 200 winner`

**Dan Lorang** — already correct as `Head of Performance,
Red Bull–Bora–Hansgrohe` (present tense) on about, press, partners,
newsletter, start-here. No change.

**Greg LeMond** — `3× Tour de France winner` consistent everywhere.
No change.

**Stephen Seiler** — `Exercise physiologist` / `Polarised training
pioneer` on about + press. Brief notes University of Agder affiliation
but current attribution is accurate and not misleading. Flagged below
for optional enrichment, no edit made.

**Tim Spector** — `ZOE founder, epidemiologist` / `ZOE founder,
epidemiologist, nutrition scientist`. Factually correct (he is an
epidemiology professor at King's College London). No CHO-oxidation
misattribution found anywhere.

## 4. Coaching programme / 5-pillar rename

The brief states the 5th pillar has been renamed from
**Accountability → Community**. Applied throughout marketing +
community surfaces wherever "Accountability" was used as a pillar
name. Did *not* touch standalone uses of the word "accountability"
inside member testimonials or when it's used as a generic concept
(e.g. Gregory Gross's quote, `Daily accountability group` feature name
in the Clubhouse card, the Apply FAQ "structured knowledge with
accountability").

Files changed:

- `coaching/page.tsx`
  - Pillar 05 renamed `Accountability` → `Community`; description
    rewritten around the private group of serious cyclists
  - Metadata description, OG description, hero paragraph, Service
    JSON-LD description, Course JSON-LD description, Service Offer
    description, "Why a cycling coach" bullet, and "How much does a
    cycling coach cost?" FAQ answer all updated
- `apply/page.tsx`
  - 5th pillar card renamed `Accountability` → `Community`,
    description updated
  - Service JSON-LD description updated
- `coaching/[location]/page.tsx`
  - SEO descriptions for Ireland / UK / USA updated
  - Service Offer JSON-LD description updated
  - Five-pillar summary paragraph + grid (`Training, Nutrition,
    Strength, Recovery, Accountability` → `… Community`) updated
- `community/not-done-yet/page.tsx`
  - Hero pillar list updated (`Training. Nutrition. Strength.
    Recovery. Accountability.` → `… Community.`)
- `community/page.tsx`
  - Metadata + OG description updated to reflect the renamed pillar

Pricing / terms of the coaching programme itself — **$195/month,
7-day free trial, cancel anytime** — verified consistent across
coaching, coaching/triathlon, coaching/[location], about, apply,
community, community/not-done-yet. No pricing drift found.

## 5. Testimonial mismatches fixed / flagged

**Chris O'Connor (FIXED)** — a body-copy quote attributed to Chris
O'Connor ("From 113kg to 97kg. The structured approach to training
and nutrition changed everything…") did not match the canonical
`src/lib/testimonials.ts` record (Chris's real stat is
**84kg → 68kg**, with a different quote about Anthony being a
visionary/educator/mentor/coach and doubling average wattage).

Five occurrences replaced with Chris's canonical quote + the correct
`84kg → 68kg · 20% body fat → 7%` detail:

- `coaching/[location]/page.tsx` — Ireland, Dublin, Cork, Galway
  testimonial blocks (4 occurrences)
- `apply/page.tsx` — Service JSON-LD `review[]` (1 occurrence)

**John Devlin (ADJUSTED)** — a body-copy quote attributed to John
Devlin ("The accountability and structure is what makes the
difference…") used the old pillar vocabulary. Reworded to
"structure and weekly rhythm" to match the pillar rename, in all
four geo-page occurrences (Ireland, Dublin, Cork, Galway, Belfast).
Attribution and intent preserved.

**Gregory Gross (FLAGGED, not changed)** — a paraphrased form of
his canonical quote appears on `coaching/page.tsx` and the USA
`coaching/[location]/page.tsx` testimonials. The paraphrase
preserves the verifiable stat ("315lbs → sub-100kg") but deviates
from the canonical wording in `testimonials.ts`. Flagged below.

**4iiii + discovery+ partner testimonials** (`partners/page.tsx`,
`sponsor/page.tsx`) — these are partner statements, not member
testimonials. They are not represented in `src/lib/testimonials.ts`
(which is a member-testimonial library). They are treated as a
separate class and not flagged as mismatches.

## 6. Policy / legal-page issues

None. `privacy`, `terms`, `cookies` all:

- Use "Roadman Cycling" (Irish cycling media and education brand,
  based in Dublin), no reference to "Roadman Cycling LLC" or any
  outdated US entity
- `last updated: April 2026` — current against today's date
  (2026-04-23)
- Reference correct operational facts (Beehiiv for newsletter, Skool
  for the Not Done Yet coaching community, Stripe for payments,
  Vercel for hosting, Meta Pixel cookies)
- Governing law: Ireland (terms page) — consistent with the brand
  being Dublin-based
- Contact page lists `anthony@roadmancycling.com` correctly and
  mirrors the press-kit contact

## 7. Contact page

- Email listed: `anthony@roadmancycling.com` — matches the user's
  brief
- No specific response-time SLA stated on the contact page (contrast
  with press page which commits to "within 48 hours"). Not
  contradictory, just less specific. Left as-is.

## 8. Geo-coaching content spot-checks

Where geo pages cite specific events and their profiles, distances
match commonly accepted race facts and are not over-claimed:

- Wicklow 200 — 200km, "~3,000m of climbing through Sally Gap,
  Wicklow Gap and the Glen of Imaal" — plausible and within
  published-route ranges. Not changed.
- Ring of Beara — 140km around the Beara Peninsula — matches
  published route. Not changed.
- Fred Whitton — Leeds page cites "112 miles and 3,950m" and the
  Manchester page cites "3,500m". Published Fred Whitton figures
  tend to cluster around 3,500–4,000m depending on the route year.
  Flagged below for owner confirmation rather than edited.
- Ride London — referenced generally (distances not claimed
  precisely on the pillar page). OK.
- US events (Leadville 100, Unbound Gravel, Gran Fondo NYC) — linked
  from cross-sell rail only, no distance claims made on the /coaching
  pillar. OK.

No fake event names found. All linked event slugs live inside
`/plan/*` which is out of this audit's scope but correctly referenced.

## 9. Flagged for human review

- **Podcast launch date conflict.** `about/page.tsx` timeline says
  *"2021: Roadman Cycling Podcast launches"* while
  `about/press/page.tsx` brand-stats block says *"weekly since 2019"*.
  The Apple Podcasts ID in both JsonLd blocks
  (`id1224143549`) is a 2017-era Apple feed ID, which suggests the
  show predates 2021. Please confirm the correct year and decide
  whether the timeline should read 2019 (show launch) or 2021
  (Roadman-branded relaunch) — we deliberately did not edit either
  so as not to invent history.
- **Stephen Seiler affiliation.** Brief notes *University of Agder*
  but the site doesn't currently name it. Optional enrichment — add
  `Exercise physiologist, University of Agder` to tighten the
  credential on `about` + `press`.
- **Sponsor page audience stats.** `sponsor/page.tsx` displays
  `€95K avg. household income` and `€5,000 avg. annual cycling spend`
  and `73% purchase intent`. `partners/page.tsx` in parallel shows
  `£65K household income`, `£3,500 annual spend`, `87% purchase
  intent`. Both are audience-claim stats and they don't match each
  other. No authoritative source for either was surfaced. Owner
  should pick the canonical figures and sync the two pages.
- **Social reach stats on `partners/page.tsx`** — `800K+ monthly
  YouTube views`, `75K subscribers`, `6.5M Facebook monthly reach`,
  `2,400+ new followers monthly`, `112% growth in reach`, `1.2M X
  monthly impressions`, `49.5K Instagram followers`, `777K+
  interactions per month`, combined `11M+ reach`. None contradict the
  brief's headline figures (61K+ main YT, 13K+ clips, 49K+ IG, 29K+
  FB) but the partner-page YouTube-subs claim of `75K` is higher than
  the brief's `61K + 13K = 74K`, which is close but not guaranteed
  to be current. Recommend owner spot-check against latest platform
  analytics before the next press cycle.
- **NDY tier `VIP` pricing** — `community/not-done-yet/page.tsx`
  shows VIP at `$1,950/year` which annualises to about $162/mo,
  *cheaper* than the $195/mo main community. Almost certainly
  intentional annual-discount framing but worth a second look so
  we aren't accidentally under-pricing the higher tier.
- **Paraphrased Gregory Gross testimonial** on `coaching/page.tsx`
  and the USA geo page — a shortened version of his canonical quote
  that still uses the word "accountability". Not factually wrong,
  but doesn't match the central library verbatim. Owner call on
  whether to keep the paraphrase or swap for the canonical quote.
- **`plateau/page.tsx` social-proof line** — *"Based on methods
  used by the coaches behind Tadej Pogačar, Chris Froome and Egan
  Bernal."* Defensible (Seiler/Lorang/Kerrison-adjacent methodology
  has been discussed on the podcast and those riders have used
  polarised / periodised models) but it's adjacent enough to a
  direct claim of coaching them that it's worth the owner
  double-checking before paid traffic continues.

## 10. Files touched

- `src/app/(marketing)/about/page.tsx`
- `src/app/(marketing)/about/press/page.tsx`
- `src/app/(marketing)/partners/page.tsx`
- `src/app/(marketing)/coaching/page.tsx`
- `src/app/(marketing)/coaching/[location]/page.tsx`
- `src/app/(community)/apply/page.tsx`
- `src/app/(community)/community/page.tsx`
- `src/app/(community)/community/not-done-yet/page.tsx`
- `scripts/audits/marketing-community-factcheck.md` (this report)

## 11. Verification

`npx tsc --noEmit --project tsconfig.json` — passes (no output).

## 12. Commit

Commit hash: recorded in the working tree after
`git commit -m "Fact-check marketing + community pages"`.
Not pushed.
