# Knowledge Layer — STATUS

Maintained per handover §0.5. Newest session first. Decisions needed at the top.

---

## Session 2026-06-09 (update 2) — guid identity approved, Stage 1 + 3 built

Anthony approved the rss_guid identity scheme ("run with your episode numbers
idea") — episode numbering decision is closed.

### 🔴 Still needed (now the critical path)

1. **Supabase project + credentials** — everything below is coded and
   unit-tested but nothing has touched a real database yet. Once provisioned:
   apply migrations 001–003, `pipeline seed`, `pipeline inventory`, run the
   P0-2 integration test, then Stage 1 on 3 sample episodes (P0-4 acceptance).
2. **Worker box with GPU** for Whisper large-v3 over 1,283 episodes
   (runbook written: `knowledge-layer/docs/runbooks/stage1-transcription.md`).
3. Carried: pilot episode list; golden-set review; rights review; MCP spec.

### ✅ Completed

- **Migration 003** (`003_episode_identity.sql`): `rss_guid` unique key on
  episodes; `episode_number` now nullable, display-only, unique where present.
- **Inventory DB loader**: upsert by guid, idempotent; display numbers
  assigned only where the feed number is used exactly once — duplicated
  numbers withheld from BOTH claimants (wrong "Ep N" in citations is worse
  than none); editorial fixes in the DB are never clobbered by re-runs.
- **Stage 1 implemented** (`stages/transcribe.py`): atomic cached enclosure
  download (cache doubles as the owned audio mirror), faster-whisper /
  openai-whisper backends with word timestamps, transcript quality scoring
  (avg word confidence + low-confidence ratio + garbage-segment ratio),
  versioned immutable transcript rows, per-episode failure isolation with
  `failed`+detail status. Unit-tested (scoring, cache logic); end-to-end
  needs DB + GPU box.
- **Stage 3 implemented** (`stages/segment.py`): speaker-pure segmentation —
  consecutive same-speaker turns merge, long monologues split at sentence
  boundaries with proportional timestamp interpolation, 200–500 word bounds,
  text-preservation and timestamp-ordering proven by tests. Falls back to
  speaker-less Whisper segments pre-diarization (claims then route to review
  as ambiguous_speaker — never guessed).
- **Stage 2 alignment half implemented** (`stages/diarize.py`): Whisper words
  assigned to pyannote speaker intervals by greatest overlap (gap words snap
  to the nearest interval within 2s, else stay unassigned), consecutive
  same-label words grouped into turns, new immutable transcript version with
  `speaker_turns`. Unresolved labels keep `speaker_expert_id` NULL — never
  guessed. Remaining half (running pyannote + label→expert resolution via
  guest list / host voice-print / LLM opening cues) needs the GPU box.
- 69 unit tests passing, lint clean.

### ⏭ Next

- Stage 2 remainder: run pyannote on the worker box + speaker resolution.
- Stage 4 extraction API driver wiring (validation/routing already built).
- On DB arrival: run the full chain on 3 sample episodes (P0-4 acceptance).

### 💰 Spend

Still zero Anthropic API spend.

---

## Session 2026-06-09 (update) — audio blocker RESOLVED, feed inventory built

Anthony confirmed the episodes live on Spotify/Apple. Verified what that means
in practice: the show is hosted on Anchor (Spotify for Podcasters) with a
**public RSS feed** — Apple/Spotify are just distribution.

### ✅ Blocker §9.1 resolved

- Feed: `https://anchor.fm/s/a09110e0/podcast/rss` (now the default
  `AUDIO_ARCHIVE_URI` in `.env.example`).
- Verified live: **1,283 items, all 1,283 with downloadable audio/mpeg
  enclosures** (HEAD-checked; CloudFront), **~64.4 GB total**, durations on
  every item, span Jan 2019 → today.
- Recommendation: **mirror audio to owned storage before the corpus run**
  (stable bytes for reproducibility + provenance; no dependence on Anchor
  availability/rate limits during a 1,283-episode batch). ~64 GB ≈ trivial
  S3/R2 cost. Will build the mirror step into Stage 1.

### 🔴 NEW decision needed from Ted: episode numbering

The feed's `itunes:episode` tags are unreliable: only **783/1,283 items are
numbered, with 35 numbers used more than once**, and 500 items (scattered, not just
old ones) carry no number. The schema keys `episodes.episode_number` as
unique NOT NULL, and the answer engine cites "Ep N" to members — so numbering
must match what listeners see. Proposal: add `rss_guid` as the stable unique
key (small migration 003), make `episode_number` nullable for display, and
resolve duplicates/gaps editorially over time. Need Ted's sign-off since this
touches schema (§0.2).

### ✅ Also completed

- `pipeline inventory` command: fetches + parses the feed (stdlib XML, no new
  deps), reports feed health (`--dry-run` run against the live feed: matches
  the numbers above). DB application deliberately gated until the numbering
  decision lands. Parser unit-tested against a FIXTURE feed (48 tests total).

---

## Session 2026-06-09 — Phase 0 kickoff (P0-1, P0-2/3 code, transcript-pipeline audit)

### 🔴 Decisions / inputs needed from Ted (blocking)

1. ~~**Audio archive location (§9.1) — HARD BLOCKER for P0-4.**~~ **RESOLVED
   same day — see update above.** Archive = public Anchor RSS enclosures.
2. **Phase0 companion package missing.** `roadman-knowledge-layer-phase0.zip`
   was not in the repo. Per the handover, migrations/prompts/seeds were
   **regenerated from Appendix A–C**. Please confirm that's expected, or supply
   the original package so I can diff. In particular the 20 golden-set starter
   questions are regenerated and **need your review**
   (`knowledge-layer/seeds/golden_set_starter.json`).
3. **Supabase project** — no `SUPABASE_DB_URL`/keys available in this
   environment, so `001_init.sql` / `002_roles_rls.sql` are written but not yet
   applied, and the P0-2 acceptance test (pipeline role cannot write
   credentials) is written but not yet run. Need project credentials or you
   run: `psql -f 001_init.sql -f 002_roles_rls.sql`, then
   `python -m pipeline.cli seed`, then the integration test.
4. **Pilot episode list (§9.6)** — provide, or approve default stratification
   (across eras + 1-guest/multi-guest mix).
5. **Guest agreements / rights review (§9.3)** and **MCP nine-tool spec
   (§9.5)** — not yet blocking, flagging early.
6. **Batch budget (§9.4)** — after pilot cost figure; batch submission
   hard-refuses while `BATCH_BUDGET_USD` is unset (implemented).

### ✅ Completed this session

- **P0-1 scaffold** — `knowledge-layer/` created (self-contained, since this
  repo is also the live Next.js site). `python -m pipeline.cli --help` lists
  all stage commands; 43 unit tests pass; ruff clean; CI workflow added
  (`.github/workflows/knowledge-layer-ci.yml`).
- **Schema** — `migrations/001_init.sql` regenerated from Appendix A: all
  enums/tables/indexes, credentials-guard trigger on `experts`, transcript
  immutability trigger. `migrations/002_roles_rls.sql` (P0-2): `pipeline_worker`
  role with column-level grants excluding `experts.credentials`, RLS for
  member-facing reads (open-review and superseded claims excluded from member
  reads). Integration test written (`test_integration_credentials_guard.py`),
  auto-skips until a DB is available.
- **Prompts** — ext-1.0.0, rel-1.0.0, syn-1.0.0 regenerated from Appendix B.
- **Seeds + loaders (P0-3 code)** — taxonomy (64 nodes, Appendix C coverage
  test-enforced), blocklist (Lorang/Pogačar landmine + structural biography
  rule, test-enforced), golden set starter (20 q, 5/persona). Idempotent
  loader (`pipeline seed`, upsert by natural key) + host expert row creation.
  Awaits DB to run for real (`seed --dry-run` validates locally).
- **P0-5 core logic, ahead of order** (pure-Python, testable without audio):
  extraction output schema validation + routing (schema violation → whole
  response rejected, no partial insert; `speaker_uncertain` / `confidence<0.7`
  / UNMAPPED / invented-topic-path → review queue), hedging round-trip test,
  blocklist mechanical pre-screen with diacritic-proof matching.
- **Citation validator implemented** (`evals/citation_validator.py`) with a
  starter adversarial suite: unknown-uuid rejection, expert-named-without-
  citation rejection (incl. surname/alias matching), SOURCES-line exemption.
- **Stage stubs** — transcribe/diarize/segment/normalise/index/relations/batch
  fail loudly with the exact blocker/task that gates them.

### 🔍 Audit: existing transcript pipeline (handover §5 stage 1 first action)

Finding: **nothing in the prior site-rebuild pipeline is reusable as Stage 1.**

- Existing transcripts are YouTube auto-captions parsed to plain text —
  **no word-level timestamps, no diarization** (`scripts/lib/transcript.ts`
  discards timing; 279 `.txt` files in `content/podcast/transcripts/`,
  ~46% of the 607 local MDX episodes; RSS shows ~1,277 episodes total).
- A dormant Whisper script exists (`scripts/transcribe_audio.py`) but uses
  `base.en` and joins segments to plain text — not large-v3, no word timing.
- Reusable as references: episode inventory (MDX frontmatter + RSS), existing
  claim/quote extraction scripts and `review-claims.ts` editorial-queue UX,
  `mcp_episodes`/`claims`/`quotes` tables from the earlier MCP experiment
  (kept separate from the new schema; could inform backfill QA later).

Consequence: Stage 1 must transcribe from source audio with Whisper large-v3
— which makes blocker #1 (audio archive) the critical path.

### ⏭ Next session

- Apply migrations + seeds to Supabase, run P0-2 integration test (needs #3).
- Episode inventory loader: populate `episodes` from RSS/MDX metadata
  (not audio-blocked; unblocks pilot selection).
- Stage 1–2 implementation once `AUDIO_ARCHIVE_URI` lands.

### 💰 Spend

No Anthropic API calls were made this session. Zero spend against budget.
