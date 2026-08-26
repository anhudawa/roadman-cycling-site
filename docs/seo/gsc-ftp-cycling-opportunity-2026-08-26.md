# FTP cycling search-owner decision

**Decision date:** 26 August 2026

**Source:** Google Search Console Performance for `sc-domain:roadmancycling.com`

**Window:** Three months through 24 August 2026

## Decision

- `/topics/ftp-training` owns the broad **ftp cycling**, **what is FTP in cycling** and FTP-overview intent.
- `/tools/ftp-zones` owns the unqualified calculator and seven-zone output.
- `/answers/ftp-test-guide` owns broad protocol selection and result interpretation.
- `/tools/ftp-test` owns fixed-equation test-result conversion.
- `/blog/how-to-improve-ftp-cycling` owns improvement tactics.
- `/blog/ftp-benchmarks-by-age-and-experience` owns experience-qualified comparisons.
- `/blog/age-group-ftp-benchmarks-2026` owns age-qualified comparisons.
- `/glossary/ftp` permanently redirects to the broad topic owner. The glossary feed, index, APIs and knowledge graph already resolve canonical glossary paths through the shared helper.

The benchmark reports keep their URLs and established demand. Their copy now identifies the broad owner explicitly and keeps the two benchmark lenses separate.

## Exact-query baseline: `ftp cycling`

| Metric           | Baseline |
| ---------------- | -------: |
| Clicks           |       15 |
| Impressions      |    2,332 |
| CTR              |     0.6% |
| Average position |      6.9 |

Search Console reported the following page split. Page-level impressions are not additive because one result set can contain or attribute more than one site URL.

| URL                                          | Clicks | Impressions |  CTR | Position | Assigned role                         |
| -------------------------------------------- | -----: | ----------: | ---: | -------: | ------------------------------------- |
| `/blog/ftp-benchmarks-by-age-and-experience` |      8 |         640 | 1.2% |      6.5 | Experience benchmark support          |
| `/topics/ftp-training`                       |      7 |       1,637 | 0.4% |      6.8 | Broad definition and navigation owner |
| `/blog/age-group-ftp-benchmarks-2026`        |      0 |          90 |   0% |      6.9 | Age-qualified benchmark support       |
| `/glossary/ftp`                              |      0 |          65 |   0% |     27.9 | Retired duplicate definition          |
| `/blog/how-to-improve-ftp-cycling`           |      0 |          31 |   0% |      1.4 | Improvement-specific support          |

The intended broad hub already held most impressions, but the experience report held more clicks and the glossary duplicated the definition. This release strengthens the existing owner rather than creating another URL.

## Trust and answer-layer changes

- Replaced the old “FTP equals one-hour power” certainty with an operational definition and explicit measurement limits.
- Added a method table covering sustained efforts, 20-minute estimates, ramp tests and modelled detection.
- Distinguished FTP from critical power and laboratory thresholds.
- Added time-to-exhaustion and power-duration context so one number is not presented as a complete rider profile.
- Replaced universal training distributions, fixed sessions and guaranteed improvement windows with rider- and event-specific decision questions.
- Added seven visible primary or official references, structured-data citations, Anthony Walsh's scoped review and correction/editorial links.
- Added a task map linking every major FTP intent to one owner.
- Added a `DefinedTerm` entity at the canonical topic URL and retired the duplicate glossary URL.
- Updated AI discovery text, the priority IndexNow set and the monthly AI-citation benchmark.

## Measurement plan

### Seven-day directional check — earliest 5 September 2026

- Confirm Google has recrawled `/topics/ftp-training` and the glossary redirect.
- Compare the exact-query page mix for `ftp cycling` and `what is ftp in cycling`.
- Look for the topic owner gaining click share without suppressing the qualified benchmark reports.
- Treat title and snippet movement as directional because recrawl timing will vary.

### Twenty-eight-day decision check — earliest 26 September 2026

- Compare clicks, impressions, CTR, position and owner share with this baseline and a matched preceding period.
- Success means the topic page is the dominant broad-intent click owner, while experience and age modifiers continue to land on their specialist reports.
- If the experience report still wins the unqualified query, inspect the exact variants and snippets before changing its canonical or redirecting an established asset.
