"""Blocklist checking (§5 stage 4, §8.1).

Two phases: a cheap mechanical pre-screen on match_hints (implemented, tested),
then an LLM confirmation pass on hits only (wired with the extract driver).
A confirmed hit routes the claim to review_queue(blocklist_hit) — the claim
never enters the live graph as fact.
"""

from __future__ import annotations

import unicodedata
from typing import Any


def _normalise(text: str) -> str:
    """Casefold and strip diacritics so 'Pogačar' matches 'pogacar'."""
    decomposed = unicodedata.normalize("NFKD", text)
    return "".join(c for c in decomposed if not unicodedata.combining(c)).casefold()


def prescreen(claim_text: str, verbatim_quote: str, entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return blocklist entries whose hints appear in the claim or quote.

    Hint semantics: a PERSON/TOPIC entry with multiple name hints fires when
    at least two distinct hints match (e.g. both 'lorang' and a 'pogacar'
    variant), or when it has a single hint and that hint matches. Structural
    entries (single-concept hints) fire on any hint. We deliberately
    over-trigger slightly — the LLM confirm pass exists to cut false positives.
    """
    haystack = _normalise(claim_text + " " + verbatim_quote)
    hits = []
    for entry in entries:
        hints = [_normalise(h) for h in entry.get("match_hints", [])]
        if not hints:
            continue
        matched = {h for h in hints if h in haystack}
        # Distinct concepts only: 'pogacar'/'pogačar' normalise to one match.
        if len(matched) >= 2 or (len(hints) == 1 and matched):
            hits.append(entry)
        elif entry["pattern"].startswith("STRUCTURAL:") and matched:
            hits.append(entry)
    return hits
