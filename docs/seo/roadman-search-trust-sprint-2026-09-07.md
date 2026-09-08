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

Anthony delegated final QA to Codex on 8 September. Publication now requires the completed review and exact-content QA record in `editorial/release.json` and `editorial/qa.json`. Automated verification alone remains insufficient; no human reviewer is impersonated and the baseline stays frozen.

## Continued work: goal and implementation log

Goal: improve useful organic discovery and qualified demand across Roadman, while making the published evidence and editorial process more reliable. Continue through concrete batches without requiring Anthony to prompt between them. This is active session work, not a newly scheduled task.

### Event dates

Removed the helper that converted a usual month into the first day of a supposedly confirmed future event. All 25 race guides now describe a WebPage about a named Thing; the 16 event preparation guides and 17 plan hubs retain Article/CollectionPage/Course structures without fabricated SportsEvent dates. Real weekly community schedules remain outside this change. No race database was seeded or altered.

Evidence: [Google event guidance](https://developers.google.com/search/docs/appearance/structured-data/event) and [Schema.org Thing](https://schema.org/Thing). Evergreen guidance is not an announcement of an event edition. Render tests cover all 58 routes, retaining their guide and breadcrumb structures. The first combined targeted run passed 74 checks.

### UK and US coaching selection

Rewrote both country guides around a rider's brief, discipline, relevant qualifications, actual feedback, calls, local skills needs and a complete written quote. Kept existing URLs and the distinction between selection articles and coaching offers. Not Done Yet remains US$195/month with an individual plan, team review and Anthony-led group calls; Inner Circle remains US$525/month for individual coaching. No additional service-level promise or client-distribution claim was introduced.

The USA guide had the qualification ladder backwards. [USA Cycling](https://usacycling.org/coaches), checked 7 September 2026, lists Level 3 as entry, Level 2 Intermediate and Level 1 Advanced. Removed the unsupported Expert/Elite ladder, weekend-course claim, category generalisations, fixed time-zone promises and invented Anthony anecdotes.

British Cycling's [coaching page](https://www.britishcycling.org.uk/coaching), [directory](https://www.britishcycling.org.uk/coachingdirectory) and [recognised-qualification page](https://www.britishcycling.org.uk/membership/article/20120504-recognised-qualifications-0) were visible in search results, but direct fetches returned 403. The revision therefore does not assert a current UK level hierarchy or unverified scope; it directs readers to verify the full credential and awarding body. Removed the unsupported Level 4 claim and universal qualification/price quality cutoffs. Do not describe this as a complete audit of British Cycling's current syllabus.

Both rewritten articles omit the prior named review credit and invented first-person Roadman View fields. The existing byline is retained under the delegated editorial workflow; no new human review is claimed. Final browser review also found and removed the shared template's automatic reviewer and inferred review-date fallbacks.

### Reader copy and authoring checks

Removed internal page-ownership wording from navigation passages across 34 further blog articles and three podcast records, preserving useful links and the original transcript text. Removed the Sam Bennett section about Google rankings and redirect implementation. Corrected the matching public recovery-feed description and one power-zone answer takeaway. These are passage edits, not a retrospective fact-check of the whole archive.

Added `findInternalSearchLanguage` to the existing SEO QA audit. It reports literal internal publishing phrases as errors in blog/podcast MDX, including wrapped frontmatter. A full scan of 1,772 files passes this check and the existing hard checks. There remain 1,866 enrichment warnings; those are not 1,866 verified SEO defects or a reason to fabricate missing metadata.

Corrected answer/question authoring guidance and two generation prompts that encouraged unsupported confidence or numbers. Guest names now require source passages; insufficient evidence can produce no FAQ. Removed an unsupported training-prescription example from the FAQ prompt. No generation jobs were run. Existing tests that required internal copy now reject it; update-date checks permit later revisions while still rejecting dates earlier than the original release. Human-review requirements and the editorial production gate were not weakened.

Scope limitation: this literal wording check covers blog/podcast files. It does not judge literary quality, validate every fact, or moderate runtime databases or the separate Good Legs website.

### CTL search and calculator correction

Semrush live UK/US `resource_organic` reports (7 September 2026):

| Query / market | Existing page | Position | Estimated monthly volume |
| --- | --- | ---: | ---: |
| whats ctl / UK | /answers/what-is-ctl | 9 | 720 |
| whats ctl / UK | /glossary/training-peaks-ctl | 19 | 720 |
| what is ctl / US | /answers/what-is-ctl | 6 | 320 |
| what is ctl / US | /glossary/training-peaks-ctl | 56 | 320 |
| ctl meaning / US | /blog/reading-your-training-data-tss-ctl-atl-tsb | 13 | 590 |
| ctl meaning / US | /answers/what-is-ctl | 26 | 590 |
| intervals icu ctl / US | /tools/training-load | 39 | 50 |

These are third-party estimates, not Search Console or revenue measurements. Semrush found five followed backlinks from one referring domain to the reading-your-training-data article. The answer and glossary lookups returned “nothing found”, which is not proof of zero backlinks. No CTL redirect was introduced; preserve the incumbent article until its query and link evidence is understood.

The calculator had a more immediate correctness problem: it seeded CTL and ATL from the first day's TSS. A single 100-TSS day therefore became an apparent CTL of 100. It also labelled fixed TSB bands “race ready”, “overreaching” and “detrained”.

Replaced that behaviour with explicit starting CTL/ATL from the day before the sequence; zero is disclosed as a hypothetical no-prior-load starting model. All entered days, including rest, advance the calculation. TSB for the last entered day uses the preceding day's values; the following day's TSB is separately identified. Removed diagnostic/performance labels, corrected the three demonstration-week totals to 225, 330 and 440 TSS, and added a worked rest-day calculation with inputs and results. No universal training dose or performance prediction is supplied.

Primary method sources, checked 7 September 2026:

- [TrainingPeaks CTL formula](https://help.trainingpeaks.com/hc/en-us/articles/204071884-Fitness-CTL)
- [TrainingPeaks ATL formula](https://help.trainingpeaks.com/hc/en-us/articles/204071894-Fatigue-ATL)
- [TrainingPeaks TSB timing](https://help.trainingpeaks.com/hc/en-us/articles/204071764-Form-TSB)
- [Performance Management Chart explanation](https://www.trainingpeaks.com/learn/articles/what-is-the-performance-management-chart/)

The engine follows the current Help Center recurrences using 1/42 and 1/7. An older TrainingPeaks blog describes exponential coefficients instead; this implementation identifies the chosen convention and does not promise exact cross-platform equivalence. Six calculation tests pass, including first-day load, rest, equilibrium, continuation and invalid inputs.

Updated /answers/what-is-ctl and the glossary entry to separate recorded load from measured performance. Removed unsupported ramp limits, fitness verdicts and attributed guest insights without a verified passage. Added primary documentation and a direct route to the corrected tool.

### Verification and remaining work

All 42 changed MDX files compiled. The copy audit passes across the corpus; colour checks and whitespace checks pass. TypeScript passed after the main implementation; later test-only maintenance is rechecked before commit.

The wider SEO suite exposed fixed-date/text expectations, export budgets and older unrelated failures. The date/text checks are being repaired without restoring bad copy. The two llms exports had exceeded their existing size budgets: the short list now preserves article titles and links without repeating descriptions, and the full export uses a smaller recent-article window while retaining every pinned article. No indexing or AI-ranking benefit is claimed for llms.txt.

A clean main worktree reproduced 10 failures in seven unchanged legacy suites covering older app text, benchmark counts, podcast ownership, press links, shared schema assumptions and IndexNow lists. These are recorded as existing debt, not introduced regressions. Exact final test and preview results will be appended after verification.

The initial mobile limitation was resolved on 8 September with a preview-only route that renders the real pages inside a narrow same-origin iframe. Completed observations supersede the earlier incomplete-review status. No approval comment was posted on Anthony's behalf.

### Final QA — 8 September

Codex completed desktop review at 1363x936 CSS pixels and responsive Chrome review at 390x844, with the video also checked at 320x844. This is a browser-layout check, not physical iPhone or Safari testing. Page-by-page evidence is in `editorial/qa.json`, tied to the content, review and publication-control hashes.

QA found and fixed three additional defects: inferred reviewer credits and dates, an empty single-rest-day training chart, and a narrow video player that expanded beyond its container. The final 320px player measures 270x200 inside a 272x202 wrapper. Both 0:30 and 12:30 share URLs pass their times to the player. The CTL 60/ATL 90 rest-day example renders 59/77/-30, with following-day TSB -18.6; the empty chart is absent. Coaching links reach the application entry and mobile navigation works. No real applications, subscriptions or payments were submitted.

Verification: 55 gate rejection tests; 139 focused release tests and 17 additional discovery/offer tests; final TypeScript check; full content audit across 1,772 MDX files and 19 tools with zero hard errors; internal link audit with 18,380 references, 15,810 valid internal links, zero broken links and 2,570 external links skipped. The 1,866 enrichment warnings and ten reproduced failures in seven unchanged legacy suites remain explicitly recorded. The content preview at `febbba9634b14adbe74583c9accf2a7e5c0ff595` built successfully, with SEO QA Audit and Episode SEO Coverage passing.

The publication gate now uses the user's delegated final QA authority while rejecting incomplete or stale records. The initial baseline is unchanged. The preview helper returns 404 outside preview deployments and does not appear in sitemaps or public navigation; production framing remains DENY.

This review covers changed sections and representative shared templates. It does not certify the entire archive. Older Wicklow numerical assertions, repeated mobile article panels and an obstructive newsletter overlay are recorded for subsequent work in [the next search-opportunity queue](search-opportunities-2026-09-08.md), together with fresh Semrush evidence.
