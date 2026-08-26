# Cycling leg-day and gym-exercise search ownership — 26 August 2026

## Decision

Keep the established pages and give each a distinct job:

- `/blog/cycling-leg-day-should-cyclists` owns whether cycling counts as leg
  day, leg-day decisions for cyclists and when to ride after lifting.
- `/blog/cycling-gym-exercises-best` owns named-exercise selection and the
  practical gym routine.
- `/blog/cycling-strength-training-guide` remains the broad strength-training
  evidence and programming owner.
- `/answers/when-to-lift-around-rides` and
  `/answers/best-gym-exercises-for-cyclists` provide short, reviewed answers
  that route readers to the relevant long-form owner.
- `/topics/cycling-strength-conditioning` remains the research library.

No redirect is warranted: both established articles already serve materially
different search demand.

## Google Search Console baseline

Source: Google Search Console Performance, page filters, three-month window
25 May–24 August 2026, captured on 26 August 2026.

| Page | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| `/blog/cycling-leg-day-should-cyclists` | 670 | 63,183 | 1.1% | 6.0 |
| `/blog/cycling-gym-exercises-best` | 394 | 11,600 | 3.4% | 6.1 |

Leading leg-day page queries included:

| Query | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| `leg workout for cyclists` | 6 | 107 | 5.6% | 7.9 |
| `leg day for cyclists` | 6 | 105 | 5.7% | 5.0 |
| `cycling after leg day` | 4 | 309 | 1.3% | 5.8 |
| `cycling legs` | 2 | 565 | 0.4% | 6.7 |
| `leg press for cyclists` | 2 | 95 | 2.1% | 3.7 |
| `best leg exercises for cyclists` | 2 | 95 | 2.1% | 6.8 |
| `is cycling enough for leg day` | 2 | 76 | 2.6% | 3.2 |

High-impression zero-click exact-query checks showed the CTR opportunity:

| Query | Clicks | Impressions | CTR | Position |
| --- | ---: | ---: | ---: | ---: |
| `does cycling count as leg day` | 0 | 175 | 0% | 4.9 |
| `is cycling a leg workout` | 0 | 79 | 0% | 4.7 |
| `cycling on leg day` | 0 | 47 | 0% | 2.6 |

Leading gym-exercise page queries included `gym workout for cyclists`
(23 / 155 / 14.8% / 3.8), `gym exercises for cyclists`
(19 / 200 / 9.5% / 3.6), `gym routine for cyclists`
(18 / 84 / 21.4% / 3.5), `cycling gym workout`
(15 / 530 / 2.8% / 5.2), and `best gym exercises for cyclists`
(15 / 112 / 13.4% / 2.9).

Rows can overlap because Google can show more than one Roadman URL for the
same query. Page and query rows must not be summed into a sitewide total.

## Problems found

- The leg-day article answered multiple intents but did not lead with the
  high-impression question, “Does cycling count as leg day?”
- Both articles treated a fixed eight-exercise list as if research had ranked
  it for every cyclist.
- Unilateral lifts were described as superior because pedalling alternates
  legs, without comparative cyclist outcome evidence.
- Six-to-ten repetitions were presented as a way to guarantee strength without
  hypertrophy, despite overlapping adaptations and reported lean-mass gain in
  an elite-cyclist study.
- Fixed session-frequency and 48-to-72-hour waiting rules were presented as
  universal.
- FTP improvement and injury prevention were implied more strongly than the
  cyclist-performance review supports.
- Short answer pages repeated the same unsafe absolutes and lacked current
  reviewed primary sources.

## Changes prepared

- Rebuilt the leg-day owner around the exact decision, direct answer, current
  evidence, scheduling boundary and query-led FAQs.
- Rebuilt the gym-exercise owner around movement-pattern selection and
  adaptable A/B sessions instead of a sacred exercise list.
- Added human review dates, evidence notes, primary sources, cited-claim tables,
  FAQ and HowTo data to both owners.
- Replaced unsafe claims on five strength answer pages with reviewed, sourced
  answers covering exercise selection, frequency, mass gain, squats and
  strength placement around rides.
- Defined the distinct page jobs in both LLM discovery files, pinned both
  owners, added the cluster to IndexNow and added AI benchmark prompts 300–301.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track page and exact-query clicks, impressions, CTR and average position.
Specifically watch whether the three zero-click queries gain CTR without the
gym-exercise page losing its exercise-selection terms. In AI benchmarking,
check whether prompts 300 and 301 cite the correct owner and preserve these
boundaries: cycling is not identical to progressive resistance training; no
universal best exercise list; no fixed ride-to-lift waiting rule; no automatic
FTP, injury-prevention or zero-mass-gain guarantee.

Manual Google URL inspection and “Request indexing” remain separate approved
actions. IndexNow does not submit to Google.
