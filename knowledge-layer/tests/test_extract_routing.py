"""Extraction validation/routing tests (task P0-5 acceptance criteria)."""

import json
from pathlib import Path

import pytest

from pipeline.seed_loader import load_all
from pipeline.stages.extract import route_extraction_output

SEEDS = Path(__file__).parent.parent / "seeds"
FIXTURES = json.loads(
    (Path(__file__).parent / "fixtures" / "extraction_outputs.json").read_text(encoding="utf-8")
)

TOPIC_PATHS = {n["path"] for n in load_all(SEEDS)["taxonomy"]}
RESOLVED_SPEAKERS = {"SPK0", "SPK1"}  # SPK2 deliberately unresolved


def route(name):
    return route_extraction_output(FIXTURES[name], TOPIC_PATHS, RESOLVED_SPEAKERS)


def test_fixtures_are_marked():
    assert FIXTURES["_meta"]["FIXTURE"] is True
    for name, payload in FIXTURES.items():
        if name == "_meta":
            continue
        for claim in payload["claims"]:
            assert "FIXTURE" in claim.get("claim_text", "FIXTURE")


def test_clean_claim_goes_live():
    out = route("valid_clean_claim")
    assert out.schema_violation is None
    assert len(out.live_claims) == 1
    assert not out.review_items


def test_low_confidence_routes_to_review():
    out = route("low_confidence_claim")
    assert not out.live_claims
    reasons = [r for item in out.review_items for r, _ in item["reasons"]]
    assert reasons == ["low_confidence"]


def test_uncertain_speaker_routes_to_review():
    out = route("uncertain_speaker_claim")
    assert not out.live_claims
    reasons = [r for item in out.review_items for r, _ in item["reasons"]]
    assert "ambiguous_speaker" in reasons


def test_unmapped_topic_routes_with_suggestion():
    out = route("unmapped_topic_claim")
    assert not out.live_claims
    (item,) = out.review_items
    assert item["reasons"][0][0] == "unmapped_topic"
    assert "le-metier.skills.cyclocross" in item["reasons"][0][1]


def test_invented_topic_path_routes_to_review():
    out = route("invented_topic_claim")
    assert not out.live_claims
    reasons = [r for item in out.review_items for r, _ in item["reasons"]]
    assert "unmapped_topic" in reasons


@pytest.mark.parametrize("name", [
    "schema_violation_missing_field",
    "schema_violation_bad_hedging",
])
def test_schema_violations_reject_whole_response(name):
    out = route(name)
    assert out.schema_violation is not None
    assert not out.live_claims and not out.review_items  # never a partial insert


def test_hedging_levels_round_trip():
    out = route("hedging_roundtrip_claims")
    assert out.schema_violation is None
    assert [c["hedging"] for c in out.live_claims] == ["speculative", "emphatic"]
