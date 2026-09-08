# Next search batch: concrete findings and acceptance criteria

Prepared after PR340 was merged. This is a research and implementation brief, not another content release or a claim of improved rankings. The broader priorities and acquisition reports are in [search-opportunities-2026-09-08.md](search-opportunities-2026-09-08.md).

## 1. Let mobile visitors keep reading

Confirmed in `src/components/features/conversion/ExitIntentPopup.tsx`: a timer opens the full-screen promotional dialog after 45 seconds whenever `window.innerWidth < 768`. It does not require the visitor to be leaving. Desktop mouse exit becomes active after five seconds. `LazyExitIntent.tsx` excludes the application and tools, but articles remain affected. Browser QA observed the overlay interrupting an article.

The next implementation should replace the automatic mobile interruption with an unobtrusive invitation while retaining inline newsletter signup, explicit consent and relevant coaching links. Preserve attribution and measure completed subscriptions and qualified applications. Google recommends compact promotional banners that leave content accessible: [interstitial guidance](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials). No ranking penalty has been established.

Acceptance: a reader can spend more than 45 seconds on an article and scroll without losing access to its text or navigation; an explicit signup action still works; dismissal stays dismissed; no change to required cookie consent or payments. Test real rendered behavior at 320/390px and desktop. Do not submit test personal data to live systems.

The blog template also stacks short answers, takeaways, source/context panels, audience blocks and multiple hub links before the article. Review these as a sequence. Keep a concise answer and useful contextual links; remove repetition only when it adds no distinct information. Do not remove substantive evidence in pursuit of a smaller page.

## 2. Correct event editions and unsupported numerical claims

Roadman's unchanged Wicklow event and plan copy says it starts around Greystones and orders the climbs differently from the current organiser description. The official [2026 homepage](https://wicklow200.ie/) identifies Russborough House, Blessington, on 7 June 2026. The [organiser's route description](https://wicklow200.ie/wicklow200-route/) places Slieve Mann before Shay Elliott and Wicklow Gap late in the route. These are edition-specific corrections; they do not establish the 2027 course or date.

The existing shared event content also supplies minimum W/kg, fixed cardiac-drift figures and finish-time assurances without directly supporting evidence. Primary files: `src/lib/event-guides.ts`, `src/lib/training-plans.ts`, `src/data/races.ts`, and the existing Wicklow/Fred Whitton articles. Start with a bounded Wicklow pass, then Fred Whitton. Keep each established URL's role clear and inspect any linked predictor's actual course provenance before repeating its promises.

Fred Whitton's official route search result distinguishes the usual 112-mile route from 106.8 miles in 2026 and mentions The Struggle. Direct retrieval of [the official route page](https://fredwhittonchallenge.co.uk/route/) failed in this session, so that snippet is a research lead, not enough to certify the full current course. Obtain the organiser's route file or full brief before publication.

Acceptance: every route statistic names its edition and source; no synthetic future date returns; remove unsupported FTP cutoffs and blanket finish guarantees; keep practical preparation advice specific without inventing workouts or research. Update all affected answer capsules, FAQs, cards and metadata consistently. Render each changed template on desktop and mobile and rerun the exact-content gate.

## 3. Match the actual search result mix

Fresh Semrush `phrase_organic` reports for the UK, first 12 traditional organic positions, retrieved 8 September:

| Query | Observed result mix | Implication for Roadman |
| --- | --- | --- |
| cycling coaching | Team EF, Matt Bottrill, ProCyclingCoaching and other service sites, alongside British Cycling qualifications and career information | The broad query mixes buyers and people seeking coach education. Assess Roadman's service page against actual delivery and buyer needs; use the successful selection guide as a distinct resource. |
| bike tyre pressure | SILCA, Vittoria, SRAM, Pirelli and Wolf Tooth tools, plus practical guides | Tool usefulness and model credibility matter. Explain Roadman's assumptions and give riders a clear path from inputs to cautious interpretation. Avoid claiming equivalence to manufacturer systems. |
| fred whitton | Organiser, reference information, local listings, social/video pages and reported route experiences | An accurate, distinctive preparation guide can serve a different need from registration. Do not expect to replace the organiser for all navigational searches. |

The domain report previously put Roadman's tyre tool at 12; this separate phrase report's first 12 results do not include it. The feeds disagree, so position 12 is an estimate from that domain report, not a verified live Google rank. Use Search Console query/page data and a consistent reporting window for evaluation. Do not count the discrepancy as a gain or loss.

Raw reports: [coaching](data/semrush-uk-serp-cycling-coaching-2026-09-08.csv), [tyre pressure](data/semrush-uk-serp-bike-tyre-pressure-2026-09-08.csv), [Fred Whitton](data/semrush-uk-serp-fred-whitton-2026-09-08.csv). These describe returned results; competitor page quality was not exhaustively audited here.

## Release discipline

Keep the current approved release intact while preparing each small follow-up. A subsequent public change needs its own source review, rendered checks and updated hashes. Preserve the baseline and reject unfinished evidence. Measure coaching applications, newsletter subscriptions, memberships and other Roadman outcomes separately; Good Legs remains one forthcoming strength/recovery part of the wider business.
