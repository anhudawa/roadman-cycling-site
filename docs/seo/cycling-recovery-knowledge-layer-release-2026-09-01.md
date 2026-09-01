# Cycling recovery knowledge-layer release — 1 September 2026

## Ownership decision

Keep `/blog/cycling-recovery-tips` as Roadman's canonical owner for broad **cycling recovery** educational intent.

The exact-query Search Console validation showed the existing article leading the broad lane with 73 visible impressions, versus 10 for `/topics/cycling-recovery`. The article itself was not rewritten in this phase and remains under the freshness guardrail after its 31 August review.

`/topics/cycling-recovery` is now the supporting research library. `/app` continues to own recovery-product, early-access and launch intent. Narrow articles retain active-recovery, food, sleep, rest-day and recovery-week questions.

## Search Console baseline

The frozen 28-day Web baseline (`2026-08-02` to `2026-08-29`) is stored in `docs/seo/data/gsc-cycling-recovery-lane-28d-2026-08-29.json`.

Broad fragmentation lane:

- 10 clicks
- 2.4K impressions
- 0.4% CTR
- Average position 15.3
- 139 matching queries

The broad regex includes a 1,245-impression lower-back query, so a cleaner exact head-term group was also frozen:

- 2 clicks
- 67 impressions
- 3% CTR
- Average position 21.3
- Existing recovery guide: 1 click / 73 visible impressions
- Research-library hub: 0 clicks / 10 visible impressions

Google states that filtered chart totals and table rows may be partial, so page rows are not summed against the card total.

## Released

- Seventh formal search owner: `cycling recovery` → `/blog/cycling-recovery-tips`
- 163 recovery articles and episodes routed to the broad owner by the strict ownership audit
- Most-specific-phrase resolution so `cycling recovery app` remains owned by `/app`
- Direct WebPage owner schema and JSON-feed discovery on the established article
- Reviewed recovery research library with four evidence-position rows and six primary or consensus sources
- Removal of unsafe universal prescriptions from the research library, including fixed supplement, deload, return-to-intensity and fatigue-diagnosis rules
- `/feeds/cycling-recovery.json` with five decision steps, six bounded recovery levers, source identifiers and explicit clinical/product boundaries
- App product feed, MCP record and knowledge-graph discovery links to the recovery owner, library and evidence feed
- AI discovery-file entries that preserve educational, research-library and product ownership
- Ownership audit support for canonical owners served through the dynamic article route

## Evidence set

- UCI Sports Nutrition Project: Nutritional Periodization (PMID 41130458)
- Athlete sleep consensus recommendations (PMID 33144349)
- Subjective athlete-monitoring systematic review (PMID 26423706)
- Athlete-reported outcome-measure validation review (PMID 32957081)
- HRV-guided endurance-training review (PMID 34639599)
- ECSS/ACSM overtraining syndrome consensus (PMID 23247672)

## Verification

- 40 focused tests passed across 10 files
- TypeScript passed
- Changed-file lint passed
- Search-quality audit: 1,772 documents, 0 errors
- Strict ownership audit: 1,772 documents, 7 owners, 0 errors, 0 review queue
- Production build passed: 4,460 generated pages
- Rendered owner verified with the `#webpage` entity and JSON alternate
- Rendered owner verified without a self-referential owner backlink
- Rendered research library verified with the new title, source-data link and removal of the four unsafe universal claims

## Measurement

- Hold the 31 August owner article through the freshness window unless a delivery error or material evidence issue appears.
- Day 7: confirm the owner entity, feed and supporting backlinks are live; compare exact head-term impressions and page distribution directionally.
- Day 14: review owner CTR/title fit only if the position and query mix are stable enough to interpret.
- Day 28: rerun both frozen query groups and investigate only if ownership fragments further or the established article materially loses visibility.
