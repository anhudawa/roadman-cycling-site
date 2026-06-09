"""Stratified sampling for the human attribution audit (task P0-8, §7.1).

STATUS: stub. Contract: 200 claims stratified by expert x era, exported with
verbatim quote + audio timestamp link for human verification against audio.
Gate: >=98% attribution, >=95% faithfulness.
"""

from __future__ import annotations

from ..config import Config

SAMPLE_SIZE = 200
ATTRIBUTION_GATE = 0.98
FAITHFULNESS_GATE = 0.95


def run(cfg: Config) -> None:
    raise SystemExit("attribution_sample: not yet implemented (task P0-8; needs pilot data).")
