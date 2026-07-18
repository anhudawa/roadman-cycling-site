# Weekly Episode Pipeline — Run Report, 20 July 2026

## New episodes found (past 7 days)

Two long-form videos on the main channel (three Shorts ignored — no episode pages for Shorts):

1. **Why Cyclists Gain Weight Even While Training Hard (How To Fix It)** — published 17 Jul, 18:17, `BgKvnYakeXs`, solo, nutrition pillar
2. **Why Your Zone 2 Training Isn't Working & How To Fix It** — published 13 Jul, 18:14, `V-wz-jUxu7k`, solo, coaching pillar

Note: the channel ID in the task file (`UCXwm3YRxUCo-IYvST6VAfFQ`) returns 404 — the real ID is `UCkRq6Nr_yEdn5493tXTOo6w` (@theroadmanpodcast). Worth updating the scheduled task.

## Files created

- `content/podcast/why-cyclists-gain-weight-race-season.mdx` — full frontmatter: answerCapsule, 5 keyTakeaways, 6 FAQs, 3 claims, citations (Impey/Morton FFTWR paper), relatedPosts/Episodes, world-class show notes with AICitationBlock
- `content/podcast/why-your-zone-2-training-isnt-working.mdx` — same treatment, 4 claims, sacredCowScore 8 (contrarian angle on Zone 2 orthodoxy)
- `content/blog/why-am-i-gaining-weight-cycling.mdx` — ~1,700-word standalone article targeting "why am i gaining weight cycling", with whoFor/roadmanView/FAQ
- `content/blog/zone-2-not-working-cycling.mdx` — ~1,800-word standalone article targeting "zone 2 not working", positions carefully against the existing grey-zone-trap post (deliberate vs accidental tempo)

FAQPage + PodcastEpisode JSON-LD are emitted automatically by `podcast/[slug]/page.tsx` from the frontmatter — no schema code changes needed.

## Internal links added FROM existing content

- `mattias-reck-mads-pedersen-training-plan.mdx` → new Zone 2 episode (it's the source of the "zone is relative, cost is absolute" idea)
- `ep-2211-what-99-get-wrong-about-weight-gain...` → new weight blog post
- `blog/80-20-cycling-training-the-grey-zone-trap.mdx` → new Zone 2 episode
- `blog/polarised-vs-sweet-spot-training-cyclists.mdx` → new Zone 2 episode
- `blog/cycling-weight-loss-fuel-for-the-work-required.mdx` → new weight episode

## Decisions made autonomously

- **Guest profiles:** skipped — both episodes are solo (per task rules)
- **keyQuotes and chapters:** omitted — YouTube transcripts were not retrievable this run (YouTube now blocks the transcript endpoints), and I won't fabricate verbatim quotes or timestamps. Show notes are grounded in the full video descriptions. Run the existing extract-key-quotes/chapter scripts once transcripts are available.
- **Skool links** use https://www.skool.com/roadmancycling per brand rules (video descriptions use /roadman/about)
- Verified: no AI-slop terms, no "genuinely" (matching the recent purge commits), no GBP/EUR, no Vekta, all related slugs resolve, YAML parses clean

## ⚠️ Commit + push: NOT pushed to main — action needed

I found your local repo in a damaged state and did not want to make it worse:

1. **Local commit `058acfa9` ("feat(roadman-os): T51...", 18 Jul) is broken.** Its tree contains ONLY the `roadman-os/` folder — it accidentally deleted every other file in the repo. It has NOT been pushed (origin/main is still at `cc2d74fc`).
2. All ~4,660 files were re-staged afterwards (a recovery attempt?), and a stale `.git/index.lock` (empty, 17 Jul) was left by a crashed git process.

Pushing main would publish the broken commit, so instead the new content is committed on a clean branch **`episode-pipeline-2026-07-20`** (commit `99b5bf35`), branched off `origin/main`, exactly 9 files, +807 lines. Your working tree, main, staged index and lock file are all untouched.

**To publish the new content** (couldn't push from here — no GitHub credentials in this environment):

```
git push origin episode-pipeline-2026-07-20
```

then merge to main once you've fixed main, or open a PR.

**Suggested fix for main** (please review before running):

```
rm .git/index.lock                 # stale lock from crashed process
git reset cc2d74fc                 # drop the broken unpushed commit, keep all files on disk
git add roadman-os && git commit   # redo the roadman-os migration commit properly
git merge episode-pipeline-2026-07-20
git push origin main
```
