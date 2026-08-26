# MTB suspension calculator search owner — 26 August 2026

## Owner decision

`/tools/shock-pressure` remains the canonical owner for these related jobs:

- MTB suspension calculator
- suspension calculator / MTB suspension setup calculator
- fork pressure calculator
- shock pressure calculator
- FOX suspension calculator
- RockShox suspension calculator
- MTB sag calculator

The URL already owns this query family. No redirect or URL migration is needed.
The release changes the promise and method rather than creating another page.

## Google Search Console baseline

Read-only Performance data, 25 May–24 August 2026:

| Page | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| `/tools/shock-pressure` | 5,179 | 150,287 | 3.4% | 6.2 |

Leading page queries:

| Query | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| `mtb suspension calculator` | 131 | 336 | 39.0% | 1.7 |
| `suspension calculator` | 109 | 1,501 | 7.3% | 3.8 |
| `fox suspension calculator` | 102 | 1,088 | 9.4% | 5.7 |
| `mtb suspension setup calculator` | 89 | 344 | 25.9% | 1.7 |
| `rockshox pressure calculator` | 79 | 516 | 15.3% | 3.1 |
| `suspension calculator mtb` | 79 | 178 | 44.4% | 1.8 |
| `rockshox suspension calculator` | 61 | 890 | 6.9% | 4.4 |
| `fox suspension setup calculator` | 55 | 699 | 7.9% | 4.4 |
| `fork pressure calculator` | 55 | 109 | 50.5% | 1.3 |
| `sag calculator mtb` | 53 | 200 | 26.5% | 2.8 |
| `shock pressure calculator` | 45 | 119 | 37.8% | 1.5 |

The exact `mtb suspension calculator` and `shock pressure calculator` query
rows showed only this tool as the Roadman landing page. The opportunity is CTR,
accuracy and long-tail coverage—not cannibalisation repair.

Supporting-guide baseline from the same window:

| Supporting page | Clicks | Impressions | CTR | Position | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| `/blog/mtb-fork-setup-guide` | 115 | 17,419 | 0.7% | 6.1 | Preserve as fork-only setup owner; rebuild against official FOX/RockShox sources |
| `/blog/mtb-suspension-setup-complete-guide` | 33 | 5,771 | 0.6% | 7.3 | Preserve as full fork-and-rear how-to owner; rebuild around the traceable setup sequence |
| `/blog/suspension-pressure-setup-mtb-gravel-guide` | 10 | 2,206 | 0.5% | 7.3 | Permanently redirect to the full setup guide; mixed pressure/setup job duplicated stronger owners |

The retained fork guide's visible query set included `mtb fork air pressure
guide` and fork-setup/how-to terms. The retained full guide's visible set
included `mountain bike suspension setup`, `mtb setup guide` and how-to terms.
The retired mixed guide showed almost no useful suspension-query clicks, and its
only visible `mtb shock pressure` / `shock pressure` rows were zero-click,
low-position impressions. This supports preserving the specialist jobs while
removing the redundant hybrid URL.

## Pre-release trust defects

The previous page combined copied, inferred and generic tables under an
"official manufacturer" claim. It also:

- multiplied fork and shock PSI by riding-style presets;
- increased PSI automatically for selected volume-spacer count;
- extrapolated beyond the last row of a pressure table;
- used generic rear-shock PSI without the bicycle leverage curve or OEM tune;
- included a duplicated, unsorted RockShox Lyrik table;
- represented at least one coil product as an air shock;
- reduced coil spring selection to an unsafe rider-weight shortcut;
- claimed coil-rate output that the interface did not actually calculate;
- calculated MTB tyre pressure through a second heuristic owner instead of
  routing that job to `/tools/tyre-pressure`;
- emailed generic rebound, seasonal and bike-park pressure changes without an
  exact product source.

Those defects could make the page look more comprehensive while making it less
reliable as a knowledge-layer source.

## Released method boundary

The rebuilt tool:

1. Calculates sag in millimetres from fork travel or shock stroke and a target
   percentage selected from the exact product/bike manual.
2. Separates body weight from kit/hydration weight. FOX's selected rear-shock
   first-inflation method uses body weight in pounds; the 2026 FOX 38 chart and
   sag procedure use dressed-rider weight.
3. Uses only the direct published 2026 FOX 38 weight band for the four listed
   FLOAT/Rhythm and standard/e-bike variants.
4. Does not interpolate within a published band or extrapolate outside the
   stated 120–250 lb chart.
5. Applies FOX's body-weight first-inflation method only to the listed 2026
   FLOAT X/FLOAT SL/FLOAT X2 profiles, with the selected shock's stated maximum
   as a hard guard. The result is explicitly not a final bike-specific PSI.
6. Routes RockShox products to Trailhead, as SRAM instructs, while still
   calculating the rider's chosen sag distance.
7. Withholds a generic PSI for other air shocks and a generic spring rate for
   coil shocks.
8. Makes measured sag the target and starting PSI the first input.
9. Removes automatic riding-style and volume-spacer pressure multipliers.
10. Routes tyre-pressure intent to the canonical tyre-pressure calculator.

## Primary sources

- FOX 2026 38 mm owner’s manual:
  <https://tech.ridefox.com/bike/owners-manuals/3103/fork--2026-38mm>
- FOX 2026 FLOAT SL / FLOAT X owner’s manual:
  <https://tech.ridefox.com/bike/owners-manuals/3098/sagsetup>
- FOX 2026 FLOAT X2 owner’s manual:
  <https://tech.ridefox.com/bike/owners-manuals/3023/shock--2026-float-x2>
- SRAM/RockShox suspension manual:
  <https://docs.sram.com/en-US/publications/5ODr3E6BhL1uWDnWhq4ATB/UM%20-%20Suspension>
- RockShox Trailhead:
  <https://trailhead.rockshox.com/>

The page is independent and not affiliated with FOX, SRAM or RockShox.
Product names identify which official source profile the rider selected.

## Discovery and measurement

- Keep `/tools/shock-pressure` in the segmented sitemap and curated IndexNow
  submission.
- Describe it explicitly in both LLM discovery documents as the canonical
  suspension calculator and state what it refuses to infer.
- Track AI benchmark prompts 302–305 for calculator, FOX/RockShox, full-system
  setup and fork-only intent.
- URL Inspection remains read-only unless the site owner explicitly approves
  a manual Request indexing action.

Post-release comparisons against the 24 August baseline:

- 2 September 2026: indexing/rendering and query-owner check;
- 9 September 2026: early CTR and query-mix check;
- 26 September 2026: 28-day clicks, impressions, CTR and position comparison;
- 24 November 2026: full three-month like-for-like comparison.

Success means preserving the strong exact-query positions while improving
CTR and coverage for the broader FOX, RockShox, setup and sag query families.
No conclusion should be drawn from the first few days of recrawl volatility.
