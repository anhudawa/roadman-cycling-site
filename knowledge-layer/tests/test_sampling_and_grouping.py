"""Tests for the attribution sampler (P0-8) and relations grouping (P2-1 prep).

All data herein is FIXTURE data with fictional experts.
"""

from datetime import date

from pipeline.qa.attribution_sample import era_of, stratified_sample
from pipeline.stages.relations import group_claims_for_relations


def _claims(expert: str, year: int, n: int, start: int = 0):
    return [
        {"id": f"{expert}-{year}-{i}", "expert": expert, "publish_year": year}
        for i in range(start, start + n)
    ]


def test_era_buckets():
    assert era_of(2019) == era_of(2021) == "2019-2021"
    assert era_of(2022) == era_of(2024) == "2022-2024"
    assert era_of(2026) == "2025-2027"


def test_small_population_returned_whole():
    claims = _claims("FIXTURE A", 2020, 50)
    assert len(stratified_sample(claims, sample_size=200)) == 50


def test_sample_size_and_floor_per_stratum():
    claims = (
        _claims("FIXTURE Big", 2020, 500)
        + _claims("FIXTURE Big", 2023, 400)
        + _claims("FIXTURE Rare", 2021, 1)   # one appearance — must still be audited
        + _claims("FIXTURE Mid", 2025, 60)
    )
    sample = stratified_sample(claims, sample_size=200, seed=42)
    assert len(sample) == 200
    assert any(c["expert"] == "FIXTURE Rare" for c in sample)
    big = sum(1 for c in sample if c["expert"] == "FIXTURE Big")
    assert big > 150  # proportionality: the dominant expert dominates the sample


def test_sampling_is_deterministic_per_seed():
    claims = _claims("FIXTURE A", 2020, 300) + _claims("FIXTURE B", 2023, 300)
    s1 = stratified_sample(claims, sample_size=100, seed=7)
    s2 = stratified_sample(claims, sample_size=100, seed=7)
    s3 = stratified_sample(claims, sample_size=100, seed=8)
    assert [c["id"] for c in s1] == [c["id"] for c in s2]
    assert [c["id"] for c in s1] != [c["id"] for c in s3]


def _claim(cid, path, d):
    return {"id": cid, "topic_path": path, "publish_date": d}


def test_grouping_by_node_and_parent():
    claims = [
        _claim("c1", "coaching.intensity-distribution.polarised", date(2019, 1, 1)),
        _claim("c2", "coaching.intensity-distribution.polarised", date(2024, 1, 1)),
        _claim("c3", "coaching.intensity-distribution.pyramidal", date(2022, 1, 1)),
    ]
    groups = group_claims_for_relations(claims)
    sets = [{c["id"] for c in g} for g in groups]
    assert {"c1", "c2"} in sets                 # node-level group
    assert {"c1", "c2", "c3"} in sets           # parent-level: cross-sibling visibility
    assert not any(s == {"c3"} for s in sets)   # singletons have nothing to relate


def test_groups_are_chronological_and_capped():
    claims = [
        _claim(f"c{i}", "recovery.sleep", date(2019 + i % 7, 1 + i % 12, 1))
        for i in range(75)
    ]
    groups = group_claims_for_relations(claims, max_per_call=30)
    assert all(len(g) <= 30 for g in groups)
    assert sum(len(g) for g in groups) == 75
    for g in groups:
        dates = [c["publish_date"] for c in g]
        assert dates == sorted(dates)


def test_null_topic_paths_excluded():
    claims = [
        _claim("c1", None, date(2020, 1, 1)),
        _claim("c2", "recovery.sleep", date(2021, 1, 1)),
        _claim("c3", "recovery.sleep", date(2022, 1, 1)),
    ]
    groups = group_claims_for_relations(claims)
    assert all(c["id"] != "c1" for g in groups for c in g)


def test_duplicate_parent_group_dropped():
    # Parent group would be identical to the single child's group: call once.
    claims = [
        _claim("c1", "recovery.sleep", date(2020, 1, 1)),
        _claim("c2", "recovery.sleep", date(2021, 1, 1)),
    ]
    groups = group_claims_for_relations(claims)
    assert len(groups) == 1
