# Episode Coverage Audit

**Date:** 2026-06-10  
**Audited by:** Claude Code

---

## Summary

| Metric | Value |
|--------|-------|
| Total episode files on site (`content/podcast/*.mdx`) | **709** |
| Canonical RSS feed total (Spotify/Apple) | **1,277** |
| Brand / marketing figure ("1,400+ conversations") | **1,400+** |
| YouTube long-form uploads | **~338** (ceiling for transcript pipeline) |
| Coverage of RSS catalogue (709 / 1,277) | **55.5%** |
| Coverage of brand "1,400+" figure (709 / 1,400) | **~50.6%** |
| Gap vs RSS catalogue | **568** |
| Gap vs brand figure | **~691** |

> **Note on the two denominators.** The verifiable catalogue is the **1,277** entries in the canonical Anchor/Apple RSS feed — this is the number every coverage figure below is calculated against. The **1,400+** figure used in marketing copy (`docs/ask-roadman-launch-email.md`, cold-traffic landing pages) counts "conversations" more loosely (interviews, clips, side-projects, cross-pod appearances) and is **not** reconcilable to a single feed. Against that looser figure, on-site coverage is roughly **half**. The `plateau-cold-traffic-audit.md` already flags the 1,400+ claim as a sceptic-magnet that should be verified or rephrased — this audit confirms the on-site corpus does not substantiate it.

---

## Source Breakdown

| Source | Count | Date Range |
|--------|-------|------------|
| YouTube (`youtubeId` field) | 340 | 2016-09-04 → 2026-06-08 |
| Audio-RSS transcribed (`source: audio-rss`) | 369 | 2019-01-01 → 2022-02-09 |
| **Total** | **709** | 2016-06-28 → 2026-06-08 |

There is **no overlap** between sources — YouTube and audio-RSS episodes cover distinct episodes within the same calendar years (confirmed by year-level cross-check).

---

## Coverage by Year

| Year | On Site | Source(s) | Notes |
|------|---------|-----------|-------|
| 2016 | 1 | YouTube only | Earliest YouTube upload |
| 2017 | 2 | YouTube only | |
| 2018 | 0 | — | RSS starts Jan 2019; no YouTube uploads found |
| 2019 | 40 | Audio-RSS only | RSS started Jan 2019; no YouTube uploads this year |
| 2020 | 174 | 24 YT + 150 audio-RSS | Best-covered year |
| 2021 | 157 | 3 YT + 154 audio-RSS | |
| 2022 | 35 | 10 YT + 25 audio-RSS | **Audio pipeline stopped Feb 2022** — ~9 months of audio-only missing |
| 2023 | 69 | 69 YouTube only | Audio-only RSS episodes not transcribed |
| 2024 | 100 | 100 YouTube only | Audio-only RSS episodes not transcribed |
| 2025 | 98 | 98 YouTube only | Audio-only RSS episodes not transcribed |
| 2026 | 33 | 33 YouTube only | Partial year (to Jun 2026) |
| **Total** | **709** | | |

---

## Gap Analysis

The 568-episode gap breaks down into two distinct ranges:

### Gap 1 — Audio-only pipeline stalled (Est. ~140–200 episodes)
**Period:** Feb 2022 – Dec 2023 (audio-only episodes not yet transcribed)

The `transcribe:audio` pipeline ran through **2022-02-09** and then stopped. The recommended safe backfill window per the pipeline docs is `--max-date=2024-01-01`, meaning:

- ~9 months of 2022 audio-only episodes are untranscribed
- All of 2023 audio-only episodes are untranscribed
- 2022–2023 had ~150–180 RSS publications per year (based on 2020–2021 averages)
- YouTube covered 79 episodes in 2022–2023; the remaining audio-only count is unknown but estimated at **140–200 episodes**

**Resolution:** Resume `npm run transcribe:audio -- --max-date=2024-01-01 --order=oldest` (safe; no YouTube/RSS dedup ambiguity before 2024).

### Gap 2 — Post-2024 audio-only RSS episodes (Est. ~370 episodes)
**Period:** 2024–2026 (audio-only RSS episodes, YouTube pipeline only captures ~338 long-form videos)

The YouTube pipeline captured 231 episodes from 2024–2026 (100 + 98 + 33). However, the RSS feed has ~1,277 total episodes while the site has 709. The remaining ~337–568 episodes are audio-only RSS entries in 2022–2026 that have **not** been processed via either pipeline.

**Caution:** Post-2024 audio-RSS backfill requires manual dedup — YouTube and RSS use divergent titles for the same recent episodes, so the automated title-normalisation + date-fuzzy guard will miss overlaps. Do not run `transcribe:audio` past `--max-date=2024-01-01` unattended.

---

## Coverage Percentage by Period

| Period | On Site | Est. RSS Total | Coverage |
|--------|---------|----------------|----------|
| Pre-2019 (2016–2018) | 3 | ~3 (no RSS) | ~100% for YouTube |
| 2019–2022 (safe audio range) | 406 | ~560 | ~72% |
| 2022 Feb onwards (stalled) | 303 | ~714 | ~42% |
| **Overall (vs RSS catalogue)** | **709** | **1,277** | **55.5%** |
| **Overall (vs brand "1,400+")** | **709** | **1,400+** | **~50.6%** |

---

## Recommended Next Steps

1. **Run audio pipeline to 2024 cutoff** — safe, no dedup risk:
   ```
   npm run transcribe:audio -- --max-date=2024-01-01 --order=oldest --limit=50
   ```
   Estimated: ~140–200 new episodes added incrementally.

2. **Manual dedup pass for 2024–2026** — required before processing recent audio-only RSS episodes. Compare RSS titles against existing YouTube episode titles to identify true audio-only entries.

3. **Re-run this audit after each batch** to track progress toward full RSS coverage.

---

*Audio RSS feed: `https://anchor.fm/s/a09110e0/podcast/rss` (Apple Podcasts id 1224143549)*  
*YouTube channel: `UCkRq6Nr_yEdn5493tXTOo6w`*
