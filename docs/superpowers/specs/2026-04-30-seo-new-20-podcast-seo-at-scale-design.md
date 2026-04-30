# SEO-NEW-20 — Podcast SEO at Scale (Design)

**Status:** Approved by user 2026-04-30. Ship.
**Owner:** Anthony / Ted
**Audit reference:** `SEO-AUDIT-IMPLEMENTATION-PLAN.md` Priority 4
**Builds on:** SEO-NEW-11 (episode template, already shipped)

## Context

The episode page template at `src/app/(content)/podcast/[slug]/page.tsx` already renders transcripts, chapters, claims-with-evidence, citations, topic tags, FAQs, key takeaways, related episodes, guest cards, and answer capsules. PodcastEpisode JSON-LD is comprehensive. 314 episode MDX files exist in `content/podcast/`. Many enrichment scripts already exist (`generate-episode-capsules`, `generate-episode-faqs`, `extract-key-quotes`, `generate-segment-titles`, `populate-related-episodes`, `populate-episode-related-posts`, `tag-episode-topics`).

What's missing is the **scaling system**: prioritisation, coverage audit, claims/citations extraction with editorial review, CTA routing by topic, master orchestrator, and a hook so future episodes get the full treatment automatically.

## Scope

- **Phase 1 (this ship):** infrastructure complete + top 50 prioritised + audit report.
- **Phase 2+ (operational):** grind through to ~300 over 6 months using the same machinery.
- **Forever (auto):** every new episode runs the full pipeline at publish time.

Out of scope: GSC API integration, search-console click weighting, topic-demand from external keyword tools. Hardcoded weights + `episodeDownloadsCache` are sufficient for Phase 1.

## Components

### 1. `src/lib/podcast/seo-priority.ts`

Pure scoring module. Exports:

- `scoreEpisode(ep, ctx) → { total, breakdown }` — combines four signals into a 0–100 score.
- `prioritiseEpisodes(episodes, ctx) → ScoredEpisode[]` — sorts all episodes by score, descending.

Signals (weights):

| Signal | Weight | Source |
|---|---|---|
| Guest authority | 30 | `GUEST_PROFILE_OVERRIDES` membership (curated featured guest = full points) + named-expert allowlist (Seiler, Lorang, Dunne, Morton, Pogačar, etc.) + has guest at all (vs solo episode). |
| Topic demand | 30 | Hardcoded `TOPIC_WEIGHTS` map: `ftp 1.0, masters 1.0, nutrition 1.0, coaching 1.0, training 0.9, recovery 0.7, race-prep 0.8, strength 0.8, ...` × max(topicTags weight). |
| Commercial relevance | 20 | Pillar match (`Coaching`, `Strength`, `Nutrition` = full; `Recovery`, `Community` = half). Plus tool-mention boost (Vekta / Skool / Strength course in transcript). |
| Listener proof | 15 | Log-scaled boost from `episodeDownloadsCache.downloads` if available (top decile = full points, missing = 0). |
| Uniqueness penalty | −5 | If transcript embedding cosine similarity ≥ 0.85 to a higher-scoring episode in the same pillar, dock 5 points. |

Breakdown is returned so the audit report can explain *why* an episode ranks where it does.

### 2. `scripts/audit-episode-coverage.ts`

Reads all 314 MDX files. For each, scores 12 coverage fields (transcript, capsule, takeaways, segmentTitles, chapters, claims+reviewed, citations+reviewed, topicTags, faq, keyQuotes, relatedPosts, guestBio). Emits:

- `seo-reports/episode-coverage-YYYY-MM-DD.json` — full data.
- `seo-reports/episode-coverage-YYYY-MM-DD.md` — human-readable. Counts of each missing field, top-50 list with scores + missing fields, table of bottom episodes.

CLI: `--top=50`, `--missing=claims` (filter), `--format=md|json`.

### 3. `scripts/extract-claims.ts`

Claude Opus 4.7 over the full transcript. System prompt enforces:

- Each claim is a discrete factual statement (not opinion).
- Evidence level chosen from `study | expert | practice | anecdote | opinion` per literal definitions in lib/podcast.ts.
- Source field included when the speaker cites one.
- 5–10 claims per episode.

Output is appended to MDX frontmatter as `claims[]` with `reviewed: false` set on every extracted claim. Idempotent: skips episodes whose existing claims are all `reviewed: true` (or were authored before this script existed and have no `reviewed` flag — treated as trusted). `--force` regenerates. Same env/CLI patterns as `extract-key-quotes.ts`.

### 4. `scripts/extract-citations.ts`

Same shape. Claude extracts `papers | books | articles | tools | episodes | websites` referenced in the transcript. Adds `reviewed: false`. Authored citations without the flag remain trusted (backwards-compatible).

### 5. `src/lib/podcast/episode-cta.ts`

Topic→CTA router. Pure function `getEpisodeCta(episode) → CtaSpec` that picks the most commercially relevant CTA based on `topicTags` and `pillar`:

| Topic / pillar | CTA | Variant |
|---|---|---|
| `ftp`, `masters`, `coaching`, pillar `Coaching` | Skool "Not Done Yet" community | `community` |
| `strength`, pillar `Strength & Conditioning` | Strength Training course ($249.99) | `strength-course` |
| `nutrition`, pillar `Nutrition` | Free Roadman Toolkit + nutrition email sequence | `toolkit-nutrition` |
| `recovery`, pillar `Recovery` | Newsletter + recovery toolkit | `newsletter-recovery` |
| Default | Newsletter signup | `newsletter` |

Returned CTA spec drives an `<EpisodeCta variant={...} />` component slot already on the page (replaces the generic email-capture in the right rail). Falls back gracefully if the variant isn't yet implemented.

### 6. `scripts/seo-batch.ts`

Master orchestrator. Steps:

1. Load all episodes.
2. Run audit coverage (in-memory, no file write).
3. Run prioritisation, take top N (default 50).
4. For each prioritised episode in score order, identify missing fields and run the appropriate enricher in dependency order:
    1. transcript (`enrich-transcripts`) — required for everything else
    2. capsule (`generate-episode-capsules`)
    3. takeaways (extracted from capsule + transcript — small new helper)
    4. segmentTitles (`generate-segment-titles`)
    5. claims (`extract-claims`)
    6. citations (`extract-citations`)
    7. topicTags (`tag-episode-topics`)
    8. faq (`generate-episode-faqs`)
    9. keyQuotes (`extract-key-quotes`)
    10. relatedPosts (`populate-episode-related-posts`)
    11. relatedEpisodes (`populate-related-episodes`)
5. Write a per-run report `seo-reports/seo-batch-YYYY-MM-DD-HHmm.md` with what changed.

CLI: `--limit=50`, `--dry-run`, `--from-rank=1`, `--to-rank=50`, `--skip=claims,citations`. The orchestrator imports each enricher's main() rather than spawning sub-processes — single API key, single rate-limit budget.

### 7. `scripts/enrich-episode.ts` + `pnpm episode:enrich <slug>`

Single-episode pipeline. Same dependency order as the batch but for one slug. Used for new-episode publish flow: edit MDX → save → `pnpm episode:enrich ep-321-...`. CI also runs this in `--dry-run --check` mode on PRs that touch `content/podcast/` to flag missing fields without modifying.

### 8. Review-gate filter in `src/lib/podcast.ts`

`getEpisodeBySlug` and `getAllEpisodes` filter unreviewed claims/citations from rendered output:

```ts
function filterReviewed<T extends { reviewed?: boolean }>(items: T[] | undefined): T[] | undefined {
  if (!items) return items;
  // legacy items without `reviewed` flag = trusted (authored manually pre-feature)
  return items.filter((item) => item.reviewed !== false);
}
```

This means `reviewed: undefined` keeps current behavior, `reviewed: false` hides the item until reviewed, `reviewed: true` shows the item. Pages don't need to change.

### 9. Review queue tooling

`scripts/review-claims.ts` — interactive CLI that walks unreviewed claims/citations. For each, shows the claim + transcript context + evidence level + source, prompts `[a]pprove / [r]eject / [e]dit / [s]kip / [q]uit`. Approving sets `reviewed: true`, editing opens `$EDITOR`, rejecting deletes the entry. Writes back to MDX. This is what Anthony / Ted runs in batches to clear the queue.

## Data model changes

Extend `EpisodeFrontmatter.claims[]` and `EpisodeFrontmatter.citations[]` in `src/lib/podcast.ts` with optional `reviewed?: boolean`. No DB schema changes required — episodes remain MDX-first.

## Auto-treatment for new episodes

Two paths:

1. **Manual / Vercel-deploy path:** the publish runbook adds a step "run `pnpm episode:enrich <slug>`" between drafting MDX and merging.
2. **CI lint:** `.github/workflows/episode-coverage.yml` runs `tsx scripts/audit-episode-coverage.ts --strict --new-only` on PRs that add/modify `content/podcast/*.mdx`. It posts a comment listing missing fields and which enrichers to run. Doesn't block merges (Anthony can ship a "lite" episode), just makes the gap visible.

We do **not** run claims/citations extraction in CI — those need editorial review and shouldn't auto-extract on every commit.

## Reports & tracking

`seo-reports/` (gitignored after first commit of the dir + .keep) holds the audit and batch run outputs. The audit also writes a top-level `SEO-PODCAST-DASHBOARD.md` summarising:

- Coverage % per field across all 314 episodes
- Top-50 cohort and their scores
- Phase-1 progress: how many of the top-50 have `reviewed:true` claims
- Pending review queue size

This gives Anthony a single page to glance at to know where the pipeline stands.

## Out of scope

- Auto-publishing reviewed claims back to social (separate flow exists in `repurpose-episode`)
- GSC integration for click-weighted prioritisation (Phase 3+)
- Live podcast-host RSS sync (no current relationship; episodes manually authored)
- Re-running enrichment on already-complete episodes (force-only)
- Schema for episodes that are pure vlogs / not interview format (template still works, just lower scores)

## Acceptance

Phase 1 done when:

- All 8 components exist, are tested locally, and `pnpm build` passes.
- Coverage audit run produces the top-50 list.
- One end-to-end dry-run of `seo-batch.ts --limit=3 --dry-run` shows it would do the right thing on three sample episodes.
- Review-gate filter is wired and a unit-style smoke test confirms `reviewed: false` claims don't render.
- `SEO-PODCAST-DASHBOARD.md` is committed at v1.

We are not running the actual paid Claude Opus extraction on all 50 episodes in this session — that's a separate, deliberate operational run gated by Anthony.
