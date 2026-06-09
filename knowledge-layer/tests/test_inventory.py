"""RSS inventory parser tests (FIXTURE feed mirrors the real Anchor structure)."""

from datetime import date
from pathlib import Path

from pipeline.inventory import (
    _parse_duration,
    assign_episode_numbers,
    inventory_report,
    parse_feed,
)

FEED_XML = (Path(__file__).parent / "fixtures" / "feed_sample.xml").read_text(encoding="utf-8")


def test_parse_feed_extracts_all_fields():
    episodes = parse_feed(FEED_XML)
    assert len(episodes) == 3
    newest = episodes[0]
    assert newest.guid == "fixture-guid-0003"
    assert newest.title == "FIXTURE Episode With Number"
    assert newest.episode_number == 1003
    assert newest.publish_date == date(2026, 6, 3)
    assert newest.audio_url == "https://example.com/fixture/ep1003.mp3"
    assert newest.duration_seconds == 3723


def test_unnumbered_episode_has_none_number():
    episodes = parse_feed(FEED_XML)
    assert episodes[2].episode_number is None
    assert episodes[2].duration_seconds == 1830  # bare-seconds duration form


def test_report_flags_duplicates_and_unnumbered():
    report = inventory_report(parse_feed(FEED_XML))
    assert report["items"] == 3
    assert report["with_audio"] == 3
    assert report["numbered"] == 2
    assert report["unnumbered"] == 1
    assert report["duplicate_numbers"] == [1003]
    assert report["duplicate_guids"] == 0
    assert report["date_range"] == ["2019-01-01", "2026-06-03"]


def test_duplicate_numbers_withheld_from_both_claimants():
    numbers = assign_episode_numbers(parse_feed(FEED_XML))
    # 1003 appears twice in the fixture feed: neither episode gets it.
    assert numbers["fixture-guid-0003"] is None
    assert numbers["fixture-guid-0002"] is None
    assert numbers["fixture-guid-0001"] is None  # unnumbered stays None


def test_unambiguous_numbers_assigned():
    episodes = parse_feed(FEED_XML)
    episodes[1].episode_number = 1002  # resolve the fixture's duplicate
    numbers = assign_episode_numbers(episodes)
    assert numbers["fixture-guid-0003"] == 1003
    assert numbers["fixture-guid-0002"] == 1002


def test_duration_parsing_variants():
    assert _parse_duration("01:02:03") == 3723
    assert _parse_duration("45:10") == 2710
    assert _parse_duration("1830") == 1830
    assert _parse_duration(None) is None
    assert _parse_duration("garbage") is None
