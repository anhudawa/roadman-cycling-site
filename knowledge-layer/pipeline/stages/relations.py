"""Phase 2 second pass — claim relations.

Grouping logic (implemented, tested): claims grouped by taxonomy node AND by
parent node (so cross-sibling relations like polarised-vs-pyramidal are seen
together), chronological, chunked to <=30 per call. Duplicate groups (a parent
whose only claims come from one child) are dropped.

The API driver (prompts/claim_relations_v1.md verbatim, confidence < 0.75 ->
review queue, sparse output is correct output) lands with P2-1 once the
corpus is extracted.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from ..config import Config

RELATION_CONFIDENCE_REVIEW_THRESHOLD = 0.75
MAX_CLAIMS_PER_CALL = 30


def _parent(path: str) -> str | None:
    return path.rsplit(".", 1)[0] if "." in path else None


def group_claims_for_relations(
    claims: list[dict[str, Any]],
    max_per_call: int = MAX_CLAIMS_PER_CALL,
) -> list[list[dict[str, Any]]]:
    """Build the relation-pass call groups.

    Each claim needs: id, topic_path, publish_date. Claims with NULL
    topic_path (review-routed) are excluded — they are not in the live graph.
    """
    by_node: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for claim in claims:
        path = claim.get("topic_path")
        if not path:
            continue
        by_node[path].append(claim)
        parent = _parent(path)
        if parent:
            by_node[parent].append(claim)

    groups, seen = [], set()
    for node in sorted(by_node):
        members = sorted(by_node[node], key=lambda c: (str(c["publish_date"]), str(c["id"])))
        key = tuple(str(c["id"]) for c in members)
        if len(members) < 2 or key in seen:
            continue  # a single claim has nothing to relate to; identical sets call once
        seen.add(key)
        for i in range(0, len(members), max_per_call):
            chunk = members[i:i + max_per_call]
            if len(chunk) >= 2:
                groups.append(chunk)
    return groups


def run(cfg: Config, episode_numbers: list[int]) -> None:
    raise SystemExit(
        "relations: grouping logic implemented and tested; the API driver "
        "lands with P2-1 once the corpus is extracted."
    )
