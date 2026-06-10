"""Stage 4 driver unit tests — prompt assembly, cost tracking, schema (FIXTURE data)."""

from types import SimpleNamespace

from pipeline.stages.extract import (
    CLAIMS_OUTPUT_SCHEMA,
    REQUIRED_CLAIM_FIELDS,
    CostTracker,
    build_system_blocks,
    build_user_input,
)


def test_system_blocks_cache_marked_and_deterministic():
    blocks = build_system_blocks("PROMPT TEXT", {"b.path", "a.path"})
    assert "cache_control" not in blocks[0]
    assert blocks[-1]["cache_control"] == {"type": "ephemeral"}
    # sorted taxonomy: byte-identical prefix across calls, or the cache never hits
    assert blocks[-1]["text"].index("a.path") < blocks[-1]["text"].index("b.path")
    assert build_system_blocks("PROMPT TEXT", {"a.path", "b.path"}) == blocks


def test_user_input_layout():
    text = build_user_input(
        {"episode_number": 1203, "title": "FIXTURE Episode", "publish_date": "2026-01-01"},
        {"SPK_aaaa": "Fixture Guest", "SPK_UNRESOLVED": None},
        previous_segment_text="FIXTURE previous segment words.",
        target_segment={"speaker_label": "SPK_aaaa", "start_ts": 100.0, "end_ts": 200.0,
                        "text": "FIXTURE target segment words."},
    )
    assert "Episode 1203: FIXTURE Episode" in text
    assert "SPK_aaaa = Fixture Guest" in text
    assert "SPK_UNRESOLVED = unresolved" in text
    assert "CONTEXT ONLY" in text
    assert text.index("FIXTURE previous segment") < text.index("FIXTURE target segment")


def test_user_input_handles_episode_start_and_missing_number():
    text = build_user_input(
        {"episode_number": None, "title": "FIXTURE", "publish_date": None},
        {"SPK_UNRESOLVED": None},
        previous_segment_text=None,
        target_segment={"speaker_label": "SPK_UNRESOLVED", "start_ts": 0.0, "end_ts": 9.0,
                        "text": "FIXTURE opening."},
    )
    assert "Episode unnumbered" in text
    assert "(none — episode start)" in text


def test_output_schema_matches_validator_contract():
    item = CLAIMS_OUTPUT_SCHEMA["properties"]["claims"]["items"]
    for fname in REQUIRED_CLAIM_FIELDS:
        assert fname in item["properties"], f"schema missing {fname}"
        assert fname in item["required"]
    assert item["additionalProperties"] is False


def test_cost_tracker_prices_usage():
    tracker = CostTracker()
    tracker.add(SimpleNamespace(input_tokens=1_000_000, output_tokens=0,
                                cache_read_input_tokens=0, cache_creation_input_tokens=0))
    assert tracker.usd == 5.00
    tracker.add(SimpleNamespace(input_tokens=0, output_tokens=1_000_000,
                                cache_read_input_tokens=0, cache_creation_input_tokens=0))
    assert tracker.usd == 30.00
    assert tracker.calls == 2


def test_cost_tracker_tolerates_missing_cache_fields():
    tracker = CostTracker()
    tracker.add(SimpleNamespace(input_tokens=10, output_tokens=5))
    assert tracker.input_tokens == 10 and tracker.cache_read_tokens == 0
