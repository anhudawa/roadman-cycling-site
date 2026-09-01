# Cycling recovery search measurement release — 1 September 2026

## Released

- Executable seven-day and 28-day comparison contract for cycling-recovery search
- Frozen read-only Search Console baselines through 29 August 2026
- Separate clean head-term, broad portfolio and app-product lanes
- Fixed expected owners so measurement cannot silently move the goalposts
- Visible owner-share comparison based only on stored page rows
- Explicit tracking of the known 1,245-impression lower-back confounder
- Guardrails for partial GSC tables, missing positions, release-day contamination, overlapping windows and reporting lag
- Markdown report generation through `npm run seo:recovery:compare`
- Day-7 and day-28 operating runbook

## Verification target

The comparator must accept both frozen baselines, reject measurement-contract drift and produce a report that keeps canonical-owner consolidation separate from broad portfolio fragmentation.

No production page copy, canonical or freshness date changes in this phase.
