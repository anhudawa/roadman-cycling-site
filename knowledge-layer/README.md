# Roadman Knowledge Layer

Pipeline and schema for converting the 1,400+ episode Roadman Cycling podcast
archive into a structured, attributed, queryable knowledge graph. Full
engineering handover and binding rules: `CLAUDE.md` (repo root context) —
the handover document is authoritative; this README is orientation only.

> The phase0 companion package (`roadman-knowledge-layer-phase0.zip`) was not
> present in this repo, so `migrations/`, `prompts/`, and `seeds/` here were
> **regenerated from the handover's Appendix A–C specifications**, which the
> handover designates as authoritative in that case. The golden-set starter
> questions in particular need Ted's review (see `seeds/golden_set_starter.json`).

## Layout

```
knowledge-layer/
  migrations/        001_init.sql (schema), 002_roles_rls.sql (roles + RLS)
  prompts/           extraction (ext-1.0.0), relations (rel-1.0.0), synthesis (syn-1.0.0)
  seeds/             taxonomy (64 nodes), blocklist, golden set starter (20 q)
  pipeline/          Python package — `python -m pipeline.cli <command>`
  evals/             citation validator (implemented) + golden runner (stub)
  tests/             unit tests + FIXTURE-marked synthetic data
  docs/runbooks/     Ted-facing operational docs (grow as stages land)
```

## Quick start

```bash
cd knowledge-layer
pip install -e ".[dev]"        # add ".[db]" for psycopg when touching Supabase
pytest -q                       # 43 unit tests; integration tests skip without SUPABASE_DB_URL
python -m pipeline.cli --help
python -m pipeline.cli seed --dry-run   # validate seed files locally
```

Applying to Supabase (privileged connection):

```bash
psql "$SUPABASE_DB_URL" -f migrations/001_init.sql
psql "$SUPABASE_DB_URL" -f migrations/002_roles_rls.sql
python -m pipeline.cli seed     # idempotent
pytest tests/test_integration_credentials_guard.py  # P0-2 acceptance proof
```

## Non-negotiables (short form — see handover §8)

- `experts.credentials` is human-curated only; pipeline never writes it
  (enforced by trigger + column grants + code).
- Every published assertion carries episode + timestamp provenance.
- Hedging survives end-to-end; the blocklist (incl. the Lorang/Pogačar
  landmine) is checked on every extraction batch.
- Honest gaps over confident fabrication.

## Status

See `STATUS.md` at the repo root for session-by-session status, open
blockers, and decisions needed from Ted.
