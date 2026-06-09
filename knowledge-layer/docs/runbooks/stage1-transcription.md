# Runbook: Stage 1 transcription (worker box)

Audience: Ted. Status: ready to exercise as soon as the Supabase project is
provisioned (migrations 001–003 + seeds applied).

## One-time setup

```bash
cd knowledge-layer
pip install -e ".[db]"
pip install faster-whisper        # preferred; openai-whisper also supported
export SUPABASE_DB_URL=postgres://...   # pipeline credentials
export AUDIO_CACHE_DIR=/data/roadman-audio   # needs ~70 GB free for full archive
# WHISPER_MODEL defaults to large-v3; a GPU box is strongly recommended
```

## Populate the episode inventory (idempotent)

```bash
python -m pipeline.cli inventory --dry-run   # feed-health report only
python -m pipeline.cli inventory             # upsert into episodes
```

Notes:
- Episodes are keyed on RSS guid. Display numbers are assigned only where the
  feed's `itunes:episode` is unambiguous; ~535 rows will have NULL numbers
  (500 unnumbered + duplicated ones) pending editorial resolution.
- Re-running refreshes metadata and never resets processing status or
  clobbers manually-fixed episode numbers.

## Transcribe

```bash
python -m pipeline.cli transcribe --episode 1234     # one episode
python -m pipeline.cli transcribe --range 1200-1220  # range
python -m pipeline.cli transcribe --all-pending      # everything pending/failed
```

Behaviour:
- Audio downloads into AUDIO_CACHE_DIR (atomic, skipped when cached — the
  cache doubles as our owned audio mirror; back it up).
- Each run inserts a NEW transcript version; transcripts are immutable.
- Quality score < 0.5 flags the episode in status_detail but does not stop it.
- Failures mark the episode `failed` with the error in status_detail and the
  run continues; re-run with `--all-pending` to retry failures.
- Episodes without display numbers are currently reachable via --all-pending
  only (selection by guid is a small future CLI addition).

On success episodes move to status `diarizing` (Stage 2 — not yet built).
