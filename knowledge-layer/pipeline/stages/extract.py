"""Stage 4 — Extraction: one Claude call per segment-window, strict validation.

The validation and routing layer below is implemented and unit-tested now
(task P0-5); the API-calling driver is wired once pilot episodes exist in the
DB. Routing rules are enforced IN CODE, not just in the prompt (§5 stage 4):

  - schema violation        -> review_queue(schema_violation), NO partial insert
  - speaker_uncertain=true  -> review_queue(ambiguous_speaker)
  - confidence < 0.7        -> review_queue(low_confidence)
  - topic_path == UNMAPPED  -> review_queue(unmapped_topic); claim stored with
                               topic_path NULL, suggested_topic in the detail
  - blocklist hint hit      -> review_queue(blocklist_hit) (see qa/blocklist_check)

Every claim is stamped with prompt_version, model_version, pipeline_version.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..config import Config

CLAIM_TYPES = {"recommendation", "mechanism", "empirical", "opinion", "anecdote", "disagreement"}
HEDGING_LEVELS = {"speculative", "qualified", "confident", "emphatic"}
CONFIDENCE_REVIEW_THRESHOLD = 0.7

REQUIRED_CLAIM_FIELDS = {
    "speaker_label": str,
    "speaker_uncertain": bool,
    "timestamp_s": (int, float),
    "claim_text": str,
    "verbatim_quote": str,
    "claim_type": str,
    "topic_path": str,
    "population_qualifier": str,
    "hedging": str,
    "confidence": (int, float),
}


@dataclass
class RoutedOutput:
    """Result of validating one extraction response."""

    live_claims: list[dict[str, Any]] = field(default_factory=list)
    review_items: list[dict[str, Any]] = field(default_factory=list)
    schema_violation: str | None = None  # set => nothing from this response is inserted


def _schema_error(payload: Any) -> str | None:
    """Return a description of the first schema violation, or None if valid."""
    if not isinstance(payload, dict) or not isinstance(payload.get("claims"), list):
        return "response is not an object with a claims[] list"
    for i, claim in enumerate(payload["claims"]):
        if not isinstance(claim, dict):
            return f"claims[{i}] is not an object"
        for fname, ftype in REQUIRED_CLAIM_FIELDS.items():
            if fname not in claim:
                return f"claims[{i}] missing field {fname}"
            value = claim[fname]
            # bool is a subclass of int — keep True out of numeric fields
            if not isinstance(value, ftype) or (isinstance(value, bool) and ftype is not bool):
                return f"claims[{i}].{fname} has wrong type"
        if claim["claim_type"] not in CLAIM_TYPES:
            return f"claims[{i}].claim_type invalid: {claim['claim_type']!r}"
        if claim["hedging"] not in HEDGING_LEVELS:
            return f"claims[{i}].hedging invalid: {claim['hedging']!r}"
        if not 0 <= claim["confidence"] <= 1:
            return f"claims[{i}].confidence out of range: {claim['confidence']!r}"
        if claim["topic_path"] == "UNMAPPED" and not claim.get("suggested_topic"):
            return f"claims[{i}] is UNMAPPED but has no suggested_topic"
        if not claim["claim_text"].strip() or not claim["verbatim_quote"].strip():
            return f"claims[{i}] has empty claim_text or verbatim_quote"
    return None


def route_extraction_output(
    payload: Any,
    valid_topic_paths: set[str],
    resolved_speakers: set[str],
) -> RoutedOutput:
    """Validate one extraction response and split claims into live vs review.

    A single schema violation rejects the WHOLE response (never a partial
    insert). Routing reasons accumulate — a claim can carry several.
    """
    out = RoutedOutput()
    violation = _schema_error(payload)
    if violation:
        out.schema_violation = violation
        return out

    for claim in payload["claims"]:
        reasons: list[tuple[str, str]] = []

        if claim["topic_path"] == "UNMAPPED":
            reasons.append(("unmapped_topic", f"suggested: {claim.get('suggested_topic')}"))
        elif claim["topic_path"] not in valid_topic_paths:
            # The model invented a path — treat as a schema-level lie, route it.
            reasons.append(("unmapped_topic", f"invented path: {claim['topic_path']}"))

        if claim["speaker_uncertain"] or claim["speaker_label"] not in resolved_speakers:
            reasons.append(("ambiguous_speaker", f"label: {claim['speaker_label']}"))

        if claim["confidence"] < CONFIDENCE_REVIEW_THRESHOLD:
            reasons.append(("low_confidence", f"confidence: {claim['confidence']}"))

        if reasons:
            out.review_items.append({"claim": claim, "reasons": reasons})
        else:
            out.live_claims.append(claim)
    return out


def run(cfg: Config, episode_numbers: list[int]) -> None:
    raise SystemExit(
        "extract: API driver not yet wired (task P0-5/P0-6). Validation and "
        "routing logic is implemented and tested; pilot episodes must exist in "
        "the DB first (blocked behind stages 1-3)."
    )
