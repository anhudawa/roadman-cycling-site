# Off-season cyclist strength owner — 31 August 2026

## Search Console baseline

Google Search Console was read while signed in to the `roadmancycling.com`
domain property. The window is the three months ending 29 August 2026.

### Web search

`/blog/off-season-gym-routine-cyclists-12-week-block` recorded:

- 45 clicks;
- 2,060 impressions;
- 2.2% CTR; and
- average position 11.6.

Leading visible queries included:

| Query | Clicks | Impressions |
| --- | ---: | ---: |
| `12-week strength training program for cyclists` | 3 | 26 |
| `12 week strength training program for cyclists` | 2 | 17 |
| `gym routine for cyclists` | 1 | 5 |
| `off season cycling training` | 0 | 14 |
| `cycling off season training plan` | 0 | 14 |
| `barbell rows for cyclists` | 0 | 11 |

### Google AI features

The same article recorded 806 impressions in Google's generative-AI features.
The article URL accounted for 805; its generated Open Graph image accounted
for one.

### Query-family overlap

The exact query filter `off season cycling training` produced 72 impressions
and no clicks across four Roadman URLs. The visible pages were:

- `/blog/triathlon-off-season-cycling` — 71 impressions;
- `/answers/off-season-strength-training` — 17 impressions;
- `/blog/off-season-gym-routine-cyclists-12-week-block` — 14 impressions; and
- `/blog/off-season-training-cycling-what-to-do-guide` — 7 impressions.

Filtered page totals can exceed the report total because Search Console warns
that tables may be partial when filters are applied. The signal still shows
unclear ownership between triathlon, concise-answer, gym and general-transition
intents.

## Ownership decision

- The 12-week article owns **off-season strength training for experienced
  cyclists who already lift**.
- `/blog/cycling-strength-training-12-week-beginner-plan` owns first-time gym,
  general beginner 12-week and printable-PDF intent.
- `/blog/off-season-training-cycling-what-to-do-guide` owns the full seasonal
  transition from the last event to structured training.
- `/blog/triathlon-off-season-cycling` remains specific to triathletes.
- `/answers/off-season-strength-training` gives the concise answer and routes
  the reader to the experienced or beginner owner rather than duplicating a
  second prescription.

## Changes shipped

1. Rebuilt the experienced-lifter article around the query's direct job: a
   complete two-session template, three-phase progression, bike-week placement,
   recovery rules and measurement.
2. Added evidence-level, review and cited-claim fields. The page separates the
   promising category-level evidence from the untested Roadman 12-week sequence.
3. Removed blanket exercise bans, automatic transfer claims, a mandatory power
   phase and universal frequency or calendar claims.
4. Rewrote the concise answer and the strength section in the general
   off-season guide so both support the canonical experienced-lifter owner.
5. Added an attributed `/app?source=off-season-strength` handoff into the one
   existing Beehiiv app waitlist.
6. Added the article to pinned LLM discovery, AI benchmark prompt 352 and the
   recurring IndexNow release set.

## Evidence boundary

The latest cyclist-only review (PMID 40632222) included 17 studies, 262
participants, interventions of 5–25 weeks and one to three sessions per week.
It found significant group-level effects for cycling efficiency, anaerobic
power and cycling performance, but graded the evidence low certainty and could
not establish an optimal implementation.

The small female-duathlete randomised trial (PMID 28292885) involved 19 trained
participants, with 11 assigned to endurance plus strength and eight to
endurance alone. It supports progressive lower-body strength work as a category;
it does not validate this exact plan or a promised percentage gain.

## Measurement

Do not call an early crawl a ranking result. Compare equivalent trailing
28-day windows only after the refreshed URL has had at least 21 days to be
recrawled and served.

Track:

- clicks, impressions, CTR and average position for the article;
- query ownership for `off season strength training for cyclists`, `off season
  gym routine cycling`, `12 week off season strength cyclists` and the broader
  `cycling off season training plan` family;
- whether beginner 12-week queries move to the beginner/PDF owner;
- Google AI feature impressions for the experienced-lifter article;
- app-waitlist conversion from `roadman-app-waitlist-off-season-strength-*`;
- crawl/index state and canonical selection; and
- month-over-month citations for AI benchmark prompt 352.

