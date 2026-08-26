# GSC cycling-coach search ownership — 26 August 2026

## Opportunity

Google Search Console, Web search, three months from 24 May to 23 August
2026, last updated 7.5 hours before the audit:

| Scope | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Whole site | 100,578 | 8,053,309 | 1.2% | 7.4 |
| Queries containing `cycling coach` | 119 | 11,024 | 1.1% | 12.3 |
| Exact query `cycling coach` | 14 | 1,467 | 1.0% | 23.4 |

The contains filter returned 83 query rows and 83 Roadman page rows. The exact
head term was distributed across 19 Roadman URLs. This is a page-selection
problem: Google sees Roadman as relevant, but the site has not made the intended
commercial owner sufficiently distinct from educational, selection and
location pages.

## Head-term cannibalisation

Top Roadman pages for the exact query `cycling coach`:

| Page | Clicks | Impressions | Intended role |
| --- | ---: | ---: | --- |
| `/blog/best-online-cycling-coach-how-to-choose` | 11 | 402 | Provider selection |
| `/blog/best-cycling-coach-uk` | 0 | 332 | UK selection |
| `/blog/best-cycling-coach-usa` | 0 | 326 | US selection |
| `/coaching` | 0 | 269 | Broad commercial owner |
| `/topics/cycling-coaching` | 1 | 143 | Educational knowledge hub |
| `/coaching/uk` | 0 | 123 | UK Roadman service |
| `/blog/best-cycling-coach-ireland` | 0 | 21 | Ireland selection |
| `http://www.roadmancycling.com/` | 0 | 18 | Legacy protocol/host variant |
| `/coaching/dublin` | 1 | 13 | Dublin service |
| `/` | 1 | 13 | Brand home |

The commercial owner received 18% of the exact-query impressions and no clicks.
The reviewed selection guide received 79% of the clicks. The release therefore
preserves the guide's selection role while giving the service page a singular
head-term title, direct answer and extractable current offer facts.

## Duplicate selection guides

Exact-page filters for the same three-month window:

| Page | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| `/blog/best-online-cycling-coach-how-to-choose` | 115 | 7,312 | 1.6% | 11.0 |
| `/blog/best-cycling-coach-guide` | 24 | 1,893 | 1.3% | 16.4 |

The older generic guide duplicated the stronger article's provider-selection
framework. Its visible query sample also included 942 impressions for the
irrelevant phrase `elite cycling coach athlete communication manual tasks
2026`, so raw page impressions should not be treated as qualified demand.

Decision: permanently redirect `/blog/best-cycling-coach-guide` to the reviewed
nine-point guide, remove the retired document from topic, related-content,
sitemap and recurring discovery inputs, and update active internal links to the
incumbent.

## One owner per intent

| Intent | Canonical Roadman owner |
| --- | --- |
| Broad `cycling coach`, `online cycling coach`, `cycling coaching` service intent | `/coaching` |
| How to choose, compare or find the best-fit coach | `/blog/best-online-cycling-coach-how-to-choose` |
| What coaching is and how it works | `/topics/cycling-coaching` |
| Current market price, billing and service comparison | `/blog/how-much-does-online-cycling-coach-cost-2026` |
| Whether coaching is worth it | `/blog/is-a-cycling-coach-worth-it` |
| Documented individual outcome | `/blog/is-a-cycling-coach-worth-it-case-study` |
| Coaching jobs | `/careers` |
| Masters-specific Roadman service | `/coaching/masters` |
| Country or city Roadman service | `/coaching/{location}` |
| Country-specific provider selection | `/blog/best-cycling-coach-{country}` |

No location, careers, value or case-study URL is retired: each has a distinct
modifier and user task. Those pages must link to the broad owner without
presenting themselves as the generic service destination.

## Release decisions

1. Change `/coaching` to a singular `Online Cycling Coach` search title and H1.
2. Add a visible short answer that defines the service and routes education,
   selection and price intent separately.
3. Freshness-stamp the service facts and WebPage schema on 26 August 2026,
   with Roadman as publisher/seller and Anthony Walsh as editor.
4. Reframe `/topics/cycling-coaching` as an educational knowledge guide; remove
   universal timelines, price floors, unsupported effectiveness percentages
   and absolute app-versus-coach claims.
5. Route the educational hub's commercial CTA through `/coaching`, not directly
   to the application form.
6. Consolidate the generic selection duplicate into the established reviewed
   checklist with a permanent redirect.
7. Extend AI-search benchmark prompts and recurring IndexNow discovery for the
   owner, knowledge, selection, price, masters and location roles.

## Measurement cohort

- Release date: 26 August 2026.
- Baseline window: 24 May–23 August 2026.
- Seven complete post-release days: 27 August–2 September; read no earlier than
  5 September 2026 to allow for Search Console reporting lag.
- 28 complete post-release days: 27 August–23 September; read no earlier than
  26 September 2026.
- Primary metric: exact-query clicks, impressions, CTR and average position for
  `/coaching` versus the other 18 URLs.
- Secondary metric: contains-filter page concentration, selection-guide
  performance, and combined non-brand clicks to the cluster.
- Guardrail: retain careers and geo-query clicks; consolidation succeeds only
  if broad intent concentrates without suppressing distinct modifiers.

Manual Request indexing is not part of this release. Use the deployed sitemap
and IndexNow submission, then request indexing in Search Console only with
explicit approval.
