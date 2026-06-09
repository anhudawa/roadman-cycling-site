"""Seed loaders for taxonomy, blocklist, and golden set (task P0-3).

Validation is pure and unit-tested; DB application is idempotent (upsert by
natural key) and safe to re-run. Seeds are applied with privileged credentials
because taxonomy and fact_blocklist are read-only to the pipeline role.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .config import SEEDS_DIR, Config

PILLARS = {"coaching", "nutrition", "strength-conditioning", "recovery", "le-metier"}
PERSONAS = {"tom", "mark", "james", "dave"}

HOST_EXPERT = {
    "canonical_name": "Anthony Walsh",
    "aliases": ["Anthony", "the host", "Roadman"],
    "domain_tags": ["host"],
}


class SeedValidationError(ValueError):
    pass


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def validate_taxonomy(data: dict[str, Any]) -> list[dict[str, Any]]:
    nodes = data.get("nodes")
    if not isinstance(nodes, list) or not nodes:
        raise SeedValidationError("taxonomy: missing nodes[]")
    paths = [n["path"] for n in nodes]
    if len(paths) != len(set(paths)):
        raise SeedValidationError("taxonomy: duplicate paths")
    path_set = set(paths)
    for n in nodes:
        if n["pillar"] not in PILLARS:
            raise SeedValidationError(f"taxonomy: bad pillar on {n['path']}")
        if not n.get("label"):
            raise SeedValidationError(f"taxonomy: missing label on {n['path']}")
        parent = n.get("parent_path")
        if parent is not None:
            if parent not in path_set:
                raise SeedValidationError(f"taxonomy: orphan parent {parent} on {n['path']}")
            if not n["path"].startswith(parent + "."):
                raise SeedValidationError(f"taxonomy: path {n['path']} not under parent {parent}")
        elif n["path"] != n["pillar"]:
            raise SeedValidationError(f"taxonomy: root node {n['path']} must equal its pillar")
    return nodes


def validate_blocklist(data: dict[str, Any]) -> list[dict[str, Any]]:
    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        raise SeedValidationError("blocklist: missing entries[]")
    for e in entries:
        for key in ("pattern", "detail", "match_hints", "added_by"):
            if key not in e:
                raise SeedValidationError(f"blocklist: entry missing {key}")
    # §8.1: the Lorang/Pogačar landmine must be present.
    if not any("lorang" in e["pattern"].lower() for e in entries):
        raise SeedValidationError("blocklist: required Lorang/Pogačar entry is missing")
    return entries


def validate_golden_set(data: dict[str, Any]) -> list[dict[str, Any]]:
    questions = data.get("questions")
    if not isinstance(questions, list) or not questions:
        raise SeedValidationError("golden_set: missing questions[]")
    for q in questions:
        if q.get("persona") not in PERSONAS:
            raise SeedValidationError(f"golden_set: bad persona {q.get('persona')!r}")
        if not q.get("question"):
            raise SeedValidationError("golden_set: empty question")
    return questions


def load_all(seeds_dir: Path = SEEDS_DIR) -> dict[str, list[dict[str, Any]]]:
    """Load and validate all seed files. Raises SeedValidationError on any problem."""
    return {
        "taxonomy": validate_taxonomy(load_json(seeds_dir / "taxonomy.json")),
        "blocklist": validate_blocklist(load_json(seeds_dir / "blocklist.json")),
        "golden_set": validate_golden_set(load_json(seeds_dir / "golden_set_starter.json")),
    }


def apply_seeds(cfg: Config, seeds_dir: Path = SEEDS_DIR) -> dict[str, int]:
    """Upsert all seeds into the database. Idempotent. Returns row counts."""
    from . import db

    seeds = load_all(seeds_dir)
    counts: dict[str, int] = {}
    with db.connect(cfg, privileged=True) as conn:
        with conn.cursor() as cur:
            # Parents must exist before children: insert roots first, then by depth.
            for node in sorted(seeds["taxonomy"], key=lambda n: n["path"].count(".")):
                cur.execute(
                    """
                    insert into taxonomy (path, label, parent_path, pillar, created_by)
                    values (%s, %s, %s, %s, %s)
                    on conflict (path) do update
                      set label = excluded.label,
                          parent_path = excluded.parent_path,
                          pillar = excluded.pillar
                    """,
                    (node["path"], node["label"], node.get("parent_path"),
                     node["pillar"], node.get("created_by", "seed-v1")),
                )
            counts["taxonomy"] = len(seeds["taxonomy"])

            for entry in seeds["blocklist"]:
                cur.execute(
                    """
                    insert into fact_blocklist (pattern, detail, match_hints, added_by)
                    select %s, %s, %s, %s
                    where not exists (select 1 from fact_blocklist where pattern = %s)
                    """,
                    (entry["pattern"], entry["detail"], entry["match_hints"],
                     entry["added_by"], entry["pattern"]),
                )
            counts["blocklist"] = len(seeds["blocklist"])

            for q in seeds["golden_set"]:
                cur.execute(
                    """
                    insert into golden_set (question, persona, reference_notes)
                    select %s, %s, %s
                    where not exists (select 1 from golden_set where question = %s)
                    """,
                    (q["question"], q["persona"], q.get("reference_notes"), q["question"]),
                )
            counts["golden_set"] = len(seeds["golden_set"])

            # Host expert row (identity fields only — credentials stay human-curated).
            cur.execute(
                """
                insert into experts (canonical_name, aliases, domain_tags)
                values (%s, %s, %s)
                on conflict (canonical_name) do nothing
                """,
                (HOST_EXPERT["canonical_name"], HOST_EXPERT["aliases"],
                 HOST_EXPERT["domain_tags"]),
            )
            counts["experts"] = 1
        conn.commit()
    return counts
