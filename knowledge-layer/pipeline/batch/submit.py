"""Anthropic Message Batches API submission — resumable, budget-capped.

STATUS: stub (task P1-1). Binding constraints (§5 stage 4):
  - resumable manifest: which episodes submitted / completed / failed
  - cost tracking against BATCH_BUDGET_USD with HARD refusal above cap
  - never runs before the synchronous 20-episode pilot has produced a
    per-episode cost figure and Ted has confirmed the budget (§9.4)
  - verify current Batch API behaviour against https://docs.claude.com at
    build time — do not assume API shapes from training data (§2)
"""

from __future__ import annotations

from ..config import Config


def run(cfg: Config, episode_numbers: list[int]) -> None:
    if cfg.batch_budget_usd <= 0:
        raise SystemExit(
            "batch submit: BATCH_BUDGET_USD unset or zero — refusing. Ted "
            "confirms the budget after the pilot cost figure (§9.4)."
        )
    raise SystemExit("batch submit: not yet implemented (task P1-1; gated on P0-8 pass).")
