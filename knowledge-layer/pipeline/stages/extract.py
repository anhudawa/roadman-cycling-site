"""Stage 4 — Extraction: one Claude call per segment-window, strict validation.

Routing rules are enforced IN CODE, not just in the prompt (§5 stage 4):

  - schema violation        -> review_queue(schema_violation), NO partial insert
  - speaker_uncertain=true  -> review_queue(ambiguous_speaker)
  - confidence < 0.7        -> review_queue(low_confidence)
  - topic_path == UNMAPPED  -> review_queue(unmapped_topic); claim stored with
                               topic_path NULL, suggested_topic in the detail
  - blocklist hint hit      -> review_queue(blocklist_hit) (qa/blocklist_check)

Every claim is stamped with prompt_version, model_version, pipeline_version.

API notes (verified against current docs 2026-06-09, per §2):
  - The handover specified "temperature 0", but sampling parameters are
    removed on current frontier models (400 error). The determinism intent is
    met instead by structured outputs (output_config.format json_schema —
    guarantees schema-valid JSON) plus the code-level validation here.
  - The static prefix (extraction prompt + taxonomy) is prompt-cached; only
    the per-segment window varies per call.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any

from ..config import Config
from ..qa import blocklist_check

CLAIM_TYPES = {"recommendation", "mechanism", "empirical", "opinion", "anecdote", "disagreement"}
HEDGING_LEVELS = {"speculative", "qualified", "confident", "emphatic"}
CONFIDENCE_REVIEW_THRESHOLD = 0.7

EXTRACTION_MODEL_DEFAULT = "claude-opus-4-8"
# USD per million tokens, verified 2026-06-09. Re-verify before the corpus run.
INPUT_USD_PER_MTOK = 5.00
OUTPUT_USD_PER_MTOK = 25.00
CACHE_READ_USD_PER_MTOK = 0.50   # ~0.1x input
CACHE_WRITE_USD_PER_MTOK = 6.25  # ~1.25x input

# Structured-output schema for the extraction response. Range checks
# (confidence 0-1) are unsupported in the API schema subset and enforced by
# _schema_error below instead.
CLAIMS_OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "claims": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "speaker_label": {"type": "string"},
                    "speaker_uncertain": {"type": "boolean"},
                    "timestamp_s": {"type": "number"},
                    "claim_text": {"type": "string"},
                    "verbatim_quote": {"type": "string"},
                    "claim_type": {"type": "string", "enum": sorted(CLAIM_TYPES)},
                    "topic_path": {"type": "string"},
                    "suggested_topic": {"type": ["string", "null"]},
                    "population_qualifier": {"type": "string"},
                    "hedging": {"type": "string", "enum": sorted(HEDGING_LEVELS)},
                    "confidence": {"type": "number"},
                },
                "required": ["speaker_label", "speaker_uncertain", "timestamp_s",
                             "claim_text", "verbatim_quote", "claim_type", "topic_path",
                             "suggested_topic", "population_qualifier", "hedging",
                             "confidence"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["claims"],
    "additionalProperties": False,
}

REQUIRED_CLAIM_FIELDS = {
    "speaker_label": str,
    "speaker_uncertain": bool,
    "timestamp_s": (int, float),
    "claim_text": str,
    "verbatim_quote": str,
    "claim_type": str,
    "topic_path": str,
    "population_qualifier": str,
    "hedging": str,
    "confidence": (int, float),
}


@dataclass
class RoutedOutput:
    """Result of validating one extraction response."""

    live_claims: list[dict[str, Any]] = field(default_factory=list)
    review_items: list[dict[str, Any]] = field(default_factory=list)
    schema_violation: str | None = None  # set => nothing from this response is inserted


def _schema_error(payload: Any) -> str | None:
    """Return a description of the first schema violation, or None if valid."""
    if not isinstance(payload, dict) or not isinstance(payload.get("claims"), list):
        return "response is not an object with a claims[] list"
    for i, claim in enumerate(payload["claims"]):
        if not isinstance(claim, dict):
            return f"claims[{i}] is not an object"
        for fname, ftype in REQUIRED_CLAIM_FIELDS.items():
            if fname not in claim:
                return f"claims[{i}] missing field {fname}"
            value = claim[fname]
            # bool is a subclass of int — keep True out of numeric fields
            if not isinstance(value, ftype) or (isinstance(value, bool) and ftype is not bool):
                return f"claims[{i}].{fname} has wrong type"
        if claim["claim_type"] not in CLAIM_TYPES:
            return f"claims[{i}].claim_type invalid: {claim['claim_type']!r}"
        if claim["hedging"] not in HEDGING_LEVELS:
            return f"claims[{i}].hedging invalid: {claim['hedging']!r}"
        if not 0 <= claim["confidence"] <= 1:
            return f"claims[{i}].confidence out of range: {claim['confidence']!r}"
        if claim["topic_path"] == "UNMAPPED" and not claim.get("suggested_topic"):
            return f"claims[{i}] is UNMAPPED but has no suggested_topic"
        if not claim["claim_text"].strip() or not claim["verbatim_quote"].strip():
            return f"claims[{i}] has empty claim_text or verbatim_quote"
    return None


def route_extraction_output(
    payload: Any,
    valid_topic_paths: set[str],
    resolved_speakers: set[str],
) -> RoutedOutput:
    """Validate one extraction response and split claims into live vs review.

    A single schema violation rejects the WHOLE response (never a partial
    insert). Routing reasons accumulate — a claim can carry several.
    """
    out = RoutedOutput()
    violation = _schema_error(payload)
    if violation:
        out.schema_violation = violation
        return out

    for claim in payload["claims"]:
        reasons: list[tuple[str, str]] = []

        if claim["topic_path"] == "UNMAPPED":
            reasons.append(("unmapped_topic", f"suggested: {claim.get('suggested_topic')}"))
        elif claim["topic_path"] not in valid_topic_paths:
            # The model invented a path — treat as a schema-level lie, route it.
            reasons.append(("unmapped_topic", f"invented path: {claim['topic_path']}"))

        if claim["speaker_uncertain"] or claim["speaker_label"] not in resolved_speakers:
            reasons.append(("ambiguous_speaker", f"label: {claim['speaker_label']}"))

        if claim["confidence"] < CONFIDENCE_REVIEW_THRESHOLD:
            reasons.append(("low_confidence", f"confidence: {claim['confidence']}"))

        if reasons:
            out.review_items.append({"claim": claim, "reasons": reasons})
        else:
            out.live_claims.append(claim)
    return out


@dataclass
class CostTracker:
    """Accumulates API usage and prices it. Pilot reports per-episode cost (P0-6)."""

    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_write_tokens: int = 0
    calls: int = 0

    def add(self, usage: Any) -> None:
        self.calls += 1
        self.input_tokens += getattr(usage, "input_tokens", 0) or 0
        self.output_tokens += getattr(usage, "output_tokens", 0) or 0
        self.cache_read_tokens += getattr(usage, "cache_read_input_tokens", 0) or 0
        self.cache_write_tokens += getattr(usage, "cache_creation_input_tokens", 0) or 0

    @property
    def usd(self) -> float:
        return (
            self.input_tokens * INPUT_USD_PER_MTOK
            + self.output_tokens * OUTPUT_USD_PER_MTOK
            + self.cache_read_tokens * CACHE_READ_USD_PER_MTOK
            + self.cache_write_tokens * CACHE_WRITE_USD_PER_MTOK
        ) / 1_000_000


def build_system_blocks(prompt_text: str, taxonomy_paths: set[str]) -> list[dict[str, Any]]:
    """Static request prefix: prompt + taxonomy, cache-marked on the last block.

    Taxonomy is sorted so the rendered bytes are deterministic — a varying
    order would silently invalidate the prompt cache on every call.
    """
    taxonomy_block = "## Valid taxonomy paths\n\n" + "\n".join(sorted(taxonomy_paths))
    return [
        {"type": "text", "text": prompt_text},
        {"type": "text", "text": taxonomy_block, "cache_control": {"type": "ephemeral"}},
    ]


def build_user_input(
    episode_meta: dict[str, Any],
    speaker_map: dict[str, str | None],
    previous_segment_text: str | None,
    target_segment: dict[str, Any],
) -> str:
    """Per-segment window: everything volatile goes here, after the cached prefix."""
    speaker_lines = "\n".join(
        f"{label} = {name if name else 'unresolved'}"
        for label, name in sorted(speaker_map.items())
    )
    parts = [
        "## Episode metadata",
        f"Episode {episode_meta.get('episode_number') or 'unnumbered'}: "
        f"{episode_meta['title']} (published {episode_meta.get('publish_date')})",
        "## Speaker map",
        speaker_lines,
        "## Previous segment (CONTEXT ONLY — never extract from this)",
        previous_segment_text or "(none — episode start)",
        "## Target segment "
        f"(speaker {target_segment['speaker_label']}, "
        f"{target_segment['start_ts']:.1f}s – {target_segment['end_ts']:.1f}s)",
        target_segment["text"],
    ]
    return "\n\n".join(parts)


def extract_segment_window(client: Any, model: str, system_blocks: list[dict[str, Any]],
                           user_input: str, tracker: CostTracker) -> Any:
    """One extraction call. Returns parsed JSON payload (or raises on API error;
    JSON errors surface as schema violations downstream, not exceptions)."""
    response = client.messages.create(
        model=model,
        max_tokens=8000,
        thinking={"type": "adaptive"},
        system=system_blocks,
        messages=[{"role": "user", "content": user_input}],
        output_config={"format": {"type": "json_schema", "schema": CLAIMS_OUTPUT_SCHEMA}},
    )
    tracker.add(response.usage)
    text = next((b.text for b in response.content if b.type == "text"), "")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"_undecodable": text[:200]}  # routed as schema_violation by the validator


def _speaker_label(speaker_id: str | None) -> str:
    return f"SPK_{speaker_id[:8]}" if speaker_id else "SPK_UNRESOLVED"


def run(cfg: Config, episode_numbers: list[int], force: bool = False) -> None:
    try:
        import anthropic
    except ImportError as exc:
        raise SystemExit(
            "extract: anthropic SDK not installed. On the worker box: pip install anthropic"
        ) from exc

    from .. import db
    from ..config import load_prompt

    prompt_text, prompt_version = load_prompt("extraction")
    model = EXTRACTION_MODEL_DEFAULT
    client = anthropic.Anthropic()
    tracker = CostTracker()

    with db.connect(cfg) as conn:
        with conn.cursor() as cur:
            cur.execute("select path from taxonomy where active")
            taxonomy_paths = {r[0] for r in cur.fetchall()}
            cur.execute("select pattern, detail, match_hints from fact_blocklist")
            blocklist = [
                {"pattern": p, "detail": d, "match_hints": h} for p, d, h in cur.fetchall()
            ]
            if episode_numbers:
                cur.execute(
                    "select id, episode_number, title, publish_date from episodes "
                    "where episode_number = any(%s)", (episode_numbers,),
                )
            else:
                cur.execute(
                    "select id, episode_number, title, publish_date from episodes "
                    "where status = 'extracting'"
                )
            episodes = cur.fetchall()
        if not taxonomy_paths:
            raise SystemExit("extract: taxonomy is empty — run `pipeline seed` first.")
        if not episodes:
            print("extract: no eligible episodes.")
            return

        system_blocks = build_system_blocks(prompt_text, taxonomy_paths)

        for ep_id, ep_number, title, publish_date in episodes:
            ep_cost_start = tracker.usd
            try:
                _extract_episode(
                    conn, cfg, client, model, system_blocks, tracker, blocklist,
                    taxonomy_paths, prompt_version,
                    {"id": ep_id, "episode_number": ep_number, "title": title,
                     "publish_date": publish_date},
                    force=force,
                )
                print(f"extract: ep {ep_number} done "
                      f"(episode cost ${tracker.usd - ep_cost_start:.2f})")
            except Exception as exc:
                conn.rollback()
                with conn.cursor() as cur:
                    cur.execute(
                        "update episodes set status = 'failed', status_detail = %s, "
                        "updated_at = now() where id = %s",
                        (f"extract: {exc}"[:500], ep_id),
                    )
                conn.commit()
                print(f"extract: ep {ep_number} FAILED: {exc}")

            if cfg.batch_budget_usd > 0 and tracker.usd > cfg.batch_budget_usd:
                raise SystemExit(
                    f"extract: cumulative cost ${tracker.usd:.2f} exceeds "
                    f"BATCH_BUDGET_USD={cfg.batch_budget_usd} — stopping. "
                    f"Completed work is committed; re-run to continue after raising the cap."
                )

    print(f"extract: total ${tracker.usd:.2f} over {tracker.calls} calls "
          f"({len(episodes)} episodes, ${tracker.usd / max(len(episodes), 1):.2f}/episode)")


def _extract_episode(conn, cfg: Config, client, model, system_blocks, tracker,
                     blocklist, taxonomy_paths, prompt_version,
                     episode: dict[str, Any], *, force: bool) -> None:
    ep_id = episode["id"]
    with conn.cursor() as cur:
        cur.execute("select count(*) from claims where episode_id = %s", (ep_id,))
        if cur.fetchone()[0] > 0:
            if not force:
                print(f"extract: ep {episode['episode_number']} already has claims — "
                      "skipping (use --force to re-extract)")
                return
            cur.execute("delete from claims where episode_id = %s", (ep_id,))

        cur.execute(
            "select s.id, s.speaker_id, s.start_ts, s.end_ts, s.text, e.canonical_name "
            "from segments s left join experts e on e.id = s.speaker_id "
            "where s.episode_id = %s order by s.start_ts", (ep_id,),
        )
        segments = cur.fetchall()
    if not segments:
        raise RuntimeError("no segments for episode")

    speaker_map = {
        _speaker_label(spk): name
        for _, spk, _, _, _, name in segments
    }
    resolved = {label for label, name in speaker_map.items() if name}

    for i, (seg_id, speaker_id, start_ts, end_ts, text, _name) in enumerate(segments):
        label = _speaker_label(speaker_id)
        user_input = build_user_input(
            episode, speaker_map,
            previous_segment_text=segments[i - 1][4] if i > 0 else None,
            target_segment={"speaker_label": label, "start_ts": start_ts,
                            "end_ts": end_ts, "text": text},
        )
        payload = extract_segment_window(client, model, system_blocks, user_input, tracker)
        routed = route_extraction_output(payload, taxonomy_paths, resolved)

        with conn.cursor() as cur:
            if routed.schema_violation:
                cur.execute(
                    "insert into review_queue (segment_id, reason, detail) "
                    "values (%s, 'schema_violation', %s)",
                    (seg_id, routed.schema_violation[:500]),
                )
                continue

            for claim in routed.live_claims:
                hits = blocklist_check.prescreen(
                    claim["claim_text"], claim["verbatim_quote"], blocklist
                )
                claim_id = _insert_claim(cur, cfg, prompt_version, model, ep_id, seg_id,
                                         speaker_id, claim, live=not hits)
                for hit in hits:
                    cur.execute(
                        "insert into review_queue (claim_id, segment_id, reason, detail) "
                        "values (%s, %s, 'blocklist_hit', %s)",
                        (claim_id, seg_id, hit["pattern"][:500]),
                    )

            for item in routed.review_items:
                claim_id = _insert_claim(cur, cfg, prompt_version, model, ep_id, seg_id,
                                         speaker_id, item["claim"], live=False)
                for reason, detail in item["reasons"]:
                    cur.execute(
                        "insert into review_queue (claim_id, segment_id, reason, detail) "
                        "values (%s, %s, %s, %s)",
                        (claim_id, seg_id, reason, detail[:500]),
                    )
        conn.commit()

    with conn.cursor() as cur:
        cur.execute(
            "update episodes set status = 'normalising', updated_at = now() where id = %s",
            (ep_id,),
        )
    conn.commit()


def _insert_claim(cur, cfg: Config, prompt_version: str, model: str, ep_id, seg_id,
                  speaker_id, claim: dict[str, Any], *, live: bool) -> str:
    """Insert one claim row. Review-routed claims keep expert_id NULL (never
    guessed) and UNMAPPED/invented topic paths are stored as NULL."""
    topic = None if claim["topic_path"] == "UNMAPPED" else claim["topic_path"]
    cur.execute(
        """
        insert into claims
          (segment_id, episode_id, expert_id, timestamp_s, claim_text, verbatim_quote,
           claim_type, topic_path, population_qualifier, confidence, hedging,
           prompt_version, model_version, pipeline_version)
        values (%s, %s, %s, %s, %s, %s, %s,
                (select path from taxonomy where path = %s),
                %s, %s, %s, %s, %s, %s)
        returning id
        """,
        (seg_id, ep_id,
         speaker_id if (live and not claim["speaker_uncertain"]) else None,
         claim["timestamp_s"], claim["claim_text"], claim["verbatim_quote"],
         claim["claim_type"], topic, claim["population_qualifier"],
         claim["confidence"], claim["hedging"],
         prompt_version, model, cfg.pipeline_version),
    )
    return cur.fetchone()[0]
