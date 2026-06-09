"""Stage 1 — Transcription (Whisper large-v3, word-level timestamps).

STATUS: stub. Hard-blocked on AUDIO_ARCHIVE_URI (§9.1 — Ted to provide).

Audit finding (recorded in STATUS.md): the prior site-rebuild pipeline has NO
word-level-timestamped transcripts — existing assets are YouTube captions
parsed to plain text and a dormant `base.en` Whisper script that discards
timing. Nothing is reusable as a Stage 1 substitute; this stage must run
Whisper large-v3 against source audio.

Contract when implemented:
  - input: episode audio from AUDIO_ARCHIVE_URI
  - output: new versioned row in `transcripts` (never overwrite — immutability
    is trigger-enforced)
  - compute transcript_quality_score (avg word confidence, low-confidence span
    ratio, silence/garbage ratio); < 0.5 flags the episode but continues
  - status transitions: pending -> transcribing -> (next stage | failed)
"""

from __future__ import annotations

from ..config import Config


def run(cfg: Config, episode_numbers: list[int]) -> None:
    if not cfg.audio_archive_uri:
        raise SystemExit(
            "transcribe: AUDIO_ARCHIVE_URI is not set. This is open blocker §9.1 — "
            "Ted must provide the audio archive location before Stage 1 can run."
        )
    raise SystemExit("transcribe: not yet implemented (task P0-4).")
