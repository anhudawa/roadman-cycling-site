# Cycling hydration search consolidation — 26 August 2026

## Decision

Keep and strengthen the established broad-intent owner:

`/blog/cycling-hydration-guide`

Permanently redirect two later broad or hybrid duplicates to that URL:

- `/blog/cycling-hydration-strategy-complete-guide`
- `/blog/cycling-hydration-sweat-rate-guide`

Keep the sweat-rate testing guide, electrolyte guide and sodium-loading guide
live because they answer distinct measurement, product-choice and pre-event
strategy intents. Rebuild `/tools/hydration` as a measured sweat-rate calculator
rather than a population estimate or universal drinking prescription.

## Google Search Console baseline

Source: Google Search Console Performance, query and page views for 24 May–23
August 2026, captured on 26 August 2026. Search Console metrics are rounded as
displayed and page impressions must not be added as if they were unique searches.

For queries containing `hydration`, the site recorded **8 clicks**, **1,265
impressions**, **0.6% CTR** and **8.1 average position**.

| Query | Clicks | Impressions |
| --- | ---: | ---: |
| `cycling hydration` | 6 | 265 |
| `cycling hydration 500 750 ml per hour guideline` | 0 | 77 |
| `cycling hydration 500 750 ml per hour recommendation` | 0 | 72 |
| `hydration for cyclists` | 0 | 64 |
| `hydration for cycling` | 0 | 54 |
| `endurance cycling hydration 500 750 ml per hour guideline` | 0 | 53 |
| `hydration for 5 hour bike ride` | 0 | 50 |

The established page owner was clear:

| Page | Clicks | Impressions |
| --- | ---: | ---: |
| `/blog/cycling-hydration-guide` | 8 | 1,136 |
| `/blog/cycling-hydration-strategy-complete-guide` | 0 | 60 |
| `/glossary/hydration-rate` | 0 | 51 |
| `/blog/electrolytes-sweat-rate-cycling` | 0 | 29 |
| `/answers/how-to-hydrate-in-hot-weather-cycling` | 0 | 28 |

The sweat-rate subset recorded **1 click**, **73 impressions**, **1.4% CTR** and
**9.2 average position**. The measurement-intent page
`/blog/cycling-electrolytes-sweat-rate-testing-guide` recorded 1 click and 20
impressions; `/blog/electrolytes-sweat-rate-cycling` recorded 0 clicks and 46
impressions; the retired hybrid recorded 0 clicks and 11 impressions. This
supports a clean split: the testing guide owns measurement, while the
electrolyte guide owns sodium and product-choice intent.

For queries containing `electrolyte`, the site recorded **6 clicks**, **686
impressions**, **0.9% CTR** and **8.7 average position**. The broad hydration
owner already carried 5 clicks and 592 impressions, while
`/answers/do-cyclists-need-electrolytes` carried 1 click and 101 impressions.

For queries containing `sodium loading`, the site recorded **2 clicks**, **134
impressions**, **1.5% CTR** and **6.7 average position**. The specialist article
recorded 2 clicks and 35 impressions; the glossary definition recorded 0 clicks
and 123 impressions. The article remains the detailed owner and the glossary is
kept as a concise definition that links to it.

## Problems found

- Three blog pages competed for broad hydration or hybrid sweat-rate intent.
- The old calculator inferred precise fluid, sodium and bottle targets from
  duration, intensity, temperature and body mass without a field measurement.
- Several pages treated a familiar 500–750 ml-per-hour range as a universal
  prescription and implied that replacing all sweat loss was the goal.
- Some sodium and cramp copy made causal or dose claims that the cited evidence
  cannot support for every rider.
- Machine-readable tool descriptions still advertised the obsolete model,
  creating a retrieval conflict for search engines and AI assistants.

## Changes prepared

- One reviewed broad owner explaining thirst-led, planned and measured
  approaches without a universal bottle rule.
- A transparent sweat-rate calculator using pre/post body mass, fluid, urine and
  duration, with error sources and overdrinking safeguards visible.
- Distinct reviewed pages for sweat-rate measurement, electrolyte choice and
  sodium loading, each with sources, cited claims, FAQs and scope limits.
- Permanent redirects and direct internal-link updates for the two duplicates.
- Aligned answer pages, topic hub, glossary definitions, tool registry,
  structured data, AI-crawler priority mapping and benchmark prompts.
- IndexNow recrawl coverage for the complete reviewed hydration cluster.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track page-level clicks, impressions, CTR and average position for the broad
owner, the three specialist articles, the calculator and the two answer pages.
Segment `cycling hydration`, `hydration for cyclists`, `calculate sweat rate
cycling`, `cycling electrolytes` and `sodium loading`. Broad impressions should
concentrate on the canonical owner; measurement, product and pre-event queries
should remain with their specialist owners.

Confirm retired URLs return permanent redirects, live owners return 200 and
self-canonicalise, and the cluster remains discoverable through its topic hub,
sitemap and AI-crawler files. Manual Google URL inspection and “Request
indexing” remain separate approved actions. IndexNow does not submit to Google.
