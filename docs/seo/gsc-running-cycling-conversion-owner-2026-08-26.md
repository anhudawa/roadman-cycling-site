# GSC running–cycling conversion owner decision — 26 August 2026

**Property:** `sc-domain:roadmancycling.com`  
**Source:** Google Search Console Performance, web search  
**Window:** 25 May–24 August 2026 (three months)

## Decision

- `/blog/running-cycling-conversion-calculator` owns informational **cycling to running conversion**, distance, time, ratio, chart, 5K examples and evidence-limit intent.
- `/tools/run-ride-converter` owns interactive **cycling to running conversion calculator** intent.
- `/answers/how-many-minutes-cycling-equals-running` remains the narrow answer and routes calculation and interpretation to their owners.
- `/topics/running-for-cyclists` and `/topics/cycling-for-runners` remain programme-level hubs.
- No redirect or canonical consolidation is justified because the guide and interactive calculator now perform different jobs.

## Baseline page performance

| URL | Clicks | Impressions | CTR | Average position |
|---|---:|---:|---:|---:|
| `/blog/running-cycling-conversion-calculator` | 1,029 | 113,114 | 0.9% | 5.7 |
| `/tools/run-ride-converter` | Not rendered as a page total | Not rendered | — | — |

The guide is already a high-impression page with page-one visibility and a material CTR opportunity. Search Console did not render a standalone three-month page total for the newer tool during collection, so exact-query rows are the baseline for its ownership.

## Exact-query ownership

| Query | Total | Guide | Tool | Decision |
|---|---|---|---|---|
| `cycling equivalent to running` | 4 clicks / 46 impressions / 8.7% / position 4.3 | 4 / 53 / 7.5% / 4.8 | 0 / 2 / 0% / 4.5 | Guide owns the explanation; tool is a calculation route. |
| `cycling to running conversion calculator` | 9 / 107 / 8.4% / 3.0 | 8 / 105 / 7.6% / 3.3 | 2 / 46 / 4.3% / 3.3 | Move exact calculator signals to the interactive tool while the guide routes visibly to it. |
| `biking to running conversion` | 4 / 306 / 1.3% / 5.2 | 4 / 305 / 1.3% / 5.4 | 1 / 18 / 5.6% / 1.9 | Guide remains the broad owner. |
| `cycling equivalent to running 5k` | 3 / 147 / 2.0% / 4.9 | 3 / 145 / 2.1% / 4.6 | 0 / 2 / 0% / 10.5 | Guide owns the worked 5K example. |
| `running to cycling conversion` | 7 / 128 / 5.5% / 5.0 | 3 / 123 / 2.4% / 4.3 | 4 / 42 / 9.5% / 7.6 | Keep two-way guide coverage and strengthen the actual calculator. |

Page-row impressions can overlap because more than one Roadman URL may appear or be counted for an exact query. Do not sum page rows as unique query impressions.

## Trust and product findings

The old guide and tool made claims the cited evidence could not support:

- a universal 1:3 distance or duration ratio;
- fixed 30-minute run to 45–60-minute ride equivalence;
- identical TSS or TRIMP as cross-sport interchangeability;
- running pace or VDOT as a predictor of cycling FTP;
- FTP as a predictor of running race times;
- a fixed 0.92 cycling VO2 correction and 1.65 duration multiplier; and
- one calorie-per-mile rule as an individual constant.

The tool also used `VO2 = 10.8 × watts ÷ mass + 7`, an oxygen-cost equation at a cycling work rate, as though FTP directly predicted VO2max. That was not a validated FTP-to-running performance model.

## Release changes

- Rebuilt the tool around named 2024 Adult Compendium running and cycling activity codes.
- The new calculation matches population-average MET-minutes only and exposes every input, MET value and limitation.
- Removed FTP, W/kg, VDOT, race-time, fixed heart-rate and universal duration predictions.
- Rebuilt the guide around one clear answer: no universal mile ratio exists.
- Added worked 30-minute and 5K examples, cited claim review, FAQs, HowTo, reviewer scope and primary-source links.
- Rewrote the narrow answer so it no longer recommends a universal three-to-one rule or injury substitution.
- Added guide and tool ownership to LLM discovery, IndexNow and AI-search benchmark prompts.

## Measurement plan

### Seven complete days — inspect on or after 5 September 2026

Use 27 August–2 September. Check guide CTR, exact-query page mix and whether calculator-intent clicks begin shifting to the tool. Treat movement as directional while Google recrawls titles and content.

### Twenty-eight complete days — inspect on or after 26 September 2026

Use 27 August–23 September and compare with the matched preceding 28 days plus this baseline. Record clicks, impressions, CTR, position and page ownership for all five exact queries.

Success means the guide improves CTR and remains the owner for ratios, charts and worked examples while the tool gains click share for calculator-qualified queries. If overlap remains, inspect query variants and result types before changing canonicals or redirects.
