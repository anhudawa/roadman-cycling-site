"""Stage 2 — Diarization + speaker identification (pyannote).

STATUS: stub. Blocked with Stage 1 on AUDIO_ARCHIVE_URI (§9.1).

Speaker resolution order (binding, §5 stage 2):
  (a) episode metadata guest list
  (b) host voice-print (Anthony Walsh anchors SPK->host mapping)
  (c) LLM pass over transcript opening for conversational cues
  (d) unresolved -> speaker stays NULL; downstream claims route to
      review_queue(ambiguous_speaker)
Never guess between two plausible guests. Null is better than wrong.
"""

from __future__ import annotations

from ..config import Config


def run(cfg: Config, episode_numbers: list[int]) -> None:
    raise SystemExit("diarize: not yet implemented (task P0-4; blocked on §9.1 audio access).")
