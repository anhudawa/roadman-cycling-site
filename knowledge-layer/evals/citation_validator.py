"""Server-side citation enforcement (§5 stage 8 — a build requirement, not optional).

Validates a synthesis answer against the retrieved claim set:
  1. every [C:uuid] must reference a uuid in the retrieved set
  2. no sentence may name an expert unless the sentence carries a citation
  3. (caller policy) max 2 regenerations on rejection, then the honest-gap
     response; every rejection is logged

Pure logic, shared between evals/golden_runner.py and the Phase 3 app
(mirrored in TypeScript or called via API — decision deferred to P3-1).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

CITATION_RE = re.compile(
    r"\[C:([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\]"
)
_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
_LEADING_CITATIONS_RE = re.compile(r"^((?:\s*\[C:[0-9a-fA-F-]{36}\])+)\s*(.*)", re.S)


def _sentences(body: str) -> list[str]:
    """Split into sentences, keeping each [C:uuid] with the sentence it follows.

    Citations are conventionally written after the terminator ("...easy. [C:x]"),
    so a chunk's leading citation tokens belong to the previous sentence.
    """
    sentences: list[str] = []
    for chunk in _SENTENCE_SPLIT_RE.split(body):
        m = _LEADING_CITATIONS_RE.match(chunk)
        if m and sentences:
            sentences[-1] += " " + m.group(1).strip()
            chunk = m.group(2)
        if chunk.strip():
            sentences.append(chunk)
    return sentences


@dataclass
class ValidationResult:
    valid: bool
    unknown_citations: list[str] = field(default_factory=list)
    uncited_expert_sentences: list[str] = field(default_factory=list)
    cited_claim_ids: set[str] = field(default_factory=set)

    @property
    def rejection_reasons(self) -> list[str]:
        reasons = [f"citation not in retrieved set: {u}" for u in self.unknown_citations]
        reasons += [f"expert named without citation: {s!r}" for s in self.uncited_expert_sentences]
        return reasons


def _name_variants(canonical_name: str, aliases: list[str]) -> list[str]:
    """Match on surname and aliases too — 'Seiler' counts as naming Stephen Seiler."""
    variants = {canonical_name, *aliases}
    surname = canonical_name.split()[-1]
    if len(surname) > 3:  # skip short surnames too prone to false matches
        variants.add(surname)
    return [v for v in variants if v]


def validate_answer(
    answer: str,
    retrieved_claim_ids: set[str],
    experts: dict[str, list[str]],
) -> ValidationResult:
    """Validate `answer` against the retrieval context.

    `experts` maps canonical_name -> aliases for ALL experts known to the
    system (not just retrieved ones): naming a non-retrieved expert in an
    uncited sentence is exactly the failure mode we exist to catch.
    """
    retrieved_lower = {c.lower() for c in retrieved_claim_ids}
    result = ValidationResult(valid=True)

    for cited in CITATION_RE.findall(answer):
        if cited.lower() in retrieved_lower:
            result.cited_claim_ids.add(cited.lower())
        else:
            result.unknown_citations.append(cited)

    body = answer
    # The SOURCES line is structured metadata, exempt from sentence rules.
    sources_idx = body.rfind("SOURCES:")
    if sources_idx != -1:
        body = body[:sources_idx]

    patterns = [
        re.compile(r"\b" + re.escape(v) + r"\b", re.IGNORECASE)
        for name, aliases in experts.items()
        for v in _name_variants(name, aliases)
    ]
    for sentence in _sentences(body):
        if not sentence.strip() or CITATION_RE.search(sentence):
            continue
        if any(p.search(sentence) for p in patterns):
            result.uncited_expert_sentences.append(sentence.strip())

    result.valid = not result.unknown_citations and not result.uncited_expert_sentences
    return result
