"""Seed integrity tests (tasks P0-3 / Appendix C invariants)."""

import json
from pathlib import Path

import pytest

from pipeline.seed_loader import (
    PERSONAS,
    PILLARS,
    SeedValidationError,
    load_all,
    validate_blocklist,
    validate_taxonomy,
)

SEEDS = Path(__file__).parent.parent / "seeds"


def test_all_seeds_load_and_validate():
    seeds = load_all(SEEDS)
    assert set(seeds) == {"taxonomy", "blocklist", "golden_set"}


def test_taxonomy_has_64_nodes_across_five_pillars():
    nodes = load_all(SEEDS)["taxonomy"]
    assert len(nodes) == 64
    assert {n["pillar"] for n in nodes} == PILLARS


def test_taxonomy_covers_appendix_c_minimums():
    paths = {n["path"] for n in load_all(SEEDS)["taxonomy"]}
    required = [
        "coaching.intensity-distribution.polarised",
        "coaching.intensity-distribution.pyramidal",
        "coaching.intensity-distribution.sweet-spot",
        "coaching.intensity-distribution.zone-2",
        "coaching.periodisation.reverse",
        "coaching.periodisation.block",
        "coaching.periodisation.taper",
        "coaching.intervals",
        "coaching.testing-metrics.ftp",
        "coaching.testing-metrics.hrv",
        "coaching.time-crunched",
        "coaching.masters.age-decline",
        "coaching.event-prep.gran-fondo",
        "coaching.event-prep.stage-race",
        "coaching.event-prep.gravel-ultra",
        "coaching.racecraft",
        "nutrition.in-ride-fueling.carb-rates",
        "nutrition.in-ride-fueling.hydration",
        "nutrition.daily.protein",
        "nutrition.daily.carb-periodisation",
        "nutrition.body-composition.red-s",
        "nutrition.supplements",
        "nutrition.recovery-nutrition",
        "strength-conditioning.programming.in-season",
        "strength-conditioning.programming.off-season",
        "strength-conditioning.injury-prevention",
        "strength-conditioning.masters-muscle-bone",
        "strength-conditioning.mobility",
        "recovery.sleep",
        "recovery.stress-load",
        "recovery.adaptation",
        "recovery.overtraining",
        "recovery.longevity.bloodwork",
        "recovery.illness-injury-return",
        "le-metier.pro-cycling.team-dynamics",
        "le-metier.pro-cycling.doping-ethics",
        "le-metier.equipment.aero",
        "le-metier.equipment.watches",
        "le-metier.skills",
        "le-metier.mindset",
        "le-metier.governance",
    ]
    missing = [p for p in required if p not in paths]
    assert not missing, f"taxonomy missing Appendix C minimums: {missing}"


def test_taxonomy_rejects_orphan_parent():
    bad = {"nodes": [
        {"path": "coaching", "label": "C", "parent_path": None, "pillar": "coaching"},
        {"path": "coaching.x.y", "label": "Y", "parent_path": "coaching.x", "pillar": "coaching"},
    ]}
    with pytest.raises(SeedValidationError, match="orphan parent"):
        validate_taxonomy(bad)


def test_blocklist_contains_lorang_pogacar_landmine():
    entries = load_all(SEEDS)["blocklist"]
    lorang = [e for e in entries if "lorang" in e["pattern"].lower()]
    assert lorang, "§8.1: Lorang/Pogačar entry is mandatory"
    assert "FALSE" in lorang[0]["detail"]
    hints = {h.lower() for h in lorang[0]["match_hints"]}
    assert "lorang" in hints and {"pogacar", "pogačar"} & hints


def test_blocklist_validation_requires_lorang_entry():
    with pytest.raises(SeedValidationError, match="Lorang"):
        validate_blocklist({"entries": [
            {"pattern": "x", "detail": "y", "match_hints": [], "added_by": "t"},
        ]})


def test_blocklist_contains_structural_biography_rule():
    entries = load_all(SEEDS)["blocklist"]
    assert any(e["pattern"].startswith("STRUCTURAL:") for e in entries)


def test_golden_set_has_20_questions_5_per_persona():
    questions = load_all(SEEDS)["golden_set"]
    assert len(questions) == 20
    for persona in PERSONAS:
        assert sum(1 for q in questions if q["persona"] == persona) == 5


def test_golden_set_marked_as_requiring_ted_review():
    raw = json.loads((SEEDS / "golden_set_starter.json").read_text(encoding="utf-8"))
    assert raw["_meta"]["requires_review_by"] == "Ted"
