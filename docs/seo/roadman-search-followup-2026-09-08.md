# Roadman search follow-up — 8 September 2026

Goal: improve discoverability and the usefulness of Roadman's existing resources across the whole business. This continuation is on PR #340; it is not a production release.

## Rechecked foundations

Live HTTP checks returned `/blog` at 298,905 bytes and `/blog?page=2` at 297,651 bytes. Both returned 200. The image allowances remain in robots.txt. The original approximately 7 MB archive problem and blocked image endpoint are already fixed; they are not new accomplishments in this batch.

The route-inventory audit scanned 3,953 source files and extracted 18,376 references: 15,806 internal references passed, 2,570 external references were skipped, and no broken internal destinations were reported. This checks extracted URLs against repository routing data; it does not prove every fragment, external source or live application flow works.

Main was still `c37eb8224168e858b6afed2cfbc2972eb84ea6f1`. PR #340 was open and unmerged. Vercel reported success for the previous branch revision, `4a33093a9dace0914fe30ff3061720ebdf212830`.

## Current Semrush evidence

Retrieved `resource_organic`, UK database, on 8 September; positions greater than 3 and less than 21, ordered by estimated search volume. These are third-party estimates, not private Search Console data or a measurement of revenue.

| Query | Estimated position | Estimated monthly volume | Roadman page |
| --- | ---: | ---: | --- |
| bike tyre pressure | 12 | 1,600 | /tools/tyre-pressure |
| lthr | 10 | 1,600 | /tools/hr-zones |
| bicycle tyre pressure calculator | 17 | 1,000 | /tools/tyre-pressure |
| bike tyre pressure calculator | 20 | 1,000 | /tools/tyre-pressure |
| dragon ride wales | 10 | 1,300 | /races/dragon-ride |
| fred whitton | 16 | 2,400 | /races/fred-whitton |
| greg lemond | 4 | 1,000 | /blog/greg-lemond-interview-roadman-podcast |

Competitor-branded calculator searches also appeared. Roadman must not imply that its model is SILCA's or SRAM's, or that their branded demand belongs to Roadman. No competitor landing pages were added. The report still lists the old ROUVY comparison destination; an old listing is not a reason to reverse an existing redirect.

## Implemented

### Shareable video moments

The watch-page player accepts `?t=750` and passes `start=750` to the YouTube embed. A compact form accepts seconds, MM:SS or HH:MM:SS, produces a link to that moment, and provides a way to return to the beginning. Invalid, negative, fractional and unsafe-number inputs are rejected. Autoplay is not enabled. YouTube may seek to a nearby keyframe rather than the exact second.

The original watch URL remains canonical. Timestamp variants are not added to the sitemap. A Suspense boundary preserves the statically generated page and an eager server-rendered fallback player. The client receives only the video ID, title and URL; the podcast catalogue is not imported into its bundle. A 200px minimum player height respects YouTube's minimum viewport requirement on narrow screens.

This prepares links that articles, newsletters and viewers can use to reference a passage. It does not validate existing chapter titles or establish quote accuracy. No Clip or SeekToAction markup was added: Google key-moment eligibility and video-file accessibility have not been established in Search Console. Adding markup alone would not establish either.

### Calculator explanations and sources

The shared calculator guide now links directly to methodology, worked examples, limitations and sources, with optional links omitted when their sections are absent. Source names are visible clickable text rather than unlinked names beside arrow-only links. This helps readers verify and reference the actual material.

The displayed modification date is labelled Updated rather than Last reviewed. Existing review names and source records are not a new human review. The six narrowly edited descriptions remove internal search-planning prose from FTP, heart-rate, suspension, sweet-spot, strength and gearing resources. Calculation models, pricing and availability are unchanged.

### Editorial controls

Removed the visible funnel-stage badge from the shared onward-links block. Destination resolution, links and analytics attributes remain intact.

The existing SEO QA audit now checks all 19 tool-registry entries, including on changed-only runs. Additional literal patterns catch the internal phrases observed in those descriptions. The check examines data strings rather than implementation comments. It is not a fact checker or a measure of literary quality.

## Validation and publication

- 53 focused tests passed across timestamp parsing, the actual player markup, video sitemap/routes, internal-copy detection and calculator source rendering.
- After adding calculator jump links and the player's minimum height, the two directly affected test files passed again: 38 tests. Each navigation link is checked against a unique section ID.
- TypeScript passed for the implementation before the final presentation-only changes. The final small additions are covered by the focused tests; no clean full-repository test result is claimed.
- Full copy audit: 1,772 MDX files and 19 tool entries, zero hard errors; 1,866 existing enrichment warnings remain.
- Diff whitespace and coral colour allowlist checks passed.
- Desktop/mobile interaction review remains pending. The local browser initially lacked Chrome; the automatic installer failed certificate validation. Official Chrome was subsequently downloaded using the environment's trusted certificate configuration, but this does not constitute a browser review.
- The editorial review record is updated, and the preview gate passes. Production approval is still required under `docs/editorial-publishing-standard.md`. No approval comment was posted on Anthony's behalf.

## Sources and next priorities

- [Google: AI features and websites](https://developers.google.com/search/docs/appearance/ai-features): standard search foundations apply; no special visibility guarantee is made here.
- [Google: link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable): descriptive, crawlable links and contextual references.
- [YouTube: player parameters](https://developers.google.com/youtube/player_parameters#start): whole-second start parameter and player dimensions.
- [Google: video structured data](https://developers.google.com/search/docs/appearance/structured-data/video): deep-linking and additional eligibility requirements for video moments.

Next: complete actual desktop/mobile preview review; source-check and link a small set of interview passages; use current Search Console queries and conversion data to choose the next commercial-page improvements. The outstanding CTL article consolidation needs backlink and query context; do not redirect the linked long-form article simply because several pages rank for related terms. Good Legs membership/payment integration remains deferred until launch.
