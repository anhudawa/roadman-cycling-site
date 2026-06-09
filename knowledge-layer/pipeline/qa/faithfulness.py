"""Mechanical faithfulness check (§7.5): claim_text vs verbatim_quote.

STATUS: stub. Contract: NLI-style or LLM-judge comparison on samples, flags
paraphrase drift (including hedging upgrades — 'might' becoming 'should')
cheaply between human audits.
"""

from __future__ import annotations

from ..config import Config


def run(cfg: Config) -> None:
    raise SystemExit("faithfulness: not yet implemented (lands with pilot QA, P0-8).")
