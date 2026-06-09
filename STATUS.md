# Knowledge Layer — STATUS

Maintained per handover §0.5. Newest session first. Decisions needed at the top.

---

## Session 2026-06-09 — Phase 0 kickoff (P0-1, P0-2/3 code, transcript-pipeline audit)

### 🔴 Decisions / inputs needed from Ted (blocking)

1. **Audio archive location (§9.1) — HARD BLOCKER for P0-4.** `AUDIO_ARCHIVE_URI`
   is unset. The RSS feed lists ~1,277 episodes; we need the canonical audio
   store (S3/host/drive?), access method, and total size.
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
