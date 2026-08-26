# Masters VO2max and nutrition child-hub authority release — 26 August 2026

## Decision

Preserve both established URLs and strengthen their distinct supporting jobs under the canonical `/masters` owner:

- `/masters/vo2max` owns the masters-specific VO2max decision: verify the signal, identify the event limiter, choose a repeatable interval dose and recognise the clinical boundary.
- `/nutrition/masters` owns the broad masters nutrition audit across energy, carbohydrate, protein, body composition and qualified handoff.

Do not redirect either URL. Neither page is the broad owner for `masters cycling`, a generic VO2max workout library, the canonical protein guide or an individual nutrition prescription.

## Google Search Console baseline

Exact-page performance, 25 May–24 August 2026:

| Page | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| `/masters/vo2max` | 2 | 69 | 2.9% | 5.6 |
| `/nutrition/masters` | 2 | 141 | 1.4% | 16.1 |

The VO2max page has an early ranking foothold but insufficient discovery. The nutrition page has more impressions but sits outside dependable first-page visibility. Both require stronger evidence, clearer ownership and better extractable answers rather than URL replacement.

Read-only URL Inspection on 26 August 2026 showed both URLs as **URL is on Google**, **Page is indexed**, served over HTTPS and carrying a valid breadcrumb enhancement. No request-indexing action was triggered.

## Problems found

The previous VO2max hub presented these conditional or population-level claims as universal rules:

- VO2max is always the first capacity to decline after 40;
- trained masters cyclists lose 0.5% per year and others lose 1%;
- two or three sessions above 90% maximum heart rate are the highest-return work;
- masters riders require exactly 72 hours between hard sessions;
- 5 × 5 is the best default workout and older riders need a fixed rep reduction.

The previous nutrition hub presented these claims as universal masters requirements:

- every masters cyclist develops the same actionable anabolic resistance;
- 1.6–2.2 g/kg/day, four equal feedings and 30–40 g per meal are compulsory;
- pre-sleep casein is one of the highest-value habits for all masters riders;
- aggressive restriction after 40 has one predictable body-composition outcome;
- improved leanness follows automatically from fuelling and protein changes.

## Evidence boundary

VO2max sources now distinguish small longitudinal cohorts, cross-sectional observations, older-adult intervention trials and synthesis:

- <https://pubmed.ncbi.nlm.nih.gov/2361923/>
- <https://pubmed.ncbi.nlm.nih.gov/11581561/>
- <https://pubmed.ncbi.nlm.nih.gov/11844000/>
- <https://pubmed.ncbi.nlm.nih.gov/36972981/>
- <https://pubmed.ncbi.nlm.nih.gov/36078762/>

Nutrition sources now distinguish masters-athlete evidence from acute older-adult physiology, small feeding trials and the REDs health framework:

- <https://pubmed.ncbi.nlm.nih.gov/39940356/>
- <https://pubmed.ncbi.nlm.nih.gov/25056502/>
- <https://pubmed.ncbi.nlm.nih.gov/28318687/>
- <https://pubmed.ncbi.nlm.nih.gov/28855419/>
- <https://bjsm.bmj.com/content/57/17/1073>
- <https://pubmed.ncbi.nlm.nih.gov/31581498/>

## Release requirements

- Preserve both canonicals and existing internal links.
- Add named reviewer and `2026-08-26` review date.
- Surface primary/review references with population and inference limits.
- Add `dateModified`, `reviewedBy` and `citation` to CollectionPage JSON-LD.
- Replace fixed rules with extractable decision frameworks and clinical handoffs.
- Rebuild the two featured research articles so their titles, excerpts, reviewed claims and body copy cannot reintroduce the retired rules through hub cards or `hasPart` relationships.
- Register both narrow jobs under the `/masters` search owner.
- Add both URLs to AI discovery files, recurring IndexNow submission and benchmark prompts 310–311.
- Measure exact-page clicks, impressions, CTR and position against this baseline after 28 and 90 days.

## Measurement questions

1. Does `/masters/vo2max` gain impressions for masters-specific VO2max and after-40 interval questions without displacing the canonical cycling VO2max interval guide?
2. Does `/nutrition/masters` move toward page one for broad masters cycling nutrition searches while the protein and body-composition guides retain their narrower jobs?
3. Do AI answers cite the hub for evidence limits rather than repeat a fixed decline, recovery or protein rule?
4. Do click-through rates improve once titles describe the decision and evidence job rather than “complete hub” language?
