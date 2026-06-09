"""Blocklist pre-screen tests (§8.1)."""

import json
from pathlib import Path

from pipeline.qa.blocklist_check import prescreen
from pipeline.seed_loader import load_all

SEEDS = Path(__file__).parent.parent / "seeds"
ENTRIES = load_all(SEEDS)["blocklist"]
FIXTURES = json.loads(
    (Path(__file__).parent / "fixtures" / "extraction_outputs.json").read_text(encoding="utf-8")
)


def test_lorang_pogacar_claim_is_flagged():
    claim = FIXTURES["blocklist_bait_claim"]["claims"][0]
    hits = prescreen(claim["claim_text"], claim["verbatim_quote"], ENTRIES)
    assert any("lorang" in h["pattern"].lower() for h in hits)


def test_diacritics_do_not_evade_the_screen():
    hits = prescreen(
        "FIXTURE: someone says Lorang coached Pogačar",
        "FIXTURE: Lorang coached Pogačar",
        ENTRIES,
    )
    assert any("lorang" in h["pattern"].lower() for h in hits)


def test_single_name_alone_does_not_flag_person_entry():
    hits = prescreen(
        "FIXTURE: Pogačar won the race convincingly.",
        "FIXTURE: Pogačar absolutely flew up that climb",
        ENTRIES,
    )
    assert not any("lorang" in h["pattern"].lower() for h in hits)


def test_biography_phrasing_triggers_structural_rule():
    hits = prescreen(
        "FIXTURE: The guest was head coach at a WorldTour team.",
        "FIXTURE: back when I was head coach at the team",
        ENTRIES,
    )
    assert any(h["pattern"].startswith("STRUCTURAL:") for h in hits)


def test_innocent_training_claim_passes():
    hits = prescreen(
        "FIXTURE: Riders might benefit from more zone 2 volume.",
        "FIXTURE: more easy volume would not hurt most people",
        ENTRIES,
    )
    assert hits == []
