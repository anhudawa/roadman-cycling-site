# Cycling podcast hub search opportunity — 25 August 2026

## Scope

Read-only Google Search Console review for the `sc-domain:roadmancycling.com`
property. Search type was Web and the date range was 24 May–23 August 2026.
No validation, URL-inspection or indexing control was used.

## Page-level demand

`/podcast` recorded:

- 47 clicks
- 5,250 impressions
- 0.9% CTR
- average position 8.7

The leading visible queries were:

| Query | Clicks | Impressions |
| --- | ---: | ---: |
| `roadman podcast` | 5 | 562 |
| `roadman cycling podcast` | 4 | 171 |
| `the roadman podcast` | 2 | 209 |
| `roadmancycling` | 2 | 78 |
| `the roadman cycling podcast` | 1 | 80 |
| `gih sauri` | 1 | 48 |
| `roadman cycling` | 0 | 239 |
| `podcast for cyclists 2025` | 0 | 186 |
| `cycling nutrition podcast` | 0 | 52 |
| `podcast for cyclists 2024` | 0 | 30 |

Lower rows contained `best cycling podcasts` and natural-language requests for
podcasts to listen to while training, but also many irrelevant meanings of
“roadman”, unrelated archive terms and adult queries. The ambiguity is not a
reason to repeat the head term. The page needs a more explicit cycling-training
entity, topic graph and archive function.

## Search ownership

- `/podcast` owns The Roadman Cycling Podcast entity, show page, broad cycling
  podcast intent and on-site episode archive.
- Individual `/podcast/[slug]` pages own their specific episode, guest and
  discussion claims.
- `/blog/best-cycling-podcasts-2026` owns category comparison and independent
  listening recommendations.
- `/guests` owns named expert and guest discovery.
- `/watch` owns cycling podcast video discovery.

## Problems in the previous version

The page described the archive as searchable, but the client search and topic
filters received only the 20 episodes on the current pagination page. A listener
could not find an older guest or topic without manually opening page after page.

The search snippet led with lifetime downloads rather than the subjects a
non-brand listener wanted. PodcastSeries schema used a generic `Sports` genre,
only three hard-coded sameAs links and no topical `about`, audience or
disambiguating description. The visible start paths did not include nutrition
or bike fit despite relevant query demand and a large supporting corpus.

## Decision

1. Search and filter the complete on-site episode index while preserving the
   20-item default pagination and limiting one active result view to 100 cards.
2. Change the page-one title to the exact Roadman entity plus training,
   nutrition and racing; move scale proof into the description and page body.
3. State the full-archive behaviour next to the search box.
4. Add visible start paths for FTP/training, nutrition, masters, bike fit,
   guests and the independent cycling-podcast comparison.
5. Declare page/episode/comparison ownership in visible copy.
6. Strengthen PodcastSeries and CollectionPage schema with topic, audience,
   genre, keywords, central sameAs links and a cycling-performance
   disambiguating description.

## Measurement

At the 7-day and 28-day checkpoints, compare clicks, impressions, CTR and
average position for `/podcast`. Monitor brand variants; `cycling podcast`,
`podcast for cyclists`, `cycling training podcast`, `cycling nutrition podcast`,
masters and bike-fit podcast queries; archive-search engagement; clicks to
topic, guest, video and comparison owners; and whether irrelevant roadman/adult
query impressions decline.
