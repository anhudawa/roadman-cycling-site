# Podcast hub cold-response fix — 31 August 2026

## Decision

Keep `/podcast` as the canonical Roadman Cycling Podcast entity and archive
owner. Preserve its complete archive search, server-rendered pagination, current
metadata, schema and ownership boundaries. Replace only the request-time data
source that was delaying cold responses.

## Search context

The fixed Search Console baseline recorded on 25 August was 47 clicks, 5,250
impressions, 0.9% CTR and average position 8.7 over 24 May–23 August. The hub
has since been rebuilt around cycling training, nutrition, racing and searchable
archive intent. That recent content release still needs its fixed seven-day
measurement window; this delivery fix does not reset or rewrite it.

## Confirmed production issue

Two anonymous cold-response samples on 31 August took 6.19 and 8.39 seconds to
first byte. The route returned `Cache-Control: private, no-cache, no-store` and
`x-vercel-cache: MISS`. A second request on the same warm server process took
0.36 seconds, isolating cold computation as the dominant problem.

The hub called `getAllEpisodes()` on every cold server process. That function
read and parsed all 818 episode MDX files. The directory is about 35 MB because
many episodes store their complete transcript inside YAML frontmatter. The hub
then discarded almost all of that data and sent only title, guest, description,
date, duration, pillar and type to archive search.

## Change

- Generate a compact transcript-free hub index during every production build.
- Commit the generated index so local, test and preview environments have the
  same deterministic input.
- Load the 357 KB compact index on `/podcast` instead of parsing the 35 MB full
  episode corpus at request time.
- Keep all 818 episodes, their sort order, archive search, filtering,
  pagination, ItemList and PodcastSeries counts unchanged.
- Add a regression test that compares index count with the episode corpus and
  rejects transcript-scale fields.

## Release gate

- Generator output count equals the MDX episode count and slugs are unique.
- Type check, lint, podcast owner tests and full production build pass.
- Rendered page retains exact canonical, 818-record search index, archive
  pagination and current structured data.
- Post-release cold samples must materially improve without changing page copy
  or canonical ownership.

## Measurement

Repeat anonymous response samples immediately after release and record the
first cold response separately from warm responses. Keep the existing search
checkpoint dates for the 25 August content change. Ranking decisions should use
complete Search Console cohorts; the performance release is expected to improve
crawl and user delivery, not to create an overnight ranking promise.
