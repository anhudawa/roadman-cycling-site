"""Episode inventory from the podcast RSS feed (precursor to Stage 1).

The audio archive is the public Anchor (Spotify for Podcasters) RSS feed —
every item carries a downloadable enclosure (verified 2026-06-09: 1,283
items, ~64 GB total, audio/mpeg).

Identity scheme (approved by Anthony 2026-06-09, migration 003):
  - rss_guid is the stable unique key (zero duplicates in the feed)
  - episode_number is display-only and nullable: populated only where the
    feed number is unambiguous (used exactly once); duplicated numbers load
    as NULL for editorial resolution.
"""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import date
from email.utils import parsedate_to_datetime

ITUNES = "{http://www.itunes.com/dtds/podcast-1.0.dtd}"


@dataclass
class FeedEpisode:
    guid: str
    title: str
    episode_number: int | None
    publish_date: date | None
    audio_url: str | None
    duration_seconds: int | None


def _parse_duration(raw: str | None) -> int | None:
    if not raw:
        return None
    raw = raw.strip()
    if re.fullmatch(r"\d+", raw):
        return int(raw)
    parts = raw.split(":")
    if not all(re.fullmatch(r"\d+", p) for p in parts) or len(parts) not in (2, 3):
        return None
    parts = [int(p) for p in parts]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def parse_feed(xml_text: str) -> list[FeedEpisode]:
    """Parse RSS into episode records, newest first (feed order)."""
    root = ET.fromstring(xml_text)
    episodes = []
    for item in root.iter("item"):
        guid = item.findtext("guid")
        title = item.findtext("title")
        if not guid or not title:
            continue
        enclosure = item.find("enclosure")
        ep_raw = item.findtext(f"{ITUNES}episode")
        pub_raw = item.findtext("pubDate")
        publish = None
        if pub_raw:
            try:
                publish = parsedate_to_datetime(pub_raw).date()
            except ValueError:
                pass
        episodes.append(FeedEpisode(
            guid=guid.strip(),
            title=title.strip(),
            episode_number=int(ep_raw) if ep_raw and ep_raw.isdigit() else None,
            publish_date=publish,
            audio_url=enclosure.get("url") if enclosure is not None else None,
            duration_seconds=_parse_duration(item.findtext(f"{ITUNES}duration")),
        ))
    return episodes


def inventory_report(episodes: list[FeedEpisode]) -> dict:
    """Summarise feed health: the numbers Ted needs for the numbering decision."""
    numbered = [e.episode_number for e in episodes if e.episode_number is not None]
    seen, dupes = set(), set()
    for n in numbered:
        (dupes if n in seen else seen).add(n)
    return {
        "items": len(episodes),
        "with_audio": sum(1 for e in episodes if e.audio_url),
        "with_duration": sum(1 for e in episodes if e.duration_seconds),
        "numbered": len(numbered),
        "unnumbered": len(episodes) - len(numbered),
        "duplicate_numbers": sorted(dupes),
        "duplicate_guids": len(episodes) - len({e.guid for e in episodes}),
        "date_range": [
            str(min(e.publish_date for e in episodes if e.publish_date)),
            str(max(e.publish_date for e in episodes if e.publish_date)),
        ] if any(e.publish_date for e in episodes) else None,
    }


def assign_episode_numbers(episodes: list[FeedEpisode]) -> dict[str, int | None]:
    """Map guid -> display episode number, or None where the feed is ambiguous.

    A number is assigned only when the feed uses it exactly once. Duplicated
    numbers are withheld entirely (both claimants load as NULL) — wrongly
    citing "Ep N" to members is worse than citing no number.
    """
    counts: dict[int, int] = {}
    for e in episodes:
        if e.episode_number is not None:
            counts[e.episode_number] = counts.get(e.episode_number, 0) + 1
    return {
        e.guid: e.episode_number
        if e.episode_number is not None and counts[e.episode_number] == 1
        else None
        for e in episodes
    }


def apply_inventory(cfg, episodes: list[FeedEpisode]) -> dict[str, int]:
    """Upsert the feed into `episodes`, keyed on rss_guid. Idempotent.

    Existing rows: metadata refreshed, processing status untouched, and a
    non-null episode_number in the DB is never clobbered (editorial fixes win
    over feed re-derivation).
    """
    from . import db

    numbers = assign_episode_numbers(episodes)
    counts = {"inserted": 0, "updated": 0, "number_withheld": sum(
        1 for e in episodes if e.episode_number is not None and numbers[e.guid] is None
    )}
    with db.connect(cfg) as conn:
        with conn.cursor() as cur:
            for e in episodes:
                cur.execute(
                    """
                    insert into episodes
                      (rss_guid, episode_number, title, publish_date, audio_url,
                       duration_seconds, pipeline_version)
                    values (%s, %s, %s, %s, %s, %s, %s)
                    on conflict (rss_guid) do update set
                      title = excluded.title,
                      publish_date = excluded.publish_date,
                      audio_url = excluded.audio_url,
                      duration_seconds = excluded.duration_seconds,
                      episode_number = coalesce(episodes.episode_number,
                                                excluded.episode_number),
                      updated_at = now()
                    returning (xmax = 0) as inserted
                    """,
                    (e.guid, numbers[e.guid], e.title, e.publish_date,
                     e.audio_url, e.duration_seconds, cfg.pipeline_version),
                )
                counts["inserted" if cur.fetchone()[0] else "updated"] += 1
        conn.commit()
    return counts


def fetch_feed(feed_url: str) -> str:
    from urllib.request import Request, urlopen

    req = Request(feed_url, headers={"User-Agent": "roadman-knowledge-pipeline/0.1"})
    with urlopen(req, timeout=120) as resp:
        return resp.read().decode("utf-8", errors="replace")
