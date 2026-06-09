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

    p = sub.add_parser("ingest", help="Phase 4: one-command new-episode ingestion (all stages)")
    p.add_argument("--latest", action="store_true", help="ingest the newest unprocessed episode(s)")
    _add_episode_flags(p)

    p = sub.add_parser("seed", help="load taxonomy/blocklist/golden-set seeds + host expert row (idempotent)")
    p.add_argument("--dry-run", action="store_true",
                   help="validate seed files locally without touching the database")

    sub.add_parser("status", help="show per-stage episode counts and open review-queue depth")

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

    if args.command == "status":
        raise SystemExit("status: not yet implemented (needs DB; lands with P0-4).")

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
        extract.run(cfg, episodes)
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
