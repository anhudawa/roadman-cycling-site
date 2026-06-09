"""Environment-driven configuration. Never hardcode secrets; see .env.example."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PROMPTS_DIR = REPO_ROOT / "prompts"
SEEDS_DIR = REPO_ROOT / "seeds"

PROMPT_VERSIONS = {
    "extraction": ("extraction_v1.md", "ext-1.0.0"),
    "relations": ("claim_relations_v1.md", "rel-1.0.0"),
    "synthesis": ("synthesis_v1.md", "syn-1.0.0"),
}


@dataclass
class Config:
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_pipeline_key: str = ""
    supabase_db_url: str = ""  # direct Postgres connection for migrations/seeds
    anthropic_api_key: str = ""
    embedding_provider: str = ""
    embedding_model: str = ""
    embedding_dim: int = 1536
    batch_budget_usd: float = 0.0  # 0 = unset; batch submission refuses to run
    audio_archive_uri: str = ""  # resolved 2026-06-09: public Anchor RSS feed
    audio_cache_dir: str = "./audio-cache"  # local mirror of downloaded enclosures
    whisper_model: str = "large-v3"
    pipeline_version: str = field(default="pipe-0.1.0")

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            supabase_url=os.environ.get("SUPABASE_URL", ""),
            supabase_service_role_key=os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""),
            supabase_pipeline_key=os.environ.get("SUPABASE_PIPELINE_KEY", ""),
            supabase_db_url=os.environ.get("SUPABASE_DB_URL", ""),
            anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
            embedding_provider=os.environ.get("EMBEDDING_PROVIDER", ""),
            embedding_model=os.environ.get("EMBEDDING_MODEL", ""),
            embedding_dim=int(os.environ.get("EMBEDDING_DIM", "1536")),
            batch_budget_usd=float(os.environ.get("BATCH_BUDGET_USD", "0") or "0"),
            audio_archive_uri=os.environ.get("AUDIO_ARCHIVE_URI", ""),
            audio_cache_dir=os.environ.get("AUDIO_CACHE_DIR", "./audio-cache"),
            whisper_model=os.environ.get("WHISPER_MODEL", "large-v3"),
            pipeline_version=os.environ.get("PIPELINE_VERSION", "pipe-0.1.0"),
        )


def load_prompt(name: str) -> tuple[str, str]:
    """Return (prompt_text, prompt_version) for a named prompt, verbatim from file."""
    filename, version = PROMPT_VERSIONS[name]
    return (PROMPTS_DIR / filename).read_text(encoding="utf-8"), version
