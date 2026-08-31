# GSC decision: cycling recovery search owner

Date: 2026-08-31
Property: `sc-domain:roadmancycling.com`
Window: latest three months (2026-05-30 to 2026-08-29)

## Decision

Keep `/blog/cycling-recovery-tips` as the broad cycling-recovery owner and permanently redirect `/blog/recovery-for-cyclists-world-tour-protocols` to it.

The shorter URL is already the recovery pillar’s canonical handoff, is linked by the app-acquisition contract, and matches the broad query family. The later “World Tour protocols” page overlaps the same intent and contains claims that are too prescriptive for the supporting evidence. Its useful professional-routine angle is retained as a bounded section in the owner.

## Search evidence

| Page | Clicks | Web impressions | CTR | Average position | Google AI-feature impressions |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/blog/cycling-recovery-tips` | 26 | 3,633 | 0.7% | 12.0 | 1,011 |
| `/blog/recovery-for-cyclists-world-tour-protocols` | 47 | 4,230 | 1.1% | 10.5 | 830 |
| **Combined owner opportunity** | **73 clicks** | **7,863 web impressions** | — | — | **1,841 Google AI-feature impressions** |

Visible owner queries included:

- `cycling recovery tips`
- `improve cycling recovery`
- `cycling recovery`
- `recovery strategies for cyclists`
- `how do pro cyclists recover quickly`
- `recovery tips and hacks for cyclists`
- `how to recover faster from cycling`
- `road cycling recovery tips`

## Editorial changes

- Rebuilt the owner around a 60-second after-ride decision table and an evidence-ranked recovery hierarchy.
- Separated rapid-turnaround carbohydrate guidance from ordinary post-ride eating.
- Removed universal 30-minute, 48-hour, 72-hour, eight-hour and 4:1 rules.
- Bounded active recovery, sleep, HRV, cold water, massage and compression claims to the cited evidence.
- Preserved “how professionals recover” as a logistics-and-consistency section rather than an endorsement of unverified named-rider protocols.
- Routed the owner to `/app?source=recovery-guide`, which remains inside the single `app-waitlist` Beehiiv audience.
- Added AI benchmark prompt 358 and pinned the owner in the LLM discovery documents.

## Measurement

Track the consolidated owner after recrawl for:

- combined clicks and impressions versus the two-page baseline;
- movement from average positions 10.5–12 into the first-page click zone;
- CTR on the broad recovery query family;
- Google AI-feature impressions versus the 1,841 combined baseline;
- attributed app-waitlist conversions from `recovery-guide`.
