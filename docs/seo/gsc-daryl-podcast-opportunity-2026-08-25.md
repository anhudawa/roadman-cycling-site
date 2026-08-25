# Daryl Fitzgerald podcast search opportunity — 25 August 2026

## Scope

Read-only Google Search Console review for the `sc-domain:roadmancycling.com`
property. Search type was Web and the date range was 24 May–23 August 2026.
No validation, URL-inspection or indexing control was used.

## Page-level demand

`/podcast/ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make`
recorded:

- 26 clicks
- 2,892 impressions
- 0.9% CTR
- average position 11.5
- 19 visible query rows

The first visible query rows showed weak entity and topic alignment:

| Query | Clicks | Impressions |
| --- | ---: | ---: |
| `how to penetration testing for cyclists` | 0 | 8 |
| `penetration testing tips for cyclists` | 0 | 6 |
| `matt lemond height` | 0 | 4 |
| `mark watts bike fit` | 0 | 2 |
| `road bike` | 0 | 2 |
| `ride height` | 0 | 1 |

Visible rows do not replace the page total; anonymised query aggregation means
they should not be summed as a complete demand estimate. The irrelevant rows
are nevertheless a useful warning that the old metadata and generated summary
did not define the episode's guest, format and evidence scope clearly enough.

## Content and ownership risk in the previous version

The old title competed with
`/blog/bike-fit-one-change-amateurs-should-make` for the same “one change”
answer intent. Its summary fields also converted interview anecdotes into
universal claims: most amateurs being 5–7mm high, a 7mm change producing a
one-minute gain, pain patterns proving fit errors and shorter cranks causing
20–30W losses.

The raw transcript is valuable primary evidence for what Daryl Fitzgerald said
and must remain intact. The generated title, capsule, takeaways, FAQ, claims and
show notes are editorial layers and should carry evidence labels and clear
search ownership.

## Decision

1. Make the episode the owner for Daryl Fitzgerald podcast, interview, audio,
   video and transcript intent.
2. Make `/blog/daryl-fitzgerald-saddle-height-one-change` the owner for the
   researched saddle-height claim and reversible test.
3. Retitle the episode around the guest and format rather than the generic
   “one bike-fit change” answer.
4. Preserve the verbatim transcript while rewriting the generated editorial
   fields.
5. Label the high-saddle pattern as practitioner observation and the 7mm and
   crank-length stories as individual anecdotes.
6. Connect the episode to the Daryl guest entity, bike-fitting topic, companion
   evidence review and complete bike-fit guide.
7. Use `updatedDate` in the visible evidence-review block as well as metadata,
   schema and sitemaps.

## Measurement

Compare the page at the 7-day and 28-day checkpoints. Watch clicks,
impressions, CTR, average position, Daryl Fitzgerald brand queries, podcast and
transcript queries, irrelevant-query reduction, and whether general
saddle-height intent consolidates on the companion article.
