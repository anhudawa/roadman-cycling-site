# Roadman search growth: first corrective batch

7 September 2026. Scope: Roadman Cycling as a whole. Good Legs visuals remain on a separate branch and PR; this work does not depend on them.

## Evidence used to choose the batch

Semrush reports retrieved 7 September 2026: `resource_organic`, UK, US and Ireland; a further UK report filtered coaching terms; UK `domain_organic_organic`. These are third-party estimates, not current Google positions, Search Console measurements or revenue attribution.

| Query | Database | Estimated position | Destination |
| --- | --- | ---: | --- |
| online cycling coaching | UK | 2 | /blog/best-online-cycling-coach-how-to-choose |
| online cycling coaching | UK | 55 | /coaching |
| cycling coaching | UK | 29 | /coaching |
| cycling and sleep | US | 2 | /blog/cycling-sleep-performance-guide |
| strength training for cyclists | US | 3 | /blog/cycling-strength-training-guide |
| bicycle gear calculator | US | 9 | /tools/gear-ratio |
| dragon ride wales | UK | 10 | /races/dragon-ride |

UK organic competitors included Road Cycling Academy (64 shared keywords), EVOQ (50), JOIN (56), TrainerRoad (177) and ROUVY (138). Shared keywords describe search overlap, not identical business models.

Live HTTP checks on 7 September confirmed:

- `/blog`: 200, 298,905 decoded HTML bytes, self-canonical.
- `/blog?page=2`: 200, 297,651 decoded HTML bytes, its own paginated canonical.
- robots.txt allows `/_next/image` in crawler groups.
- `/compare/rouvy-vs-zwift-platform`: 308 to `/blog/rouvy-vs-zwift`.
- `/glossary/ftp`: 308 to `/topics/ftp-training`.
- `/glossary/training-peaks-ctl`: 200, so CTL intent overlap remains a review candidate.

Do not reopen already deployed redirects merely because an older Semrush listing still appears. The original ~7 MB archive problem is resolved in these live samples. Sizes vary between responses.

## Changes in this branch

1. Coaching service introduction: replace the podcast-name list and generic benefit promise with the existing individual plan, team review and Anthony-led group call. Keep existing search title, canonical URL, prices, testimonials and application tracking.
2. Coach-selection and price guides: replace internal page-ownership language with useful links and questions. Retain the historical August price sample and its date; this is not a fresh provider-price audit. Do not credit Anthony with a new review.
3. Dragon Ride article: replace the misidentified 311km Gran Fondo and unsupported W/kg/finish-time rules with edition-specific route facts and a preparation guide. Remove unsupported minimum weeks, stacked training loads, weather statistics, physiological assertions, blanket intake instructions and attributed guest prescriptions. Link the free community to `/community/clubhouse`; remove outdated coaching prices and the course-slug result-page link.
4. Race guide and directory: record the 2026 route edition alongside distance/elevation; compare all four routes using the organiser's publication. Remove unverified climb statistics, finish-time bands and the promise of a route-specific simulation from this guide. A route guide does not advertise the historical course as a future SportsEvent. Other race guides retain their existing behaviour pending their own review.
5. AI-readable summary and modification dates: align the Dragon Ride summary and changed-page dates with the edited content. No extra pages or keyword-variation pages added.

## Dragon Ride source record

- [Organiser's 2026 route announcement](https://www.dragonride.co.uk/news-item/2026-reversed-routes-revealed/): Cymru Classic 99km/1,324m; Medio Fondo 153km/2,332m; Gran Fondo 222km/3,583m; Dragon Devil 298km/4,504m. Named climbs and reversed direction also come from this source.
- [Organiser's next-event information](https://www.dragonride.co.uk/news-item/how-to-enter-the-2025-dragon-ride/): 13 June 2027 announced; 2027 routes unconfirmed. Its legacy URL does not represent the displayed edition. Its Cymru Classic ascent differs from the route announcement (1,350m versus 1,324m); this batch consistently uses the specific 2026 route announcement for historic route figures.
- Preparation advice is general coaching guidance, not a validated event-specific training programme. No case outcomes or first-person event experience invented.

## Important remaining work

| Priority | Work | Reason / completion condition |
| --- | --- | --- |
| High | UK and US coach-selection articles | The UK article still contains broad price/qualification assertions, an unhelpful blanket dismissal of low-priced coaching and event references needing verification. Review the complete articles, their answer capsules and FAQs before changing them. |
| High | Actual Search Console + conversion refresh | Compare non-overlapping windows after an appropriate post-release interval; connect consented article-to-application activity with qualified applications and memberships. Earlier repository exports are historical context only. |
| High | Event dataset and prediction provenance | Other guides still derive event dates from a month and publish unverified finish-time bands. The Dragon Ride seed describes a synthetic segment course and an old event date; removing the editorial link does not update a live database or validate that simulator. Audit all event dates, GPX provenance and result claims as a separate complete batch. |
| Medium | CTL answer/glossary intent | Inspect `/answers/what-is-ctl` and `/glossary/training-peaks-ctl`, GSC query splits and backlinks before deciding whether to merge. |
| Medium | Gear-ratio and tyre-pressure tools | Existing visibility merits practical usability and evidence review before expanding tool inventory. Record outcomes rather than app clicks alone. |
| Medium | Interview references | Start with a small, verified set of original interviews. Pair exact timestamps and quotations with the appropriate guide and video; never fabricate transcript fidelity. |
| Medium | Editorial language elsewhere | An initial regex found 39 matching lines across blog sources. Matches are review candidates, not automatic deletion instructions. Remove internal ownership prose without removing useful links or changing search intent. |

## Measurement

Track separate outcomes for coaching applications, paid Not Done Yet membership, camp enquiries/bookings, Saturday Spin subscriptions, Clubhouse joins and Good Legs signups. Retain source pages and consent state. Do not sum overlapping keyword volumes, equate AI citations with customers, or treat two same-day Semrush reads as growth.

Google's [AI-feature guidance](https://developers.google.com/search/docs/appearance/ai-features) supports crawlability, textual usefulness, internal discovery and original image/video resources. No special schema or AI text file is required for inclusion. AEO work should improve the source material and verification, then measure discovery.

## Publication

This is a preview batch until the repository's editorial review and editor-comment requirements are satisfied. Automated verification is not editorial approval. Review evidence and any outstanding desktop/mobile checks belong in `editorial/release.json`; no reviewer is impersonated and no baseline is reset.
