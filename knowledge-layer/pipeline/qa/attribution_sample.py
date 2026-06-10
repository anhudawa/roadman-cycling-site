"""Stratified sampling for the human attribution audit (task P0-8, §7.1).

200 claims stratified by expert x era, exported as CSV for Ted/Anthony to
verify each claim against its verbatim quote and audio timestamp.
Gate: >=98% attribution, >=95% faithfulness — fails the phase gate otherwise.

Sampling is deterministic for a given seed so an audit can be reproduced.
"""

from __future__ import annotations

import csv
import random
from collections import defaultdict
from pathlib import Path
from typing import Any

from ..config import Config

SAMPLE_SIZE = 200
ATTRIBUTION_GATE = 0.98
FAITHFULNESS_GATE = 0.95


def era_of(publish_year: int) -> str:
    """Three-year archive eras: 2019-2021, 2022-2024, 2025-2027, ..."""
    start = 2019 + ((publish_year - 2019) // 3) * 3
    return f"{start}-{start + 2}"


def stratified_sample(
    claims: list[dict[str, Any]],
    sample_size: int = SAMPLE_SIZE,
    seed: int = 0,
) -> list[dict[str, Any]]:
    """Sample stratified by (expert, era), proportional with a floor of 1.

    Every non-empty stratum contributes at least one claim (an expert who
    appeared once still gets audited); remaining slots are allocated
    proportionally to stratum size, largest first.
    """
    if len(claims) <= sample_size:
        return sorted(claims, key=lambda c: str(c["id"]))

    strata: dict[tuple, list[dict[str, Any]]] = defaultdict(list)
    for claim in claims:
        strata[(claim["expert"], era_of(claim["publish_year"]))].append(claim)

    rng = random.Random(seed)
    keys = sorted(strata, key=lambda k: (-len(strata[k]), k))
    quotas = {k: 1 for k in keys}
    remaining = sample_size - len(keys)
    if remaining < 0:  # more strata than slots: largest strata win
        quotas = {k: 1 for k in keys[:sample_size]}
        remaining = 0
    total = sum(len(strata[k]) for k in quotas)
    for k in quotas:
        share = int(remaining * len(strata[k]) / total) if total else 0
        quotas[k] += min(share, len(strata[k]) - quotas[k])
    # distribute rounding leftovers to the largest strata with capacity
    leftover = sample_size - sum(quotas.values())
    for k in keys:
        if leftover <= 0:
            break
        capacity = len(strata[k]) - quotas.get(k, 0)
        if k in quotas and capacity > 0:
            take = min(capacity, leftover)
            quotas[k] += take
            leftover -= take

    sample: list[dict[str, Any]] = []
    for k, quota in quotas.items():
        pool = sorted(strata[k], key=lambda c: str(c["id"]))
        sample.extend(rng.sample(pool, min(quota, len(pool))))
    return sample


def run(cfg: Config, out_path: str = "attribution_audit_sample.csv", seed: int = 0) -> None:
    from .. import db

    with db.connect(cfg) as conn, conn.cursor() as cur:
        cur.execute(
            """
            select c.id, coalesce(x.canonical_name, 'UNRESOLVED') as expert,
                   extract(year from e.publish_date)::int as publish_year,
                   e.episode_number, c.timestamp_s, c.claim_text, c.verbatim_quote,
                   c.hedging, c.population_qualifier, e.audio_url
            from claims c
            join episodes e on e.id = c.episode_id
            left join experts x on x.id = c.expert_id
            where c.superseded_by is null
            """
        )
        cols = [d[0] for d in cur.description]
        claims = [dict(zip(cols, row)) for row in cur.fetchall()]

    if not claims:
        raise SystemExit("attribution_sample: no claims in the database yet.")

    sample = stratified_sample(claims, seed=seed)
    fieldnames = [*cols, "auditor_attribution_ok", "auditor_faithfulness_ok", "auditor_notes"]
    with Path(out_path).open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for claim in sample:
            writer.writerow({**claim, "auditor_attribution_ok": "",
                             "auditor_faithfulness_ok": "", "auditor_notes": ""})
    print(f"attribution_sample: wrote {len(sample)} claims to {out_path} (seed={seed}). "
          f"Gates: attribution >= {ATTRIBUTION_GATE:.0%}, faithfulness >= {FAITHFULNESS_GATE:.0%}.")
