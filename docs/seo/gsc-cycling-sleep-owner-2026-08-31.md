# GSC decision: cycling sleep search owner

Date: 2026-08-31
Property: `sc-domain:roadmancycling.com`
Window: latest three months (2026-05-30 to 2026-08-29)

## Decision

Keep `/blog/cycling-sleep-performance-guide` as the broad sleep-and-cycling owner. Permanently redirect these overlapping broad guides to it:

- `/blog/sleep-cycling-performance-complete-guide`
- `/blog/cycling-sleep-optimisation`
- `/blog/cycling-sleep-optimisation-performance-guide`

The first three established pages divide one query family. The owner has the strongest history, the shortest query-matched URL and an average position of 7.0. The fourth page is a newer protocol duplicate with the same broad intent; retiring it now prevents another competing owner from accumulating.

Keep symptom- and scenario-specific pages live, including sleep apnoea, sleep debt and HRV, masters sleep, caffeine and travel/jet lag.

## Search evidence

| Established page | Clicks | Web impressions | CTR | Average position | Google AI-feature impressions |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/blog/cycling-sleep-performance-guide` | 77 | 19,755 | 0.4% | 7.0 | 4,204 |
| `/blog/sleep-cycling-performance-complete-guide` | 3 | 1,845 | 0.2% | 12.2 | 165 |
| `/blog/cycling-sleep-optimisation` | 22 | 4,004 | 0.5% | 9.1 | 1,675 |
| **Combined owner opportunity** | **102 clicks** | **25,604 web impressions** | — | — | **6,044 Google AI-feature impressions** |

Visible queries included:

- `cycling and sleep`
- `sleep bike`
- `nap cycling`
- `cycling for light sleepers`
- `cycling for heavy sleepers`
- `insomnia tutorial for cyclists`

## Editorial changes

- Rebuilt the owner around a 60-second sleep audit and an individualised decision framework.
- Replaced fixed 7.5–8.5-hour, 9–10-hour and training-volume tables with the adult seven-hour health consensus plus athlete-specific individualisation.
- Removed exact growth-hormone, testosterone, cortisol, deep-sleep percentage and watt-loss claims that exceeded the cited evidence.
- Replaced universal noon caffeine and three-hour evening-training rules with dose-, timing- and response-based guidance.
- Bounded naps and sleep extension to the limited intervention evidence rather than promising one exact protocol.
- Replaced fixed wearable-accuracy percentages with direct comparison evidence against polysomnography.
- Removed melatonin and magnesium dosing advice and added clinical escalation for persistent insomnia, disabling sleepiness and possible sleep-disordered breathing.
- Rebuilt the sleep topic hub so it routes broad intent to the owner and distinct intent to separate guides.
- Routed app interest to `/app?source=sleep-guide`, which remains inside the single `app-waitlist` Beehiiv audience.
- Added AI benchmark prompt 359 and pinned the owner in the LLM discovery documents.

## Measurement

After recrawl, track:

- combined clicks and impressions versus the three-page 102-click and 25,604-impression baseline;
- CTR improvement from the established pages’ 0.2–0.5% range;
- movement from owner average position 7.0 toward the top three;
- Google AI-feature visibility versus the 6,044-impression combined baseline;
- attributed app-waitlist conversions from `sleep-guide`;
- whether all retired URLs fall out of search while the owner absorbs their query families.
