# Cycling heart-rate-zones search-owner decision

**Decision date:** 26 August 2026

**Source:** Google Search Console Performance for `sc-domain:roadmancycling.com`

**UI window observed:** 25 May–24 August 2026 (`3 months`)

## Decision

- `/tools/hr-zones` is the canonical owner for broad **cycling heart rate zones**, **cycling HR zones**, heart-rate-zone calculation, Max-HR zone output and LTHR zone output.
- `/blog/cycling-heart-rate-zones-explained`, `/blog/cycling-heart-rate-zones-explained-guide` and `/blog/heart-rate-zone-training-cycling-guide` permanently redirect to the calculator. They served the same broad calculation-and-explanation job without winning it.
- `/blog/heart-rate-zones-indoor-vs-outdoor-cycling` retains indoor-versus-outdoor differences.
- `/blog/mtb-heart-rate-zones-guide` retains mountain-bike-specific demand.
- `/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe` retains Zone 2 measurement and metric-comparison intent.
- `/blog/cycling-training-with-heart-rate-only-guide` retains complete heart-rate-only training-plan intent.
- The Zone 2 owner, heart-rate-monitor guide, high-heart-rate diagnostic and other specialist pages remain indexable because they answer distinct jobs.

The decision follows observed user choice rather than moving demand to a new URL. The calculator produced **1.24K clicks and 42.8K impressions** in the measured period and took **21 of 24 clicks** across the four material broad head terms. The strongest retiring explainer produced only **20 clicks from 1.42K impressions** overall, while the newer broad guide had no reportable page total.

## Page baselines

These page totals include all queries attributed to each page in the observed three-month window.

| URL | Clicks | Impressions | CTR | Position | Role after release |
|---|---:|---:|---:|---:|---|
| `/tools/hr-zones` | 1.24K | 42.8K | 2.9% | 6.5 | Canonical broad owner and calculator |
| `/blog/cycling-heart-rate-zones-explained` | 20 | 1.42K | 1.4% | 10.9 | Retired duplicate |
| `/blog/cycling-heart-rate-zones-explained-guide` | — | — | — | — | Retired duplicate; no reportable page total |
| `/blog/heart-rate-zone-training-cycling-guide` | 3 | 1.23K | 0.2% | 9.5 | Retired duplicate |
| `/blog/heart-rate-zones-indoor-vs-outdoor-cycling` | 41 | 3.76K | 1.1% | 7.9 | Preserved indoor/outdoor intent |
| `/blog/mtb-heart-rate-zones-guide` | 96 | 5.95K | 1.6% | 5.4 | Preserved MTB intent |

## Exact-query ownership

Search Console can attribute more page-row impressions than the query-card total when multiple Roadman URLs appear or are attributed in the same result set. Page rows are ownership signals, not additive site totals.

| Query | Total clicks | Total impressions | Tool clicks | Tool page impressions | Old explainer clicks | Old explainer page impressions |
|---|---:|---:|---:|---:|---:|---:|
| `cycling heart rate zones` | 14 | 359 | 12 | 294 | 2 | 73 |
| `heart rate zones cycling` | 3 | 115 | 2 | 94 | 1 | 24 |
| `cycling hr zones` | 4 | 70 | 4 | 63 | 0 | 11 |
| `cycling zones heart rate` | 3 | 36 | 3 | 27 | 0 | 10 |

The calculator captured **21 of the 24 exact-query clicks**. It also already wins high-intent calculator variants: `cycling hr zone calculator` generated 27 clicks, `heart rate zones cycling calculator` 25, `heart rate zone calculator cycling` 23 and `hr zone calculator cycling` 21.

The indoor/outdoor guide appeared underneath the broad owner but its page-level performance—41 clicks and 3.76K impressions—supports a distinct job. The MTB guide is stronger again at 96 clicks and 5.95K impressions. Neither is part of this consolidation.

## Content-overlap check

A simple word-frequency cosine comparison found heavy same-job overlap between the three retiring pages:

| Pair | Cosine similarity |
|---|---:|
| Old broad explainer vs newer broad guide | 0.904 |
| Old broad explainer vs training guide | 0.863 |
| Newer broad guide vs training guide | 0.917 |

The result supports consolidation when combined with the query evidence; similarity alone was not used to retire a page. The indoor/outdoor guide was preserved despite textual overlap because its modifier, user job and independent demand are distinct. MTB overlap was lower and its search performance is independently strong.

## Trust and answer-layer changes

- Rebuilt the calculator output as continuous whole-bpm ranges with no gaps or overlaps.
- Corrected the worked examples: Max HR 188 gives `94–113`, `114–132`, `133–150`, `151–169`, `170–188`; LTHR 168 gives `≤136`, `137–151`, `152–158`, `159–168`, `≥169`.
- Disclosed the exact percentage conventions and made clear that Max-HR percentage zones are not the Karvonen heart-rate-reserve method.
- Removed the unsupported claim that one LTHR method is inherently more accurate and the claim that a 20-minute FTP test directly measures LTHR.
- Distinguished a field LTHR estimate from laboratory lactate thresholds and five-zone coaching bands from three-zone research models.
- Added eight visible sources, WebPage citation nodes, Anthony Walsh review and an explicit evidence-limit statement.
- Added boundaries for heat, cardiovascular drift, illness, medication, symptoms, power, RPE and short-effort heart-rate lag.
- Repointed active editorial links, topic collections, AI discovery and the monthly AI-citation benchmark to the calculator.
- Added three permanent redirects and retained specialist indoor/outdoor, MTB, Zone 2 comparison and heart-rate-only pages.

## Measurement plan

### Seven-day directional check — earliest 5 September 2026

- Confirm the calculator has been recrawled and all three retired paths return a permanent redirect.
- Check query/page ownership for the four measured broad head terms and the main calculator variants.
- Confirm indoor/outdoor and MTB modifier queries remain on their specialist pages.
- Treat snippet and position changes as directional because crawl and reporting latency will differ by URL.

### Twenty-eight-day decision check — earliest 26 September 2026

- Compare clicks, impressions, CTR, position and exact-query owner share with this baseline and a matched preceding period.
- Success means the calculator retains or grows its broad-query click share while the three retiring pages leave indexed page mixes.
- Preserve the specialist pages unless later exact-query evidence—not mere textual similarity—shows that they serve the same user job.
