# Tyre-pressure search owner decision — 26 August 2026

## Decision

- Canonical calculator owner: `https://roadmancycling.com/tools/tyre-pressure`
- Informational support owner: `https://roadmancycling.com/blog/cycling-tyre-pressure-guide`
- Consolidated duplicate: `/blog/tyre-pressure-cycling-complete-guide` permanently redirects to the informational support owner.
- MTB intent remains separate at `/blog/mtb-tyre-pressure-guide`.

The calculator already owns calculator intent in Google. The work is therefore a
CTR, trust and product-quality rebuild, not a new-URL launch. The previous copy
claimed a SILCA-grade method and WorldTour use without a reproducible source-to-
claim chain. Those claims were removed even though they produced branded SILCA
impressions; trust and clear entity boundaries take priority over borrowed-brand
traffic.

## Three-month GSC baseline

Search type: Web. Range shown by GSC: 24 May–23 August 2026. Last UI update at
capture: approximately 9.5 hours earlier.

### Calculator page aggregate

- 587 clicks
- 57,125 impressions
- 1.0% CTR
- average position 8.4
- 1,000 exposed query rows

### Highest-priority calculator queries

| Query | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| silca tyre pressure calculator | 8 | 2,513 | 0.3% | 8.0 |
| road bike tyre pressure | 8 | 1,074 | 0.7% | 9.6 |
| tyre pressure calculator | 6 | 1,074 | 0.6% | 19.5 |
| tire pressure calculator | 5 | 984 | 0.5% | 20.0 |
| bike tyre pressure calculator | 6 | 351 | 1.7% | 16.8 |
| road bike tyre pressure calculator | 9 | 247 | 3.6% | 13.4 |
| bike tire pressure calculator | 10 | 223 | 4.5% | 18.5 |
| tyre pressure calculator road bike | 5 | 217 | 2.3% | 14.0 |
| road bike tire pressure calculator | 5 | 195 | 2.6% | 18.5 |

### Exact-query ownership checks

`tyre pressure calculator` across the property:

- 6 clicks
- 1,075 impressions
- 0.6% CTR
- average position 19.4
- `/tools/tyre-pressure`: 6 clicks, 1,074 impressions, 0.6% CTR, position 19.5
- `/blog/mtb-tyre-pressure-guide`: 0 clicks, 1 impression, position 6.0

`road bike tyre pressure` across the property:

- 9 clicks
- 1,101 impressions
- 0.8% CTR
- average position 10.1
- `/tools/tyre-pressure`: 8 clicks, 1,074 impressions, 0.7% CTR, position 9.6
- `/blog/cycling-tyre-pressure-guide`: 1 click, 14 impressions, 7.1% CTR, position 38.4
- `/blog/tyre-pressure-cycling-complete-guide`: 0 clicks, 28 impressions, position 34.2

## Release specification

The calculator owner must provide:

- the exact road-bike calculator phrase in the title and H1;
- front and rear results in PSI and bar;
- complete system weight rather than rider weight alone;
- measured mounted tyre width rather than a hidden rim-width correction;
- explicit hooked, hookless and unknown rim states;
- optional manufacturer minimum and maximum inputs;
- a 72 PSI hookless ceiling with an explicit warning that exact systems can be lower;
- a published, reproducible Roadman v1 formula and surface factors;
- no claim that the model copies or equals SILCA or another proprietary calculator;
- visible limitations, named review, primary/official sources, WebApplication,
  WebPage, HowTo, FAQ and breadcrumb structured data;
- a single supporting road/gravel guide and a permanent redirect from the duplicate.

## Measurement plan

Do not compare partial rollout days with the baseline.

- Earliest seven-day check: 3 September 2026, using full post-release days only.
- Primary 28-day check: 24 September 2026.
- Compare page-level clicks, impressions, CTR and average position.
- Track the British and US spelling families separately.
- Expect `silca tyre pressure calculator` impressions to fall if Google removes
  the page from borrowed-brand intent; do not reverse the trust correction solely
  to recover that traffic.
- Success signals: higher CTR for generic calculator terms, movement toward page
  one for calculator queries, stable ownership by the tool, and no reappearance
  of the consolidated article as a competing indexed URL.
