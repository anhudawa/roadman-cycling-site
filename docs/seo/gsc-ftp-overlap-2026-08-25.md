# FTP benchmark overlap — GSC decision record

**Decision date:** 25 August 2026

**Source:** Google Search Console Performance and URL Inspection for `https://roadmancycling.com/`

**Performance window:** 27 July–23 August 2026 (28 days; Search Console last updated approximately 9.5 hours before collection)

## Decision

- `/blog/age-group-ftp-benchmarks-2026` is Roadman's maintained editorial owner for FTP-by-age benchmark intent.
- `/blog/ftp-benchmarks-by-age-and-experience` retains its established URL and now owns training-experience intent: beginner, recreational, club, competitive and elite amateur.
- Three weaker duplicate articles permanently redirect to the maintained age report:
  - `/blog/good-ftp-for-my-age`
  - `/blog/cycling-what-is-a-good-ftp-by-age-guide`
  - `/blog/masters-ftp-benchmarks-cycling-guide`
- `/tools/masters-ftp-benchmark` retains calculator intent; `/answers/ftp-by-age` retains concise answer intent.

## Search Console evidence

The site recorded **357 clicks, 16,737 impressions, 2.1% CTR and average position 8.0** for queries containing `ftp` during the window.

| URL | Clicks | Impressions | Average position | Role after consolidation |
|---|---:|---:|---:|---|
| `/blog/ftp-benchmarks-by-age-and-experience` | 103 | 5,601 | 6.5 | Experience-level benchmark |
| `/blog/age-group-ftp-benchmarks-2026` | 66 | 3,695 | — | Maintained age-banded report |
| `/tools/ftp-zones` | 59 | 2,194 | — | FTP zones calculator |
| `/tools/masters-ftp-benchmark` | 31 | 1,419 | — | Masters benchmark calculator |
| `/answers/ftp-by-age` | 9 | 657 | — | Concise answer |
| `/blog/good-ftp-for-my-age` | 5 | 414 | 11.1 | Redirected |
| `/blog/cycling-what-is-a-good-ftp-by-age-guide` | 0 | 54 | — | Redirected |
| `/blog/masters-ftp-benchmarks-cycling-guide` | 0 | 0 | — | Redirected |

URL Inspection reported `/blog/masters-ftp-benchmarks-cycling-guide` as **not on Google**, **unknown to Google**, with no referring sitemap, referring page or crawl. Its Page-filtered Performance result was zero clicks and zero impressions both for FTP queries and for all queries.

## Content-overlap evidence

Pairwise body-text cosine similarity across the five editorial pages reached **0.804**. The strongest duplicate pairs were:

| Pair | Similarity |
|---|---:|
| Masters guide vs broad “good FTP” guide | 0.804 |
| “Good FTP for my age” vs broad “good FTP” guide | 0.796 |
| Experience page vs masters guide | 0.740 |
| Experience page vs broad “good FTP” guide | 0.736 |

This combination of strong duplication, weak or absent search demand on the later pages, and an established annual canonical justified redirects rather than further indexing attempts.

## Verification requirements

1. All three retired URLs return a permanent redirect to `/blog/age-group-ftp-benchmarks-2026`.
2. The maintained report and experience page return 200, self-canonicalise, and remain in the sitemap.
3. Retired pages are absent from the sitemap and topic maps.
4. The experience page no longer carries age-focused keywords, age FAQs or duplicate age tables.
5. IndexNow includes the two editorial owners plus the calculator and concise answer URL.
