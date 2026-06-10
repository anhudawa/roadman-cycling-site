"""Stage 5 — Normalisation: entity resolution + claim dedupe.

Name-resolution logic (implemented, tested): guest names from episode
metadata / diarization resolve against canonical names and aliases with
diacritic- and honorific-insensitive matching. Anything ambiguous resolves to
nobody — never guessed (§5 stage 2 spirit applies here too).

New unseen guests get expert rows with IDENTITY FIELDS ONLY — credentials
stays NULL, human-curated per §8.1 — and are flagged for Ted. The DB driver
(plus trigram fallback in SQL and embedding-based claim dedupe) lands with
the pilot (P0-6) / corpus pass (P1-3).
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any

from ..config import Config

HONORIFICS = {"dr", "prof", "professor", "doctor", "coach", "mr", "mrs", "ms"}


def normalise_name(name: str) -> str:
    """Casefold, strip diacritics, punctuation, and leading honorifics."""
    decomposed = unicodedata.normalize("NFKD", name)
    flat = "".join(c for c in decomposed if not unicodedata.combining(c)).casefold()
    words = [w for w in re.split(r"[^a-z0-9]+", flat) if w]
    while words and words[0] in HONORIFICS:
        words.pop(0)
    return " ".join(words)


def resolve_expert(
    name: str,
    experts: list[dict[str, Any]],
) -> dict[str, Any] | None:
    """Resolve a name against experts [{id, canonical_name, aliases}].

    Match order: exact canonical/alias match, then unique surname match.
    Multiple candidates -> None (never guess between two plausible experts).
    """
    target = normalise_name(name)
    if not target:
        return None

    candidates: dict[Any, dict[str, Any]] = {}
    for e in experts:
        if target == normalise_name(e["canonical_name"]) or any(
            target == normalise_name(a) for a in e.get("aliases", [])
        ):
            candidates[e["id"]] = e

    # single-token reference ("Seiler", "Friel"): surname matches are ALSO
    # candidates — an alias like "Prof Seiler" must not win over another
    # expert who shares the surname. Two plausible experts = no resolution.
    if " " not in target:
        for e in experts:
            words = normalise_name(e["canonical_name"]).split()
            if words and words[-1] == target:
                candidates[e["id"]] = e

    if len(candidates) == 1:
        return next(iter(candidates.values()))
    return None


def new_expert_row(name: str) -> dict[str, Any]:
    """Identity fields only for an unseen guest. Credentials deliberately
    absent — human-curated per §8.1; the row is flagged for Ted's review."""
    return {
        "canonical_name": name.strip(),
        "aliases": [],
        "domain_tags": ["unreviewed-new-guest"],
    }


def run(cfg: Config, episode_numbers: list[int]) -> None:
    raise SystemExit(
        "normalise: resolution logic implemented and tested; the DB driver "
        "(trigram fallback + claim dedupe) lands with the pilot (P0-6)."
    )
