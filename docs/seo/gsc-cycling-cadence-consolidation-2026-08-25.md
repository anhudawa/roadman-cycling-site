# Cycling cadence search consolidation — 25 August 2026

## Search Console evidence

Source: Google Search Console, `sc-domain:roadmancycling.com`, Web search,
24 May–23 August 2026.

Queries containing `cadence` recorded **71 clicks, 7,030 impressions, 1.0% CTR
and average position 12.0**. The leading editorial pages in that query family
were:

| URL | Clicks | Impressions | Role after release |
| --- | ---: | ---: | --- |
| `/blog/cycling-cadence-by-age-masters` | 26 | 2,686 | Age and masters-specific answer |
| `/blog/cycling-cadence-optimal-guide` | 18 | 3,537 | General cadence chart and optimal-RPM owner |
| `/blog/low-cadence-training-cycling-torque-intervals` | 12 | 677 | Low-cadence session owner |
| `/blog/cycling-cadence-optimal-rpm-guide` | 0 | 210 | Retired general duplicate |
| `/blog/cycling-cadence-finding-your-optimal-rpm-guide` | 0 | 148 | Retired general duplicate |

The exact query `cycling cadence chart` recorded **15 clicks, 345 impressions,
4.3% CTR and average position 6.8**. Google assigned 14 clicks and 287
impressions to the masters page, while the intended general guide recorded one
click and 67 impressions. The exact query `average cadence cycling` showed the
same routing problem: two clicks and 246 impressions on the masters page versus
zero clicks and 51 impressions on the general guide.

## Page baselines

The same three-month exact-page reports showed:

| URL | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| `/blog/cycling-cadence-optimal-guide` | 239 | 33,311 | 0.7% | 7.4 |
| `/blog/cycling-cadence-by-age-masters` | 253 | 22,010 | 1.1% | 6.9 |
| `/blog/cycling-cadence-optimal-rpm-guide` | 23 | 4,280 | 0.5% | 10.4 |
| `/blog/cycling-cadence-finding-your-optimal-rpm-guide` | 10 | 2,040 | 0.5% | 14.0 |

The two July duplicates target the same general question as the January owner.
Simple body-term cosine similarity was 0.885 between the incumbent and
`optimal-rpm-guide`, 0.860 between the incumbent and
`finding-your-optimal-rpm-guide`, and 0.919 between the two later pages.

## Release decisions

1. Keep `/blog/cycling-cadence-optimal-guide` as the established general owner
   and make its title, opening, answer capsule and chart explicitly answer
   general cadence and RPM intent.
2. Keep `/blog/cycling-cadence-by-age-masters` for the distinct age question,
   but remove the unsupported rule that every masters rider should add 5–10 rpm.
3. Permanently redirect the two later general duplicates to the incumbent and
   remove them from active content and topic routing.
4. Preserve separate pages for cadence self-testing and drills, cadence
   training, climbing cadence and low-cadence interval prescription.
5. Replace anonymous or overconfident assertions with dated review signals,
   named accountability and direct links to primary studies.
6. Update the cadence topic hub, calculator path, IndexNow set and AI benchmark
   prompts to reinforce the same owner split.

## Claims removed or narrowed

- no universal 90-rpm target;
- no claim that most recreational cyclists are 5–10 rpm too low;
- no claim that masters cyclists should ride 90–100 rpm on the flat or add
  5–10 rpm solely because of age;
- no claim that higher cadence categorically protects ageing joints;
- no claim that professional cadence should be copied by amateurs; and
- no guaranteed VO2max or FTP return from a cadence drill.

## Measurement

- Release date: 25 August 2026.
- First directional checkpoint: seven complete days after release, no earlier
  than 3 September 2026.
- Primary checkpoint: 28 complete days after release, no earlier than
  24 September 2026.
- Re-run the queries-containing-`cadence` report, both exact page reports and
  the exact queries `cycling cadence chart`, `average cadence cycling`,
  `cycling cadence`, `optimal cycling cadence` and `cycling cadence by age`.
- Success means general impressions consolidate toward the general owner while
  the masters URL retains or grows genuinely age-qualified demand.

