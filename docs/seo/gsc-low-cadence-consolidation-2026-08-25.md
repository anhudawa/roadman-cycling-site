# Google Search Console decision: low-cadence evidence consolidation

Decision date: 25 August 2026

Baseline window: three months ending 24 August 2026

Property: `https://roadmancycling.com/`

## Why this cluster was selected

The established page `/blog/low-cadence-training-cycling-torque-intervals`
recorded **224 clicks, 15,669 impressions, 1.4% CTR and average position 6.3**.
The later page `/blog/low-cadence-training-world-tour-coaches` recorded **45
clicks, 4,550 impressions, 1.0% CTR and average position 7.6**.

Their rendered copy had a cosine similarity of **0.883**. Both pages tried to
answer the same low-cadence and torque-interval question. The incumbent had the
stronger search history and is the canonical owner.

## Query and page evidence

The Search Console filter `queries containing low cadence` recorded **13 clicks,
829 impressions, 1.6% CTR and average position 8.6**. Page distribution was:

| Page | Clicks | Impressions |
| --- | ---: | ---: |
| `/blog/low-cadence-training-cycling-torque-intervals` | 12 | 649 |
| `/blog/cycling-cadence-optimal-guide` | 1 | 171 |
| `/blog/low-cadence-training-world-tour-coaches` | 1 | 120 |

Exact-query checks showed:

| Query | Clicks | Impressions | CTR | Position | Main owner |
| --- | ---: | ---: | ---: | ---: | --- |
| `low cadence cycling` | 1 | 258 | 0.4% | 8.6 | incumbent torque guide |
| `low cadence training cycling` | 1 | 36 | 2.8% | 5.4 | incumbent torque guide |
| `torque intervals cycling` | 5 | 70 | 7.1% | 5.6 | incumbent torque guide |

The incumbent's leading related queries included `torque training cycling` at
7 clicks / 132 impressions, `torque intervals cycling` at 5 / 76 and `low
cadence intervals cycling` at 4 / 49. The later page had no stronger distinct
intent to preserve.

## Content-quality finding

The later page and several supporting pages converted one small trial into
claims the primary paper did not support. The release corrects the authors'
name to Hebisz, the analysed sample to 24 well-trained female cyclists aged
17–20, and the dose to 50–60-rpm maximal sprints plus 60–70-rpm four-minute
intervals at 90–100% maximal aerobic power inside a complete eight-week
polarised programme.

The release also makes clear that:

- group-average changes are not guaranteed individual outcomes;
- the trial did not measure FTP, time-trial performance or muscle fibres;
- proposed recruitment and fibre mechanisms were not directly measured;
- a 22-rider veteran trial using moderate 40-rpm work found no benefit;
- another trained-cyclist trial found improvements in both high- and
  low-cadence groups; and
- knee-load modelling justifies careful progression but does not predict
  injury in an individual.

Primary sources checked:

- Hebisz and Hebisz 2024, PLOS ONE, DOI `10.1371/journal.pone.0311833`
- Kristoffersen et al. 2014, PMID `24550843`
- Whitty et al. 2016, PMID `27175601`
- Bini and Hume 2013, PMID `23898683`

## Implementation decision

1. Keep `/blog/low-cadence-training-cycling-torque-intervals` as the search
   owner and rewrite it as the primary-source evidence and decision guide.
2. Permanently redirect `/blog/low-cadence-training-world-tour-coaches` to the
   owner and remove the retired document from the active corpus.
3. Route all active internal links and topic maps to the owner.
4. Correct repeated research claims in the cadence hub, Roadman Method module,
   training explainers and event guides.
5. Add the owner to the curated IndexNow set and add AI benchmark prompt 223.

## Measurement plan

Do not compare partial post-release days with the baseline.

- Seven-day checkpoint: 25–31 August 2026, earliest reliable review 3
  September 2026.
- Twenty-eight-day checkpoint: 25 August–21 September 2026, earliest reliable
  review 24 September 2026.
- Track the two page URLs, the three exact queries above, queries containing
  `low cadence`, and the broader `torque interval` family.
- Success means the retired URL leaves active results, the owner absorbs its
  impressions, CTR improves without a material position loss, and incorrect
  old claim snippets stop appearing.

Google Search Console validation and manual request-indexing actions remain a
separate, user-approved write step.
