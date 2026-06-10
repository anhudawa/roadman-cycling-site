"""Single pipeline entrypoint: ``python -m pipeline.cli <command>``.

Every stage command takes the same episode-selection flags (§5):
  --episode N        one episode
  --range A-B        inclusive episode-number range
  --all-pending      every episode whose status makes it eligible for the stage
"""

from __future__ import annotations

import argparse
import json
import sys

from . import PIPELINE_VERSION_DEFAULT
from .config import Config

STAGE_COMMANDS = {
    "transcribe": ("Stage 1: Whisper large-v3 transcription (word-level timestamps)", "stages.transcribe"),
    "diarize": ("Stage 2: pyannote diarization + speaker identification", "stages.diarize"),
    "segment": ("Stage 3: 200-500 word topical segmentation", "stages.segment"),
    "extract": ("Stage 4: claim extraction (validated, routed, blocklist-checked)", "stages.extract"),
    "normalise": ("Stage 5: entity resolution + claim dedupe", "stages.normalise"),
    "index": ("Stage 6: embeddings for segments and claims", "stages.index"),
    "relations": ("Phase 2 pass: claim relations (supports/contradicts/refines/supersedes)", "stages.relations"),
}


def _add_episode_flags(p: argparse.ArgumentParser) -> None:
    group = p.add_mutually_exclusive_group()
    group.add_argument("--episode", type=int, metavar="N", help="single episode number")
    group.add_argument("--range", metavar="A-B", help="inclusive episode number range, e.g. 100-120")
    group.add_argument("--all-pending", action="store_true", help="all episodes eligible for this stage")


def _episode_selection(args: argparse.Namespace) -> list[int]:
    if getattr(args, "episode", None) is not None:
        return [args.episode]
    if getattr(args, "range", None):
        try:
            start, end = (int(x) for x in args.range.split("-", 1))
        except ValueError:
            raise SystemExit(f"--range must look like A-B, got {args.range!r}")
        if end < start:
            raise SystemExit(f"--range end before start: {args.range!r}")
        return list(range(start, end + 1))
    return []  # --all-pending or nothing: stage resolves eligibility from DB


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m pipeline.cli",
        description="Roadman knowledge layer pipeline. Per-episode, idempotent, resumable.",
    )
    parser.add_argument("--pipeline-version", default=None,
                        help=f"override PIPELINE_VERSION (default {PIPELINE_VERSION_DEFAULT})")
    sub = parser.add_subparsers(dest="command", required=True)

    for name, (help_text, _) in STAGE_COMMANDS.items():
        p = sub.add_parser(name, help=help_text)
        _add_episode_flags(p)
        if name == "index":
            p.add_argument("--force", action="store_true",
                           help="re-embed rows that already have embeddings")
        if name == "extract":
            p.add_argument("--force", action="store_true",
                           help="re-extract episodes that already have claims")

    p = sub.add_parser("ingest", help="Phase 4: one-command new-episode ingestion (all stages)")
    p.add_argument("--latest", action="store_true", help="ingest the newest unprocessed episode(s)")
    _add_episode_flags(p)

    p = sub.add_parser("seed", help="load taxonomy/blocklist/golden-set seeds + host expert row (idempotent)")
    p.add_argument("--dry-run", action="store_true",
                   help="validate seed files locally without touching the database")

    p = sub.add_parser("inventory", help="parse the podcast RSS feed into the episodes inventory")
    p.add_argument("--feed-url", default=None,
                   help="RSS feed URL (default: AUDIO_ARCHIVE_URI)")
    p.add_argument("--dry-run", action="store_true",
                   help="fetch + parse + report feed health without touching the database")

    sub.add_parser("status", help="show per-stage episode counts and open review-queue depth")

    p = sub.add_parser("audit-sample",
                       help="export the 200-claim stratified attribution audit CSV (P0-8)")
    p.add_argument("--out", default="attribution_audit_sample.csv", help="output CSV path")
    p.add_argument("--seed", type=int, default=0, help="sampling seed (reproducible audits)")

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    cfg = Config.from_env()
    if args.pipeline_version:
        cfg.pipeline_version = args.pipeline_version

    if args.command == "seed":
        from . import seed_loader

        if args.dry_run:
            seeds = seed_loader.load_all()
            print(json.dumps({k: len(v) for k, v in seeds.items()}, indent=2))
            print("seed --dry-run: all seed files valid.")
            return 0
        counts = seed_loader.apply_seeds(cfg)
        print(f"seeds applied (idempotent): {json.dumps(counts)}")
        return 0

    if args.command == "inventory":
        from . import inventory

        feed_url = args.feed_url or cfg.audio_archive_uri
        if not feed_url:
            raise SystemExit("inventory: no feed URL — pass --feed-url or set AUDIO_ARCHIVE_URI.")
        episodes = inventory.parse_feed(inventory.fetch_feed(feed_url))
        print(json.dumps(inventory.inventory_report(episodes), indent=2))
        if args.dry_run:
            return 0
        counts = inventory.apply_inventory(cfg, episodes)
        print(f"inventory applied (idempotent): {json.dumps(counts)}")
        return 0

    if args.command == "status":
        from . import db

        with db.connect(cfg) as conn, conn.cursor() as cur:
            cur.execute("select status, count(*) from episodes group by status order by status")
            episode_counts = {str(s): n for s, n in cur.fetchall()}
            cur.execute("select count(*) from review_queue where status = 'open'")
            open_reviews = cur.fetchone()[0]
            cur.execute("select count(*) from claims where superseded_by is null")
            live_claims = cur.fetchone()[0]
        print(json.dumps({
            "episodes_by_status": episode_counts,
            "review_queue_open": open_reviews,
            "claims_live": live_claims,
        }, indent=2))
        return 0

    if args.command == "audit-sample":
        from .qa import attribution_sample

        attribution_sample.run(cfg, out_path=args.out, seed=args.seed)
        return 0

    if args.command == "ingest":
        raise SystemExit("ingest: not yet implemented (Phase 4, task P4-1).")

    episodes = _episode_selection(args)
    if args.command == "transcribe":
        from .stages import transcribe
        transcribe.run(cfg, episodes)
    elif args.command == "diarize":
        from .stages import diarize
        diarize.run(cfg, episodes)
    elif args.command == "segment":
        from .stages import segment
        segment.run(cfg, episodes)
    elif args.command == "extract":
        from .stages import extract
        extract.run(cfg, episodes, force=args.force)
    elif args.command == "normalise":
        from .stages import normalise
        normalise.run(cfg, episodes)
    elif args.command == "index":
        from .stages import index
        index.run(cfg, episodes, force=args.force)
    elif args.command == "relations":
        from .stages import relations
        relations.run(cfg, episodes)
    return 0


if __name__ == "__main__":
    sys.exit(main())
