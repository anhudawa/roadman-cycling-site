# Google Search Console baseline — 24 August 2026

Captured in the verified `roadmancycling.com` domain property on 25 August
2026. Search Console's latest complete day was 22 August 2026.

This is the frozen baseline for the Phase 2 search-owner, evidence, freshness,
and internal-linking releases shipped on 24–25 August 2026.

## Organic search baseline

| Window | Complete dates | Clicks | Impressions | CTR | Average position |
| --- | --- | ---: | ---: | ---: | ---: |
| 7 days | 16–22 Aug 2026 | 10,571 | 769,396 | 1.4% | 8.0 |
| 28 days | 26 Jul–22 Aug 2026 | 40,654 | 2,980,008 | 1.4% | 7.9 |
| 3 months | 23 May–22 Aug 2026 | 99,314 | 7,954,205 | 1.2% | 7.4 |

## Google generative-AI search baseline

Google's Search Console report for generative-AI features recorded **697,964
impressions** from 26 July through 22 August 2026. That is 23.4% of the total
Web-search impressions reported for the same 28-day window.

The report currently exposes impressions, not clicks or queries. Its leading
pages show the content pattern Google AI features already prefer from Roadman:
exact benchmarks, calculators, comparison pages, and direct evidence-oriented
answers.

| Page | AI-feature impressions |
| --- | ---: |
| `/blog/age-group-ftp-benchmarks-2026` | 16,632 |
| `/tools/shock-pressure` | 14,300 |
| `/answers/should-cyclists-take-creatine` | 13,861 |
| `/blog/running-cycling-conversion-calculator` | 10,773 |
| `/blog/ftp-benchmarks-by-age-and-experience` | 10,068 |
| `/tools/tyre-pressure` | 8,116 |
| `/blog/cycling-back-pain-fixes` | 8,056 |
| `/blog/rouvy-vs-zwift` | 7,962 |
| `/blog/wahoo-vs-garmin-cycling-computers` | 6,987 |
| `/tools/power-speed` | 6,909 |

## Leading conventional organic pages

| Page | 28-day clicks | 28-day impressions |
| --- | ---: | ---: |
| `/tools/shock-pressure` | 1,603 | 55,752 |
| `/blog/age-group-ftp-benchmarks-2026` | 1,324 | 64,147 |
| `/blog/rouvy-vs-zwift` | 1,274 | 23,745 |
| `/podcast/ep-2170-eva-lovia-i-had-to-transform-my-life-after-porn` | 1,071 | 18,364 |
| `/blog/wahoo-vs-garmin-cycling-computers` | 877 | 23,825 |
| `/tools/fuelling` | 768 | 19,569 |
| `/blog/running-cycling-conversion-calculator` | 694 | 79,663 |
| `/blog/ftp-benchmarks-by-age-and-experience` | 595 | 32,845 |
| `/` | 411 | 3,389 |
| `/tools/hr-zones` | 408 | 13,981 |

No commercial search-owner pillar is yet among the top 10 pages by clicks.
The Phase 2 objective is to make the five owner pages the authoritative
conversion layer while the existing tools, answers, articles, and episodes
continue to capture long-tail demand.

## Priority owner-page index validation

All five pages were inspected individually in Search Console on 25 August:

| Page | Google status | Canonical | Fetch/indexing |
| --- | --- | --- | --- |
| `/coaching` | On Google; indexed | Inspected URL | Successful / allowed |
| `/masters` | On Google; indexed | Inspected URL | Successful / allowed |
| `/training-plans` | On Google; indexed | Inspected URL | Successful / allowed |
| `/training-camps` | On Google; indexed | Inspected URL | Successful / allowed |
| `/podcast` | On Google; indexed | Inspected URL | Successful / allowed |

Google last crawled all five on 24 August 2026 as Googlebot smartphone. The
canonical sitemap index at `https://roadmancycling.com/sitemap.xml` was
successfully resubmitted on 25 August after the production releases.

## Indexing inventory and defects

Search Console reported 3,718 indexed pages and 4,327 not-indexed URLs. The
raw excluded count is not a measure of lost rankings: most are intentional
alternates, redirects, noindex pages, robots exclusions, or generated assets.

| Reason | URLs | Assessment on 25 Aug |
| --- | ---: | --- |
| Alternate page with proper canonical | 1,588 | Expected consolidation |
| Crawled — currently not indexed | 1,227 | Samples dominated by fingerprinted Open Graph image assets and feeds |
| Page with redirect | 492 | Generally expected consolidation |
| Excluded by `noindex` | 264 | Generally intentional private/thin pages |
| Blocked by robots.txt | 255 | Requires periodic audit, not blanket removal |
| Soft 404 | 103 | Retired junk guest slugs returning streamed 200 responses; fix in progress |
| Duplicate without user-selected canonical | 20 | Mostly obsolete guest slugs plus `/method/checkout`; fix in progress |
| Access forbidden (403) | 1 | Isolated; inspect if it persists |

The concrete remediation is to return route-level 404s for guest slugs absent
from the curated guest corpus, noindex the transactional checkout, and send an
`X-Robots-Tag` on generated social images and raw feeds.

## Video-search opportunity

Google reported one indexed video and 352 videos excluded because the video
"isn't on a watch page." The examples are podcast episode pages with valid
YouTube videos. This is a meaningful discovery/search opportunity, but it
needs a deliberate watch-page architecture or a verified episode-page layout
test rather than simply creating 352 duplicate URLs.

## Measurement schedule

- First full post-release window: 25–31 August 2026. Pull after GSC has fully
  processed 31 August (target 3 September).
- Matched 28-day post-release window: 25 August–21 September 2026. Pull after
  GSC lag clears (target 24 September).
- Compare total clicks, impressions, CTR and position; the five owner URLs;
  their query families; Google generative-AI impressions; non-brand clicks;
  and cannibalisation between owner and support pages.

Do not judge the releases from partial same-day data. Search Console was
already 2–3 days behind when this baseline was captured.
