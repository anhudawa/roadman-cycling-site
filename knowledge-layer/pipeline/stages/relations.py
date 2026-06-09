"""Phase 2 second pass — claim relations.

STATUS: stub (task P2-1).

Contract: group claims by taxonomy node (and parent), chronological, <=30 per
call, prompts/claim_relations_v1.md verbatim. Confidence < 0.75 -> review
queue. Sparse output is correct output.
"""

from __future__ import annotations

from ..config import Config

RELATION_CONFIDENCE_REVIEW_THRESHOLD = 0.75
MAX_CLAIMS_PER_CALL = 30


def run(cfg: Config, episode_numbers: list[int]) -> None:
    raise SystemExit("relations: not yet implemented (Phase 2, task P2-1).")
