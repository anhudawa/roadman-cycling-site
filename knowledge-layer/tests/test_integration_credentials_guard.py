"""P0-2 acceptance: pipeline role cannot write experts.credentials; service can.

Integration test — requires a live database with 001 + 002 applied. Skipped
automatically when SUPABASE_DB_URL is unset (e.g. in CI without secrets).
Run against the Supabase project before signing off P0-2.
"""

import os
import uuid

import pytest

psycopg = pytest.importorskip("psycopg")

DSN = os.environ.get("SUPABASE_DB_URL")
pytestmark = pytest.mark.skipif(not DSN, reason="SUPABASE_DB_URL not set (integration test)")


@pytest.fixture()
def conn():
    with psycopg.connect(DSN) as c:
        yield c
        c.rollback()


def _make_expert(cur) -> str:
    name = f"FIXTURE Integration Expert {uuid.uuid4()}"
    cur.execute(
        "insert into experts (canonical_name) values (%s) returning id", (name,)
    )
    return cur.fetchone()[0]


def test_pipeline_role_cannot_write_credentials(conn):
    with conn.cursor() as cur:
        expert_id = _make_expert(cur)
        cur.execute("set role pipeline_worker")
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            cur.execute(
                "update experts set credentials = 'FIXTURE: fake credential' where id = %s",
                (expert_id,),
            )


def test_pipeline_role_can_update_identity_fields(conn):
    with conn.cursor() as cur:
        expert_id = _make_expert(cur)
        cur.execute("set role pipeline_worker")
        cur.execute(
            "update experts set aliases = array['FIXTURE alias'], episode_count = 1 "
            "where id = %s",
            (expert_id,),
        )
        assert cur.rowcount == 1


def test_privileged_role_can_write_credentials(conn):
    with conn.cursor() as cur:
        expert_id = _make_expert(cur)
        cur.execute(
            "update experts set credentials = 'FIXTURE: human-verified credential', "
            "credentials_verified_by = 'integration-test', "
            "credentials_verified_at = now() where id = %s",
            (expert_id,),
        )
        assert cur.rowcount == 1


def test_transcripts_are_immutable(conn):
    with conn.cursor() as cur:
        cur.execute(
            "insert into episodes (episode_number, title) values (-999999, 'FIXTURE ep') "
            "on conflict (episode_number) do update set title = excluded.title returning id"
        )
        episode_id = cur.fetchone()[0]
        cur.execute(
            "insert into transcripts (episode_id, version, model, raw) "
            "values (%s, 1, 'fixture', '{\"FIXTURE\": true}') "
            "on conflict (episode_id, version) do nothing",
            (episode_id,),
        )
        with pytest.raises(psycopg.errors.IntegrityConstraintViolation):
            cur.execute(
                "update transcripts set model = 'edited' where episode_id = %s", (episode_id,)
            )
