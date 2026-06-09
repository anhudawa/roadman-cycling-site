"""Typed DB access for the pipeline.

Connects with the restricted pipeline credentials by default. NOTE (§8.1):
nothing in this module — or anywhere in pipeline code — may ever write
`experts.credentials`; the DB role and a trigger enforce it, and code review
enforces it here.
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import TYPE_CHECKING, Iterator

from .config import Config

if TYPE_CHECKING:  # psycopg is an optional dependency (pip install -e '.[db]')
    import psycopg


@contextmanager
def connect(cfg: Config, *, privileged: bool = False) -> Iterator["psycopg.Connection"]:
    """Yield a Postgres connection. `privileged` is for migrations/seeds only."""
    try:
        import psycopg
    except ImportError as exc:  # pragma: no cover
        raise SystemExit(
            "psycopg not installed. Install with: pip install -e '.[db]'"
        ) from exc

    dsn = cfg.supabase_db_url
    if not dsn:
        raise SystemExit(
            "SUPABASE_DB_URL is not set. Direct Postgres access is required for "
            "migrations and seeds (see .env.example)."
        )
    with psycopg.connect(dsn) as conn:
        if not privileged:
            with conn.cursor() as cur:
                cur.execute("set role pipeline_worker")
        yield conn
