# Heat-training search consolidation — 26 August 2026

## Decision

Keep and strengthen the established owner:

`/blog/heat-training-cyclists-30-watts-ftp-protocol`

Permanently redirect the three later broad or at-home duplicates to that URL:

- `/blog/cycling-heat-training-guide`
- `/blog/cycling-heat-training-protocol-at-home`
- `/blog/heat-training-indoor-trainer-cyclists`

Keep the acclimation, race-day, heat-illness and masters pages live because they
answer distinct specialist intents. Retire the duplicate hot-weather-safety
answer and redirect it to the heat-illness guide.

## Google Search Console baseline

Source: Google Search Console Performance, page and query views for 24 May–23
August 2026, captured on 26 August 2026.

| Page | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| `/blog/heat-training-cyclists-30-watts-ftp-protocol` | 280 | 9,395 | 3.0% | 6.4 |
| `/blog/heat-training-indoor-trainer-cyclists` | 22 | 1,520 | 1.4% | 8.1 |
| `/blog/cycling-heat-training-guide` | 12 | 1,730 | 0.7% | 17.4 |
| `/blog/cycling-heat-performance-adaptation-guide` | 11 | 1,330 | 0.8% | 7.2 |

The established owner was the strongest broad-intent page by a wide margin. Its
leading queries were:

| Query | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| `heat training cycling` | 54 | 1,249 | 4.3% | 4.5 |
| `heat training protocol cycling` | 18 | 132 | 13.6% | 4.2 |
| `cycling heat training` | 15 | 336 | 4.5% | 5.0 |
| `cycling heat training protocol` | 11 | 80 | 13.8% | 4.3 |
| `heat training for cyclists` | 7 | 87 | 8.0% | 5.2 |

The at-home duplicate did not resolve as a meaningful owner in the captured page
comparison. Search Console metrics are rounded as displayed and page impressions
must not be added as if they were unique searches.

## Problems found

- Four pages competed for broad heat-training or at-home protocol intent.
- The winning URL itself promised a universal 20-to-30-watt FTP gain from a
  narrow study in 18 male elite cyclists after altitude.
- Several pages converted study protocols into unsupervised heater, closed-room,
  no-fan, overdressing, duration, power and fluid prescriptions.
- Race and training-camp guides repeated those claims, creating a site-wide
  consistency and safety problem.
- Heat-stroke guidance relied too heavily on sweating status or consumer
  temperature readings and lacked a clear emergency boundary.
- Female and older-adult evidence limits were not made visible.

## Changes prepared

- One canonical evidence guide for broad heat-training intent, retaining the URL
  with the strongest query history while explicitly rejecting its old watt claim.
- Permanent redirects and direct internal-link updates for the three duplicates.
- Distinct support pages for acclimation planning, race-day pacing and cooling,
  heat-illness response, and masters-specific risk.
- Primary or authoritative sources from consensus statements, systematic reviews,
  PubMed, ACSM, CDC and NHS, with population and certainty limits shown.
- A rebuilt heat answer layer, topic hub and terminology set using the same
  evidence and safety boundaries.
- AI-crawler priority mapping, benchmark prompts and IndexNow recrawl coverage for
  the canonical cluster.

## Measurement

- 7-day cohort: 27 August–2 September 2026; earliest reliable review
  **5 September 2026**.
- 28-day cohort: 27 August–23 September 2026; earliest reliable review
  **26 September 2026**.

Track page-level clicks, impressions, CTR and average position for the canonical
owner and the four specialist pages. Segment broad queries such as `heat training
cycling`, `cycling heat training`, `heat training for cyclists` and `cycling heat
training protocol`; verify that broad impressions migrate to the canonical owner
while specialist queries remain with their intended page.

Confirm every retired URL returns a permanent redirect, the five live pages return
200 and self-canonicalise, and all five remain discoverable through the topic hub,
sitemap and AI-crawler files. Manual Google URL inspection and “Request indexing”
remain separate approved actions. IndexNow does not submit to Google.
