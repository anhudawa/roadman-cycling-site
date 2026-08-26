# Google Search Console decision: Benji Naesen entity consolidation

Decision date: 25 August 2026  
Source: Google Search Console, domain property `roadmancycling.com`  
Decision owner: `/blog/benji-naesen-imposter-syndrome-cycling-weight-loss`

## Why this is the next opportunity

The exact query `benji naesen` recorded **107 clicks, 14,919 impressions, 0.7%
CTR and average position 7.2** in the current three-month Search Console view.
The query already has first-page visibility, but the click-through rate leaves
meaningful headroom.

The page breakdown shows one established owner and two weak competing URLs:

| URL | Clicks | Impressions | CTR | Position | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| `/blog/benji-naesen-imposter-syndrome-cycling-weight-loss` | 107 | 14,901 | 0.7% | 7.1 | Preserve history; make exact entity/interview owner |
| `/blog/benji-naesen-imposter-syndrome-weight-loss-creators` | 0 | 31 | 0% | 20.4 | Permanent redirect to owner |
| `/podcast/ep-2230-benji-naesens-opens-up-about-imposter-syndrome-in-cycling` | 0 | 7 | 0% | 50.9 | Keep for listen/watch/transcript intent |
| `/glossary/lanterne-rouge` | 0 | 1 | 0% | 2.0 | Keep for definition intent |

## Intent ownership after the release

- **Broad name and interview context:** the established blog owner answers who
  Benji Naesen is, verifies his current Lanterne Rouge role and contextualises
  the weight-loss and imposter-syndrome discussion.
- **Entity and appearances:** `/guests/benji-naesen` supplies a ProfilePage and
  Person node, verified sameAs links, current affiliation, key ideas, quotations
  and all Roadman appearances.
- **Listen, watch and transcript:** the episode URL remains the source recording
  and exposes the transcript, claims, quotes and reviewed citations.
- **Lanterne rouge definition:** the glossary URL remains a distinct vocabulary
  page and does not target the person.

## Changes shipped

1. Rewrote the ranking article around the exact entity query with a direct
   answer, quick facts, current role verification, clearer source boundaries
   and a differentiated title and description.
2. Removed unsupported extrapolations about weight regain, hormones and power.
   Naesen's account is now labelled anecdotal rather than presented as a
   universal cycling-weight-loss protocol.
3. Permanently redirected the overlapping second article and updated every
   internal link to the established owner.
4. Corrected the podcast episode title, description, claims and FAQ language;
   added reviewed links to the current official show listings.
5. Added a curated Benji Naesen guest profile with Person sameAs links to the
   official profiles published by the Lanterne Rouge show, plus a current
   Lanterne Rouge Media affiliation.
6. Added the owner, guest page and episode to the priority IndexNow release and
   added AI benchmark prompt 225.

## Measurement protocol

Use 24 August 2026 as the pre-change baseline and annotate the production
deployment date. Compare both the exact query and the three intent URLs.

- **7-day checkpoint:** 25–31 August versus 18–24 August; earliest reliable
  review **3 September 2026** to allow Search Console reporting latency.
- **28-day checkpoint:** 25 August–21 September versus 28 July–24 August;
  earliest reliable review **24 September 2026**.
- Track clicks, impressions, CTR and average position for `benji naesen`.
- Confirm that impressions consolidate on the blog owner rather than moving to
  the redirected article.
- Segment the guest and episode URLs to ensure they gain only their distinct
  biography/appearance and listen/transcript intents.
- Record whether AI benchmark prompt 225 mentions Roadman, cites the owner,
  accurately states Naesen's co-host role and preserves the first-person limits.

## Success and guardrails

The primary success signal is higher non-branded click capture at stable or
better position, not a forced ranking handoff to the guest page. A movement from
0.7% toward 1.5% CTR at the same impression volume would add roughly 119 clicks
per comparable three-month period; this is an arithmetic scenario, not a
forecast.

Do not recreate a second broad Benji Naesen article. New coverage should be
either a genuinely new dated news intent, a distinct Lanterne Rouge topic, or an
addition to the owner, guest profile or source episode.
