"""Stage 6 — Indexing: embeddings for segments and claims.

STATUS: stub. Blocked on the P0-7 embedding benchmark (EMBEDDING_* env unset).
Idempotent contract: skip rows with non-null embedding unless --force.
"""

from __future__ import annotations

from ..config import Config


def run(cfg: Config, episode_numbers: list[int], force: bool = False) -> None:
    if not cfg.embedding_provider or not cfg.embedding_model:
        raise SystemExit(
            "index: EMBEDDING_PROVIDER/EMBEDDING_MODEL unset — decided by the "
            "P0-7 pilot benchmark, signed off by Ted."
        )
    raise SystemExit("index: not yet implemented (task P0-6/P0-7).")
