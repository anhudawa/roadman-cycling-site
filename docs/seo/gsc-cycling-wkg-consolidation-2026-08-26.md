# Cycling W/kg search ownership — 26 August 2026

Source: Google Search Console, `sc-domain:roadmancycling.com`, Web search,
three-month interface window **25 May–24 August 2026**. Figures below are a
pre-release diagnostic baseline. Search Console can attribute the same search
to more than one Roadman page, so page-row impressions are ownership signals
and must not be added as unique site impressions.

## Decision

Keep `/blog/cycling-power-to-weight-ratio-guide` as the canonical broad
editorial owner for `W/kg`, `watts per kg`, `watts per kilo` and cycling
power-to-weight interpretation and safe improvement guidance. Permanently
redirect the later same-job guide
`/blog/cycling-watts-per-kilo-complete-guide` and the low-traffic, prescriptive
`/blog/cycling-power-to-weight-improve-guide` to it.

Keep these distinct jobs indexable:

- `/tools/wkg` — calculation;
- `/glossary/w-kg` — short definition;
- `/answers/ftp-vs-watts-per-kg` — the narrow FTP-versus-W/kg question;
- `/blog/age-group-ftp-benchmarks-2026` — age-qualified benchmarking;
- `/blog/ftp-benchmarks-by-age-and-experience` — experience-qualified benchmarking;
- `/blog/power-duration-curve-find-your-limiters` — multi-duration profiling;
- `/blog/watts-per-kg-alpe-dhuez` — climb-specific analysis;
- `/blog/triathlon-cycling-power-to-weight` — triathlon-specific application; and
- `/podcast/ep-2187-power-to-weight-the-number-that-matters` — episode record.

## Page evidence

| Page | Clicks | Impressions | CTR | Average position | Post-release role |
| --- | ---: | ---: | ---: | ---: | --- |
| `/blog/cycling-power-to-weight-ratio-guide` | 453 | 67,699 | 0.7% | 6.0 | Broad editorial owner |
| `/blog/cycling-watts-per-kilo-complete-guide` | 59 | 7,210 | 0.8% | 7.0 | Permanent redirect to owner |
| `/blog/cycling-power-to-weight-improve-guide` | 5 | 1,010 | 0.5% | 8.7 | Permanent redirect to owner |
| `/tools/wkg` | 463 | 43,800 | 1.1% | 6.8 | Calculator |
| `/blog/age-group-ftp-benchmarks-2026` | 4,030 | 184,000 | 2.2% | 5.5 | Age benchmark |
| `/blog/ftp-benchmarks-by-age-and-experience` | 2,150 | 126,000 | 1.7% | 5.5 | Experience benchmark |

The incumbent broad guide had **7.9 times** the clicks and **9.4 times** the
impressions of the later same-job explainer. The calculator has a separate
interactive job and comparable demand, so it must not be redirected into an
article.

The improvement article exposed no defensible separate owner signal: its
three-month page total was **5 clicks, 1,010 impressions, 0.5% CTR and average
position 8.7**. Its leading disclosed improvement queries were `how to
increase power to weight ratio` at 3 impressions and `power to weight ratio
improvement` at 2. It repeated the canonical owner's improvement section while
prescribing generic body-fat cut-offs, guaranteed gains and fixed weight-loss
rates. Redirecting it removes a trust and safety contradiction without
sacrificing a proven search job.

## Exact-query splits

### `w/kg`

The query recorded **5 clicks, 1,220 impressions, 0.4% CTR and average position
7.0**.

| Page | Clicks | Page-row impressions | Average position |
| --- | ---: | ---: | ---: |
| Broad owner | 3 | 736 | 6.5 |
| Calculator | 2 | 338 | 7.8 |
| Glossary | 0 | 164 | 11.2 |
| Age benchmark | 0 | 98 | 6.3 |
| Retired duplicate | 0 | 65 | 8.8 |

### `watts per kg`

The query recorded **4 clicks, 814 impressions, 0.5% CTR and average position
8.1**. The broad owner received 1 click / 409 page-row impressions, the age
benchmark 1 / 281, the calculator 1 / 61, the FTP-versus-W/kg answer 1 / 26,
the glossary 0 / 80 and the duplicate 0 / 67. Those pages are not all the same
job; only the two long-form broad explainers are consolidated.

### `power to weight ratio cycling`

The query recorded **2 clicks, 294 impressions, 0.7% CTR and average position
9.8**. The broad owner received 1 click / 171 page-row impressions, the
calculator 1 / 51, the episode 0 / 111 and the duplicate 0 / 1. This supports
the established article as the explainer while preserving calculation and
episode intent.

### `w/kg cycling`

The query recorded **8 clicks, 338 impressions, 2.4% CTR and average position
5.6**. The age benchmark led with 4 clicks / 207 page-row impressions because
many searches want a qualified comparison. The broad owner recorded 2 / 134,
the calculator 1 / 75 and the duplicate 1 / 17. The release therefore makes
the broad/age/calculator boundaries explicit instead of forcing all variants
to one URL.

## Content and trust corrections

The incumbent had stronger search history but weaker editorial boundaries. The
release:

- merges the duplicate's useful duration, terrain and energy-availability context;
- states the formula and adds a conversion chart without presenting arbitrary
  bands as population percentiles or race licences;
- separates FTP, five-minute, one-minute and sprint W/kg;
- removes generic male/female body-fat cut-offs, guaranteed 12-week gains,
  universal weight-loss advice and unsupported professional labels, including
  the remaining prescriptive improvement URL;
- explains rider mass versus total rider-plus-bike system mass;
- adds six evidence-graded claim rows, six FAQs, a five-step method, named
  review scope and linked primary or official sources;
- updates the calculator so its range display is arithmetic context rather than
  a rider classification; and
- exposes the owner and calculator in `llms.txt`, `llms-full.txt`, the pinned
  retrieval set, AI benchmark prompts and IndexNow recrawl list.

## Measurement

Use complete post-release windows; do not compare same-day partial data.

| Check | Data window | Inspect on | Primary signals |
| --- | --- | --- | --- |
| Crawl/indexing | Production release onward | after deployment | 308 redirect, canonical owner, retired URL absent from sitemap, Google-selected canonical |
| Seven complete days | 27 August–2 September 2026 | 5 September 2026 | Owner/tool impressions, CTR, exact-query URL count, AI answer accuracy |
| Twenty-eight complete days | 27 August–23 September 2026 | 26 September 2026 | Owner clicks/CTR/position, duplicate consolidation, calculator intent separation, AI citations |

Success means both retired guides' remaining impressions consolidate toward
the broad owner, while calculator queries continue to reach `/tools/wkg` and
age-qualified queries remain on the age report. A higher owner CTR at a
comparable position matters more than forcing every W/kg query onto one URL.
