# Training-expert child pages — evidence and intent boundaries

**Decision date:** 26 August 2026  
**GSC property:** `sc-domain:roadmancycling.com`  
**Baseline window:** 24 May–23 August 2026  
**Release pages:** Joe Friel, Dan Lorang and Dylan Johnson training-method articles

## Decision

Keep each established URL indexable and give it one source-specific job. Do not redirect the child pages into the comparison or broad training-plan owner without complete page-level GSC evidence.

| Intent                                    | Destination                                              |
| ----------------------------------------- | -------------------------------------------------------- |
| Roadman coached training-plan service     | `/training-plans`                                        |
| General training-plan methodology         | `/topics/cycling-training-plans`                         |
| Friel/Lorang/Johnson comparison           | `/blog/cycling-training-plan-build-friel-lorang-johnson` |
| Joe Friel interview framework             | `/blog/joe-friel-perfect-cycling-training-week`          |
| Dan Lorang amateur framework              | `/blog/dan-lorang-amateur-training-plan`                 |
| Dylan Johnson 2025 oscillation experiment | `/blog/dylan-johnson-oscillation-training-plan`          |

## Available search signals

The parent comparison recorded 44 clicks, 3,294 impressions, 1.3% CTR and average position 14.7 across 68 GSC query rows. Named demand included `joe friel training plans` (2 clicks / 19 impressions), `lorang method` (1 / 27), `dylan johnson training plans` (0 / 36) and `the lorang system` (0 / 33).

For the exact broad query `cycling training plan`, the Joe Friel child article recorded 1 click / 49 impressions in the baseline while the parent comparison recorded 1 / 4. Sitewide `dan lorang training plan` produced 12 clicks / 53 impressions in the contains-`training plan` dataset.

The captured snapshot did not preserve complete page-level totals for both source-specific child URLs. That missing evidence is a reason to retain their URLs and narrow their content, not a reason to redirect them.

## Evidence problems found

### Joe Friel page

The previous article converted a conditional interview into a universal “perfect” plan. It attributed an 80/20 rule to Friel, prescribed five days and a twelve-week minimum for everyone, presented one A race as a hard maximum, treated a nine-day cycle as better for masters riders and inferred a fixed durability test.

The complete transcript says there is no perfect distribution of ten hours for everybody and asks about lifestyle before giving a five-day example. Friel's taper and build lengths are typical coaching estimates. Anthony Walsh introduced 80/20 in the interview; Friel did not assign a universal ratio.

### Dan Lorang page

The page had already received a transcript and current-role review. This release retains its source boundaries and adds explicit ownership through `primaryHub: cycling-training-plans`.

### Dylan Johnson page

The previous article converted Johnson's elite 2025 self-experiment into a direct amateur framework, invented a 14–18-hour/6–8-hour scaled template, made two intensity days a constant, treated early power numbers as support and presented fatigued sprinting as universally more transferable.

In the source transcript, Johnson says the exact oscillation sequence is not the gold standard, lacks good research, is not represented by a study he knows and had not yet been tested against the target season. His 30–35/10–15-hour sequence remains an elite N=1 report.

## Release contract

- Preserve all three URLs and publication dates.
- Add source-specific metadata, `primaryHub`, reviewer and 26 August 2026 review dates.
- Use the complete Roadman transcripts as primary evidence for interview attribution.
- Separate expert statement, coaching framework, N=1 experiment and systematic-review evidence.
- Route broad methodology and commercial intent to their canonical owners.
- Add the child pages to pinned LLM discovery, benchmark prompts 266–267 and IndexNow.
- Do not publish a percentage-scaled Johnson template or universal Friel ratio.

## Measurement

| Cohort                     | Dates                       | Earliest useful read | Purpose                                         |
| -------------------------- | --------------------------- | -------------------- | ----------------------------------------------- |
| Seven complete days        | 27 August–2 September 2026  | 5 September 2026     | Recrawl, title adoption and broad-query leakage |
| Twenty-eight complete days | 27 August–23 September 2026 | 26 September 2026    | Named-query CTR, position and page ownership    |

Track each landing page plus `joe friel training plan`, `joe friel training week`, `dan lorang training plan`, `dylan johnson training plan` and `dylan johnson oscillation training`. Success means stronger source-specific query matching while broad commercial `cycling training plan` visibility consolidates on `/training-plans`.

## Guardrails

- Do not merge or redirect child URLs until complete query/page evidence is reviewed.
- Do not call a coaching example scientifically proven.
- Do not convert an N=1 experiment into a universal recommendation.
- Preserve dates and role context so historical interviews are not silently updated.
- Recheck exact source language before restoring any removed numerical claim.
