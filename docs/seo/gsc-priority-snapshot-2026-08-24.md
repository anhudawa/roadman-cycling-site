# Google Search Console priority snapshot — 24 August 2026

Source: Google Search Console, `sc-domain:roadmancycling.com`, Web search, 23 May–22 August 2026. This is the baseline for the first data-led search consolidation batch.

## Site baseline

| Metric | Value |
| --- | ---: |
| Web clicks | 99,314 |
| Web impressions | 7,954,205 |
| Web CTR | 1.2% |
| Average position | 7.4 |
| Generative-AI feature impressions | 1,515,016 |

## Priority query families

| Query | Clicks | Impressions | CTR | Position | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| cycling podcast | 18 | 1,208 | 1.5% | 7.9 | Keep the roundup as the comparison result; strengthen `/podcast` as the show/archive entity. |
| cycling podcasts | 66 | 595 | 11.1% | 3.0 | Protect the roundup and route listeners into the archive. |
| best cycling podcasts | 56 | 853 | 6.6% | 2.8 | Protect `/blog/best-cycling-podcasts-2026`. |
| cycling coach | 14 | 1,452 | 1.0% | 23.5 | Separate learning, comparison and service intent; do not force every query into the sales page. |
| online cycling coach | 13 | 724 | 1.8% | 11.4 | Protect the coach-selection guide and link prominently to `/coaching`. |
| cycling coaching | 10 | 851 | 1.2% | 22.2 | Strengthen the knowledge guide and service path as distinct destinations. |
| cycling training plan | 32 | 806 | 4.0% | 7.2 | Use the winning case study to pass relevance and users to the methodology and plan hubs. |
| road cycling training plan | 10 | 298 | 3.4% | 16.1 | Strengthen `/training-plans` and `/topics/cycling-training-plans`. |
| queries containing “training camp” | 3 | 309 | 1.0% | 13.0 | Separate first-timer, preparation, adaptation and booking intent. |
| masters cycling age groups | 2 | 18 | 11.1% | 11.8 | Protect the masters racing guide and connect it to `/masters`. |

The aggregate “masters” filter was distorted by one irrelevant 3,581-impression query. Decisions for the masters cluster should therefore use exact cycling queries, not the unfiltered aggregate.

## Confirmed URL splits

### Cycling coach

Google showed 18 Roadman URLs for the exact query. The material competitors were:

| Page | Clicks | Impressions | Position |
| --- | ---: | ---: | ---: |
| `/blog/best-online-cycling-coach-how-to-choose` | 11 | 390 | 9.5 |
| `/topics/cycling-coaching` | 1 | 140 | 14.3 |
| `/blog/best-cycling-coach-uk` | 0 | 331 | 26.9 |
| `/blog/best-cycling-coach-usa` | 0 | 323 | 29.4 |
| `/coaching` | 0 | 268 | 37.3 |
| `/coaching/uk` | 0 | 122 | 68.8 |

Action: preserve the ranking selection guide, make the topic hub the learning destination, and keep `/coaching` clearly commercial. Location pages retain local intent and should not target the unqualified head term in internal anchors.

### Cycling training plan

| Page | Clicks | Impressions | Position |
| --- | ---: | ---: | ---: |
| `/blog/how-pro-cyclist-trains-60-days` | 31 | 750 | 5.9 |
| `/blog/joe-friel-perfect-cycling-training-week` | 1 | 44 | 34.3 |
| `/blog/cycling-training-plan-build-friel-lorang-johnson` | 1 | 4 | 4.5 |
| `/topics/cycling-training-plans` | 0 | 17 | 35.6 |

Action: keep the 60-day article as a first-person case study, explicitly label it as such, and send authority to both the methodology hub and the coach-designed plans page.

### Training camps

| Page | Clicks | Impressions | Position |
| --- | ---: | ---: | ---: |
| `/training-camps/girona-road` | 1 | 29 | 4.1 |
| `/blog/girona-training-camps-2026` | 1 | 24 | 8.6 |
| `/blog/what-to-expect-cycling-training-camp` | 0 | 182 | 18.2 |
| `/training-camps` | 0 | 45 | 14.5 |
| `/blog/cycling-training-camp-preparation-guide` | 0 | 41 | 5.0 |
| `/blog/cycling-training-camps-what-to-expect-guide` | 0 | 41 | 13.9 |

Action: retain separate first-timer, preparation and training-adaptation articles, but give each a distinct title and opening. All three route to the booking hub.

## Generative-AI visibility

Roadman appeared 1,515,016 times in Google’s generative-AI features during the period. Priority pages inside the top 100 included:

| Page | AI impressions |
| --- | ---: |
| `/blog/best-cycling-podcasts-2026` | 4,874 |
| `/podcast/ep-2170-eva-lovia-i-had-to-transform-my-life-after-porn` | 7,687 |
| `/podcast/ep-2043-i-tried-creatine-for-30-days-the-results-shocked-me` | 6,085 |
| `/podcast/ep-18-the-rise-and-fall-of-peloton-the-50-billion-fail` | 4,983 |
| `/podcast/ep-2064-5-easy-fixes-for-numb-hands-while-cycling` | 4,899 |
| `/podcast/armstrong-stripped-ullrich-kept-1997-tour-title` | 4,800 |
| `/podcast/ep-2036-5-exercises-pogacar-always-does-before-a-ride` | 4,312 |

Action: keep answer capsules, takeaways and reviewed claims intact; correct topic routing so these pages feed the right knowledge clusters.

## Measurement cadence

Re-check these exact queries 28 days after deployment and compare:

1. clicks and CTR for the current winner;
2. impressions transferred toward the intended hub;
3. the number of Roadman URLs shown for each exact query;
4. generative-AI impressions for the upgraded podcast pages;
5. assisted clicks from the ranking article into the commercial destination.

Do not redirect a page solely because it appears in the same query report. Redirect only when the content intent is genuinely duplicative and the weaker URL has no independent demand.

## Phase 2 execution log — 24 August 2026

Search Console indexing work completed after the first production deployment:

- The previously submitted child sitemaps (`/sitemap/0.xml` through `/sitemap/5.xml`) were still recorded as “Couldn't fetch” from 23 April 2026.
- The live child sitemaps returned valid XML with HTTP 200 responses.
- Submitted the canonical `https://roadmancycling.com/sitemap.xml` index to the domain property.
- Google accepted and read the index on 24 August 2026 with status `Success`.
- Confirmed that `/coaching`, `/training-camps`, `/podcast`, `/topics/cycling-training-plans`, and `/topics/masters-cycling` were already indexed.
- Added all five URLs to Google's priority crawl queue after the production content changes.

The second implementation batch then:

- moved the three high-impression coaching comparison articles from “best coach” title intent to explicit “how to choose” intent;
- reinforced `/coaching`, `/coaching/uk`, and `/coaching/usa` as service destinations;
- added exact-query headings to the training-plan and masters owner pages;
- added evidence-graded claim tables to the coaching, training-plan, and masters knowledge hubs;
- added visible author, reviewer, named-source, editorial-standard, and corrections signals to the three core performance pages; and
- updated priority-page sitemap modification dates to 24 August 2026.
