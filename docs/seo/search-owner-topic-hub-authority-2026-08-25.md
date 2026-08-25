# Search-owner authority flow — 25 August 2026

## Problem

Roadman articles already declared an editorial `primaryHub`, and the blog
template linked visibly to that topic hub. The canonical search-owner link and
`BlogPosting.isPartOf` relationship were resolved separately from titles,
descriptions and keywords. That left 121 articles in the coaching, masters and
training-plan topic families without a relationship to their canonical owner.

This mattered most for the owner pages that need more authority and coverage
against the 24 August Search Console baseline:

| Owner | Baseline clicks | Baseline impressions | Baseline position |
| --- | ---: | ---: | ---: |
| `/coaching` | 26 | 903 | 23.5 |
| `/masters` | 2 | 106 | 19.5 |
| `/training-plans` | 2 | 49 | 6.5 |

## Decision

Use explicit editorial hub membership as a **fallback** search-owner signal:

| Editorial hub | Canonical owner |
| --- | --- |
| `cycling-coaching` | `/coaching` |
| `masters-cycling` | `/masters` |
| `cycling-training-plans` | `/training-plans` |

Metadata matching still runs first. A narrower family therefore wins: the
training-camp preparation guide remains owned by `/training-camps` even though
its methodology belongs to the cycling-training-plans topic hub.

The shared blog template now emits the same decision in two places:

1. a visible, tracked link to the canonical owner; and
2. the owner's stable WebPage `@id` in `BlogPosting.isPartOf`.

## Coverage change

The strict ownership audit reports:

| Owner | Before | After | Added |
| --- | ---: | ---: | ---: |
| `/coaching` | 96 | 167 | 71 |
| `/masters` | 89 | 97 | 8 |
| `/training-plans` | 91 | 133 | 42 |
| `/training-camps` | 8 | 8 | 0 |
| `/podcast` | 712 | 712 | 0 |

Total new owner relationships: **121**. The audit remains at zero errors and
zero review items across 1,827 documents.

## Verification

- Representative content tests cover coaching, masters and training-plan
  fallbacks plus the narrower training-camp override.
- The full test suite passes.
- TypeScript and changed-file linting pass.
- The production build renders the expected tracked link and owner WebPage
  `@id` for all four representative articles.

Measure owner impressions, position, CTR and assisted owner-link clicks at the
fixed seven-day and 28-day checkpoints in the GSC measurement runbook.
