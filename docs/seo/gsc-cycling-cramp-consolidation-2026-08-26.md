# Cycling cramp search consolidation — 26 August 2026

## Decision

Keep and strengthen the established broad-intent owner:

`/blog/cycling-cramp-prevention`

Permanently redirect the later exact-match duplicate to that URL:

- `/answers/what-causes-muscle-cramps-cycling`

Keep three narrow support pages live because they answer different jobs:

- `/problem/cramp-on-long-rides` — repeated duration-specific diagnosis;
- `/answers/how-to-stop-cramping-in-races` — race response and prevention audit;
- `/answers/cramping-in-hot-weather` — hot-weather safety and escalation.

Keep `/podcast/what-causes-muscle-cramp-and-how-to-avoid-it` as a historical
2021 source record. Its verbatim transcript preserves the position Anthony
presented then, while its reviewed summary directs current broad questions to
the evidence guide.

## Google Search Console baseline

Source: Google Search Console Performance, query and page views for 24 May–23
August 2026, captured on 26 August 2026. Search Console metrics are rounded as
displayed and page impressions must not be added as if they were unique searches.

For queries containing `cramp`, the site recorded **3 clicks**, **1,047
impressions**, **0.3% CTR** and **6.2 average position** across 381 query rows.

| Query | Clicks | Impressions |
| --- | ---: | ---: |
| `cycling cramps` | 2 | 42 |
| `how to avoid leg cramps when cycling` | 1 | 8 |
| `cramping after rides` | 0 | 201 |
| UK endurance-event prevention and mid-ride query | 0 | 41 |
| `how to stop leg cramps immediately` | 0 | 37 |
| `prevent cramps cycling drink` | 0 | 36 |
| `calf cramp cycling` | 0 | 29 |
| `cramps after long ride sodium` | 0 | 28 |
| `cramp` | 0 | 19 |
| `cramp after cycling` | 0 | 13 |

The established broad owner was clear:

| Page | Clicks | Impressions |
| --- | ---: | ---: |
| `/blog/cycling-cramp-prevention` | 2 | 790 |
| `/problem/cramp-on-long-rides` | 1 | 275 |
| `/answers/how-to-stop-cramping-in-races` | 0 | 52 |
| `/answers/cramping-in-hot-weather` | 0 | 38 |
| `/podcast/what-causes-muscle-cramp-and-how-to-avoid-it` | 0 | 34 |

The page totals overlap because a query can produce impressions for more than
one Roadman URL. That overlap is the reason to give every page one explicit job.

## Problems found

- The broad guide, exact-match answer, race answer and 2021 podcast summary all
  competed to explain the same head intent.
- Several live summaries treated neuromuscular fatigue as the one settled cause,
  replacing an old single-cause electrolyte story with another absolute claim.
- Fixed carbohydrate, fluid, sodium, distance and pacing numbers were presented
  as prevention rules even where the evidence supports only individual planning.
- Expert insights attributed conclusions about cramp causation and prevention to
  podcast guests without a sufficiently source-bounded link to those claims.
- Pickle-juice evidence was described too broadly. The relevant experiment was
  small, laboratory-induced and acute; it did not establish cycling prevention.
- Magnesium, after-ride cramps and medically concerning symptoms lacked clear
  evidence and safety boundaries.
- Machine-readable event and glossary copy repeated a sodium-deficiency diagnosis
  that conflicted with the reviewed hydration cluster.

## Changes prepared

- One reviewed broad owner covering cause uncertainty, immediate static
  stretching, individual prevention, after-ride cramps, supplement evidence and
  emergency warning signs.
- Six cited claims, six extractable FAQs, current reviewer metadata and direct
  links to primary reviews and trials.
- A permanent redirect for the exact-match duplicate answer so one URL owns
  `what causes cycling cramps` and related broad queries.
- Narrow, reviewed race and heat answers plus a long-ride diagnostic that link
  back to the canonical owner without repeating its head intent.
- A source-bounded podcast summary that preserves the verbatim 2021 transcript
  while separating historical claims from Roadman's current evidence synthesis.
- Aligned topic-hub, event-guide, glossary, AI-crawler, benchmark-prompt and
  IndexNow discovery signals.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track page-level clicks, impressions, CTR and average position for the broad
owner and three narrow support pages. Segment `cycling cramps`, `cramping after
rides`, `how to stop leg cramps immediately`, `how to avoid leg cramps when
cycling`, `calf cramp cycling`, `prevent cramps cycling drink` and `cramps after
long ride sodium`.

Broad cause, prevention, immediate-response and after-ride impressions should
concentrate on the article owner. Long-ride diagnostic queries may remain with
the problem page; race-action queries with the race answer; hot-weather safety
queries with the heat answer. The podcast page should surface for episode or
Anthony-specific intent, not as the current universal evidence answer.

Confirm the retired answer returns a permanent redirect, every live owner returns
200 and self-canonicalises, the broad owner remains in sitemap and AI-crawler
files, and the cluster is reachable from the cycling-nutrition hub. Manual Google
URL inspection and “Request indexing” remain separate approved actions. IndexNow
does not submit to Google.
