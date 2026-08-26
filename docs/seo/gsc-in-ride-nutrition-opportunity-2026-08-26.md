# In-ride cycling nutrition search-owner decision — 26 August 2026

## Decision

Keep and rebuild the established complete-guide owner:

`/blog/cycling-in-ride-nutrition-guide`

Keep `/blog/cycling-energy-gels-guide` as the narrower product-format owner,
and keep event-specific plans indexable for their own distance and race-day
jobs. Do not create another generic cycling nutrition guide.

## Google Search Console baseline

Source: Google Search Console Performance, three-month Web data for 24 May–23
August 2026, captured 26 August 2026.

The owner across all queries recorded:

- 184 clicks
- 22,786 impressions
- 0.8% CTR
- average position 7.9
- 297 exposed query rows

### Exact query: `cycling nutrition during ride`

- 3 clicks
- 1,477 impressions
- 0.2% CTR
- average position 7.0

| URL | Clicks | Impressions | CTR | Position | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| `/blog/cycling-in-ride-nutrition-guide` | 2 | 1,470 | 0.1% | 6.9 | Preserve and strengthen complete owner |
| `/blog/how-to-fuel-100-mile-bike-ride` | 1 | 1 | 100% | 11.0 | Preserve distance-specific owner |
| `/topics/cycling-nutrition` | 0 | 26 | 0% | 46.1 | Preserve directory role |
| `/blog/race-day-nutrition-plan-cyclists` | 0 | 1 | 0% | 1.0 | Preserve race-day timeline intent |
| `/blog/pre-ride-breakfast-cyclists-guide` | 0 | 1 | 0% | 3.0 | Preserve pre-ride intent |

The guide captured 1,470 of 1,499 exposed page impressions and two of the three
clicks. The secondary URLs have distinct purposes and negligible overlap, so
the remediation is an owner upgrade rather than redirects.

### Other visible owner queries

| Query | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| `cycling nutrition guidelines` | 0 | 1,563 | 0% | 5.4 |
| `cycling fueling` | 1 | 380 | 0.3% | 18.7 |
| `cycling nutrition plan` | 0 | 466 | 0% | 12.8 |
| `cycling nutrition` | 0 | 429 | 0% | 22.7 |
| `cycling fueling guide` | 2 | 25 | 8% | 7.2 |

The zero-click `cycling nutrition guidelines` query at position 5.4 is the
largest title-and-answer mismatch. It supports a guideline-led search title
while the stable URL continues to own complete during-ride intent.

Search Console warns that filtered card totals and table rows can be partial.
The decision therefore uses owner dominance and distinct user jobs rather than
assuming filtered rows are perfectly additive.

## Trust defects found

The incumbent prescribed one schedule to nearly every rider. It claimed:

- 80–120 g/h for any ride over 90 minutes and 90–120 g/h for every ride over
  three hours;
- one mandatory start time and gel interval;
- a hard glucose absorption ceiling and one universally superior 2:1 ratio;
- a guaranteed 10 g weekly gut-training staircase and comfortable 90 g/h after
  eight weeks;
- 500–750 ml/h of fluid from temperature alone;
- 500–700 mg/h sodium after two hours; and
- “good enough for a Grand Tour stage winner” as evidence for amateur use.

The page had one research link, no current review date, no reviewer, no visible
claim boundary, no hydration or hyponatraemia evidence, no distinction between
established and emerging carbohydrate practice and no reproducible test plan.
It also diverted into café-stop calorie control instead of answering during-
ride nutrition.

## Changes prepared

- Retitled the stable owner `Cycling Nutrition Guidelines: What to Eat During a
  Ride`, combining the two largest demonstrated intents.
- Replaced the universal schedule with separate carbohydrate, fluid and sodium
  decisions derived from session demand and field evidence.
- Separated established 30–60 and up-to-90 g/h ranges from emerging 120 g/h
  research in trained endurance athletes.
- Added individual sweat-rate arithmetic, an overdrinking boundary and the
  exercise-associated hyponatraemia consensus.
- Removed a universal sodium dose and made clear that sodium does not make
  forced fluid intake safe.
- Added six source-bounded claims, six FAQs, named editorial review, a six-step
  HowTo protocol, safety escalation and a course-timeline template.
- Pinned the owner in bounded LLM discovery, added it to the recurring IndexNow
  set and added AI benchmark prompt 241.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track the owner’s total clicks, impressions, CTR, position and query count. For
`cycling nutrition during ride`, success means CTR above 0.1% on the owner and
movement toward the top five without loss of relevant impressions. For
`cycling nutrition guidelines`, the first success threshold is any sustained
click activity at a comparable position; its frozen baseline is zero clicks,
1,563 impressions and position 5.4.

For AI benchmarking, record whether prompt 241 cites Roadman and preserves the
key boundaries: carbohydrate, fluid and sodium are separate targets; 120 g/h
is advanced; fluid is individual; excessive drinking creates risk; sodium does
not cancel overdrinking; and the complete plan must be rehearsed.

Manual Google URL inspection and “Request indexing” remain a separate approved
action. IndexNow does not submit to Google.
