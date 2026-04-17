# Wikidata entity payload — Anthony Walsh (Roadman Cycling)

Ready-to-submit Wikidata entry for Anthony Walsh, founder and host of the Roadman Cycling Podcast. Wikidata is a structured-data layer that feeds Google's Knowledge Graph independent of Wikipedia. Getting a QID entry is the single biggest branded-search/Knowledge-Panel activation available without a full Wikipedia article.

## Why this matters

- **Knowledge Graph candidacy.** Google scrapes Wikidata for entity disambiguation. A QID tied to `roadmancycling.com` via `P856` (official website) signals that the domain is the canonical authority for this person.
- **Lower bar than Wikipedia.** Wikidata accepts verifiable structured data without requiring multiple independent secondary sources that Wikipedia does. Approved within hours to days versus weeks to months.
- **Cross-platform entity consistency.** Same QID can be referenced from podcast apps, LinkedIn, and social profiles, tightening the entity web.

## Who submits

Any registered Wikidata user can create the item. Best practice:

1. Register an account at [wikidata.org](https://www.wikidata.org) (use a real name, not an anonymous handle — makes the edit more likely to stick).
2. Make 5-10 small edits to existing items first to establish edit history (typo fixes, missing references on other cycling figures' pages, etc.).
3. Wait 4 days (Wikidata requires 4-day-old accounts to create new items directly — otherwise you'd need to use the "request" queue).
4. Create the item using the structured data below.

## Entity statements

Submit these as Wikidata statements (property = value, with source reference).

### Core identity

| Property | Value | Source |
|---|---|---|
| `P31` (instance of) | `Q5` (human) | — |
| `P21` (sex or gender) | `Q6581097` (male) | roadmancycling.com/about |
| `P27` (country of citizenship) | `Q27` (Ireland) | roadmancycling.com/about — "based in Dublin, Ireland" |
| `label` (English) | `Anthony Walsh` | — |
| `description` (English) | `Irish cycling coach and host of the Roadman Cycling Podcast` | — |
| `alias` | `Anthony Walsh (Roadman Cycling)` | — |

### Occupation & work

| Property | Value | Source |
|---|---|---|
| `P106` (occupation) | `Q2826330` (podcaster) | roadmancycling.com/about |
| `P106` (occupation) | `Q41583` (coach) | roadmancycling.com/coaching |
| `P1448` (official name) | `Anthony Walsh` | — |
| `P1027` / `P800` (notable work) | The Roadman Cycling Podcast (create as separate item, see below) | — |

### External identifiers (sameAs)

These are the **critical** statements — they link the Wikidata entity to other canonical web identifiers.

| Property | Value | Notes |
|---|---|---|
| `P856` (official website) | `https://roadmancycling.com` | PRIMARY — must be set |
| `P2002` (Twitter/X username) | `Roadman_Podcast` | verified on x.com/Roadman_Podcast |
| `P2003` (Instagram username) | `roadman.cycling` | instagram.com/roadman.cycling |
| `P2397` (YouTube channel ID) | `UC…` (look up the channel ID from youtube.com/@theroadmanpodcast — it starts with `UC`) | — |
| `P5687` (Spotify artist/show ID) | `2oCs3N4ahypwzzUrFqgUmC` | from open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC |
| `P5842` (Apple Podcasts artist ID) | `1224143549` | from podcasts.apple.com/…/id1224143549 |
| `P2013` (Facebook ID / username) | `roadmancycling` | facebook.com/roadmancycling |
| `P3984` (TikTok username) | `roadmancyclingpodcast` | tiktok.com/@roadmancyclingpodcast |

### Derived "works" item (optional, strongly recommended)

Create a second Wikidata item for **"The Roadman Cycling Podcast"** itself:

| Property | Value |
|---|---|
| `label` | `The Roadman Cycling Podcast` |
| `description` | `Irish cycling performance podcast hosted by Anthony Walsh` |
| `P31` (instance of) | `Q24634210` (podcast) |
| `P50` (author) / `P175` (performer) | [Anthony Walsh QID once created] |
| `P571` (inception) | `2021` |
| `P856` (official website) | `https://roadmancycling.com/podcast` |
| `P5687` (Spotify show ID) | `2oCs3N4ahypwzzUrFqgUmC` |
| `P5842` (Apple Podcasts ID) | `1224143549` |
| `P1113` (number of episodes) | `310+` |

Then edit the Anthony Walsh item's `P1448` or `P800` to point at this new podcast item.

## Submission checklist

Before submitting:

- [ ] YouTube channel ID (the `UC...` string) — confirm from youtube.com/@theroadmanpodcast page source
- [ ] Double-check Facebook username is `roadmancycling` (not `roadman.cycling` or similar)
- [ ] Verify the founding year for the podcast (was Feb 2021 correct?)
- [ ] Have a Wikidata account with ≥4-day edit history + 5-10 small edits on existing items

## What happens after submission

- Google typically picks up the QID within 7-14 days.
- Knowledge Panel activation depends on Google's threshold, not Wikidata's; expect 1-3 months before the panel appears on branded queries like "Anthony Walsh cycling" or "Roadman Cycling Podcast host".
- Once live, Google's panel will surface the sameAs links automatically — the social profiles become discoverable from the branded SERP.

## Post-submission actions (high leverage)

Once the Anthony Walsh Wikidata item exists:

1. **Add `sameAs` to the site's Person schema** pointing at the Wikidata QID URL (`https://www.wikidata.org/wiki/Q[ID]`). Already partially done via `/src/components/seo/JsonLd.tsx` — add the QID URL to the `sameAs` array once assigned.
2. **Update `/src/lib/guests/profiles.ts`** — when any featured guest also has a Wikidata entry, add the QID URL to their override's `sameAs`. This compounds entity signal.
3. **Reference the QID from social bios** where supported (Instagram bio, X bio). Drives verification signal.
