"""Anthropic Message Batches API collection — resumable.

STATUS: stub (task P1-1). Pulls completed batch results, runs the same
validation/routing as the synchronous path (pipeline.stages.extract), and
updates the manifest.
"""

from __future__ import annotations

from ..config import Config


def run(cfg: Config) -> None:
    raise SystemExit("batch collect: not yet implemented (task P1-1).")
