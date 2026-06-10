# Episode Coverage Audit

**Date:** 2026-06-10  
**Audited by:** Claude Code  
**Method:** live Anchor podcast RSS (`https://anchor.fm/s/a09110e0/podcast/rss`, fetched 2026-06-10) matched per-episode against `content/podcast/*.mdx`.

> This supersedes the earlier estimate-only version of this file. The earlier pass computed the gap as `1,277 − 709 = 568` and *guessed* the date ranges. This pass actually **fetched the live feed (1,283 items) and matched each one against the site files**, so the missing list is enumerated, not estimated — see `docs/episode-coverage-missing.csv`.

---

## Headline numbers

| Metric | Value |
|---|---|
| **Episodes in the podcast catalog** (live Anchor RSS, canonical) | **1,283** |
| **Podcast pages on site** (`content/podcast/*.mdx`) | **709** |
| &nbsp;&nbsp;— sourced from audio RSS (`source: audio-rss`, GUID-matched) | 369 |
| &nbsp;&nbsp;— sourced from YouTube (`youtubeId`) | 340 |
| **Catalog episodes covered on site** (after matching) | **≈ 639** |
| **Catalog episodes missing from site** | **≈ 644** |
| **Coverage** | **≈ 49.8%** |

> **The "~500 missing" estimate is confirmed — and is slightly conservative.** It corresponds almost exactly to the single large contiguous gap: the daily-episode back-catalog from **Feb 2022 → Dec 2023 = 492 missing episodes**. Counting the whole feed, total missing is **≈ 644 (~50% of the catalog)**.

---

## What's actually missing

The gap is **not** spread evenly. It is overwhelmingly the **2022–2023 daily-podcast back-catalog**, which was never imported by either pipeline.

| Era | Feed episodes | On site | Status |
|---|---|---|---|
| 2019–2021 | 345 | ~344 | ✅ Essentially complete (imported via audio RSS by GUID) |
| **2022–2023** | **592** | **~100** | ❌ **The hole — 492 missing, ~25/month every month** |
| 2024–2026 | 346 | ~195 | ◐ Long-form covered by YouTube; ~152 short audio-only dailies missing (low value) |

**The cutover, in one sentence:** the site switched from **audio-RSS import (2019–2022)** to **YouTube import (2023→)**, and the **daily audio episodes from Feb 2022 through Dec 2023 fell through the crack between the two pipelines** — YouTube only carried the long-form interviews/vlogs from those years, not the daily audio episodes.

---

## Source breakdown (site files)

| Source | Count | Date range |
|---|---|---|
| Audio-RSS (`source: audio-rss`, has `rssGuid`) | 369 | 2019-01 → 2022-02 |
| YouTube (`youtubeId`) | 340 | 2016-09 → 2026-06 |
| **Total** | **709** | |

The two sources are essentially non-overlapping by era: audio-RSS handled 2019–early-2022, YouTube handled 2023→. ~70 of the YouTube pages (incl. the 2016–2017 uploads) predate or sit outside the Anchor feed entirely — i.e. they're site content that is *not* counted in the 1,283 catalog.

---

## Missing episodes by month

Complete month-by-month count of catalog episodes with **no** page on the site. Full per-episode list (date, duration, title, GUID) is in **`docs/episode-coverage-missing.csv`** (644 rows).

| Month | Missing | Month | Missing | Month | Missing |
|---|---|---|---|---|---|
| 2022-02 | 10 | 2023-01 | 25 | 2024-07 | 4 |
| 2022-03 | 23 | 2023-02 | 21 | 2024-08 | 6 |
| 2022-04 | 22 | 2023-03 | 23 | 2024-09 | 8 |
| 2022-05 | 25 | 2023-04 | 21 | 2024-10 | 5 |
| 2022-06 | 25 | 2023-05 | 23 | 2024-11 | 8 |
| 2022-07 | 26 | 2023-06 | 19 | 2024-12 | 6 |
| 2022-08 | 25 | 2023-07 | 27 | 2025-01 | 6 |
| 2022-09 | 21 | 2023-08 | 14 | 2025-02 | 2 |
| 2022-10 | 23 | 2023-09 | 15 | 2025-03 | 6 |
| 2022-11 | 23 | 2023-10 | 17 | 2025-04 | 3 |
| 2022-12 | 24 | 2023-11 | 22 | 2025-05 | 3 |
| | | 2023-12 | 18 | 2025-06 | 2 |
| | | | | 2025-07 | 3 |
| | | | | 2025-08 | 9 |
| | | | | 2025-09 | 6 |
| | | | | 2025-10 | 6 |
| | | | | 2025-11 | 3 |
| | | | | 2025-12 | 5 |
| | | | | 2026-01 | 6 |
| | | | | 2026-02 | 3 |
| | | | | 2026-03 | 5 |
| | | | | 2026-04 | 5 |
| | | | | 2026-05 | 5 |
| | | | | 2026-06 | 3 |

**Gap ranges (the actionable backlog):**
- **2022-02 → 2023-12 — 492 episodes (priority).** Near-continuous daily back-catalog, ~25/month.
- **2024-01 → 2026-06 — 152 episodes.** Sparse residual; mostly short audio-only dailies. Lower priority.

---

## YouTube side

YouTube long-form coverage is effectively complete: the site has **340 pages with a `youtubeId`**, against a channel of **~338 long-form uploads** (per project memory; the YouTube channel RSS only exposes the latest ~15 items, so it cannot be counted directly). **The missing episodes are an audio-catalog problem, not a YouTube problem.**

---

## Methodology

1. **Catalog (denominator):** fetched the live Anchor RSS feed — **1,283** `<item>` entries, each with GUID, title, pubDate, and `itunes:duration`. Podcast RSS returns the full back-catalog (unlike YouTube RSS, which truncates), so this is the canonical count. (The earlier audit's 1,277 was a slightly older snapshot; the feed has grown by 6.)
2. **Site (numerator):** parsed frontmatter of all 709 `content/podcast/*.mdx` files for `rssGuid`, `youtubeId`, `title`, `publishDate`, `duration`.
3. **Matching** — a feed episode counts as *covered* if any of these hit:
   - **GUID** (exact): 369 audio-RSS pages map 1:1 to feed items.
   - **Exact normalised title:** +15.
   - **Date (±3 days) + duration (±180s):** +170 — catches YouTube re-posts whose titles were SEO-rewritten.
   - **Single same-day candidate:** +85.
   - Total covered ≈ 639; unmatched feed items ≈ 644.
4. **Confidence:** the GUID/title matches (384) are exact. The date/duration matches (255) are heuristic, because YouTube publish dates and durations drift from the Anchor feed. Tightening the window pushes "missing" up to ~810 (37% coverage); loosening it lands at ~644 (50%). Either way the **2022–2023 contiguous gap of ~492 is stable and unambiguous** — those episodes have no GUID, title, or date/duration match anywhere on the site. The headline uses the loose (conservative-missing) match.

---

## Recommendation

Backfill the **Feb 2022 – Dec 2023 audio back-catalog (492 episodes)** first. These already have GUIDs and audio URLs in the Anchor feed and flow through the existing `transcribe:audio` → MDX pipeline (the same path that produced the 369 audio-RSS pages). Per the pipeline's dedup note, the pre-2024 range is safe to run unattended:

```
npm run transcribe:audio -- --max-date=2024-01-01 --order=oldest
```

The 2024+ residual (152, mostly short audio-only dailies) overlaps the YouTube catalog and needs a manual dedup pass before import — lower value, triage later.

---

*Audio RSS feed: `https://anchor.fm/s/a09110e0/podcast/rss` · YouTube channel: `UCkRq6Nr_yEdn5493tXTOo6w`*  
*Companion data: `docs/episode-coverage-missing.csv` (644 missing episodes, enumerated)*
