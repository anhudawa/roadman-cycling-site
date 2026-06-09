"""Stage 5 — Normalisation: entity resolution + claim dedupe.

STATUS: stub (task P1-3 at corpus scale; minimal version for pilot).

Rules (§5 stage 5):
  - experts resolved via aliases + trigram match
  - new unseen guest names -> create expert row with IDENTITY FIELDS ONLY
    (credentials stays NULL — human-curated, §8.1), flag for Ted
  - dedupe near-identical claims (same expert + episode, high cosine, same topic)
"""

from __future__ import annotations

from ..config import Config


def run(cfg: Config, episode_numbers: list[int]) -> None:
    raise SystemExit("normalise: not yet implemented (pilot-minimal version lands with P0-6).")
