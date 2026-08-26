# ROUVY vs Zwift search-owner decision — 26 August 2026

## Decision

Keep and strengthen the established exact-query owner:

`/blog/rouvy-vs-zwift`

Permanently redirect and remove from the generated comparison registry:

`/compare/rouvy-vs-zwift-platform`

The generated comparison had no distinct useful intent. It repeated the same
platform decision using stale prices, unsupported route and event volumes, and
pre-acquisition product framing.

## Google Search Console baseline

Source: Google Search Console Performance, exact query `rouvy vs zwift`,
three-month view captured on 26 August 2026.

- 644 clicks
- 12,266 impressions
- 5.3% CTR
- Average position 4.0

Leading pages for the exact query:

| URL | Clicks | Impressions | CTR | Average position | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| `/blog/rouvy-vs-zwift` | 644 | 12,179 | 5.3% | 3.8 | Preserve history; canonical decision owner |
| `/compare/rouvy-vs-zwift-platform` | 0 | 252 | 0% | 22.0 | Permanent redirect to owner |
| `/topics/indoor-training` | 0 | 3 | 0% | 5.7 | Keep for library/navigation intent |

Page impressions are not additive because more than one Roadman result can
appear for the same query. The blog owner captured every exact-query click and
appeared against 99.3% of exact-query impressions. At an average position of
3.8, its 5.3% CTR leaves a meaningful title-and-snippet opportunity.

## Problems found

- The owner had the news-led search title `ROUVY vs Zwift After the 2026
  Acquisition`, while the exact query expresses a product-decision intent.
- The duplicate generated comparison earned 252 impressions and no clicks.
- The duplicate listed ROUVY at `$12–15` per month even though its current US
  Single plan is $19.99 per month.
- It used unsupported counts such as “hundreds of races daily” and “thousands
  of daily group rides,” exactly the kind of fast-decaying claim the reviewed
  owner deliberately removed.
- It predated Zwift's April 2026 acquisition of ROUVY, their independent roadmap
  and subscription decision, and current cross-hardware compatibility.
- One internal tool link and the offline cluster namespace continued to point
  at the stale generated route.
- The owner linked primary sources but had no structured claim/position table or
  explicit boundary between official product facts and Roadman recommendations.

## Changes prepared

- Retitled the owner `ROUVY vs Zwift 2026: Which Indoor App Is Better?` to match
  exact comparison intent while preserving the stable URL.
- Added a four-claim trust table covering the acquisition, current prices,
  hardware compatibility and the limit of Roadman's editorial verdict.
- Rechecked the official Zwift and ROUVY acquisition, pricing and compatibility
  sources on 26 August 2026 and refreshed the visible review trail.
- Added an explicit disclosure that Roadman has not run a controlled
  platform-versus-platform training-outcome study.
- Removed the stale generated comparison from the registry and sitemap source,
  then added a permanent redirect to the established owner.
- Repointed the remaining internal tool link and removed the retired slug from
  the offline comparison namespace.
- Pinned the owner in bounded LLM discovery and added AI benchmark prompt 238.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track exact-query clicks, impressions, CTR and average position. The primary
success signal is owner CTR above the 5.3% baseline without a material position
loss. Confirm that the retired comparison disappears from the query page table
and its historical impressions consolidate on the owner.

For AI benchmarking, record whether prompt 238 cites Roadman and preserves four
facts: common ownership, separate apps and subscriptions, current pricing, and a
use-case verdict rather than an unsupported universal performance winner.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
