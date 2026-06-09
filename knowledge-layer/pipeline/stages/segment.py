"""Stage 3 — Segmentation: 200-500 word topical chunks respecting speaker turns.

STATUS: stub (task P0-5). Simple approach first: turn-grouping with a
topic-shift heuristic; LLM-assisted boundaries only for long monologues.
"""

from __future__ import annotations

from ..config import Config


def run(cfg: Config, episode_numbers: list[int]) -> None:
    raise SystemExit("segment: not yet implemented (task P0-5).")
