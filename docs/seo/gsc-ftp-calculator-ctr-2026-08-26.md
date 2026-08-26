# FTP calculator search-owner decision

**Decision date:** 26 August 2026

**Source:** Google Search Console Performance for `sc-domain:roadmancycling.com`

**Window:** 24 May–23 August 2026 (3 months; Search Console last updated approximately 7.5 hours before collection)

## Decision

- `/tools/ftp-zones` owns the unqualified **FTP calculator** and **FTP zone calculator** intent.
- `/tools/masters-ftp-benchmark` owns the qualified **FTP calculator by age and gender** and masters-percentile intent.
- `/tools/ftp-test` owns protocol-selection and test-result conversion.
- The two main tools now name and link to each other's distinct job. Metadata, headings, body copy and AI discovery use those same roles.
- No redirects are justified: the tools answer different tasks and each has established search demand.

## Exact-query baseline: `ftp calculator`

| Metric | Baseline |
|---|---:|
| Clicks | 44 |
| Impressions | 4,522 |
| CTR | 1.0% |
| Average position | 8.2 |

Top pages reported for the exact query:

| URL | Clicks | Impressions | Assigned role |
|---|---:|---:|---|
| `/tools/ftp-zones` | 29 | 2,218 | General FTP calculator and seven power zones |
| `/tools/masters-ftp-benchmark` | 13 | 2,061 | Qualified age-and-gender benchmark |
| `/tools/wkg` | 2 | 281 | W/kg conversion |
| `/tools/ftp-test` | 0 | 86 | Test-protocol conversion |
| `/blog/ftp-benchmarks-by-age-and-experience` | 0 | 35 | Experience-level editorial benchmark |
| `/blog/age-group-ftp-benchmarks-2026` | 0 | 29 | Age-group editorial report |

The intended general owner received 66% of clicks, but the masters tool appeared almost as often. The primary intervention is clearer intent qualification rather than consolidation by redirect.

## Exact-query baseline: `ftp calculator by age and gender`

| Metric | Baseline |
|---|---:|
| Clicks | 80 |
| Impressions | 1,115 |
| CTR | 7.2% |
| Average position | 4.4 |

Top pages reported for the exact query:

| URL | Clicks | Impressions | Assigned role |
|---|---:|---:|---|
| `/tools/masters-ftp-benchmark` | 66 | 986 | Qualified calculator owner |
| `/blog/ftp-benchmarks-by-age-and-experience` | 13 | 782 | Experience-level support |
| `/blog/age-group-ftp-benchmarks-2026` | 1 | 101 | Age-report support |
| `/tools/ftp-zones` | 0 | 9 | General zones tool; should not own this query |

The masters tool is already the click owner. Its title and H1 now state **FTP calculator by age and gender**, while the general tool explicitly routes this need to it.

## Product and trust corrections

- The general tool now calculates the same range data as the public API instead of maintaining a second copy of the zone table.
- Whole-watt ranges are continuous: the next zone starts one watt after the preceding floored upper boundary.
- The page no longer claims that fixed FTP percentages locate physiological thresholds, that FTP always equals one-hour power, or that a universal 80/20 distribution follows from a seven-zone calculator.
- The visible methodology, FAQ and WebPage citations share one content registry.
- Anthony Walsh's review is scoped to method and primary-source verification; it does not imply laboratory measurement or clinical review.

## Measurement plan

### Seven-day directional check — earliest 5 September 2026

- Compare the exact-query page mix for both queries.
- Confirm that `/tools/ftp-zones` gains share for unqualified `ftp calculator` without reducing the masters tool's qualified clicks.
- Treat movement as directional only; recent recrawling and title rewriting can make a seven-day window noisy.

### Twenty-eight-day decision check — earliest 26 September 2026

- Compare clicks, impressions, CTR, average position and page ownership against this three-month baseline and the matched preceding 28 days.
- Success means higher CTR and click share for `/tools/ftp-zones` on the unqualified query, while `/tools/masters-ftp-benchmark` remains the click owner for the age-and-gender query.
- If overlap persists, inspect the exact variants producing the masters impressions before changing canonicals or redirects.
