# Wikidata Entity Plan — Roadman Cycling

**Status:** Draft for submission · **Owner:** Anthony Walsh · **Created:** June 2026
**Source finding:** `docs/seo-aeo-audit-june-2026.md` → Finding 5 (Entity & knowledge graph, 🔴 Red — "No Wikipedia, no clear Knowledge Panel, ambiguous brand name. The biggest single gap for the goal").

## Why this matters

AI answer engines (ChatGPT, Perplexity, Gemini, Google AI Overviews) resolve and *trust* entities before they cite them. "Roadman" is an ambiguous string — it returns UK slang, the 1988 "Cycle Race: Road Man" video game, Boardman Bikes, and unrelated brands. Until there is a structured, machine-readable entity that ties "Roadman Cycling", "The Roadman Cycling Podcast", and "Anthony Walsh" together with consistent `sameAs` identifiers, citation share is capped regardless of content quality.

The on-site half of the work is already done (connected JSON-LD `@graph`, `llms.txt`, `/facts.json`, `/entity/*` pages). **Wikidata is the highest-leverage off-site step** — it is openly editable (no notability bar as high as Wikipedia's), it is ingested directly by Google's Knowledge Graph, and it is a primary `sameAs` anchor that every other entity reference can point at.

> ⚠️ **Verify-before-submit rule.** Every identifier value below marked `‹confirm›` must be checked against the live source before it is added to Wikidata. A wrong identifier on Wikidata is worse than a missing one — it actively mis-resolves the entity. The same discipline governs the site's `sameAs` arrays (see `src/lib/brand-facts.ts`).

> ⚠️ **Conflict of interest.** Anthony / the Roadman team have a COI editing their own entities on Wikidata. This is *permitted* but must be transparent: disclose the COI on the item talk page, cite independent third-party sources (below), and avoid promotional language in labels/descriptions. Wikidata items with only self-published references are liable to deletion.

---

## 1. Item: The Roadman Cycling Podcast

**Suggested label (en):** `The Roadman Cycling Podcast`
**Also known as (aliases):** `Roadman Cycling Podcast`, `Roadman Podcast`
**Suggested description (en):** `cycling performance podcast hosted by Anthony Walsh`

### Statements (properties)

| Property | P-ID | Value | Notes |
|---|---|---|---|
| instance of | **P31** | podcast (**Q16908636**) | Core type. Some podcast items also/instead use Q24634210 ("podcast") — confirm the live target before saving. |
| official website | **P856** | `https://roadmancycling.com/podcast` | |
| title | **P1476** | `The Roadman Cycling Podcast` (en) | Monolingual text. |
| language of work or name | **P407** | English (**Q1860**) | |
| country of origin | **P495** | Ireland (**Q27**) | |
| presenter | **P371** | Anthony Walsh (the Person item, once created) | The "host" of a podcast. Confirm P371 label is "presenter" before use. |
| publisher | **P123** | Roadman Cycling (org item, if/when created) | Optional until the org item exists. |
| inception | **P571** | `‹confirm›` (year the show first published) | The Apple feed (id 1224143549) predates the 2021 brand relaunch; confirm the true first-episode date rather than assuming the brand founding year (2021). |
| Apple Podcasts podcast ID | **P5842** | `1224143549` | ✅ verified — `podcasts.apple.com/.../id1224143549`. |
| Spotify show ID | **P5916** | `2oCs3N4ahypwzzUrFqgUmC` | ✅ verified — `open.spotify.com/show/2oCs3N4ahypwzzUrFqgUmC`. |
| Podchaser podcast ID | **P7998** | `516594` (slug `the-roadman-cycling-podcast-516594`) | ✅ verified page exists. Confirm whether P7998 expects the numeric ID or the full slug. |
| Podcast Index ID | **P11740** | `‹confirm›` | Look up the feed ID at podcastindex.org (search "Roadman Cycling Podcast"). |
| YouTube channel ID | **P2397** | `‹confirm UC… id›` | ⚠️ **Not P1651.** P1651 is *YouTube video ID*; the channel property is **P2397**. Get the `UC…` id from the channel's Share → "Copy channel ID" (handle `@theroadmanpodcast`). |

### `sameAs`-equivalent links to also record

Wikidata captures most "sameAs" as the typed identifier properties above. Add anything without a dedicated property as **official website (P856)** qualified, or via **described at URL (P973)**:

- RSS feed: `https://roadmancycling.com/feed/podcast` (and the origin Anchor/Spotify-for-Podcasters feed).
- Goodpods: `https://goodpods.com/podcasts/the-roadman-cycling-podcast-205537` (✅ verified). No dedicated Wikidata property — record via P973 if desired.

### Independent references needed (P31/P571/presenter claims)

Wikidata claims should carry **reference URL (P854)** + **retrieved (P813)** pointing at independent, third-party coverage. Verified candidates found:

- **Wattbike** — "Anthony Walsh — From Pedals to Podcasts": `https://wattbike.com/blogs/wattbikers/anthony-walsh-roadman-podcast` (independent brand editorial).
- **Cyclist Magazine Podcast** — guest episode "50. Anthony Walsh, the Roadman Cyclist": `https://shows.acast.com/cyclist-magazine-podcast/episodes/50-anthony-walsh-the-roadman-cyclist`.
- **My Back 40** podcast — guest interview: `https://www.myback40.org/podcast/091-anthony-walsh-roadman-cycling`.
- Apple Podcasts / Spotify directory listings (support the platform-ID statements but are *not* independent for notability).

> **Gap to close:** none of the above is a major-press feature. To harden the item (and unlock a future Wikipedia article), target 1–2 pieces of genuinely independent coverage (cycling trade press, national outlet) that discuss the podcast as a subject, not just an Anthony interview.

---

## 2. Item: Anthony Walsh (cycling podcaster)

**Suggested label (en):** `Anthony Walsh`
**Suggested description (en):** `Irish cycling coach and host of The Roadman Cycling Podcast`
*(The description is the disambiguator — "Anthony Walsh" is a common name. Keep it specific.)*

### Statements (properties)

| Property | P-ID | Value | Notes |
|---|---|---|---|
| instance of | **P31** | human (**Q5**) | |
| sex or gender | **P21** | male (**Q6581097**) | |
| country of citizenship | **P27** | Ireland (**Q27**) | `‹confirm›` citizenship vs. residence. |
| occupation | **P106** | podcaster (**Q20669817**); cycling coach / sports coach | Add "podcaster" + a coaching occupation. Confirm the cycling-coach Q-item or fall back to "coach" (Q41583). |
| residence / work location | **P551** | Dublin (**Q1761**) | |
| official website | **P856** | `https://roadmancycling.com/author/anthony-walsh` | Canonical Person URL — matches `ENTITY_IDS.person`. |
| owner of / founder of | **P112** (founded by, on the org item) | Anthony Walsh founded Roadman Cycling | Express on the org item via P112, and/or P1830 on the Person. |
| X/Twitter username | **P2002** | `Roadman_Podcast` | ✅ `x.com/Roadman_Podcast`. (Brand account; acceptable as the operated handle.) |
| Instagram username | **P2003** | `roadman.cycling` | ✅ `instagram.com/roadman.cycling`. |
| Facebook ID | **P2013** | `roadmancycling` | ✅ `facebook.com/roadmancycling`. |
| TikTok username | **P7085** | `roadmancyclingpodcast` | ✅ `tiktok.com/@roadmancyclingpodcast`. |
| YouTube channel ID | **P2397** | `‹confirm UC… id›` | Same `UC…` id as the podcast item if the channel is shared. |
| LinkedIn personal profile ID | **P6634** | `anthony-walsh-cycling` `‹confirm›` | ⚠️ The site claims `linkedin.com/in/anthony-walsh-cycling`; a public search also surfaces `linkedin.com/in/anthony-walsh-5522b326`. Confirm which is the live canonical profile **before** recording (and reconcile `SAME_AS.person` in `brand-facts.ts` to match). |

### Independent references needed

Same three verified sources as the podcast item (Wattbike, Cyclist Magazine Podcast, My Back 40). The Wattbike feature is the strongest single biographical reference for P106/P551 claims.

---

## 3. Item: Roadman Cycling (organisation) — optional, second phase

Lower priority than the podcast + person, but worth creating once those resolve, to complete the triangle.

| Property | P-ID | Value | Notes |
|---|---|---|---|
| instance of | **P31** | business (**Q4830453**) / enterprise | |
| official website | **P856** | `https://roadmancycling.com` | |
| inception | **P571** | `2021` | Brand relaunch from A1 Coaching (est. 2013). |
| founded by | **P112** | Anthony Walsh (Person item) | |
| country | **P17** | Ireland (**Q27**) | |
| headquarters location | **P159** | Dublin (**Q1761**) | |
| LinkedIn company ID | **P4264** | `roadman-cycling` | ✅ `linkedin.com/company/roadman-cycling`. |

---

## 4. The connected-entity picture (how it should resolve)

After creation, the three Wikidata items reference each other (presenter / publisher / founded-by), and the **site's JSON-LD points back at the Wikidata items** by adding the Wikidata URLs to each entity's `sameAs`. That closes the loop: schema.org `sameAs` → Wikidata → schema.org.

```
Wikidata: Anthony Walsh  ──presenter(P371)──▶  Wikidata: The Roadman Cycling Podcast
        ▲  founded-by(P112)                              ▲ publisher(P123)
        └────────────  Wikidata: Roadman Cycling  ───────┘

   schema.org Person.sameAs ─▶ wikidata.org/wiki/Q‹person›
   schema.org PodcastSeries.sameAs ─▶ wikidata.org/wiki/Q‹podcast›
   schema.org Organization.sameAs ─▶ wikidata.org/wiki/Q‹org›
```

### Post-creation follow-up on this repo

Once the items have Q-numbers, add each `https://www.wikidata.org/wiki/Q…` URL to the matching array in `src/lib/brand-facts.ts`:

- `SAME_AS.person` → the Anthony Walsh Q-item.
- `PODCAST_SAME_AS` → the podcast Q-item.
- `SAME_AS.organization` → the org Q-item.

These flow automatically into the root `@graph` (`src/components/seo/JsonLd.tsx`), the `/entity/*` pages, and `/facts.json`. No other code changes required.

---

## 5. Submission checklist

- [ ] Confirm no existing Wikidata item for either subject (a June 2026 search found none).
- [ ] Get the `UC…` YouTube channel ID (Share → Copy channel ID) for **P2397** — do **not** use P1651.
- [ ] Get the Podcast Index feed ID for **P11740**.
- [ ] Confirm the podcast's true first-publish date for **P571**.
- [ ] Reconcile the personal LinkedIn slug (`anthony-walsh-cycling` vs `anthony-walsh-5522b326`).
- [ ] Create **The Roadman Cycling Podcast** item; add P31, P856, identifiers, references.
- [ ] Create **Anthony Walsh** item; link via presenter (P371).
- [ ] (Phase 2) Create **Roadman Cycling** org item; link founded-by / publisher.
- [ ] Disclose COI on each item's talk page; cite the independent sources.
- [ ] Add the three Wikidata Q-URLs back into `brand-facts.ts` and `npm run build`.
- [ ] Re-run the entity audit in `docs/seo-aeo-audit-june-2026.md` Finding 5.
